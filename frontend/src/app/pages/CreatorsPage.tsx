import { motion } from "motion/react";
import { Navbar } from "../components/Navbar";
import { GridOverlay } from "../components/GridOverlay";
import { GlassCard } from "../components/GlassCard";
import { Github, Linkedin, Mail, Zap } from "lucide-react";

const creators = [
  {
    name: "Prateek Das",
    role: "Lead Architect & AI Systems",
    bio: "Visionary behind the IntelliMock core engine and behavioral biometric systems. Specializing in high-fidelity AI integration and full-stack development.",
    initial: "P",
    color: "#7C3AED",
    photo: "/team/prateek.jpg",
    links: {
      github: "https://github.com/Amazingdude1525",
      linkedin: "https://www.linkedin.com/in/prateek-das-a45215252/",
      mail: "mailto:prateek@intellimock.dev"
    }
  },
  {
    name: "Abhishek Kumar Singh",
    role: "Senior UI/UX & Frontend Lead",
    bio: "Architect of the premium glassmorphic interface and 3D integration. Passionate about creating world-class user experiences.",
    initial: "A",
    color: "#06B6D4",
    photo: "/team/abhishek.jpg",
    links: {
      github: "https://github.com/ABHISHEKKUMARSINGH-dev",
      linkedin: "https://www.linkedin.com/in/abhishek-kumar-singh-67667825a/",
      mail: "mailto:abhishek.25bce11273@vitbhopal.ac.in"
    }
  },
  {
    name: "Kishlay Mishra",
    role: "Backend & Cloud Orchestrator",
    bio: "Mastermind of the high-concurrency Node.js infrastructure, database scaling, and cloud-native deployment pipelines.",
    initial: "K",
    color: "#22C55E",
    photo: "/team/kishlay.jpg",
    links: {
      github: "https://github.com/bekishu999",
      linkedin: "https://www.linkedin.com/in/kishlaymishra999/",
      mail: "mailto:kishlay@intellimock.dev"
    }
  }
];

export function CreatorsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      <GridOverlay />
      <Navbar />

      <div className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 mb-6">
              <Zap className="w-4 h-4 text-[#7C3AED]" />
              <span className="text-xs font-mono text-[#7C3AED] uppercase tracking-widest">The Masterminds</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Team <span className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">Ctrl Alt Elite</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              We are a team of passionate creators from VIT Bhopal, dedicated to pushing the boundaries of AI-driven career development.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {creators.map((creator, index) => (
              <motion.div
                key={creator.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <GlassCard className="p-8 h-full flex flex-col text-center group hover:border-[#7C3AED]/50 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(124,58,237,0.1)] transition-all duration-500">
                  {/* Photo / Initial */}
                  <div className="mb-8 flex justify-center">
                    <div
                      className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-white/10 group-hover:scale-[1.15] group-hover:border-[#7C3AED]/50 transition-all duration-500 overflow-hidden shadow-2xl relative"
                      style={{ background: `linear-gradient(135deg, ${creator.color}20, ${creator.color}05)` }}
                    >
                      <img
                        src={creator.photo}
                        alt={creator.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<span class="text-5xl font-bold" style="color:${creator.color}">${creator.initial}</span>`;
                        }}
                      />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-2 group-hover:text-[#7C3AED] transition-colors">
                    {creator.name}
                  </h3>
                  <p className="text-sm font-mono mb-6 uppercase tracking-widest" style={{ color: creator.color }}>
                    {creator.role}
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-10 flex-grow">
                    {creator.bio}
                  </p>

                  <div className="flex items-center justify-center gap-4 border-t border-white/5 pt-6 mt-auto">
                    <a href={creator.links.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                    <a href={creator.links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
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
            <p className="text-[10px] md:text-xs font-mono text-gray-500 uppercase tracking-[0.3em] md:tracking-[0.5em]">
              BUILT WITH PRECISION · ELITE PERFORMANCE ARCHITECTURE
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
