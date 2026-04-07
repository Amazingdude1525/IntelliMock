import { motion } from "motion/react";

interface AvatarProps {
  size?: number;
  isSpeaking?: boolean;
  accentColor?: string;
}

// Priya Sharma — Indian female, warm skin, dark hair in bun, purple blazer
export function PriyaSharma({ size = 120, isSpeaking = false, accentColor = "#7C3AED" }: AvatarProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 120 120" fill="none"
      animate={isSpeaking ? { y: [0, -3, 0] } : { y: 0 }}
      transition={isSpeaking ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" } : {}}
    >
      {/* Glow ring */}
      <circle cx="60" cy="60" r="58" stroke={accentColor} strokeWidth={isSpeaking ? 3 : 1} opacity={isSpeaking ? 0.8 : 0.2} />
      {/* Face */}
      <circle cx="60" cy="55" r="32" fill="#D4A574" />
      {/* Hair bun */}
      <ellipse cx="60" cy="28" rx="22" ry="14" fill="#1a1a2e" />
      <circle cx="60" cy="20" r="10" fill="#1a1a2e" />
      {/* Hair sides */}
      <path d="M38 45 Q35 30 42 25 Q48 22 50 30 Z" fill="#1a1a2e" />
      <path d="M82 45 Q85 30 78 25 Q72 22 70 30 Z" fill="#1a1a2e" />
      {/* Eyes */}
      <ellipse cx="50" cy="52" rx="3.5" ry="4" fill="#1a1a2e" />
      <ellipse cx="70" cy="52" rx="3.5" ry="4" fill="#1a1a2e" />
      <circle cx="51" cy="51" r="1.2" fill="white" />
      <circle cx="71" cy="51" r="1.2" fill="white" />
      {/* Eyebrows */}
      <path d="M44 46 Q50 42 56 46" stroke="#1a1a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M64 46 Q70 42 76 46" stroke="#1a1a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <path d="M58 58 Q60 62 62 58" stroke="#c49560" strokeWidth="1.5" fill="none" />
      {/* Mouth */}
      <path d={isSpeaking ? "M52 67 Q60 72 68 67" : "M54 66 Q60 69 66 66"} stroke="#b87a5a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Bindi */}
      <circle cx="60" cy="42" r="1.5" fill="#e74c3c" />
      {/* Purple Blazer */}
      <path d="M30 95 Q35 78 60 80 Q85 78 90 95 L90 120 L30 120 Z" fill="#6B21A8" />
      <path d="M50 80 L55 95 L60 80 L65 95 L70 80" stroke="#7C3AED" strokeWidth="1" fill="none" />
      {/* Collar */}
      <path d="M50 80 L56 88 L60 82 L64 88 L70 80" stroke="white" strokeWidth="1.2" fill="none" />
    </motion.svg>
  );
}

// James O'Brien — White male, salt-pepper hair, blue suit, glasses
export function JamesOBrien({ size = 120, isSpeaking = false, accentColor = "#06B6D4" }: AvatarProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 120 120" fill="none"
      animate={isSpeaking ? { y: [0, -3, 0] } : { y: 0 }}
      transition={isSpeaking ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" } : {}}
    >
      <circle cx="60" cy="60" r="58" stroke={accentColor} strokeWidth={isSpeaking ? 3 : 1} opacity={isSpeaking ? 0.8 : 0.2} />
      {/* Face */}
      <circle cx="60" cy="55" r="32" fill="#F5D6B8" />
      {/* Hair - salt and pepper */}
      <ellipse cx="60" cy="30" rx="28" ry="16" fill="#555566" />
      <ellipse cx="45" cy="32" rx="6" ry="4" fill="#888899" />
      <ellipse cx="75" cy="32" rx="6" ry="4" fill="#888899" />
      {/* Glasses */}
      <rect x="41" y="47" width="15" height="12" rx="3" stroke="#333" strokeWidth="2" fill="none" />
      <rect x="64" y="47" width="15" height="12" rx="3" stroke="#333" strokeWidth="2" fill="none" />
      <line x1="56" y1="52" x2="64" y2="52" stroke="#333" strokeWidth="1.5" />
      {/* Eyes behind glasses */}
      <ellipse cx="48.5" cy="53" rx="3" ry="3.5" fill="#2c5f7c" />
      <ellipse cx="71.5" cy="53" rx="3" ry="3.5" fill="#2c5f7c" />
      <circle cx="47.5" cy="52" r="1" fill="white" />
      <circle cx="70.5" cy="52" r="1" fill="white" />
      {/* Eyebrows */}
      <path d="M42 44 Q48 40 56 44" stroke="#555" strokeWidth="2" fill="none" />
      <path d="M64 44 Q72 40 78 44" stroke="#555" strokeWidth="2" fill="none" />
      {/* Nose */}
      <path d="M58 59 Q60 64 62 59" stroke="#dbb896" strokeWidth="1.5" fill="none" />
      {/* Mouth */}
      <path d={isSpeaking ? "M52 68 Q60 74 68 68" : "M54 67 Q60 70 66 67"} stroke="#c49078" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Blue Suit */}
      <path d="M30 95 Q35 78 60 80 Q85 78 90 95 L90 120 L30 120 Z" fill="#1e3a5f" />
      <line x1="60" y1="82" x2="60" y2="110" stroke="#264d73" strokeWidth="1" />
      {/* Tie */}
      <path d="M57 82 L60 100 L63 82" fill="#06B6D4" />
      {/* Collar */}
      <path d="M48 80 L55 88 L60 82 L65 88 L72 80" stroke="white" strokeWidth="1.5" fill="none" />
    </motion.svg>
  );
}

// Chen Wei — East Asian male, short dark hair, grey turtleneck, serious
export function ChenWei({ size = 120, isSpeaking = false, accentColor = "#8B5CF6" }: AvatarProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 120 120" fill="none"
      animate={isSpeaking ? { y: [0, -3, 0] } : { y: 0 }}
      transition={isSpeaking ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" } : {}}
    >
      <circle cx="60" cy="60" r="58" stroke={accentColor} strokeWidth={isSpeaking ? 3 : 1} opacity={isSpeaking ? 0.8 : 0.2} />
      {/* Face */}
      <circle cx="60" cy="55" r="32" fill="#F0D0A0" />
      {/* Short dark hair */}
      <ellipse cx="60" cy="30" rx="28" ry="15" fill="#0a0a1a" />
      <rect x="35" y="28" width="50" height="8" rx="4" fill="#0a0a1a" />
      {/* Eyes — narrower */}
      <path d="M45 52 Q48 48 55 52 Q48 54 45 52" fill="#1a1a2e" />
      <path d="M65 52 Q72 48 75 52 Q72 54 65 52" fill="#1a1a2e" />
      <circle cx="50" cy="51.5" r="1" fill="white" />
      <circle cx="70" cy="51.5" r="1" fill="white" />
      {/* Eyebrows — straight serious */}
      <line x1="44" y1="46" x2="56" y2="46" stroke="#0a0a1a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="64" y1="46" x2="76" y2="46" stroke="#0a0a1a" strokeWidth="2.5" strokeLinecap="round" />
      {/* Nose */}
      <path d="M58 58 Q60 63 62 58" stroke="#d4b080" strokeWidth="1.5" fill="none" />
      {/* Mouth — neutral serious */}
      <path d={isSpeaking ? "M53 67 Q60 72 67 67" : "M54 67 L66 67"} stroke="#b8906a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Grey Turtleneck */}
      <path d="M30 95 Q35 78 60 80 Q85 78 90 95 L90 120 L30 120 Z" fill="#3a3a4a" />
      <path d="M48 80 Q52 75 60 74 Q68 75 72 80" stroke="#4a4a5a" strokeWidth="3" fill="none" />
      <path d="M50 80 Q55 76 60 75 Q65 76 70 80" stroke="#555566" strokeWidth="2" fill="none" />
    </motion.svg>
  );
}

// Aisha Nwosu — Black female, natural hair, green blazer, warm smile
export function AishaNwosu({ size = 120, isSpeaking = false, accentColor = "#22C55E" }: AvatarProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 120 120" fill="none"
      animate={isSpeaking ? { y: [0, -3, 0] } : { y: 0 }}
      transition={isSpeaking ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" } : {}}
    >
      <circle cx="60" cy="60" r="58" stroke={accentColor} strokeWidth={isSpeaking ? 3 : 1} opacity={isSpeaking ? 0.8 : 0.2} />
      {/* Face */}
      <circle cx="60" cy="55" r="32" fill="#8B6914" />
      {/* Natural curly hair */}
      <circle cx="42" cy="30" r="12" fill="#1a1a1a" />
      <circle cx="60" cy="24" r="14" fill="#1a1a1a" />
      <circle cx="78" cy="30" r="12" fill="#1a1a1a" />
      <circle cx="36" cy="42" r="8" fill="#1a1a1a" />
      <circle cx="84" cy="42" r="8" fill="#1a1a1a" />
      <circle cx="50" cy="22" r="10" fill="#222" />
      <circle cx="70" cy="22" r="10" fill="#222" />
      {/* Eyes */}
      <ellipse cx="50" cy="52" rx="3.5" ry="4" fill="#1a1a2e" />
      <ellipse cx="70" cy="52" rx="3.5" ry="4" fill="#1a1a2e" />
      <circle cx="51" cy="51" r="1.2" fill="white" />
      <circle cx="71" cy="51" r="1.2" fill="white" />
      {/* Eyebrows */}
      <path d="M44 46 Q50 42 56 46" stroke="#111" strokeWidth="2" fill="none" />
      <path d="M64 46 Q70 42 76 46" stroke="#111" strokeWidth="2" fill="none" />
      {/* Nose */}
      <path d="M57 58 Q60 63 63 58" stroke="#7a5810" strokeWidth="1.5" fill="none" />
      {/* Warm smile */}
      <path d={isSpeaking ? "M50 66 Q60 75 70 66" : "M52 65 Q60 72 68 65"} stroke="#6a4810" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Green Blazer */}
      <path d="M30 95 Q35 78 60 80 Q85 78 90 95 L90 120 L30 120 Z" fill="#166534" />
      <path d="M50 80 L56 90 L60 82 L64 90 L70 80" stroke="#22C55E" strokeWidth="1" fill="none" />
      {/* Collar */}
      <path d="M50 80 L56 88 L60 82 L64 88 L70 80" stroke="white" strokeWidth="1.2" fill="none" />
      {/* Earrings */}
      <circle cx="32" cy="56" r="2.5" fill="#FFD700" />
      <circle cx="88" cy="56" r="2.5" fill="#FFD700" />
    </motion.svg>
  );
}

// Marcus Lee — Mixed race male, curly hair, casual startup style
export function MarcusLee({ size = 120, isSpeaking = false, accentColor = "#F59E0B" }: AvatarProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 120 120" fill="none"
      animate={isSpeaking ? { y: [0, -3, 0] } : { y: 0 }}
      transition={isSpeaking ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" } : {}}
    >
      <circle cx="60" cy="60" r="58" stroke={accentColor} strokeWidth={isSpeaking ? 3 : 1} opacity={isSpeaking ? 0.8 : 0.2} />
      {/* Face */}
      <circle cx="60" cy="55" r="32" fill="#C8956C" />
      {/* Curly hair */}
      <circle cx="45" cy="28" r="10" fill="#2a1a0a" />
      <circle cx="60" cy="24" r="12" fill="#2a1a0a" />
      <circle cx="75" cy="28" r="10" fill="#2a1a0a" />
      <circle cx="38" cy="36" r="7" fill="#3a2a1a" />
      <circle cx="82" cy="36" r="7" fill="#3a2a1a" />
      {/* Eyes */}
      <ellipse cx="50" cy="52" rx="3.5" ry="3.5" fill="#1a1a2e" />
      <ellipse cx="70" cy="52" rx="3.5" ry="3.5" fill="#1a1a2e" />
      <circle cx="51" cy="51" r="1.2" fill="white" />
      <circle cx="71" cy="51" r="1.2" fill="white" />
      {/* Relaxed eyebrows */}
      <path d="M44 47 Q50 44 56 47" stroke="#2a1a0a" strokeWidth="1.8" fill="none" />
      <path d="M64 47 Q70 44 76 47" stroke="#2a1a0a" strokeWidth="1.8" fill="none" />
      {/* Nose */}
      <path d="M58 58 Q60 62 62 58" stroke="#b07850" strokeWidth="1.5" fill="none" />
      {/* Casual smile */}
      <path d={isSpeaking ? "M51 66 Q60 73 69 66" : "M53 66 Q60 70 67 66"} stroke="#a06840" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Casual Hoodie */}
      <path d="M30 95 Q35 78 60 80 Q85 78 90 95 L90 120 L30 120 Z" fill="#374151" />
      {/* Hood line */}
      <path d="M42 82 Q50 76 60 75 Q70 76 78 82" stroke="#4B5563" strokeWidth="2.5" fill="none" />
      {/* String */}
      <line x1="55" y1="82" x2="53" y2="95" stroke="#6B7280" strokeWidth="1" />
      <line x1="65" y1="82" x2="67" y2="95" stroke="#6B7280" strokeWidth="1" />
    </motion.svg>
  );
}

// Elena Kovac — European female, blonde, strict expression, white blazer
export function ElenaKovac({ size = 120, isSpeaking = false, accentColor = "#F43F5E" }: AvatarProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 120 120" fill="none"
      animate={isSpeaking ? { y: [0, -3, 0] } : { y: 0 }}
      transition={isSpeaking ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" } : {}}
    >
      <circle cx="60" cy="60" r="58" stroke={accentColor} strokeWidth={isSpeaking ? 3 : 1} opacity={isSpeaking ? 0.8 : 0.2} />
      {/* Face */}
      <circle cx="60" cy="55" r="32" fill="#FCE4C8" />
      {/* Blonde straight hair */}
      <ellipse cx="60" cy="30" rx="30" ry="16" fill="#D4A843" />
      <rect x="32" y="30" width="10" height="35" rx="5" fill="#D4A843" />
      <rect x="78" y="30" width="10" height="35" rx="5" fill="#D4A843" />
      <ellipse cx="60" cy="28" rx="26" ry="12" fill="#E0B84D" />
      {/* Eyes — sharp */}
      <ellipse cx="50" cy="52" rx="3.5" ry="3" fill="#4A90D9" />
      <ellipse cx="70" cy="52" rx="3.5" ry="3" fill="#4A90D9" />
      <circle cx="49" cy="51.5" r="1" fill="white" />
      <circle cx="69" cy="51.5" r="1" fill="white" />
      {/* Sharp eyebrows */}
      <path d="M43 46 Q48 42 56 45" stroke="#9A7830" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M64 45 Q72 42 77 46" stroke="#9A7830" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <path d="M58 58 Q60 62 62 58" stroke="#e0c4a0" strokeWidth="1.5" fill="none" />
      {/* Strict neutral mouth */}
      <path d={isSpeaking ? "M53 67 Q60 71 67 67" : "M54 67 L66 67"} stroke="#c4907a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* White Blazer */}
      <path d="M30 95 Q35 78 60 80 Q85 78 90 95 L90 120 L30 120 Z" fill="#E5E7EB" />
      <line x1="60" y1="82" x2="60" y2="110" stroke="#D1D5DB" strokeWidth="1" />
      {/* Collar */}
      <path d="M48 80 L55 90 L60 82 L65 90 L72 80" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
      {/* Blouse underneath */}
      <path d="M54 82 Q60 78 66 82" fill="#F43F5E" />
    </motion.svg>
  );
}

// Recruiter data for easy mapping
export const RECRUITERS = [
  { id: 'priya', name: 'Priya Sharma', role: 'HR Lead', company: 'TCS Digital', style: 'Friendly', Avatar: PriyaSharma, color: '#7C3AED' },
  { id: 'james', name: "James O'Brien", role: 'VP Engineering', company: 'Barclays', style: 'Strict', Avatar: JamesOBrien, color: '#06B6D4' },
  { id: 'chen', name: 'Chen Wei', role: 'Staff Engineer', company: 'ByteDance', style: 'Deep-diver', Avatar: ChenWei, color: '#8B5CF6' },
  { id: 'aisha', name: 'Aisha Nwosu', role: 'People Director', company: 'Spotify', style: 'Friendly', Avatar: AishaNwosu, color: '#22C55E' },
  { id: 'marcus', name: 'Marcus Lee', role: 'CTO', company: 'YC Startup', style: 'Casual', Avatar: MarcusLee, color: '#F59E0B' },
  { id: 'elena', name: 'Elena Kovac', role: 'Principal PM', company: 'McKinsey Digital', style: 'Strict', Avatar: ElenaKovac, color: '#F43F5E' },
] as const;
