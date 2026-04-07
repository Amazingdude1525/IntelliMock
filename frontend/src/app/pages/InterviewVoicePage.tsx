import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { Navbar } from "../components/Navbar";
import { GridOverlay } from "../components/GridOverlay";
import { GlassCard } from "../components/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, MessageSquare, Camera, CameraOff, Loader2, Volume2, Radio } from "lucide-react";
import { toast } from "sonner";
import { getSession, startInterview, endInterview, setAuthToken } from "../../lib/api";
import { useGroqStream } from "../../hooks/useGroqStream";
import { useConfidence } from "../../hooks/useConfidence";
import { useVoice } from "../../hooks/useVoice";
import { RECRUITERS } from "../components/RecruiterAvatars";
import type { Session, Message } from "../../types";

type Phase = 'lobby' | 'intro' | 'active';

// Pick 3 panelists for each session
const PANEL = [RECRUITERS[0], RECRUITERS[1], RECRUITERS[3]]; // Priya, James, Aisha

export function InterviewVoicePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();

  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [phase, setPhase] = useState<Phase>('lobby');
  const [activeSpeaker, setActiveSpeaker] = useState<number>(0);
  const [introText, setIntroText] = useState("");
  const [micTestLevel, setMicTestLevel] = useState(0);

  const { streamedText, isStreaming, isComplete, startStream, error: groqError } = useGroqStream();
  const { metrics, startTracking, stopTracking, videoRef } = useConfidence();
  const {
    isListening, transcript, startListening, stopListening,
    isSpeaking, speak, stopSpeaking, isSupported, error: voiceError
  } = useVoice();

  // ─── Session loader ───
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
        }
      } catch {
        toast.error("Failed to load session");
        navigate("/dashboard");
      } finally {
        setIsInitializing(false);
      }
    }
    load();
  }, [id, getToken, navigate]);

  // ─── Stream → message sync ───
  const prevStreaming = useRef(false);
  useEffect(() => {
    if (prevStreaming.current && !isStreaming && streamedText) {
      const finalMsg = streamedText.replace('INTELLIMOCK_COMPLETE', '');
      setMessages(prev => [...prev, {
        id: Date.now().toString(), session_id: id!, role: 'assistant',
        content: finalMsg, created_at: new Date().toISOString(),
      }]);
      setActiveSpeaker(1); // Core speaks answers
      speak(finalMsg);
    }
    prevStreaming.current = isStreaming;
  }, [isStreaming, streamedText, id, speak]);

  // ─── Transcript → submit ───
  const prevListening = useRef(false);
  useEffect(() => {
    if (prevListening.current && !isListening && transcript.trim() && id && !isStreaming) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(), session_id: id, role: 'user',
        content: transcript, created_at: new Date().toISOString()
      }]);
      startStream(id, transcript, metrics);
    }
    prevListening.current = isListening;
  }, [isListening, transcript, id, startStream, isStreaming, metrics]);

  // ─── Completion ───
  useEffect(() => {
    if (isComplete) {
      toast.success("Interview Complete!");
      navigate(`/feedback?session=${id}`);
    }
  }, [isComplete, navigate, id]);

  // ─── Mic test animation ───
  useEffect(() => {
    if (phase !== 'lobby') return;
    const interval = setInterval(() => {
      setMicTestLevel(Math.random() * 80 + 20);
    }, 200);
    return () => clearInterval(interval);
  }, [phase]);

  // ─── Start intro sequence ───
  const handleEnterRoom = async () => {
    startTracking();
    setPhase('intro');

    const intros = [
      { idx: 0, text: `Hello! I'm ${PANEL[0].name}, ${PANEL[0].role} at ${PANEL[0].company}. I'll be evaluating your fit and communication today.` },
      { idx: 1, text: `${PANEL[1].name} here, ${PANEL[1].role} at ${PANEL[1].company}. I'll focus on your technical depth and problem-solving.` },
      { idx: 2, text: `And I'm ${PANEL[2].name}, ${PANEL[2].role} at ${PANEL[2].company}. I'll be looking at your behavioral responses and empathy.` },
    ];

    for (const intro of intros) {
      setActiveSpeaker(intro.idx);
      setIntroText(intro.text);
      speak(intro.text);
      await new Promise(r => setTimeout(r, 5000));
    }

    setPhase('active');
    setActiveSpeaker(1);

    // Start the actual interview question
    const chatHistory = messages.filter(m => m.role !== 'system');
    if (chatHistory.length > 0) {
      const last = chatHistory[chatHistory.length - 1];
      if (last.role === 'assistant') speak(last.content);
    }
  };

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
        stopTracking();
        stopSpeaking();
        stopListening();
        await endInterview(id);
        navigate(`/feedback?session=${id}`);
      } catch { toast.error("Failed to end interview"); }
    }
  };

  // ─── Loading ───
  if (isInitializing || !session) {
    return (
      <div className="h-screen bg-[#0a0a0f] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#7C3AED] animate-spin mb-4" />
        <p className="text-gray-500 font-mono animate-pulse text-sm">Initializing Interview Systems...</p>
      </div>
    );
  }

  const questionNumber = Math.max(1, messages.filter(m => m.role === 'user').length + 1);
  const totalQuestions = 7;
  const currentSpeech = isStreaming
    ? streamedText.replace('INTELLIMOCK_COMPLETE', '')
    : (messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || "Waiting for panel...");

  // ═══════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════
  return (
    <div className="h-screen bg-[#0a0a0f] text-white relative overflow-hidden flex flex-col">
      <GridOverlay />
      <Navbar />

      <AnimatePresence mode="wait">
        {/* ═══════ LOBBY ═══════ */}
        {phase === 'lobby' && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex items-center justify-center pt-20 px-6"
          >
            <GlassCard className="max-w-lg w-full p-10 space-y-8 text-center border-[#7C3AED]/30">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">Pre-Interview Check</h1>
                <p className="text-gray-400 text-sm">Calibrate your devices before entering the room.</p>
              </div>

              {/* Camera Preview */}
              <div className="aspect-video rounded-2xl bg-black/60 overflow-hidden border border-white/5 relative group">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10">
                  <Camera className="w-3 h-3 text-green-400" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-green-400">Camera Active</span>
                </div>
              </div>

              {/* Mic Test */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-gray-400">Microphone Level</span>
                  <Volume2 className="w-4 h-4 text-[#06B6D4]" />
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${micTestLevel}%` }}
                    transition={{ duration: 0.15 }}
                    className="h-full bg-gradient-to-r from-[#06B6D4] to-[#7C3AED] rounded-full"
                  />
                </div>
                <p className="text-[10px] text-gray-500 font-mono">Speak to test your microphone</p>
              </div>

              {/* Meet Your Panel */}
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase tracking-widest text-gray-400">Your Interview Panel</span>
                <div className="flex justify-center gap-6">
                  {PANEL.map(r => (
                    <div key={r.id} className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16"><r.Avatar size={64} /></div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400">{r.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleEnterRoom}
                className="w-full py-4 rounded-xl bg-[#7C3AED] text-white font-bold text-sm uppercase tracking-[0.3em] hover:shadow-[0_0_40px_rgba(124,58,237,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Enter Interview Room
              </button>
            </GlassCard>
          </motion.div>
        )}

        {/* ═══════ INTRO ═══════ */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center pt-20 px-6"
          >
            <div className="flex items-end gap-16 mb-12">
              {PANEL.map((r, idx) => (
                <motion.div
                  key={r.id}
                  animate={{
                    scale: activeSpeaker === idx ? 1.15 : 0.85,
                    opacity: activeSpeaker === idx ? 1 : 0.4,
                  }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className={`rounded-full p-1 transition-shadow duration-500 ${activeSpeaker === idx ? `shadow-[0_0_30px_${r.color}50]` : ''}`}>
                    <r.Avatar size={activeSpeaker === idx ? 140 : 100} isSpeaking={activeSpeaker === idx} accentColor={r.color} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold" style={{ color: activeSpeaker === idx ? r.color : '#666' }}>{r.name}</p>
                    <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{r.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              key={introText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl"
            >
              <p className="text-xl italic text-gray-300 leading-relaxed">"{introText}"</p>
            </motion.div>

            <div className="mt-10 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Radio className="w-3 h-3 text-[#7C3AED] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Panel Introduction in Progress</span>
            </div>
          </motion.div>
        )}

        {/* ═══════ ACTIVE INTERVIEW ═══════ */}
        {phase === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-20 pb-20 px-6 max-w-[1800px] mx-auto w-full items-start"
          >
            {/* ─── LEFT COLUMN: Camera + Biometrics ─── */}
            <div className="lg:col-span-3 flex flex-col gap-5">
              <GlassCard className="overflow-hidden relative group border-[#7C3AED]/20">
                <div className="aspect-video">
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 rounded-full bg-black/70 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] font-mono uppercase tracking-widest text-white/60">LIVE</span>
                </div>
              </GlassCard>

              <GlassCard className="p-5 space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#7C3AED] font-bold">Confidence</span>
                  <span className="text-lg font-bold" style={{
                    color: metrics.overall > 70 ? '#22C55E' : metrics.overall > 40 ? '#F59E0B' : '#F43F5E'
                  }}>{metrics.overall}%</span>
                </div>
                {[
                  { label: "Eye Contact", val: metrics.eyeContact, color: "#7C3AED" },
                  { label: "Posture", val: metrics.posture, color: "#06B6D4" },
                  { label: "Focus", val: metrics.focus, color: "#8B5CF6" },
                  { label: "Calmness", val: metrics.calm, color: "#22C55E" },
                ].map(m => (
                  <div key={m.label} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-gray-500">
                      <span>{m.label}</span><span>{m.val}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div animate={{ width: `${m.val}%` }} className="h-full rounded-full" style={{ backgroundColor: m.color }} />
                    </div>
                  </div>
                ))}
              </GlassCard>

              {/* Timeline */}
              <GlassCard className="p-5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-4 block">Progress</span>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalQuestions }).map((_, i) => (
                    <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
                      i < questionNumber - 1 ? 'bg-[#7C3AED]' : i === questionNumber - 1 ? 'bg-[#06B6D4] animate-pulse' : 'bg-white/10'
                    }`} />
                  ))}
                </div>
                <p className="text-[10px] font-mono text-gray-500 mt-3 text-center">Question {questionNumber} of {totalQuestions}</p>
              </GlassCard>
            </div>

            {/* ─── CENTER COLUMN: Panel + Question ─── */}
            <div className="lg:col-span-6 flex flex-col items-center">
              {/* Recruiter Panel — "at the table" */}
              <div className="w-full flex justify-center items-end gap-8 mb-6 relative">
                {PANEL.map((r, idx) => {
                  const isActive = activeSpeaker === idx && (isSpeaking || isStreaming);
                  return (
                    <motion.div
                      key={r.id}
                      animate={{
                        scale: isActive ? 1.1 : 0.9,
                        opacity: isActive ? 1 : 0.5,
                      }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className={`rounded-full transition-shadow duration-700 ${isActive ? 'shadow-[0_0_40px_rgba(124,58,237,0.4)]' : ''}`}>
                        <r.Avatar
                          size={isActive ? 130 : 100}
                          isSpeaking={isActive}
                          accentColor={r.color}
                        />
                      </div>
                      <div className="text-center">
                        <p className={`text-xs font-bold transition-colors ${isActive ? 'text-white' : 'text-gray-600'}`}>{r.name}</p>
                        <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">{r.company}</p>
                      </div>
                      {/* Speaking indicator */}
                      {isActive && (
                        <div className="flex gap-0.5 h-4 items-end">
                          <motion.div animate={{ height: [4, 14, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 rounded-full" style={{ backgroundColor: r.color }} />
                          <motion.div animate={{ height: [6, 16, 6] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-1 rounded-full" style={{ backgroundColor: r.color }} />
                          <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 rounded-full" style={{ backgroundColor: r.color }} />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Interview table visual */}
              <div className="w-full max-w-xl mx-auto mb-6">
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              {/* Question Display */}
              <GlassCard className="w-full max-w-2xl p-8 text-center border-white/5">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#7C3AED]/20 text-[#7C3AED] text-[10px] font-mono font-bold uppercase tracking-widest">
                    Q{questionNumber}
                  </span>
                  {isStreaming && (
                    <span className="px-3 py-1 rounded-full bg-[#06B6D4]/20 text-[#06B6D4] text-[10px] font-mono uppercase tracking-widest animate-pulse">
                      Answering...
                    </span>
                  )}
                </div>
                <p className="text-lg leading-relaxed text-gray-200 italic">"{currentSpeech}"</p>
              </GlassCard>
            </div>

            {/* ─── RIGHT COLUMN: Voice Controls ─── */}
            <div className="lg:col-span-3 flex flex-col gap-5">
              {/* Mic Button */}
              <GlassCard className="p-8 flex flex-col items-center gap-6 border-white/5">
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                      isListening
                        ? "border-[#F43F5E] bg-[#F43F5E]/20 shadow-[0_0_50px_rgba(244,63,94,0.4)]"
                        : "border-white/10 bg-[#7C3AED]/10 shadow-[0_0_20px_rgba(124,58,237,0.2)]"
                    }`}
                  >
                    {isListening ? (
                      <Mic className="w-10 h-10 text-[#F43F5E] animate-pulse" />
                    ) : isSpeaking || isStreaming ? (
                      <div className="flex gap-1.5 h-8 items-end">
                        <motion.div animate={{ height: [8, 24, 8] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 bg-[#7C3AED] rounded-full" />
                        <motion.div animate={{ height: [12, 32, 12] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 bg-[#7C3AED] rounded-full" />
                        <motion.div animate={{ height: [8, 20, 8] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 bg-[#7C3AED] rounded-full" />
                      </div>
                    ) : (
                      <Mic className="w-10 h-10 text-white/80" />
                    )}
                  </motion.button>
                  {isStreaming && (
                    <div className="absolute -inset-2 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold text-gray-500">
                  {isListening ? "Listening..." : isSpeaking ? "AI Speaking" : "Tap to Speak"}
                </span>
              </GlassCard>

              {/* Live Transcript */}
              <GlassCard className="p-5 flex-1 min-h-[120px] border-l-2 border-[#7C3AED]/30 max-h-[250px] overflow-y-auto">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#7C3AED] mb-3 block font-bold">Live Transcript</span>
                <p className="text-xs leading-relaxed text-gray-400 italic">
                  {voiceError || groqError || transcript || "Your speech will appear here..."}
                </p>
              </GlassCard>

              {/* Quick Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate(`/interview/${id}/chat`)}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest border border-white/10 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-[#06B6D4]" />
                  Switch to Chat
                </button>
                <button
                  onClick={handleEnd}
                  className="w-full py-3 rounded-xl bg-[#F43F5E]/10 hover:bg-[#F43F5E]/20 transition-all text-[10px] font-bold uppercase tracking-widest border border-[#F43F5E]/20 text-[#F43F5E]"
                >
                  End Interview
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
