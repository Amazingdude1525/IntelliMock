import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { GridOverlay } from "../components/GridOverlay";
import { GlassCard } from "../components/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import { Send, Lightbulb, Mic, Video, Eye, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSession, startInterview, endInterview, setAuthToken } from "../../lib/api";
import { useGroqStream } from "../../hooks/useGroqStream";
import { useConfidence } from "../../hooks/useConfidence";
import { InterviewerPanel } from "../components/InterviewerPanel";
import type { Session, Message } from "../../types";

export function InterviewChatPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  
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
      } catch (err) {
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedText, isStreaming]);

  const handleSend = async () => {
    if (!input.trim() || !id || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      session_id: id,
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    
    await startStream(id, input, metrics);
  };
  
  const prevStreaming = useRef(false);
  useEffect(() => {
    if (prevStreaming.current && !isStreaming && streamedText) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        session_id: id!,
        role: 'assistant',
        content: streamedText,
        created_at: new Date().toISOString(),
      }]);
    }
    prevStreaming.current = isStreaming;
  }, [isStreaming, streamedText, id]);

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

  if (isInitializing || !session) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent-purple animate-spin mb-4" />
        <p className="text-text-muted font-mono animate-pulse">Initializing AI Interviewer...</p>
      </div>
    );
  }

  const displayMessages = messages.filter(m => m.role !== 'system');

  return (
    <div className="h-screen bg-background text-text-primary relative flex">
      <GridOverlay />

      {/* Left Panel */}
      <div className="w-[400px] border-r border-border bg-surface/50 backdrop-blur-xl relative z-10 p-6 flex flex-col">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-display font-bold">Interview Session</h1>
            <button
              onClick={handleEnd}
              className="w-10 h-10 rounded-full hover:bg-surface-alt transition-colors flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 rounded-full bg-accent-purple/10 text-accent-purple text-xs font-medium capitalize">
              {session.role}
            </span>
            <span className="px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue text-xs font-medium capitalize">
              {session.domain}
            </span>
            <span className="px-3 py-1 rounded-full bg-accent-amber/10 text-accent-amber text-xs font-medium capitalize">
              {session.difficulty}
            </span>
          </div>
        </div>

        <GlassCard className="p-6 mb-6">
          <h3 className="font-display font-bold mb-4 flex items-center justify-between">
            Confidence Meter
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${confidenceError ? 'bg-accent-red' : 'bg-accent-green'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${confidenceError ? 'bg-accent-red' : 'bg-accent-green'}`}></span>
              </span>
            </div>
          </h3>
          
          <div className="relative w-full aspect-video rounded-lg bg-surface-alt mb-6 overflow-hidden border border-border">
            <video
              ref={videoRef}
              muted
              playsInline
              className="w-full h-full object-cover transform -scale-x-100"
            />
            {!videoRef.current?.srcObject && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted">
                <Video className="w-8 h-8 mb-2" />
                <span className="text-xs text-center px-4">{confidenceError || "Loading camera..."}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {[
              { label: "Eye Contact", value: metrics.eyeContact },
              { label: "Posture", value: metrics.posture },
              { label: "Focus", value: metrics.focus },
              { label: "Calmness", value: metrics.calm },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-text-muted">{metric.label}</span>
                  <span className="text-xs font-mono font-bold">{metric.value}%</span>
                </div>
                <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor:
                        metric.value >= 80 ? "var(--accent-green)" : 
                        metric.value >= 60 ? "var(--accent-amber)" : "var(--accent-red)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-4 mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Overall Confidence</span>
            <span className="text-2xl font-display font-bold text-gradient">{metrics.overall}%</span>
          </div>
        </GlassCard>
      </div>

      {/* Right Panel - Elite Interface */}
      <div className="flex-1 relative z-10 flex flex-col bg-black/40">
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-0 space-y-8 scrollbar-hide">
          {/* 3D Interviewer Panel */}
          <InterviewerPanel isStreaming={isStreaming} />

          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence mode="popLayout">
              {displayMessages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-2xl ${message.role === "user" ? "order-2 pl-12" : "order-1 pr-12"}`}>
                    <GlassCard
                      className={`p-6 shadow-2xl ${
                        message.role !== "user"
                          ? "border-l-4 border-l-accent-purple bg-white/5"
                          : "bg-accent-purple/20 border-accent-purple/30"
                      }`}
                    >
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em] mb-1">
                          {message.role === 'user' ? 'Transmission from Candidate' : 'Neural Response Vector'}
                        </span>
                        <p className="text-base leading-relaxed whitespace-pre-wrap text-white font-light">
                          {message.content.replace('INTELLIMOCK_COMPLETE', '')}
                        </p>
                      </div>
                    </GlassCard>
                  </div>
                </motion.div>
              ))}

              {isStreaming && (
                 <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="flex justify-start"
                >
                  <div className="max-w-2xl order-1 pr-12">
                    <GlassCard className="p-6 border-l-4 border-l-accent-purple bg-white/5 shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/5 to-transparent animate-pulse" />
                      <div className="relative z-10">
                        <span className="text-[10px] font-mono text-accent-purple uppercase tracking-[0.2em] mb-2 block animate-pulse font-bold">
                          Incoming Sync Stream...
                        </span>
                        <p className="text-base leading-relaxed whitespace-pre-wrap text-white font-light">
                          {streamedText.replace('INTELLIMOCK_COMPLETE', '')}
                          <motion.span 
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="inline-block w-1 h-5 ml-1 align-middle bg-accent-purple shadow-[0_0_10px_#7C3AED]"
                          ></motion.span>
                        </p>
                      </div>
                    </GlassCard>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-20" />
          </div>
        </div>

        <div className="border-t border-border bg-surface/50 backdrop-blur-xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-3">
              <div className="flex gap-4 items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={isStreaming}
                  placeholder="Type your response... (Shift+Enter for newline)"
                  className="flex-1 bg-transparent py-3 px-2 outline-none resize-none min-h-[50px] max-h-[200px] disabled:opacity-50"
                  rows={2}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  className="w-12 h-12 rounded-full mb-1 bg-gradient-to-r from-accent-purple to-accent-blue text-white flex items-center justify-center disabled:opacity-50 hover:shadow-lg hover:shadow-accent-purple/30 transition-all active:scale-95"
                >
                   {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                </button>
              </div>
            </GlassCard>

            <div className="flex items-center justify-between mt-4 px-2">
              <button disabled className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-alt text-sm font-medium opacity-50 cursor-not-allowed">
                <Lightbulb className="w-4 h-4 text-accent-amber" />
                Adaptive hints active
              </button>

              <button
                onClick={() => navigate(`/interview/${id}/voice`)}
                className="flex items-center gap-2 px-6 py-2 rounded-full bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 transition-colors text-sm font-medium"
              >
                <Mic className="w-4 h-4" />
                Switch to Voice Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
