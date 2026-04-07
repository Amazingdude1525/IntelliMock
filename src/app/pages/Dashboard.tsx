import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Navbar } from "../components/Navbar";
import { GridOverlay } from "../components/GridOverlay";
import { GlassCard } from "../components/GlassCard";
import { ScoreRing } from "../components/ScoreRing";
import { motion } from "motion/react";
import { Sparkles, TrendingUp, Award, Flame, ArrowRight, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getSessions, getStats, setAuthToken } from "../../lib/api";
import { SplineScene } from "../components/SplineScene";
import { OnboardingManager } from "../components/OnboardingManager";
import type { Session, UserStats } from "../../types";

export function Dashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [location, setLocation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";
  const displayName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Elite Talent';

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const token = await getToken();
        if (token) setAuthToken(token);
        
        // Fetch location (Simulated or IP based)
        try {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          if (data.city) setLocation(data.city);
        } catch (e) {
          console.log("Location fetch failed, using fallback");
        }

        const [fetchedSessions, fetchedStats] = await Promise.all([
          getSessions(),
          getStats(user.id)
        ]);
        
        setSessions(fetchedSessions.slice(0, 3));
        setStats(fetchedStats);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user, getToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent-purple animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Sessions", value: stats?.total_interviews || "0", icon: Sparkles, trend: "this week" },
    { label: "Avg Score", value: stats?.average_score ? Math.round(stats.average_score) : "0", icon: TrendingUp, trend: "overall" },
    { label: "Best Score", value: stats?.average_score ? Math.round(stats.average_score + 10) : "0", icon: Award, trend: "highest" }, // Mock best
    { label: "Streak", value: stats?.streak || "0", icon: Flame, trend: "days" },
  ];

  // Placeholder graph data based on stats
  const graphData = [
    { date: "Mon", score: stats?.average_score ? stats.average_score - 10 : 0 },
    { date: "Tue", score: stats?.average_score ? stats.average_score - 5 : 0 },
    { date: "Wed", score: stats?.average_score ? stats.average_score : 0 },
    { date: "Thu", score: stats?.average_score ? stats.average_score + 2 : 0 },
    { date: "Fri", score: stats?.average_score || 0 },
  ];

  return (
    <div className="min-h-screen bg-black text-text-primary relative overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
         <SplineScene scene="https://prod.spline.design/ikt8LM2YVfLStsXP/scene.splinecode" className="scale-150 blur-[2px]" />
      </div>
      <GridOverlay />
      <Navbar />
      <OnboardingManager />

      <div className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
               <span className="text-[10px] font-mono text-accent-purple uppercase tracking-[0.4em] font-bold">Neural Link Synchronized</span>
               <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
            </div>
            <h1 className="text-6xl font-display font-black mb-3 tracking-tighter italic">
              {greeting}, <span className="bg-gradient-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent uppercase">
                {displayName}
              </span>
            </h1>
            <p className="text-xl text-text-muted font-light flex items-center gap-2">
              Welcome back {location ? `from ${location}` : ''}. Core systems are ready for deployment.
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <stat.icon className="w-5 h-5 text-accent-purple" />
                    <div className="text-xs font-mono text-accent-green flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </div>
                  </div>
                  <div className="text-4xl font-display font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-text-muted">{stat.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Start New Interview CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link to="/setup">
                  <GlassCard className="p-8 relative overflow-hidden group cursor-pointer border hover:border-accent-purple/50 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/20 to-accent-blue/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-display font-bold mb-2">
                          Start New Interview
                        </h2>
                        <p className="text-text-muted">
                          Choose your role and begin practicing
                        </p>
                      </div>
                      <div className="w-14 h-14 rounded-full bg-accent-purple flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ArrowRight className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </GlassCard>
                </Link>
              </motion.div>

              {/* Recent Sessions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold">Recent Sessions</h2>
                  <Link
                    to="/history"
                    className="text-sm text-accent-purple hover:text-accent-blue transition-colors"
                  >
                    View All
                  </Link>
                </div>

                <div className="space-y-4">
                  {sessions.length === 0 ? (
                    <GlassCard className="p-8 text-center text-text-muted">
                      No interviews completed yet. Start one above!
                    </GlassCard>
                  ) : (
                    sessions.map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <Link to={`/feedback/${session.id}`}>
                          <GlassCard hover className="p-6">
                            <div className="flex items-center gap-6">
                              {/* Score Ring */}
                              <div className="flex-shrink-0">
                                <ScoreRing score={session.feedback?.overall_score || 0} size={80} strokeWidth={6} animate={false} />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-display font-bold text-lg capitalize">
                                    {session.role}
                                  </h3>
                                  <span className="px-3 py-1 rounded-full bg-accent-purple/10 text-accent-purple text-xs font-medium capitalize">
                                    {session.domain}
                                  </span>
                                </div>
                                <p className="text-sm text-text-muted">
                                  {new Date(session.created_at).toLocaleDateString()}
                                </p>
                              </div>

                              {/* Verdict Badge */}
                              <div
                                className={`px-4 py-2 rounded-full font-medium text-sm`}
                                style={{
                                  backgroundColor: `var(--accent-purple)/0.1`,
                                  color: `var(--accent-purple)`,
                                }}
                              >
                                {session.feedback ? "Completed" : "In Progress"}
                              </div>
                            </div>
                          </GlassCard>
                        </Link>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Progress Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <GlassCard className="p-6">
                  <h3 className="text-lg font-display font-bold mb-6">
                    This Week's Progress
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={graphData}>
                        <XAxis
                          dataKey="date"
                          stroke="var(--text-muted)"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="var(--text-muted)"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="var(--accent-purple)"
                          strokeWidth={3}
                          dot={{ fill: "var(--accent-purple)", r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Quick Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <GlassCard className="p-6">
                  <h3 className="text-lg font-display font-bold mb-4">
                    Quick Tips
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-accent-green text-xs">✓</span>
                      </div>
                      <p className="text-sm text-text-muted">
                        Practice daily for consistent improvement
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-accent-blue text-xs">✓</span>
                      </div>
                      <p className="text-sm text-text-muted">
                        Review feedback after each session
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-accent-purple text-xs">✓</span>
                      </div>
                      <p className="text-sm text-text-muted">
                        Try different roles to expand your skills
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
