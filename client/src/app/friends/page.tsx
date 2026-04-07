'use client';
import { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebaseConfig';
import { collection, query, onSnapshot, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { User, Trash2, MessageSquare, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function FriendsPage() {
  const { user, loading: authLoading } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'users', user.uid, 'friends'));
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const friendsList = await Promise.all(snapshot.docs.map(async (fDoc) => {
          const data = fDoc.data();
          let peerName = "Stranger";
          try {
             const peerSnap = await getDoc(doc(db, 'users', data.peerUid));
             if (peerSnap.exists()) peerName = peerSnap.data().displayName || "Stranger";
          } catch(e) {}
          
          return { id: fDoc.id, ...data, peerName };
        }));
        setFriends(friendsList);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const removeFriend = async (friendId: string) => {
    if (!user) return;
    if (confirm("Disconnect this permanent link?")) {
      await deleteDoc(doc(db, 'users', user.uid, 'friends', friendId));
    }
  };

  if (authLoading) return null;

  return (
    <main className="min-h-screen relative flex flex-col pt-24 pb-12">
      {/* HUD Background - Pure Black */}
      <div className="fixed inset-0 -z-10 bg-[#000000]" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(217,70,239,0.15)_0%,transparent_70%)] pointer-events-none -z-10" />
      
      <NavBar />

      <div className="max-w-5xl mx-auto w-full px-6 relative z-10">
        <div className="flex items-center justify-between mb-12">
           <div className="flex items-center gap-4">
              <ShieldCheck className="text-magenta-500 w-10 h-10 drop-shadow-[0_0_15px_rgba(217,70,239,0.3)]" />
              <div>
                 <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Signal Network</h1>
                 <p className="text-xs text-magenta-400 font-mono tracking-[0.4em] uppercase">Persistent Communication Matrix</p>
              </div>
           </div>
           <div className="text-right hidden md:block">
              <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">Secure Link Protocols</div>
              <div className="text-sm font-black text-white uppercase tracking-widest">{friends.length} Active Nodes</div>
           </div>
        </div>

        {loading ? (
          <div className="holographic-panel p-20 flex flex-col items-center justify-center bg-slate-900/40">
             <div className="w-16 h-16 border-4 border-magenta-500/10 border-t-magenta-500 rounded-full animate-spin mb-6" />
             <p className="text-magenta-400 font-mono text-xs animate-pulse tracking-widest uppercase">Initializing Secure Protocols...</p>
          </div>
        ) : friends.length === 0 ? (
          <div className="holographic-panel p-20 flex flex-col items-center justify-center bg-slate-900/40 text-center">
             <MessageSquare size={64} className="text-slate-700 mb-6" />
             <h3 className="text-xl font-bold text-slate-500 mb-2 uppercase tracking-wider">No Nodes Found</h3>
             <p className="text-slate-600 max-w-sm font-mono text-xs uppercase tracking-wide leading-relaxed">
                Connect with strangers in the main relay and use the static link override to save them to your permanent network.
             </p>
             <Link href="/chat" className="mt-10 px-8 py-3 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 rounded-lg font-bold hover:bg-cyan-500/20 transition-all uppercase tracking-widest shadow-lg">
                Access Relay
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((friend) => (
              <div key={friend.id} className="holographic-panel p-6 group hover-3d transition-all bg-slate-800/40 border-white/5">
                <div className="flex items-start justify-between mb-6">
                   <div className="w-14 h-14 rounded-xl bg-magenta-500/10 border border-magenta-500/30 flex items-center justify-center text-magenta-400 group-hover:shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all">
                      <User size={28} />
                   </div>
                   <button 
                     onClick={() => removeFriend(friend.id)}
                     className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>

                <div className="space-y-1 mb-8">
                   <h3 className="text-xl font-black text-white uppercase tracking-tight truncate border-l-2 border-magenta-500 pl-3">
                      {friend.peerName}
                   </h3>
                   <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 pl-3">
                      <Clock size={10} />
                      <span className="uppercase">Signal Estab: {friend.addedAt?.toDate().toLocaleDateString()}</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                   <Link href={`/chat?friend=${friend.peerUid}`} className="flex items-center justify-center gap-2 py-3 bg-magenta-500/10 border border-magenta-500/50 text-magenta-400 text-xs font-bold uppercase tracking-widest hover:bg-magenta-500 hover:text-white transition-all rounded-lg">
                      <MessageSquare size={14} /> MSG
                   </Link>
                   <button className="flex items-center justify-center gap-2 py-3 bg-slate-700/30 border border-slate-600 text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-all rounded-lg">
                      DATA
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
