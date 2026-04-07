'use client';
import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function FriendsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const fetchFriends = async () => {
        try {
          const friendsRef = collection(db, 'users', user.uid, 'friends');
          const snap = await getDocs(friendsRef);
          
          if (snap.empty) {
            setFriends([]);
            setLoading(false);
            return;
          }

          const friendsList = await Promise.all(
            snap.docs.map(async (f) => {
              const fData = f.data();
              const peerDoc = await getDoc(doc(db, 'users', fData.peerUid));
              let displayName = 'ANONYMOUS_NODE';
              if (peerDoc.exists() && peerDoc.data().displayName) {
                displayName = peerDoc.data().displayName;
              }
              return { id: f.id, ...fData, displayName };
            })
          );
          
          setFriends(friendsList);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchFriends();
    }
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col perspective-container">
      <NavBar />
      <div className="max-w-4xl mx-auto w-full p-6 relative z-10">
        <h1 className="text-3xl font-black neon-text-cyan mb-8 uppercase tracking-widest pl-2 border-l-4 border-cyan-500">SAVED CONNECTIONS</h1>
        
        <div className="holographic-panel hover-3d p-8 min-h-[400px] border border-cyan-500/20 shadow-lg">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full pt-10 text-cyan-500/70 space-y-4">
              <div className="w-12 h-12 border-2 border-dashed border-cyan-500 rounded-full animate-spin" />
              <p className="font-mono text-sm tracking-widest uppercase">FETCHING NETWORK TOPOLOGY...</p>
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center mt-16">
              <p className="text-cyan-500/80 font-mono text-lg uppercase tracking-widest">NETWORK IS EMPTY</p>
              <button 
                onClick={() => router.push('/chat')}
                className="mt-8 px-8 py-4 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 font-bold uppercase tracking-widest hover:bg-cyan-500/30 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              >
                INITIATE NEW SCAN
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {friends.map((friend) => (
                <div key={friend.id} className="p-5 holographic-panel border border-cyan-500/30 bg-cyan-950/20 flex justify-between items-center transition-all hover:bg-cyan-900/30 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] group cursor-default">
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 bg-cyan-500/10 border-2 border-cyan-500/50 flex items-center justify-center text-cyan-400 font-black text-xl rounded-none transform rotate-45 group-hover:bg-cyan-500/30 transition-colors">
                        <span className="-rotate-45">{friend.displayName.charAt(0).toUpperCase()}</span>
                     </div>
                     <div>
                       <h3 className="font-bold text-lg text-cyan-50 tracking-widest uppercase">{friend.displayName}</h3>
                       <p className="text-xs text-cyan-500/80 font-mono mt-1">LINK ESTABLISHED</p>
                     </div>
                  </div>
                  <button className="px-6 py-3 bg-transparent border border-cyan-500/50 text-cyan-400 uppercase font-mono text-xs tracking-[0.2em] hover:bg-cyan-500/20 transition-all">
                    PULL DATA
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
