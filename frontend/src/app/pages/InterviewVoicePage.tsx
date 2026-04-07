import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { GridOverlay } from "../components/GridOverlay";
import { GlassCard } from "../components/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, MessageSquare, X, Loader2, Video } from "lucide-react";
import { toast } from "sonner";
import { getSession, startInterview, endInterview, setAuthToken } from "../../lib/api";
import { useGroqStream } from "../../hooks/useGroqStream";
import { useConfidence } from "../../hooks/useConfidence";
import { useVoice } from "../../hooks/useVoice";
import { InterviewerPanel } from "../components/InterviewerPanel";
import { SplineScene } from "../components/SplineScene";
import type { Session, Message } from "../../types";

export function InterviewVoicePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  const { streamedText, isStreaming, isComplete, startStream, error: groqError } = useGroqStream();
  const { metrics, startTracking, stopTracking, videoRef, error: confidenceError } = useConfidence();
  const { 
    isListening, transcript, startListening, stopListening, 
    isSpeaking, speak, stopSpeaking, isSupported, error: voiceError 
  } = useVoice();

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const token = await getToken();
        if (token) setAuthToken(token);
        
        const data = await getSession(id);
        setSession(data as any);
        setMessages((data as any).messages || []);
        
        const chatHistory = (data as any).messages?.filter((m: any) => m.role !== 'system') || [];
        if (chatHistory.length === 0) {
          const firstQ = await startInterview(id);
          setMessages([
            ...((data as any).messages || []),
            { id: 'initial', session_id: id, role: 'assistant', content: firstQ, created_at: new Date().toISOString() }
          ]);
          // Wait briefly, then speak the first question!
          setTimeout(() => speak(firstQ), 1000);
        } else {
           const lastMsg = chatHistory[chatHistory.length - 1];
           if (lastMsg && lastMsg.role === 'assistant') setTimeout(() => speak(lastMsg.content), 500);
        }
      } catch (err) {
        toast.error("Failed to load session");
        navigate("/dashboard");
      } finally {
        setIsInitializing(false);
      }
    }
    load();
    startTracking();
    
    return () => {
      stopTracking();
      stopSpeaking();
      stopListening();
    };
  }, [id, getToken, navigate, startTracking, stopTracking, speak, stopSpeaking, stopListening]);

  // Handle Groq completion -> automatically read the output loudly
  const prevStreaming = useRef(false);
  useEffect(() => {
    if (prevStreaming.current && !isStreaming && streamedText) {
      const finalMsg = streamedText.replace('INTELLIMOCK_COMPLETE', '');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        session_id: id!,
        role: 'assistant',
        content: finalMsg,
        created_at: new Date().toISOString(),
      }]);
      speak(finalMsg); 
    }
    prevStreaming.current = isStreaming;
  }, [isStreaming, streamedText, id, speak]);

  // Submit Answer -> Hook onto transcription stop (whether manual or auto 2s silence)
  const prevListening = useRef(false);
  useEffect(() => {
    if (prevListening.current && !isListening && transcript.trim() && id && !isStreaming) {
       const userMsg = transcript;
       setMessages((prev) => [...prev, {
          id: Date.now().toString(), session_id: id, role: 'user', content: userMsg, created_at: new Date().toISOString()
       }]);
       startStream(id, userMsg, metrics);
    }
    prevListening.current = isListening;
  }, [isListening, transcript, id, startStream, isStreaming]);

  useEffect(() => {
    if (isComplete) {
      toast.success("Interview Complete! Generating feedback...");
      navigate(`/feedback?session=${id}`);
    }
  }, [isComplete, navigate, id]);

  const handleToggleRecording = () => {
    if (isListening) stopListening();
    else {
      if (isSpeaking) stopSpeaking();
      startListening();
    }
  };

  const handleEnd = async () => {
    if (id) {
      try {
        await endInterview(id);
        navigate(`/feedback?session=${id}`);
      } catch (err) {
        toast.error("Failed to end interview");
      }
    }
  };

  const getWaveformColor = () => {
    if (isSpeaking) return "var(--accent-purple)";
    if (isListening) return "var(--accent-green)";
    return "var(--text-muted)";
  };

  const getConfidenceColor = () => {
    if (metrics.overall >= 80) return "var(--accent-green)";
    if (metrics.overall >= 60) return "var(--accent-amber)";
    return "var(--accent-red)";
  };

  if (isInitializing || !session) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent-purple animate-spin mb-4" />
        <p className="text-text-muted font-mono animate-pulse">Initializing Voice Capabilities...</p>
      </div>
    );
  }

  const questionNumber = Math.max(1, messages.filter(m => m.role === 'user').length + 1);
  const currentAssistantSpeech = isStreaming 
                                  ? streamedText.replace('INTELLIMOCK_COMPLETE','') 
                                  : (messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || "Please begin...");

  return (
    <div className="h-screen bg-black text-white relative overflow-hidden flex flex-col">
      <div className="fixed inset-0 z-0 opacity-20">
        <SplineScene scene="https://prod.spline.design/KChzoSKgLSxtlaux/scene.splinecode" />
      </div>
      <GridOverlay />
      
      {/* Fixed Navbar Integration */}
      <div className="fixed top-0 left-0 right-0 z-[100]">
        <Navbar transparent />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-6">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Biometrics & Meta */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Camera Preview */}
              <GlassCard className="aspect-video overflow-hidden relative group border-accent-purple/20">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Neural Link: Stream</span>
                </div>
              </GlassCard>

              {/* Confidence Metrics */}
              <GlassCard className="p-5 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent-purple font-bold">Biometrics</span>
                  <span className="text-xs font-bold text-white italic">{metrics.overall}%</span>
                </div>
                {[
                  { label: "Posture", val: metrics.posture, color: "bg-accent-blue" },
                  { label: "Focus", val: metrics.focus, color: "bg-accent-purple" },
                  { label: "Calmness", val: metrics.calmness, color: "bg-accent-green" },
                ].map(m => (
                  <div key={m.label} className="space-y-1.5">
                    <div className="flex justify-between text-[8px] font-mono uppercase tracking-widest text-text-muted">
                      <span>{m.label}</span>
                      <span>{m.val}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${m.val}%` }}
                        className={`h-full ${m.color} shadow-[0_0_8px_rgba(255,255,255,0.2)]`}
                      />
                    </div>
                  </div>
                ))}
              </GlassCard>
            </motion.div>
          </div>

          {/* Center Column: AI Interaction */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* Neural Status */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-3xl">
                <div className="relative w-2 h-2">
                   <div className="absolute inset-0 bg-accent-purple rounded-full animate-ping opacity-75" />
                   <div className="relative w-2 h-2 bg-accent-purple rounded-full" />
                </div>
                <span className="text-[10px] font-mono text-white uppercase tracking-[0.4em] font-bold">Transmission Phase: {questionNumber}/7</span>
              </div>
            </motion.div>

            {/* 3D Interviewers */}
            <div className="w-full aspect-video flex items-center justify-center mb-10 overflow-visible">
              <InterviewerPanel isStreaming={isStreaming || isSpeaking} />
            </div>

            {/* Current Speech Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAssistantSpeech}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center mb-10 min-h-[80px]"
              >
                <h1 className="text-xl md:text-2xl font-display font-light leading-relaxed max-w-2xl mx-auto italic text-white/80">
                   "{currentAssistantSpeech}"
                </h1>
              </motion.div>
            </AnimatePresence>

            {/* Interaction Trigger */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleRecording}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
                    isListening ? "border-accent-red shadow-[0_0_50px_rgba(220,38,38,0.4)]" : "border-white/5 shadow-[0_0_30px_rgba(124,58,237,0.2)]"
                  } backdrop-blur-3xl`}
                  style={{
                    backgroundColor: isListening ? "rgba(220, 38, 38, 0.15)" : "rgba(124, 58, 237, 0.15)"
                  }}
                >
                  {isListening ? (
                    <Mic className="w-10 h-10 text-accent-red animate-pulse" />
                  ) : isSpeaking || isStreaming ? (
                    <div className="flex gap-1.5 h-8 items-end">
                      <motion.div animate={{ height: [8, 24, 8] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 bg-accent-purple rounded-full" />
                      <motion.div animate={{ height: [12, 32, 12] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 bg-accent-purple rounded-full" />
                      <motion.div animate={{ height: [8, 20, 8] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 bg-accent-purple rounded-full" />
                    </div>
                  ) : (
                    <Mic className="w-10 h-10 text-white group-hover:text-accent-purple transition-colors" />
                  )}
                </motion.button>
                {/* Orbital Loader during AI processing */}
                {isStreaming && (
                  <div className="absolute -inset-2 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-[0.3em] font-bold">
                {isListening ? "Neural Input Active" : isSpeaking ? "Synthesizing Speech" : "Click to Speak"}
              </p>
            </div>
          </div>

          {/* Right Column: Dynamic Transcript */}
          <div className="lg:col-span-3 h-full">
             <AnimatePresence>
               {(transcript || voiceError || groqError) && (
                 <motion.div
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0 }}
                 >
                   <GlassCard className={`p-6 border-l-2 ${voiceError || groqError ? 'border-accent-red' : 'border-accent-green'}`}>
                     <div className="flex items-center gap-2 mb-4">
                       <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Live Stream</span>
                     </div>
                     <p className="text-sm leading-relaxed text-white/70 italic">
                        {voiceError || groqError || transcript || "..."}
                     </p>
                   </GlassCard>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>

        {/* Global Controls */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6">
           <button
            onClick={() => navigate(`/interview/${id}/chat`)}
            className="px-10 py-3 rounded-full bg-white/5 hover:bg-white/10 transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 group"
          >
            <MessageSquare className="w-4 h-4 text-accent-blue" />
            Switch to Chat
          </button>
          <button
            onClick={handleEnd}
            className="px-10 py-3 rounded-full bg-accent-red/10 hover:bg-accent-red/20 transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] border border-accent-red/20 text-accent-red"
          >
            Abort Session
          </button>
        </div>
      </div>
    </div>
  );
}
  );
}
