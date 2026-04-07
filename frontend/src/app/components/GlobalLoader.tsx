import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

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
          }, 600);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const letters = "INTELLIMOCK".split("");

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-[#0a0a0f] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Ambient glow orbs */}
          <div className="absolute w-[600px] h-[600px] rounded-full bg-[#7C3AED]/8 blur-[150px] -top-40 -left-40" />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-[#06B6D4]/6 blur-[120px] -bottom-20 -right-20" />
          
          {/* Particle grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, rgba(124,58,237,0.08) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />

          {/* Animated logo text */}
          <div className="relative mb-12">
            <div className="flex items-center gap-[2px]">
              {letters.map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 30, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ 
                    delay: i * 0.08, 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className={`text-5xl md:text-7xl font-bold tracking-tighter ${
                    i >= 7 ? 'text-[#7C3AED]' : 'text-white'
                  }`}
                  style={{ 
                    textShadow: i >= 7 ? '0 0 30px rgba(124,58,237,0.5)' : '0 0 20px rgba(255,255,255,0.1)',
                    fontFamily: "'Syne', 'Inter', sans-serif",
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>
            
            {/* Scanning line */}
            <motion.div
              initial={{ left: '-10%' }}
              animate={{ left: '110%' }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[#7C3AED] to-transparent"
              style={{ filter: 'blur(1px)' }}
            />
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xs font-mono text-gray-500 uppercase tracking-[0.5em] mb-10"
          >
            AI-Powered Interview Platform
          </motion.p>

          {/* Progress bar */}
          <div className="w-64">
            <div className="h-[2px] bg-white/5 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full rounded-full"
                style={{ 
                  background: 'linear-gradient(90deg, #7C3AED, #06B6D4)',
                  boxShadow: '0 0 15px rgba(124,58,237,0.5)'
                }}
                initial={{ width: "0%" }}
                animate={{ width: `${percent}%` }}
              />
            </div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.3em] text-center"
            >
              Calibrating Neural Systems · {percent}%
            </motion.p>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-[#7C3AED]/20 rounded-tl-lg" />
          <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-[#7C3AED]/20 rounded-tr-lg" />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-[#06B6D4]/20 rounded-bl-lg" />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-[#06B6D4]/20 rounded-br-lg" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
