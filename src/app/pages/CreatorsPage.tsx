import { motion } from "motion/react";
import { Navbar } from "../components/Navbar";
import { GridOverlay } from "../components/GridOverlay";
import { GlassCard } from "../components/GlassCard";
import { Github, Linkedin, Mail, Zap } from "lucide-react";

const creators = [
  {
    name: "Prateek Das",
    role: "Lead Architect & AI Systems",
    bio: "Visionary behind the IntelliMock core engine and behavioral biometric systems. Specializing in high-fidelity AI integration.",
    links: { github: "https://github.com/Amazingdude1525", linkedin: "#", mail: "mailto:prateek@example.com" }
  },
  {
    name: "Abhishek Kumar Singh",
    role: "Senior UI/UX & Frontend Lead",
    bio: "Architect of the premium glassmorphic interface and 3D Spline integration.",
    links: { github: "https://github.com/AbhishekSingh", linkedin: "#", mail: "mailto:abhishek@example.com" }
  },
  {
    name: "Kishlay Mishra",
    role: "Backend & Cloud Orchestrator",
    bio: "Mastermind of the high-concurrency Node.js infrastructure and database scaling.",
    links: { github: "https://github.com/KishlayMishra", linkedin: "#", mail: "mailto:kishlay@example.com" }
  }
];

export function CreatorsPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <GridOverlay />
      <Navbar />

      <div className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 mb-6">
              <Zap className="w-4 h-4 text-accent-purple" />
              <span className="text-xs font-mono text-accent-purple uppercase tracking-widest">The Masterminds</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-display font-black mb-6 tracking-tighter">
              Team <span className="bg-gradient-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent">Ctrl Alt Elite</span>
            </h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto font-light leading-relaxed">
              We are a team of passionate creators dedicated to pushing the boundaries of AI-driven career development.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {creators.map((creator, index) => (
              <motion.div
                key={creator.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-8 h-full flex flex-col text-left group hover:border-accent-purple/50 transition-all duration-500">
                  <div className="mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500">
                      <span className="text-3xl font-display font-bold text-accent-purple">
                        {creator.name.charAt(0)}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-display font-bold mb-2 group-hover:text-accent-purple transition-colors">
                    {creator.name}
                  </h3>
                  <p className="text-accent-blue text-sm font-mono mb-6 uppercase tracking-widest">
                    {creator.role}
                  </p>
                  <p className="text-text-muted text-sm leading-relaxed mb-10 flex-grow">
                    {creator.bio}
                  </p>

                  <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                    <a href={creator.links.github} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                    <a href={creator.links.linkedin} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href={creator.links.mail} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-32 text-center"
          >
            <p className="text-xs font-mono text-text-muted uppercase tracking-[0.5em]">
              Designed with Precision & Passion
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
