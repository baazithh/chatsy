'use client';
import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Activity, Users, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <main className="min-h-screen relative flex flex-col pt-24 pb-12">
      <div className="fixed inset-0 -z-10 bg-[#f8fafc]" />
      <NavBar />
      
      <div className="max-w-6xl mx-auto w-full px-6 relative z-10 transition-all">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <Shield className="text-red-500 w-8 h-8 drop-shadow-[0_0_10px_rgba(239,68,68,0.1)]" />
                 <span className="text-[10px] font-mono text-red-600 font-bold uppercase tracking-[0.4em]">Node Administrator Authority</span>
              </div>
              <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">
                 System <span className="text-red-600">Telemetry</span>
              </h1>
           </div>
           
           <div className="holographic-panel px-6 py-3 border-red-500/10 bg-white/60 shadow-sm flex items-center gap-6">
              <div className="flex flex-col">
                 <span className="text-[8px] font-mono text-slate-400 uppercase">Uptime</span>
                 <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">99.998%</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-200" />
              <div className="flex flex-col">
                 <span className="text-[8px] font-mono text-slate-400 uppercase">Node Stat</span>
                 <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Active-Relay</span>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left Column: Stats */}
           <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="holographic-panel p-10 border-cyan-500/20 bg-white/60 group hover-3d shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <Activity className="text-cyan-600 w-10 h-10" />
                    <span className="text-[10px] font-mono text-slate-400 border border-slate-200 px-3 py-1 rounded-full uppercase">Relay_Primary</span>
                 </div>
                 <h2 className="text-sm font-mono font-bold text-slate-500 uppercase tracking-[0.3em] mb-2">Sync Channels</h2>
                 <div className="text-8xl font-black text-slate-900 [text-shadow:0_0_15px_rgba(6,182,212,0.1)] tabular-nums mb-4 transition-all">
                    {stats.activeChatsCount.toString().padStart(2, '0')}
                 </div>
                 <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                      initial={{ width: 0 }}
                      animate={{ width: '45%' }}
                    />
                 </div>
              </div>

              <div className="holographic-panel p-10 border-magenta-500/20 bg-white/60 group hover-3d shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <Users className="text-magenta-600 w-10 h-10" />
                    <span className="text-[10px] font-mono text-slate-400 border border-slate-200 px-3 py-1 rounded-full uppercase">Queue_Priority</span>
                 </div>
                 <h2 className="text-sm font-mono font-bold text-slate-500 uppercase tracking-[0.3em] mb-2">Data Nodes</h2>
                 <div className="text-8xl font-black text-slate-900 [text-shadow:0_0_15px_rgba(217,70,239,0.1)] tabular-nums mb-4 transition-all">
                    {stats.queueLength.toString().padStart(2, '0')}
                 </div>
                 <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-magenta-500 shadow-[0_0_8px_rgba(217,70,239,0.4)]"
                      initial={{ width: 0 }}
                      animate={{ width: '25%' }}
                    />
                 </div>
              </div>
              
              <div className="md:col-span-2 holographic-panel p-8 border-slate-100 bg-slate-50 opacity-40 hover-3d">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Signal Load Density Matrix</span>
                 </div>
                 <div className="h-20 flex items-end gap-1 px-2">
                    {[...Array(40)].map((_, i) => (
                       <div key={i} className="flex-1 bg-slate-200" style={{ height: `${Math.random() * 100}%` }} />
                    ))}
                 </div>
              </div>
           </div>

           {/* Right Column: Server Logs */}
           <div className="holographic-panel p-6 border-white/60 bg-white/40 flex flex-col h-full shadow-sm">
              <h3 className="text-[10px] font-mono text-cyan-700 mb-6 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full animate-ping" />
                 Inbound Packet Stream
              </h3>
              <div className="flex-1 font-mono text-[9px] text-slate-500 space-y-3 overflow-hidden">
                 <p>{`[${new Date().toLocaleTimeString()}] PKT_IN: 172.16.89.201`}</p>
                 <p className="text-cyan-600 font-bold">{`[${new Date().toLocaleTimeString()}] HANDSHAKE: AUTH_OK_200`}</p>
                 <p>{`[${new Date().toLocaleTimeString()}] STREAM_UP: RELAY_NODE_77`}</p>
                 <p className="text-magenta-600">{`[${new Date().toLocaleTimeString()}] EVENT: PRIORITY_QUEUING_IDLE`}</p>
                 <p className="text-red-500/80">{`[${new Date().toLocaleTimeString()}] NOTICE: ANOMALY_FILTER_ACTIVE`}</p>
                 <p>{`[${new Date().toLocaleTimeString()}] TRACE: GARBAGE_COLLECT_1.2MB`}</p>
                 <p className="text-cyan-700 font-bold">{`[${new Date().toLocaleTimeString()}] HEARTBEAT: STABLE_OPS`}</p>
                 <p className="animate-pulse">{`[${new Date().toLocaleTimeString()}] MONITORING_ACTIVE_RELAYS...`}</p>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
