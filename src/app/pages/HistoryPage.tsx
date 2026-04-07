import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Navbar } from "../components/Navbar";
import { GridOverlay } from "../components/GridOverlay";
import { GlassCard } from "../components/GlassCard";
import { ScoreRing } from "../components/ScoreRing";
import { motion } from "motion/react";
import { Filter, Calendar, FileText, ExternalLink, Loader2 } from "lucide-react";
import { getSessions, setAuthToken } from "../../lib/api";
import type { Session } from "../../types";

const roles = ["All Roles", "Software Engineer", "Product Manager", "Data Scientist", "Designer"];
const scoreFilters = ["All Scores", "80-100", "60-79", "Below 60"];

export function HistoryPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedScore, setSelectedScore] = useState("All Scores");
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      try {
        const token = await getToken();
        if (token) setAuthToken(token);
        const data = await getSessions();
        setSessions(data);
      } catch (err) {
        console.error("Failed to fetch sessions history", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, [user, getToken]);

  const filteredSessions = sessions.filter((session) => {
    const roleMatch = selectedRole === "All Roles" || session.role === selectedRole;
    let scoreMatch = true;
    
    // Fallback to 0 if no overall_score found yet limit the math ops to actual values when present
    const scoreVal = session.feedback?.overall_score || 0;

    if (selectedScore === "80-100") scoreMatch = scoreVal >= 80;
    else if (selectedScore === "60-79") scoreMatch = scoreVal >= 60 && scoreVal < 80;
    else if (selectedScore === "Below 60") scoreMatch = scoreVal < 60;

    return roleMatch && scoreMatch;
  });

  return (
    <div className="min-h-screen bg-background text-text-primary relative overflow-hidden">
      <GridOverlay />
      <Navbar />

      <div className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-5xl font-display font-bold mb-4">
              Interview History
            </h1>
            <p className="text-xl text-text-muted">
              Review your past performances and track your progress
            </p>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <GlassCard className="p-6">
              <div className="flex flex-wrap gap-6">
                {/* Role Filter */}
                <div className="flex-1 min-w-[200px]">
                  <label className="flex items-center gap-2 text-sm text-text-muted mb-3">
                    <Filter className="w-4 h-4" />
                    Role
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedRole === role
                            ? "bg-accent-purple text-white"
                            : "bg-surface-alt text-text-muted hover:bg-surface"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score Filter */}
                <div className="flex-1 min-w-[200px]">
                  <label className="flex items-center gap-2 text-sm text-text-muted mb-3">
                    <FileText className="w-4 h-4" />
                    Score Range
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {scoreFilters.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setSelectedScore(filter)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedScore === filter
                            ? "bg-accent-purple text-white"
                            : "bg-surface-alt text-text-muted hover:bg-surface"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Sessions Grid */}
          {isLoading ? (
             <div className="flex justify-center items-center py-20">
               <Loader2 className="w-12 h-12 text-accent-purple animate-spin" />
             </div>
          ) : filteredSessions.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredSessions.map((session, index) => {
                const score = session.feedback?.overall_score || 0;
                const verdictColor = score >= 80 ? "accent-green" : score >= 60 ? "accent-amber" : "accent-red";
                const verdict = score >= 80 ? "Ready" : score >= 60 ? "Almost Ready" : "Needs Work";
                
                return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  onMouseEnter={() => setHoveredSession(session.id)}
                  onMouseLeave={() => setHoveredSession(null)}
                >
                  <Link to={session.feedback ? `/feedback?session=${session.id}` : `/interview/${session.id}/chat`}>
                    <GlassCard
                      hover
                      className={`p-6 transition-all ${
                        hoveredSession === session.id ? "ring-2 ring-accent-purple" : ""
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-display font-bold capitalize">
                              {session.role}
                            </h3>
                            <span className="px-3 py-1 rounded-full bg-accent-purple/10 text-accent-purple text-xs font-medium capitalize">
                              {session.domain}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-text-muted">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(session.created_at).toLocaleDateString()}
                            </span>
                            <span>{new Date(session.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span>•</span>
                            <span className="capitalize">{session.difficulty}</span>
                          </div>
                        </div>

                        {/* Score Ring */}
                        <div className="flex-shrink-0">
                          <ScoreRing
                            score={score}
                            size={80}
                            strokeWidth={6}
                            animate={false}
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div
                          className={`px-4 py-2 rounded-full font-medium text-sm`}
                          style={{
                            backgroundColor: session.feedback ? `var(--${verdictColor})/0.1` : `var(--accent-purple)/0.1`,
                            color: session.feedback ? `var(--${verdictColor})` : `var(--accent-purple)`,
                          }}
                        >
                          {session.feedback ? verdict : "Resume Interview"}
                        </div>

                        {hoveredSession === session.id && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-accent-purple text-sm font-medium"
                          >
                            {session.feedback ? "View Report" : "Resume"}
                            <ExternalLink className="w-4 h-4" />
                          </motion.div>
                        )}
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              )})}
            </div>
          ) : (
            // Empty State
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-16 text-center">
                <div className="w-20 h-20 rounded-full bg-surface-alt mx-auto mb-6 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-text-muted" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-3">
                  No interviews found
                </h3>
                <p className="text-text-muted mb-8 max-w-md mx-auto">
                  Try adjusting your filters or start a new interview to build your history.
                </p>
                <Link
                  to="/setup"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent-purple text-white font-medium hover:bg-accent-purple/90 transition-colors"
                >
                  Start New Interview
                </Link>
              </GlassCard>
            </motion.div>
          )}

          {/* Stats Summary */}
          {filteredSessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12"
            >
              <GlassCard className="p-8">
                <h3 className="text-xl font-display font-bold mb-6">Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div>
                    <div className="text-3xl font-display font-bold mb-1">
                      {filteredSessions.length}
                    </div>
                    <div className="text-sm text-text-muted">Total Sessions</div>
                  </div>
                  <div>
                    <div className="text-3xl font-display font-bold mb-1">
                      {Math.round(
                        filteredSessions.reduce((acc, s) => acc + (s.feedback?.overall_score || 0), 0) /
                          filteredSessions.length
                      )}
                    </div>
                    <div className="text-sm text-text-muted">Average Score</div>
                  </div>
                  <div>
                    <div className="text-3xl font-display font-bold mb-1">
                      {Math.max(...filteredSessions.map((s) => s.feedback?.overall_score || 0))}
                    </div>
                    <div className="text-sm text-text-muted">Best Score</div>
                  </div>
                  <div>
                    <div className="text-3xl font-display font-bold mb-1 text-accent-green">
                      {filteredSessions.filter((s) => (s.feedback?.overall_score || 0) >= 80).length}
                    </div>
                    <div className="text-sm text-text-muted">Ready</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
