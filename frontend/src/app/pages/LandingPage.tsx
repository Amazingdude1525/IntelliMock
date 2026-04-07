import { Link } from "react-router";
import { Navbar } from "../components/Navbar";
import { GridOverlay } from "../components/GridOverlay";
import { GlassCard } from "../components/GlassCard";
import { GlowOrbs } from "../components/GlowOrbs";
import { motion } from "motion/react";
import { 
  Sparkles, 
  Brain, 
  Target, 
  TrendingUp, 
  MessageSquare, 
  Mic, 
  BarChart3,
  ArrowDown 
} from "lucide-react";
import { lazy, Suspense } from "react";
import { SplineScene } from "../components/SplineScene";

const Hero3D = lazy(() => import("../components/Hero3D").then(m => ({ default: m.Hero3D })));

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-text-primary relative overflow-hidden">
      <GlowOrbs />
      <GridOverlay />
      <Suspense fallback={null}><Hero3D /></Suspense>
      <Navbar transparent />
      
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-48 pb-20">
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-7xl md:text-8xl font-display font-black leading-[0.9] mb-8 tracking-tighter">
              The Future of{" "}
              <span className="bg-gradient-to-r from-accent-purple via-accent-blue to-accent-green bg-clip-text text-transparent">
                Career Intelligence
              </span>
              .
            </h1>
            <p className="text-xl text-text-muted mb-8 leading-relaxed">
              AI-powered mock interviews that adapt to your level. Get instant feedback, 
              build confidence, and land your dream job.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/setup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent-purple text-white font-medium text-lg hover:bg-accent-purple/90 transition-all hover:scale-105 shadow-lg shadow-accent-purple/25"
              >
                <Sparkles className="w-5 h-5" />
                Start Interview
              </Link>
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-surface-alt border border-border text-text-primary font-medium text-lg hover:bg-surface transition-all">
                Learn More
              </button>
            </div>
          </motion.div>

          {/* Right Side - Spline 3D Scene */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[500px] lg:h-[600px] w-full"
          >
            <SplineScene 
              scene="https://prod.spline.design/KChzoSKgLSxtlaux/scene.splinecode" 
              className="scale-110 lg:scale-125 select-none pointer-events-none"
            />
            
            {/* Decorative Floating Glows */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-accent-purple/20 blur-3xl"
            />
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-accent-blue/20 blur-3xl"
            />
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        >
          <ArrowDown className="w-6 h-6 text-text-muted" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-display font-bold mb-4">
              Why IntelliMock?
            </h2>
            <p className="text-xl text-text-muted">
              Everything you need to ace your next interview
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered Feedback",
                description: "Get detailed insights on communication, clarity, and technical depth from our advanced AI.",
                color: "accent-purple",
              },
              {
                icon: Target,
                title: "Role-Specific Practice",
                description: "Practice for SDE, PM, Design, or any role with customized questions and scenarios.",
                color: "accent-blue",
              },
              {
                icon: TrendingUp,
                title: "Track Your Progress",
                description: "See your improvement over time with detailed analytics and personalized recommendations.",
                color: "accent-green",
              },
              {
                icon: MessageSquare,
                title: "Chat Mode",
                description: "Practice with text-based interviews at your own pace, perfect for technical questions.",
                color: "accent-amber",
              },
              {
                icon: Mic,
                title: "Voice Mode",
                description: "Simulate real interviews with voice interactions and get feedback on your speaking style.",
                color: "accent-red",
              },
              {
                icon: BarChart3,
                title: "Career Roadmap",
                description: "Receive personalized action plans to improve specific skills and land your dream job.",
                color: "accent-blue",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard hover className="p-8 h-full">
                  <div className={`w-14 h-14 rounded-xl bg-surface-alt flex items-center justify-center mb-6 border border-border`}>
                    <feature.icon className={`w-7 h-7`} style={{ color: `var(--${feature.color})` }} />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-text-muted leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-display font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-text-muted">
              Get started in three simple steps
            </p>
          </motion.div>

          <div className="space-y-12">
            {[
              {
                number: "01",
                title: "Choose Your Path",
                description: "Select your target role, difficulty level, and interview style. Customize the experience to match your goals.",
              },
              {
                number: "02",
                title: "Practice with AI",
                description: "Engage in realistic mock interviews. Our AI adapts to your responses and provides relevant follow-up questions.",
              },
              {
                number: "03",
                title: "Get Feedback & Improve",
                description: "Review detailed feedback on your performance. Track your progress and follow personalized recommendations.",
              },
            ].map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="flex gap-8 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                      <span className="text-3xl font-display font-bold text-white">
                        {step.number}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-2xl font-display font-bold mb-3">
                      {step.title}
                    </h3>
                    <p className="text-lg text-text-muted leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < 2 && (
                  <div className="absolute left-10 top-24 w-0.5 h-12 bg-gradient-to-b from-accent-purple/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link
              to="/setup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent-purple text-white font-medium text-lg hover:bg-accent-purple/90 transition-all hover:scale-105 shadow-lg shadow-accent-purple/25"
            >
              Get Started Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-20 px-6 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-green flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-display font-bold">Intelli<span className="text-accent-purple">Mock</span></span>
            </div>
            <p className="text-text-muted max-w-sm leading-relaxed mb-8">
              Empowering the next generation of talent with state-of-the-art AI behavioral analysis and role-specific simulation.
            </p>
            <div className="text-xs font-mono text-text-muted uppercase tracking-widest">
              Made with precision by <Link to="/creators" className="text-white hover:text-accent-purple transition-colors">Team Ctrl Alt Elite</Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 italic">Platform</h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li><Link to="/setup" className="hover:text-white transition-colors">Start Interview</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/history" className="hover:text-white transition-colors">Session History</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 italic">Support</h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ & Help</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-mono text-text-muted uppercase tracking-[0.3em]">
            © 2026 IntelliMock. Elite Performance Architecture.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-text-muted hover:text-white transition-colors italic text-xs uppercase tracking-widest">Twitter</a>
            <a href="#" className="text-text-muted hover:text-white transition-colors italic text-xs uppercase tracking-widest">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
