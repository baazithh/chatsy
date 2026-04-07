'use client';
import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ activeChatsCount: 0, queueLength: 0 });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth');
      } else if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
         router.push('/');
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
       const fetchStats = async () => {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/stats`);
            const data = await res.json();
            setStats(data);
          } catch(e) {}
       };
       fetchStats();
       const interval = setInterval(fetchStats, 2000); // Live poll
       return () => clearInterval(interval);
    }
  }, [user]);

  if (authLoading || !user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) return null;

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col perspective-container">
      <NavBar />
      <div className="max-w-5xl mx-auto w-full p-6 relative z-10 hover-3d">
        <h1 className="text-3xl font-black text-red-500 mb-8 uppercase tracking-widest pl-2 border-l-4 border-red-500 [text-shadow:0_0_10px_rgba(239,68,68,0.6)]">
          Admin Telemetry
        </h1>

        <div className="holographic-panel p-10 border border-red-500/30 bg-red-950/10">
          <div className="flex font-mono text-xs text-red-400 mb-8 justify-between border-b border-red-500/20 pb-4">
             <span className="animate-pulse">Live System Metrics...</span>
             <span>Admin Authorized</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="p-10 holographic-panel border border-cyan-500/40 bg-cyan-900/10 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent)]" />
                <h2 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-[0.3em] mb-4">Active Chats</h2>
                <p className="text-8xl font-black text-white [text-shadow:0_0_20px_rgba(6,182,212,1)] drop-shadow-2xl">
                   {stats.activeChatsCount}
                </p>
             </div>

             <div className="p-10 holographic-panel holographic-panel-magenta border border-magenta-500/40 bg-magenta-900/10 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.1),transparent)]" />
                <h2 className="text-sm font-mono font-bold text-magenta-400 uppercase tracking-[0.3em] mb-4">Users In Queue</h2>
                <p className="text-8xl font-black text-white [text-shadow:0_0_20px_rgba(217,70,239,1)] drop-shadow-2xl">
                   {stats.queueLength}
                </p>
             </div>
          </div>

        </div>
      </div>
    </main>
  );
}
