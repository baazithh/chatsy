'use client';
import { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [displayName, setDisplayName] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const loadProfile = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDisplayName(data.displayName || '');
          setInterests(data.interests || []);
        }
      };
      loadProfile();
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { displayName, interests }, { merge: true });
    setSaving(false);
  };

  const addInterest = () => {
    const term = newInterest.trim().toLowerCase();
    if (term && !interests.includes(term)) {
      setInterests([...interests, term]);
      setNewInterest('');
    }
  };

  const removeInterest = (term: string) => {
    setInterests(interests.filter(i => i !== term));
  };

  if (authLoading || !user) return null;

  return (
    <main className="min-h-screen relative flex flex-col pt-24 pb-12">
      <div className="fixed inset-0 -z-10 bg-[#f8fafc]" />
      <NavBar />
      
      <div className="max-w-4xl mx-auto w-full px-6 relative z-10 hover-3d">
        <h1 className="text-3xl font-black neon-text-cyan mb-8 uppercase tracking-widest pl-2 border-l-4 border-cyan-500">Your Profile</h1>
        
        <div className="holographic-panel p-8 space-y-8 border border-cyan-500/20">
          
          <div>
            <label className="block text-xs font-mono font-bold text-cyan-400 mb-3 border-b border-cyan-500/20 pb-2 tracking-widest uppercase">Display Name</label>
            <input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-4 holographic-panel glass-input font-bold tracking-wider"
              placeholder="Your Alias"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-cyan-400 mb-3 border-b border-cyan-500/20 pb-2 tracking-widest uppercase">Your Interests</label>
            <div className="flex gap-4 mb-4">
              <input 
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addInterest();
                  }
                }}
                className="flex-1 p-3 holographic-panel glass-input uppercase font-mono text-sm tracking-widest"
                placeholder="Add an interest..."
              />
              <button 
                onClick={addInterest}
                className="px-8 py-3 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 font-bold hover:bg-cyan-500 hover:text-gray-900 transition-all uppercase"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-6">
              {interests.map(i => (
                <span key={i} className="px-4 py-2 bg-cyan-900/30 text-cyan-50 font-mono text-xs uppercase tracking-widest border border-cyan-500/40 rounded-sm flex items-center gap-3">
                  {i}
                  <button onClick={() => removeInterest(i)} className="text-cyan-400 hover:text-magenta-400 font-bold">&times;</button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full py-5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 font-black tracking-[0.2em] uppercase hover:bg-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
