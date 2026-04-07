'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Users, User, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NavBar() {
  const pathname = usePathname();

  const links = [
    { name: 'Relay', href: '/chat', icon: Activity },
    { name: 'Network', href: '/friends', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Admin', href: '/admin', icon: Shield, adminOnly: true },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50">
      <div className="holographic-panel px-8 py-4 flex justify-between items-center transition-all bg-slate-900/40 backdrop-blur-xl border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all">
            <Activity className="text-cyan-400 w-6 h-6 animate-pulse" />
          </div>
          <span className="text-2xl font-black neon-text-cyan tracking-tighter uppercase hidden sm:block">
            Chatsy
          </span>
        </Link>

        <div className="flex gap-2 sm:gap-8 items-center">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`relative px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2
                  ${isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
              >
                <link.icon size={14} className={isActive ? 'animate-pulse' : ''} />
                <span className="hidden md:inline">{link.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-4 pl-8 border-l border-white/5">
           <div className="flex flex-col items-end">
              <span className="text-[8px] font-mono text-cyan-500/50 uppercase tracking-widest">Protocol</span>
              <span className="text-[10px] font-black text-white uppercase">v2.0.4-Stable</span>
           </div>
        </div>
      </div>
    </nav>
  );
}
