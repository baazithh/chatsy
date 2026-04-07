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
          // Fetch the peer's display name from their user document
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
      {/* HUD Background */}
      <div className="fixed inset-0 -z-10 bg-[#05050a]" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(217,70,239,0.1)_0%,transparent_70%)] pointer-events-none -z-10" />
      
      <NavBar />

      <div className="max-w-5xl mx-auto w-full px-6 relative z-10 transition-all">
        <div className="flex items-center justify-between mb-12">
           <div className="flex items-center gap-4">
              <ShieldCheck className="text-magenta-500 w-10 h-10 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]" />
              <div>
                 <h1 className="text-4xl font-black neon-text-magenta tracking-tighter uppercase">Signal Network</h1>
                 <p className="text-xs text-magenta-500/60 font-mono tracking-[0.4em] uppercase">Persistent Communication Matrix</p>
              </div>
           </div>
           <div className="text-right hidden md:block">
              <div className="text-xs font-mono text-gray-500 uppercase">Secure Link Protocols</div>
              <div className="text-sm font-black text-white uppercase tracking-widest">{friends.length} Active Node{friends.length !== 1 ? 's' : ''}</div>
           </div>
        </div>

        {loading ? (
          <div className="holographic-panel p-20 flex flex-col items-center justify-center border-magenta-500/20">
             <div className="w-16 h-16 border-4 border-magenta-500/20 border-t-magenta-500 rounded-full animate-spin mb-6" />
             <p className="text-magenta-400 font-mono text-xs animate-pulse tracking-widest uppercase">Initializing Secure Protocols...</p>
          </div>
        ) : friends.length === 0 ? (
          <div className="holographic-panel p-20 flex flex-col items-center justify-center border-magenta-500/20 text-center">
             <MessageSquare size={64} className="text-magenta-500/20 mb-6" />
             <h3 className="text-xl font-bold text-gray-300 mb-2 uppercase tracking-wider">No Nodes Found</h3>
             <p className="text-gray-500 max-w-sm font-mono text-xs uppercase tracking-wide leading-relaxed">
                Connect with strangers in the main relay and use the static link override to save them to your permanent network.
             </p>
             <Link href="/chat" className="mt-10 px-8 py-3 bg-magenta-500/10 border border-magenta-500/50 text-magenta-400 rounded-lg font-bold hover:bg-magenta-500/20 transition-all uppercase tracking-widest">
                Access Relay
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((friend) => (
              <div key={friend.id} className="holographic-panel holographic-panel-magenta p-6 group hover-3d transition-all">
                <div className="flex items-start justify-between mb-6">
                   <div className="w-14 h-14 rounded-xl bg-magenta-500/10 border border-magenta-500/30 flex items-center justify-center text-magenta-400 group-hover:scale-110 transition-transform">
                      <User size={28} />
                   </div>
                   <button 
                     onClick={() => removeFriend(friend.id)}
                     className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>

                <div className="space-y-1 mb-8">
                   <h3 className="text-xl font-black text-white uppercase tracking-tight truncate border-l-2 border-magenta-500 pl-3">
                      {friend.peerName}
                   </h3>
                   <div className="flex items-center gap-2 text-[10px] font-mono text-magenta-500/50 pl-3">
                      <Clock size={10} />
                      <span className="uppercase">Link Established: {friend.addedAt?.toDate().toLocaleDateString()}</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                   <Link href={`/chat?friend=${friend.peerUid}`} className="flex items-center justify-center gap-2 py-3 bg-magenta-500/20 border border-magenta-500/50 text-magenta-400 text-xs font-bold uppercase tracking-widest hover:bg-magenta-500 hover:text-black transition-all rounded-lg">
                      <MessageSquare size={14} /> Msg
                   </Link>
                   <button className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all rounded-lg">
                      Profile
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
