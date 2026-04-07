interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = "", hover = false }: GlassCardProps) {
  return (
    <div
      className={`
        backdrop-blur-xl 
        bg-glass-bg 
        border border-glass-border
        rounded-[var(--radius-card)]
        transition-all duration-200
        ${hover ? "hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-accent-purple/10" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
