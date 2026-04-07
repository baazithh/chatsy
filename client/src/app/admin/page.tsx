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
      <div className="fixed inset-0 -z-10 bg-[#05050a]" />
      <NavBar />
      
      <div className="max-w-6xl mx-auto w-full px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <Shield className="text-red-500 w-8 h-8" />
                 <span className="text-[10px] font-mono text-red-500/50 uppercase tracking-[0.4em]">Root Access Granted</span>
              </div>
              <h1 className="text-5xl font-black text-white uppercase tracking-tighter">
                 System <span className="text-red-500 [text-shadow:0_0_20px_rgba(239,68,68,0.4)]">Telemetry</span>
              </h1>
           </div>
           
           <div className="holographic-panel px-6 py-3 border-red-500/20 bg-red-500/5 flex items-center gap-6">
              <div className="flex flex-col">
                 <span className="text-[8px] font-mono text-red-400 uppercase">Uptime</span>
                 <span className="text-xs font-bold text-white uppercase tracking-widest">99.998%</span>
              </div>
              <div className="w-[1px] h-8 bg-red-500/20" />
              <div className="flex flex-col">
                 <span className="text-[8px] font-mono text-red-400 uppercase">Node Status</span>
                 <span className="text-xs font-bold text-white uppercase tracking-widest">Master-Active</span>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left Column: Stats */}
           <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="holographic-panel p-10 border-cyan-500/30 bg-cyan-900/10 group hover-3d">
                 <div className="flex items-center justify-between mb-8">
                    <Activity className="text-cyan-400 w-10 h-10" />
                    <span className="text-[10px] font-mono text-cyan-500/50 border border-cyan-500/20 px-3 py-1 rounded-full">RELAY_ALPHA</span>
                 </div>
                 <h2 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-[0.3em] mb-2">Active Channels</h2>
                 <div className="text-8xl font-black text-white [text-shadow:0_0_25px_rgba(6,182,212,0.8)] tabular-nums mb-4">
                    {stats.activeChatsCount.toString().padStart(2, '0')}
                 </div>
                 <div className="w-full h-1 bg-cyan-500/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,1)]"
                      initial={{ width: 0 }}
                      animate={{ width: '45%' }}
                    />
                 </div>
              </div>

              <div className="holographic-panel p-10 border-magenta-500/30 bg-magenta-900/10 group hover-3d">
                 <div className="flex items-center justify-between mb-8">
                    <Users className="text-magenta-400 w-10 h-10" />
                    <span className="text-[10px] font-mono text-magenta-500/50 border border-magenta-500/20 px-3 py-1 rounded-full">QUEUE_OMEGA</span>
                 </div>
                 <h2 className="text-sm font-mono font-bold text-magenta-400 uppercase tracking-[0.3em] mb-2">Pending Nodes</h2>
                 <div className="text-8xl font-black text-white [text-shadow:0_0_25px_rgba(217,70,239,0.8)] tabular-nums mb-4">
                    {stats.queueLength.toString().padStart(2, '0')}
                 </div>
                 <div className="w-full h-1 bg-magenta-500/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-magenta-500 shadow-[0_0_10px_rgba(217,70,239,1)]"
                      initial={{ width: 0 }}
                      animate={{ width: '25%' }}
                    />
                 </div>
              </div>
              
              <div className="md:col-span-2 holographic-panel p-8 border-white/10 bg-white/5 opacity-50 cursor-not-allowed">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Global Server Load Matrix</span>
                 </div>
                 <div className="h-20 flex items-end gap-1 px-2">
                    {[...Array(40)].map((_, i) => (
                       <div key={i} className="flex-1 bg-white/10" style={{ height: `${Math.random() * 100}%` }} />
                    ))}
                 </div>
              </div>
           </div>

           {/* Right Column: Server Logs */}
           <div className="holographic-panel p-6 border-white/10 bg-black/40 flex flex-col h-full">
              <h3 className="text-[10px] font-mono text-cyan-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                 Encrypted Event Stream
              </h3>
              <div className="flex-1 font-mono text-[9px] text-cyan-500/70 space-y-3 overflow-hidden">
                 <p>{`[${new Date().toLocaleTimeString()}] INGRESS_PACKET_RECEIVED: 192.168.1.45`}</p>
                 <p>{`[${new Date().toLocaleTimeString()}] HANDSHAKE_SUCCESS: NODE_ID_${Math.random().toString(36).substr(2, 6).toUpperCase()}`}</p>
                 <p className="text-white/40">{`[${new Date().toLocaleTimeString()}] BROADCAST_ROOM_CREATED: ROOM_7782`}</p>
                 <p>{`[${new Date().toLocaleTimeString()}] GARBAGE_COLLECTION_COMPLETE: 4.2ms`}</p>
                 <p className="text-red-500/60">{`[${new Date().toLocaleTimeString()}] ALERT: MULTIPLE_SKIPS_DETECTED_IP_BLOCK`}</p>
                 <p>{`[${new Date().toLocaleTimeString()}] AUTH_TOKEN_RENEWED: USER_ADMIN`}</p>
                 <p className="text-cyan-400">{`[${new Date().toLocaleTimeString()}] SYNC_COMPLETE: CLOUD_FIREBASE_RT`}</p>
                 <p className="animate-pulse">{`[${new Date().toLocaleTimeString()}] LISTENING_ON_RELAY_CHANNEL...`}</p>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
