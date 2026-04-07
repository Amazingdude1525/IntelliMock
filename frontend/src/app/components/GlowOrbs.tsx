import { motion } from 'motion/react';

const orbs = [
  { size: 300, x: '10%', y: '20%', color1: '#7C3AED', color2: '#38BDF8', duration: 20 },
  { size: 200, x: '80%', y: '60%', color1: '#00E699', color2: '#7C3AED', duration: 25 },
  { size: 250, x: '50%', y: '80%', color1: '#F59E0B', color2: '#F43F5E', duration: 18 },
  { size: 150, x: '20%', y: '70%', color1: '#38BDF8', color2: '#00E699', duration: 22 },
  { size: 180, x: '70%', y: '15%', color1: '#7C3AED', color2: '#F59E0B', duration: 24 },
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
            background: `radial-gradient(circle, ${orb.color1}15, ${orb.color2}08, transparent)`,
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -20, 30, -10, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
