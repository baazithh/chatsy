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
         // unauthorized
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
    <main className="min-h-screen relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 -z-10" />
      <NavBar />
      <div className="glassmorphism p-12 rounded-3xl max-w-4xl mx-auto w-full mt-6 border border-red-500/20 shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-red-500">Admin Telemetry</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8 font-medium">Live socket metrics measuring platform load</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
              <h2 className="text-lg font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Active Chats</h2>
              <p className="text-7xl font-black mt-4 text-primary bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
                 {stats.activeChatsCount}
              </p>
           </div>
           <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
              <h2 className="text-lg font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Users In Queue</h2>
              <p className="text-7xl font-black mt-4 text-violet-400">
                 {stats.queueLength}
              </p>
           </div>
        </div>
      </div>
    </main>
  );
}
