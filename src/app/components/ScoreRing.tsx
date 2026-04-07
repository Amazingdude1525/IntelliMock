import { motion } from "motion/react";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  animate?: boolean;
}

export function ScoreRing({
  score,
  size = 120,
  strokeWidth = 8,
  label = "",
  animate = true,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (value: number) => {
    if (value >= 80) return "url(#gradient-green)";
    if (value >= 60) return "url(#gradient-amber)";
    return "url(#gradient-red)";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-green)" />
            <stop offset="100%" stopColor="var(--accent-blue)" />
          </linearGradient>
          <linearGradient id="gradient-amber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-amber)" />
            <stop offset="100%" stopColor="var(--accent-green)" />
          </linearGradient>
          <linearGradient id="gradient-red" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-red)" />
            <stop offset="100%" stopColor="var(--accent-amber)" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-alt dark:text-border/30"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : offset}
          strokeLinecap="round"
          animate={animate ? { strokeDashoffset: offset } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        {/* Score text */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="0.3em"
          className="text-3xl font-display font-bold fill-text-primary transform rotate-90"
          style={{ transformOrigin: "center" }}
        >
          {score}
        </text>
      </svg>
      
      {label && (
        <span className="text-sm font-medium text-text-muted">{label}</span>
      )}
    </div>
  );
}
