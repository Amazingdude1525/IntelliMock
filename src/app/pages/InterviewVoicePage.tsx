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
    <div className="h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">
      <div className="fixed inset-0 z-0 opacity-30">
        <SplineScene scene="https://prod.spline.design/KChzoSKgLSxtlaux/scene.splinecode" />
      </div>
      <GridOverlay />

      <button
        onClick={handleEnd}
        className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all flex items-center justify-center border border-white/10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Hidden local camera video feed used for metrics but kept offscreen to retain UX */}
      <video ref={videoRef} muted playsInline className="absolute top-0 left-0 w-1 h-1 opacity-0 pointer-events-none" />

      <div className="relative z-10 max-w-5xl w-full px-6 flex flex-col items-center">
        {/* Question Counter */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20">
            <span className="text-[10px] font-mono text-accent-purple uppercase tracking-[0.3em]">Neural Link Status: Active</span>
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          </div>
        </motion.div>

        {/* Current Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAssistantSpeech}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mb-12 h-24 flex items-center justify-center"
          >
            <h1 className="text-2xl md:text-3xl font-display font-light leading-snug max-w-4xl mx-auto italic tracking-tight text-white/90 font-display">
               "{currentAssistantSpeech}"
            </h1>
          </motion.div>
        </AnimatePresence>

        {/* 3D Interviewer Panel */}
        <div className="w-full mb-12">
          <InterviewerPanel isStreaming={isStreaming || isSpeaking} />
        </div>

        {/* Trigger Button - Moved BELOW the assistant for better visibility */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleRecording}
            className="w-20 h-20 rounded-full shadow-[0_0_40px_rgba(124,58,237,0.3)] flex items-center justify-center transition-all border border-white/10 backdrop-blur-2xl relative"
            style={{
              backgroundColor: isListening
                ? "rgba(220, 38, 38, 0.9)"
                : isSpeaking || isStreaming
                ? "rgba(124, 58, 237, 0.9)"
                : "rgba(30, 41, 59, 0.8)",
            }}
          >
            {isListening ? (
              <Mic className="w-8 h-8 text-white animate-pulse" />
            ) : isSpeaking || isStreaming ? (
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-4 bg-white rounded-full animate-[bounce_1s_infinite_0s]" />
                <span className="w-1.5 h-8 bg-white rounded-full animate-[bounce_1s_infinite_0.1s]" />
                <span className="w-1.5 h-4 bg-white rounded-full animate-[bounce_1s_infinite_0.2s]" />
              </div>
            ) : (
              <div className="relative">
                <Mic className="w-8 h-8 text-white" />
                <div className="absolute -inset-4 bg-accent-purple/20 blur-xl rounded-full -z-10 animate-pulse" />
              </div>
            )}
          </motion.button>
          <p className="text-xs font-mono text-text-muted uppercase tracking-[0.2em] animate-pulse">
            {isListening ? "Listening..." : isSpeaking ? "AI Speaking" : "Click to Speak"}
          </p>
        </div>

        {/* Live Transcript / Error Banner */}
        <AnimatePresence>
          {(isListening || transcript || voiceError || groqError) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 mb-8 w-full z-20"
            >
              <GlassCard className={`p-6 max-w-2xl mx-auto w-full ${voiceError || groqError ? 'border-accent-red' : ''}`}>
                <p className="text-sm text-text-muted mb-2">{voiceError || groqError ? "Error:" : "You said:"}</p>
                <p className="text-base leading-relaxed tracking-wide">{voiceError || groqError || transcript || "..."}</p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Text */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-12 h-12">
          <p className="text-lg font-medium text-text-muted transition-colors">
            {isStreaming ? (
                <span className="text-accent-purple flex justify-center items-center gap-2 font-mono text-sm uppercase tracking-widest"><Loader2 className="w-4 h-4 animate-spin"/> Processing Neural Input...</span>
            ) : isSpeaking ? (
              <span className="text-accent-purple font-mono text-sm uppercase tracking-widest">Assistant Transmitting...</span>
            ) : isListening ? (
              <span className="text-accent-red animate-pulse font-mono text-sm uppercase tracking-widest">Input Stream Active</span>
            ) : (
              <span className="font-mono text-xs uppercase tracking-[0.3em] opacity-40 italic">Standby for Voice Command</span>
            )}
          </p>
        </motion.div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate(`/interview/${id}/chat`)}
            className="px-8 py-3.5 rounded-full bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-white/10"
          >
            <MessageSquare className="w-4 h-4" />
            Switch to Chat
          </button>
        </div>
      </div>
    </div>
  );
}
