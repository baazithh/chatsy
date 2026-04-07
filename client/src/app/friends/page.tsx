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
              let displayName = 'Stranger';
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
    <main className="min-h-screen relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-violet-50 dark:from-gray-950 dark:to-indigo-950 -z-10" />
      <NavBar />
      <div className="max-w-4xl mx-auto w-full p-6 relative z-10">
        <h1 className="text-3xl font-bold mb-6">Your Friends</h1>
        <div className="glassmorphism p-8 rounded-2xl min-h-[300px]">
          {loading ? (
            <p className="text-gray-500 text-center mt-10 animate-pulse font-medium">Loading connections...</p>
          ) : friends.length === 0 ? (
            <div className="text-center mt-10">
              <p className="text-gray-600 dark:text-gray-300 text-lg">You haven't added any friends yet.</p>
              <button 
                onClick={() => router.push('/chat')}
                className="mt-6 px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-all shadow-md hover:-translate-y-1"
              >
                Start Matching
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {friends.map((friend) => (
                <div key={friend.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-violet-200 dark:bg-violet-900 flex items-center justify-center text-violet-600 dark:text-violet-300 font-bold text-lg border border-violet-300 dark:border-violet-700">
                        {friend.displayName.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{friend.displayName}</h3>
                       <p className="text-xs text-gray-500">Connected via Matcher</p>
                     </div>
                  </div>
                  <button className="px-5 py-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full font-bold transition-colors text-sm shadow-sm border border-gray-200 dark:border-gray-600">
                    Message
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
