import { motion } from 'motion/react';

const orbs = [
  { size: 400, x: '5%', y: '10%', color1: '#7C3AED', color2: '#06B6D4', duration: 25 },
  { size: 300, x: '75%', y: '60%', color1: '#22C55E', color2: '#7C3AED', duration: 30 },
  { size: 350, x: '45%', y: '75%', color1: '#7C3AED', color2: '#F43F5E', duration: 22 },
  { size: 200, x: '15%', y: '65%', color1: '#06B6D4', color2: '#22C55E', duration: 28 },
  { size: 250, x: '65%', y: '8%', color1: '#8B5CF6', color2: '#F59E0B', duration: 26 },
];

export function GlowOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color1}12, ${orb.color2}06, transparent 70%)`,
            filter: 'blur(100px)',
          }}
          animate={{
            x: [0, 40, -30, 20, 0],
            y: [0, -30, 40, -15, 0],
            scale: [1, 1.15, 0.9, 1.1, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* Subtle grid dot pattern */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(124,58,237,0.3) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      />
    </div>
  );
}
