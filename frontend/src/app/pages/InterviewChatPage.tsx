import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { Navbar } from "../components/Navbar";
import { GridOverlay } from "../components/GridOverlay";
import { GlassCard } from "../components/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import { Send, Lightbulb, Mic, Video, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSession, startInterview, endInterview, setAuthToken } from "../../lib/api";
import { useGroqStream } from "../../hooks/useGroqStream";
import { useConfidence } from "../../hooks/useConfidence";
import { RECRUITERS } from "../components/RecruiterAvatars";
import type { Session, Message } from "../../types";

const PANEL = [RECRUITERS[0], RECRUITERS[1], RECRUITERS[3]]; // Priya, James, Aisha

export function InterviewChatPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();

  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeSpeaker, setActiveSpeaker] = useState(1);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { streamedText, isStreaming, isComplete, startStream, error } = useGroqStream();
  const { metrics, startTracking, stopTracking, videoRef, error: confidenceError } = useConfidence();

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
    startTracking();
    return () => stopTracking();
  }, [id, getToken, navigate, startTracking, stopTracking]);

  useEffect(() => {
    if (isComplete) {
      toast.success("Interview Complete! Generating feedback...");
      navigate(`/feedback?session=${id}`);
    }
  }, [isComplete, navigate, id]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, streamedText, isStreaming]);

  const handleSend = async () => {
    if (!input.trim() || !id || isStreaming) return;
    const userMessage: Message = { id: Date.now().toString(), session_id: id, role: 'user', content: input, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    await startStream(id, input, metrics);
  };

  const prevStreaming = useRef(false);
  useEffect(() => {
    if (prevStreaming.current && !isStreaming && streamedText) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(), session_id: id!, role: 'assistant',
        content: streamedText, created_at: new Date().toISOString(),
      }]);
      setActiveSpeaker((prev) => (prev + 1) % 3);
    }
    prevStreaming.current = isStreaming;
  }, [isStreaming, streamedText, id]);

  const handleEnd = async () => {
    if (id) {
      try { await endInterview(id); navigate(`/feedback?session=${id}`); }
      catch { toast.error("Failed to end interview"); }
    }
  };

  if (isInitializing || !session) {
    return (
      <div className="h-screen bg-[#0a0a0f] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#7C3AED] animate-spin mb-4" />
        <p className="text-gray-500 font-mono animate-pulse text-sm">Initializing AI Panel...</p>
      </div>
    );
  }

  const displayMessages = messages.filter(m => m.role !== 'system');
  const questionNumber = Math.max(1, messages.filter(m => m.role === 'user').length + 1);

  return (
    <div className="h-screen bg-[#0a0a0f] text-white relative flex overflow-hidden">
      <GridOverlay />

      {/* ─── LEFT PANEL: Sidebar ─── */}
      <div className="w-[360px] border-r border-white/[0.06] bg-[#0f0f18]/80 backdrop-blur-xl relative z-10 p-6 flex flex-col">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-bold tracking-tight">Interview Session</h1>
            <button
              onClick={handleEnd}
              className="w-9 h-9 rounded-full hover:bg-white/5 transition-colors flex items-center justify-center border border-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            <span className="px-3 py-1 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] text-[10px] font-mono font-bold uppercase tracking-widest capitalize">{session.role}</span>
            <span className="px-3 py-1 rounded-full bg-[#06B6D4]/10 text-[#06B6D4] text-[10px] font-mono font-bold uppercase tracking-widest capitalize">{session.domain}</span>
            <span className="px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-[10px] font-mono font-bold uppercase tracking-widest capitalize">{session.difficulty}</span>
          </div>
        </div>

        {/* Camera */}
        <GlassCard className="mb-5 overflow-hidden">
          <div className="relative w-full aspect-video bg-black/40">
            <video ref={videoRef} muted playsInline className="w-full h-full object-cover transform -scale-x-100" />
            {!videoRef.current?.srcObject && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                <Video className="w-6 h-6 mb-2" />
                <span className="text-[10px] font-mono">{confidenceError || "Loading camera..."}</span>
              </div>
            )}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[8px] font-mono uppercase tracking-widest text-white/60">LIVE</span>
            </div>
          </div>
        </GlassCard>

        {/* Confidence Metrics */}
        <GlassCard className="p-5 mb-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#7C3AED] font-bold">Confidence</span>
            <span className="text-lg font-bold" style={{
              color: metrics.overall > 70 ? '#22C55E' : metrics.overall > 40 ? '#F59E0B' : '#F43F5E'
            }}>{metrics.overall}%</span>
          </div>
          {[
            { label: "Eye Contact", value: metrics.eyeContact, color: "#7C3AED" },
            { label: "Posture", value: metrics.posture, color: "#06B6D4" },
            { label: "Focus", value: metrics.focus, color: "#8B5CF6" },
            { label: "Calmness", value: metrics.calm, color: "#22C55E" },
          ].map(m => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{m.label}</span>
                <span className="text-[9px] font-mono font-bold text-gray-400">{m.value}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: m.color }}
                  initial={{ width: 0 }} animate={{ width: `${m.value}%` }} transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          ))}
        </GlassCard>

        {/* Progress */}
        <GlassCard className="p-4 mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Progress</span>
            <span className="text-xs font-bold text-gray-400">Q{questionNumber}/7</span>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full transition-all ${
                i < questionNumber - 1 ? 'bg-[#7C3AED]' : i === questionNumber - 1 ? 'bg-[#06B6D4] animate-pulse' : 'bg-white/5'
              }`} />
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ─── RIGHT PANEL: Chat ─── */}
      <div className="flex-1 relative z-10 flex flex-col">
        {/* Panel avatars header */}
        <div className="border-b border-white/[0.06] bg-[#0a0a0f]/60 backdrop-blur-xl px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {PANEL.map((r, idx) => {
                const isActive = activeSpeaker === idx && isStreaming;
                return (
                  <div key={r.id} className="flex items-center gap-3">
                    <div className={`transition-all duration-500 ${isActive ? 'shadow-[0_0_20px_rgba(124,58,237,0.3)]' : 'opacity-60'} rounded-full`}>
                      <r.Avatar size={36} isSpeaking={isActive} accentColor={r.color} />
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>{r.name}</p>
                      <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">{r.company}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
              <div className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-[#22C55E] animate-pulse' : 'bg-gray-600'}`} />
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                {isStreaming ? 'Panel Active' : 'Awaiting'}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 pt-6 space-y-6">
          <div className="max-w-4xl mx-auto space-y-5">
            <AnimatePresence mode="popLayout">
              {displayMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 15, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-2xl ${message.role === "user" ? "pl-16" : "pr-16"}`}>
                    {message.role !== "user" && (() => {
                      const SpeakerAvatar = PANEL[activeSpeaker].Avatar;
                      return (
                      <div className="flex items-center gap-2 mb-2">
                        <SpeakerAvatar size={20} accentColor={PANEL[activeSpeaker].color} />
                        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{PANEL[activeSpeaker].name}</span>
                      </div>
                      );
                    })()}
                    <GlassCard
                      className={`p-5 ${
                        message.role !== "user"
                          ? "border-l-2 border-l-[#7C3AED]/50"
                          : "bg-[#7C3AED]/10 border-[#7C3AED]/20"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-200">
                        {message.content.replace('INTELLIMOCK_COMPLETE', '')}
                      </p>
                    </GlassCard>
                  </div>
                </motion.div>
              ))}

              {isStreaming && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-2xl pr-16">
                    {(() => {
                      const SpeakerAvatar = PANEL[activeSpeaker].Avatar;
                      return (
                    <div className="flex items-center gap-2 mb-2">
                      <SpeakerAvatar size={20} isSpeaking accentColor={PANEL[activeSpeaker].color} />
                      <span className="text-[9px] font-mono text-[#7C3AED] uppercase tracking-widest animate-pulse font-bold">{PANEL[activeSpeaker].name} · typing</span>
                    </div>
                      );
                    })()}
                    <GlassCard className="p-5 border-l-2 border-l-[#7C3AED]/50 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/5 to-transparent animate-pulse" />
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-200 relative z-10">
                        {streamedText.replace('INTELLIMOCK_COMPLETE', '')}
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="inline-block w-0.5 h-4 ml-1 align-middle bg-[#7C3AED] shadow-[0_0_8px_#7C3AED]"
                        />
                      </p>
                    </GlassCard>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-16" />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl p-4">
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-2 flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                disabled={isStreaming}
                placeholder="Type your response... (Shift+Enter for newline)"
                className="flex-1 bg-transparent py-3 px-3 outline-none resize-none min-h-[44px] max-h-[160px] text-sm disabled:opacity-50"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="w-10 h-10 rounded-xl mb-1 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white flex items-center justify-center disabled:opacity-30 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all active:scale-95"
              >
                {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
              </button>
            </GlassCard>

            <div className="flex items-center justify-between mt-3 px-1">
              <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                {input.length > 0 ? `${input.split(/\s+/).filter(Boolean).length} words` : 'Ready'}
              </span>
              <button
                onClick={() => navigate(`/interview/${id}/voice`)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED]/20 transition-colors text-[10px] font-bold uppercase tracking-widest"
              >
                <Mic className="w-3 h-3" />
                Voice Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
