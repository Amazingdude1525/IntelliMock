import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { SplineScene } from "./SplineScene";
import { Sparkles } from "lucide-react";

export function GlobalLoader({ onComplete }: { onComplete?: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
          }, 800);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-accent-purple/10 to-transparent blur-3xl opacity-50" />
          
          <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
            {/* The 3D Soul of the App */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 1.5 }}
              className="w-full h-full"
            >
              <SplineScene 
                scene="https://prod.spline.design/b3JzPfQqzKfS3Uyy/scene.splinecode" 
                className="scale-75 md:scale-80 -translate-y-10"
              />
            </motion.div>
          </div>

          {/* Loading Progress UI */}
          <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <Sparkles className="w-5 h-5 text-accent-purple" />
              </div>
              <span className="text-2xl font-display font-bold tracking-tight text-white">
                Intelli<span className="text-accent-purple">Mock</span>
              </span>
            </motion.div>

            <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full bg-accent-purple shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                initial={{ width: "0%" }}
                animate={{ width: `${percent}%` }}
              />
            </div>
            
            <p className="text-xs font-mono text-text-muted uppercase tracking-[0.3em]">
              Initializing AI Mind... {percent}%
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
