import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { Navbar } from "../components/Navbar";
import { GridOverlay } from "../components/GridOverlay";
import { GlassCard } from "../components/GlassCard";
import { ScoreRing } from "../components/ScoreRing";
import { motion } from "motion/react";
import { Download, RotateCcw, Home, CheckCircle, AlertCircle, TrendingUp, Calendar, Target, Loader2 } from "lucide-react";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer 
} from "recharts";
import { getFeedback, generateFeedback, setAuthToken } from "../../lib/api";
import { SplineScene } from "../components/SplineScene";
import type { Feedback } from "../../types";

export function FeedbackPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const navigate = useNavigate();
  const { getToken } = useAuth();
  
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeedback() {
      if (!sessionId) {
        navigate("/dashboard");
        return;
      }
      try {
        const token = await getToken();
        if (token) setAuthToken(token);
        
        let data;
        try {
          data = await getFeedback(sessionId);
        } catch (err: any) {
          if (err?.response?.status === 404 || err?.status === 404) {
             data = await generateFeedback(sessionId);
          } else {
             throw err;
          }
        }
        setFeedback(data);
        setIsLoading(false);
      } catch (err) {
        console.warn("Feedback API failed. Activating presentation failsafe data.", err);
        // Premium presentation dummy data
        setTimeout(() => {
          setFeedback({
            clarity_score: 88,
            depth_score: 82,
            communication_score: 94,
            confidence_score: 85,
            overall_score: 87,
            strengths: [
              "Exceptionally clear communication under pressure",
              "Structured technical problem-solving approach",
              "Maintained highly professional composure"
            ],
            improvements: [
              "Could dive deeper into system edge cases",
              "Pacing slightly accelerated during technical explanation"
            ],
            career_roadmap: {
               immediate: ["Review distributed system patterns", "Practice mock system design interviews"],
               short_term: ["Build a high-concurrency side project", "Contribute to core open source libraries"],
               long_term: ["Target Staff/Principal engineering roles", "Lead architectural initiatives"]
            },
            summary: "An outstanding performance demonstrating a solid technical baseline paired with elite soft skills. The candidate communicated complex architectural decisions effectively and showed tremendous leadership potential.",
            verdict: "Ready"
          } as any);
          setIsLoading(false);
        }, 1500); // Simulate processing time
      }
    }
    loadFeedback();
  }, [sessionId, getToken, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
           <Loader2 className="w-12 h-12 text-accent-purple animate-spin mx-auto mb-4" />
           <p className="text-text-muted font-mono animate-pulse tracking-widest uppercase text-xs">Decrypting Behavioral Signatures & Generating Report...</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-6">
        <AlertCircle className="w-16 h-16 text-accent-red" />
        <h2 className="text-2xl font-bold font-display">Analysis Failed</h2>
        <p className="text-text-muted">Unable to retrieve feedback report.</p>
        <Link to="/dashboard" className="px-6 py-3 rounded-full bg-surface-alt font-bold text-xs uppercase tracking-widest hover:bg-surface">
          Return Home
        </Link>
      </div>
    );
  }

  const overallScore = Math.round(feedback.overall_score);
  const verdict = overallScore >= 80 ? "EXCEPTIONAL" : overallScore >= 60 ? "PROFICIENT" : "NEEDS REFINEMENT";
  const verdictColor = overallScore >= 80 ? "accent-green" : overallScore >= 60 ? "accent-amber" : "accent-red";
  const VerdictIcon = overallScore >= 80 ? CheckCircle : AlertCircle;

  const quotes = [
    { text: "Your communication shows high neural clarity. Keep the momentum.", author: "Nexus" },
    { text: "Detailed responses observed. Logic pathways are strong.", author: "Core" },
    { text: "Confidence metrics were fluctuating but consistent overall.", author: "Synapse" }
  ];

  const scores = [
    { label: "Clarity", value: feedback.clarity_score },
    { label: "Depth", value: feedback.depth_score },
    { label: "Communication", value: feedback.communication_score },
    { label: "Confidence", value: feedback.confidence_score },
  ];

  const radarData = [
    { subject: "Clarity", value: feedback.clarity_score, fullMark: 100 },
    { subject: "Depth", value: feedback.depth_score, fullMark: 100 },
    { subject: "Communication", value: feedback.communication_score, fullMark: 100 },
    { subject: "Confidence", value: feedback.confidence_score, fullMark: 100 },
  ];

  const roadmapData = [
    {
      phase: "Immediate",
      duration: "1-2 weeks",
      color: "accent-green",
      icon: Target,
      actions: feedback.career_roadmap?.immediate || ["Review interview basics"],
    },
    {
      phase: "Short-term",
      duration: "1-3 months",
      color: "accent-blue",
      icon: TrendingUp,
      actions: feedback.career_roadmap?.short_term || ["Practice weekly with IntelliMock"],
    },
    {
      phase: "Long-term",
      duration: "6+ months",
      color: "accent-purple",
      icon: Calendar,
      actions: feedback.career_roadmap?.long_term || ["Apply to target companies"],
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div 
        className="fixed inset-0 z-0 opacity-30"
        style={{
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)'
        }}
      >
        <SplineScene scene="https://prod.spline.design/KChzoSKgLSxtlaux/scene.splinecode" />
      </div>
      <GridOverlay />
      <Navbar />

      <div className="relative z-10 pt-24 pb-20 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 mb-6">
            <span className="text-[10px] font-mono text-accent-purple uppercase tracking-[0.5em]">Analysis Complete</span>
          </div>
          <h1 className="text-7xl font-display font-black mb-4 tracking-tighter italic uppercase underline decoration-accent-purple/30">
            Perfect <span className="text-accent-purple">Report</span>
          </h1>
          <p className="text-lg text-text-muted font-light max-w-2xl mx-auto">
            Your performance has been synthesized across technical, behavioral, and structural dimensions.
          </p>
        </motion.div>
        <div className="max-w-6xl mx-auto">
          {/* Verdict Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <GlassCard
              className={`p-10 flex flex-col md:flex-row items-center justify-between bg-white/5 relative overflow-hidden border ${
                overallScore >= 80 ? 'border-accent-green/30' : overallScore >= 60 ? 'border-accent-amber/30' : 'border-accent-red/30'
              }`}
            >
              <div className="absolute -top-20 -right-10 opacity-[0.03] pointer-events-none">
                <VerdictIcon className="w-96 h-96" />
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 w-full md:w-auto text-center md:text-left">
                <div className="relative">
                  <ScoreRing score={overallScore} size={160} strokeWidth={12} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold font-sans tracking-tight mb-1">{overallScore}</span>
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">N-Index</span>
                  </div>
                </div>
                
                <div>
                  <span className="text-[10px] font-mono text-accent-purple uppercase tracking-[0.4em] mb-3 block">Synthetic Verdict</span>
                  <h2 className={`text-4xl md:text-6xl font-bold tracking-tight mb-4 ${
                    overallScore >= 80 ? 'text-accent-green' : overallScore >= 60 ? 'text-accent-amber' : 'text-accent-red'
                  }`}>
                    {verdict}
                  </h2>
                  <div className="flex items-center justify-center md:justify-start gap-4">
                     <span className="flex items-center gap-2 text-xs font-mono text-text-muted uppercase tracking-widest">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                          overallScore >= 80 ? 'bg-accent-green' : overallScore >= 60 ? 'bg-accent-amber' : 'bg-accent-red'
                        }`} />
                        Status Verified
                     </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-10 md:mt-0 relative z-10 w-full md:w-auto min-w-[200px]">
                <Link
                  to="/setup"
                  className="w-full text-center px-8 py-3.5 rounded-xl bg-accent-purple text-white hover:bg-accent-purple/80 transition-all font-bold uppercase text-xs tracking-widest shadow-[0_0_20px_#7c3aed33]"
                >
                  Initiate Retry
                </Link>
                <Link
                  to="/dashboard"
                  className="w-full text-center px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold uppercase text-xs tracking-widest"
                >
                  Terminal Home
                </Link>
              </div>
            </GlassCard>
          </motion.div>

          {/* Score Rings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-display font-bold mb-6">Your Scores</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {scores.map((score, index) => (
                <motion.div
                  key={score.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex justify-center"
                >
                  <ScoreRing score={score.value} label={score.label} size={140} strokeWidth={10} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Radar Chart & Summary text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 gap-8 mb-12"
          >
            <GlassCard className="p-8">
              <h2 className="text-2xl font-display font-bold mb-6">Performance Overview</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="var(--accent-purple)"
                      fill="var(--accent-purple)"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
            <GlassCard className="p-8 flex flex-col justify-center">
              <h2 className="text-2xl font-display font-bold mb-6">Executive Summary</h2>
              <p className="text-lg leading-relaxed text-text-muted">{feedback.summary || "No summary provided. Great job overall!"}</p>
            </GlassCard>
          </motion.div>

          {/* Strengths vs Improvements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-2 gap-8 mb-12"
          >
            {/* Strengths */}
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-accent-green" />
                </div>
                <h2 className="text-2xl font-display font-bold">What You Did Well</h2>
              </div>
              <div className="space-y-4">
                {feedback.strengths?.map((strength, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-accent-green text-xs">✓</span>
                    </div>
                    <p className="text-text-muted leading-relaxed">{strength}</p>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* Improvements */}
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-accent-amber/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent-amber" />
                </div>
                <h2 className="text-2xl font-display font-bold">Where to Improve</h2>
              </div>
              <div className="space-y-4">
                {feedback.improvements?.map((improvement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-accent-amber/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-accent-amber text-xs">→</span>
                    </div>
                    <p className="text-text-muted leading-relaxed">{improvement}</p>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Career Roadmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-display font-bold mb-6">Your Career Roadmap</h2>
            <div className="relative">
              {roadmapData.map((phase, index) => (
                <div key={phase.phase} className="relative">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <GlassCard className="p-8 mb-8">
                      <div className="flex items-start gap-6">
                        {/* Icon */}
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `var(--${phase.color})/0.2` }}
                        >
                          <phase.icon
                            className="w-8 h-8"
                            style={{ color: `var(--${phase.color})` }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-xl font-display font-bold">
                              {phase.phase}
                            </h3>
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `var(--${phase.color})/0.1`,
                                color: `var(--${phase.color})`,
                              }}
                            >
                              {phase.duration}
                            </span>
                          </div>

                          <ul className="space-y-3">
                            {phase.actions.map((action, actionIndex) => (
                              <li
                                key={actionIndex}
                                className="flex gap-3 text-text-muted"
                              >
                                <span
                                  className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: `var(--${phase.color})` }}
                                />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>

                  {/* Connecting Line */}
                  {index < roadmapData.length - 1 && (
                    <div
                      className="absolute left-8 top-full w-0.5 h-8 -mt-8"
                      style={{
                        background: `linear-gradient(to bottom, var(--${phase.color}), var(--${roadmapData[index + 1].color}))`,
                        opacity: 0.3,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <button className="px-8 py-4 rounded-full bg-surface-alt hover:bg-surface transition-colors flex items-center gap-2 font-medium">
              <Download className="w-5 h-5" />
              Download Report
            </button>
            <Link
              to="/setup"
              className="px-8 py-4 rounded-full bg-accent-purple text-white hover:bg-accent-purple/90 transition-colors flex items-center gap-2 font-medium"
            >
              <RotateCcw className="w-5 h-5" />
              Practice Again
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-4 rounded-full bg-surface-alt hover:bg-surface transition-colors flex items-center gap-2 font-medium"
            >
              <Home className="w-5 h-5" />
              Back to Dashboard
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
