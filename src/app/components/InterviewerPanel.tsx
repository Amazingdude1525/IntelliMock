import { motion } from "motion/react";
import { SplineScene } from "./SplineScene";
import { User, Cpu, Brain, Zap } from "lucide-react";

interface Interviewer {
  id: number;
  name: string;
  role: string;
  scene: string;
  color: string;
}

const interviewers: Interviewer[] = [
  { id: 1, name: "Nexus", role: "Technical Architect", scene: "https://prod.spline.design/b3JzPfQqzKfS3Uyy/scene.splinecode", color: "var(--accent-purple)" },
  { id: 2, name: "Core", role: "Logic Engine", scene: "https://prod.spline.design/b3JzPfQqzKfS3Uyy/scene.splinecode", color: "var(--accent-blue)" },
  { id: 3, name: "Synapse", role: "Behavioral Analyst", scene: "https://prod.spline.design/b3JzPfQqzKfS3Uyy/scene.splinecode", color: "var(--accent-green)" }
];

export function InterviewerPanel({ isStreaming, activeId = 1 }: { isStreaming: boolean, activeId?: number }) {
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent-purple/5 to-transparent blur-3xl opacity-30" />
      
      <div className="flex items-center justify-center gap-8 md:gap-20 relative z-10">
        {interviewers.map((interviewer) => (
          <motion.div
            key={interviewer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: isStreaming && activeId === interviewer.id ? 1.1 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`flex flex-col items-center group relative`}
          >
            {/* Holographic Platform */}
            <div className="absolute -bottom-4 w-32 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm rounded-full opacity-50" />
            
            <div className={`w-32 h-32 md:w-48 md:h-48 relative transition-all duration-700 ${
              isStreaming && activeId === interviewer.id 
                ? "drop-shadow-[0_0_30px_rgba(124,58,237,0.4)]" 
                : "opacity-40 grayscale-[50%]"
            }`}>
              <SplineScene 
                scene={interviewer.scene} 
                className="scale-100"
              />
              
              {/* Active Indicator Ring */}
              {isStreaming && activeId === interviewer.id && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                  className="absolute inset-0 rounded-full border-2 border-accent-purple/30 blur-md pointer-events-none"
                />
              )}
            </div>

            <motion.div 
              animate={{ opacity: isStreaming && activeId === interviewer.id ? 1 : 0.6 }}
              className="mt-6 text-center"
            >
              <h3 className="text-lg font-display font-bold tracking-tight mb-1 text-white uppercase italic">
                {interviewer.name}
              </h3>
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                {interviewer.role}
              </p>
            </motion.div>

            {/* Speaking Pulse */}
            {isStreaming && activeId === interviewer.id && (
              <div className="absolute -top-4 flex gap-1">
                <motion.div animate={{ height: [8, 20, 8] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-accent-purple rounded-full" />
                <motion.div animate={{ height: [12, 28, 12] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-1 bg-accent-purple rounded-full" />
                <motion.div animate={{ height: [8, 20, 8] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-1 bg-accent-purple rounded-full" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
          <div className="flex gap-1">
             <div className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-accent-green animate-pulse' : 'bg-text-muted'}`} />
          </div>
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
            {isStreaming ? 'Intelli-Mesh Synchronized' : 'Monitoring Environment'}
          </span>
        </div>
      </div>
    </div>
  );
}
