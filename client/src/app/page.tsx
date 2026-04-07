import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 perspective-container bg-[#0f172a]">
      {/* 3D Animated Background Elements - Dark Gray HUD */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] border border-cyan-500/10 rounded-full blur-[2px] -z-10 animate-[spin_20s_linear_infinite] [transform:rotateX(60deg)]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] border border-magenta-500/10 rounded-full blur-[2px] -z-10 animate-[spin_30s_linear_reverse_infinite] [transform:rotateX(50deg)]" />

      <div className="text-center space-y-8 holographic-panel hover-3d p-12 max-w-2xl mx-auto backdrop-blur-2xl relative z-10">
        <div className="space-y-4 flex flex-col items-center">
          <Activity size={48} className="text-cyan-400 animate-pulse mb-2" />
          <h1 className="text-6xl font-black neon-text-cyan tracking-tighter pb-2">
            Chatsy
          </h1>
          <p className="text-xl text-slate-300 max-w-md mx-auto font-light tracking-wide">
            Connecting stranger nodes in the dark gray data relay.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mt-10">
          <Link href="/chat" className="px-8 py-4 bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 rounded-lg font-bold hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all uppercase tracking-widest flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping block" />
            Launch Relay
          </Link>
          <Link href="/profile" className="px-8 py-4 bg-white/5 text-gray-300 border border-white/10 rounded-lg font-bold hover:bg-white/10 transition-all uppercase tracking-widest">
            Identity Node
          </Link>
        </div>
      </div>
    </main>
  );
}
