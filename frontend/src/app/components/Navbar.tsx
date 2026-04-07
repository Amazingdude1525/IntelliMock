import { Link, useLocation } from "react-router";
import { Zap } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

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
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all border-b border-white/5 ${
        transparent
          ? "bg-transparent"
          : "backdrop-blur-2xl bg-black/80"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl bg-accent-purple flex items-center justify-center overflow-hidden">
               <Zap className="w-5 h-5 text-white relative z-10" />
               <div className="absolute inset-0 bg-gradient-to-tr from-accent-blue/40 to-transparent animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-black tracking-tighter italic leading-none">
                INTELLI<span className="text-accent-purple">MOCK</span>
              </span>
              <span className="text-[8px] font-mono text-accent-green uppercase tracking-[0.4em] font-bold">Elite Terminal</span>
            </div>
          </Link>

          {/* Center Links */}
          {!isLanding && (
            <div className="hidden md:flex items-center gap-10">
              <Link
                to="/dashboard"
                className={`text-[10px] font-mono uppercase tracking-[0.2em] font-bold transition-all hover:text-accent-purple relative group ${
                  location.pathname === "/dashboard" ? "text-accent-purple" : "text-text-muted"
                }`}
              >
                Dashboard
                <div className={`absolute -bottom-1 left-0 h-[1px] bg-accent-purple transition-all duration-300 ${location.pathname === "/dashboard" ? "w-full" : "w-0 group-hover:w-full"}`} />
              </Link>
              <Link
                to="/history"
                className={`text-[10px] font-mono uppercase tracking-[0.2em] font-bold transition-all hover:text-accent-purple relative group ${
                  location.pathname === "/history" ? "text-accent-purple" : "text-text-muted"
                }`}
              >
                History
                <div className={`absolute -bottom-1 left-0 h-[1px] bg-accent-purple transition-all duration-300 ${location.pathname === "/history" ? "w-full" : "w-0 group-hover:w-full"}`} />
              </Link>
              <Link
                to="/creators"
                className={`text-[10px] font-mono uppercase tracking-[0.2em] font-bold transition-all hover:text-accent-purple relative group ${
                  location.pathname === "/creators" ? "text-accent-purple" : "text-text-muted"
                }`}
              >
                Creators
                <div className={`absolute -bottom-1 left-0 h-[1px] bg-accent-purple transition-all duration-300 ${location.pathname === "/creators" ? "w-full" : "w-0 group-hover:w-full"}`} />
              </Link>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            {!isLanding && (
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-[10px] font-mono text-accent-purple uppercase tracking-widest leading-none mb-1 font-bold">{getGreeting()}</span>
                <span className="text-sm font-bold text-white tracking-tight uppercase italic">{getUserDisplayName()}</span>
              </div>
            )}
            
            {isLanding ? (
              <Link
                to="/dashboard"
                className="px-8 py-2.5 rounded-full bg-accent-purple text-white font-bold text-[10px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all border border-white/10"
              >
                Access Platform
              </Link>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple/40 to-accent-blue/40 p-[1px] group cursor-pointer">
                <div className="w-full h-full rounded-xl bg-black flex items-center justify-center text-white text-xs font-black border border-white/10 uppercase group-hover:bg-accent-purple/10 transition-colors">
                  {getUserDisplayName().charAt(0)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
