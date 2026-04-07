import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 perspective-container bg-[#f8fafc]">
      {/* 3D Animated Background Elements - Light HUD */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] border border-cyan-500/10 rounded-full blur-[2px] -z-10 animate-[spin_20s_linear_infinite] [transform:rotateX(60deg)]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] border border-magenta-500/10 rounded-full blur-[2px] -z-10 animate-[spin_30s_linear_reverse_infinite] [transform:rotateX(50deg)]" />

      <div className="text-center space-y-8 holographic-panel hover-3d p-12 max-w-2xl mx-auto backdrop-blur-2xl relative z-10">
        <div className="space-y-4 flex flex-col items-center">
          <Activity size={48} className="text-cyan-600 animate-pulse mb-2" />
          <h1 className="text-6xl font-black neon-text-cyan tracking-tighter pb-2">
            Chatsy
          </h1>
          <p className="text-xl text-slate-500 max-w-md mx-auto font-light tracking-wide italic">
            Connecting stranger nodes in the frosted data relay.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mt-10">
          <Link href="/chat" className="px-8 py-4 bg-cyan-600/10 text-cyan-700 border border-cyan-400/50 rounded-lg font-bold hover:bg-cyan-600/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all uppercase tracking-widest flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-ping block" />
            Launch Relay
          </Link>
          <Link href="/profile" className="px-8 py-4 bg-slate-200/40 text-slate-600 border border-slate-300/50 rounded-lg font-bold hover:bg-slate-200/60 transition-all uppercase tracking-widest">
            Identity Node
          </Link>
        </div>
      </div>
    </main>
  );
}
