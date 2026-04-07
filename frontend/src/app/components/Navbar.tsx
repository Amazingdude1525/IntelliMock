import { Link, useLocation } from "react-router";
import { Zap } from "lucide-react";
import { useUser, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { motion } from "motion/react";

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const location = useLocation();
  const { user } = useUser();
  const isLanding = location.pathname === "/";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getUserDisplayName = () => {
    if (user?.firstName) return user.firstName;
    const email = user?.primaryEmailAddress?.emailAddress;
    return email ? email.split('@')[0] : 'Explorer';
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-[100] border-b border-white/[0.06]"
      style={{
        background: transparent 
          ? 'linear-gradient(to bottom, rgba(10,10,15,0.9), transparent)'
          : 'rgba(10,10,15,0.7)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#7C3AED]/40 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(124,58,237,0.3)] group-hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-shadow">
               <Zap className="w-5 h-5 text-white relative z-10" />
               <div className="absolute inset-0 bg-gradient-to-tr from-[#06B6D4]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
                INTELLI<span className="text-[#7C3AED]">MOCK</span>
              </span>
              <span className="text-[7px] font-mono text-[#22C55E] uppercase tracking-[0.4em] font-bold">Elite Terminal</span>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8">
            {(!isLanding || user) && (
              <>
                {[
                  { to: "/dashboard", label: "Dashboard" },
                  { to: "/history", label: "History" },
                  { to: "/creators", label: "Creators" },
                ].map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-[10px] font-mono uppercase tracking-[0.2em] font-bold transition-all hover:text-[#7C3AED] relative group py-1 ${
                      location.pathname === link.to ? "text-[#7C3AED]" : "text-gray-400"
                    }`}
                  >
                    {link.label}
                    <div className={`absolute -bottom-1 left-0 h-[2px] bg-[#7C3AED] rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(124,58,237,0.5)] ${
                      location.pathname === link.to ? "w-full" : "w-0 group-hover:w-full"
                    }`} />
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <SignedIn>
              <div className="hidden lg:flex flex-col items-end mr-2">
                <span className="text-[9px] font-mono text-[#7C3AED] uppercase tracking-widest leading-none mb-1 font-bold">{getGreeting()}</span>
                <span className="text-sm font-bold text-white tracking-tight">{getUserDisplayName()}</span>
              </div>
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9 rounded-xl border border-white/10 shadow-[0_0_10px_rgba(124,58,237,0.2)]"
                  }
                }}
              />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-6 py-2 rounded-full bg-[#7C3AED] text-white font-bold text-[10px] uppercase tracking-widest hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all border border-white/10 hover:scale-[1.03] active:scale-[0.97]">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
