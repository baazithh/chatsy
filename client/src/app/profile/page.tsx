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
    <main className="min-h-screen relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-violet-50 dark:from-gray-950 dark:to-indigo-950 -z-10" />
      <NavBar />
      
      <div className="max-w-4xl mx-auto w-full p-6 relative z-10">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        <div className="glassmorphism p-8 rounded-2xl space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
            <input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary outline-none"
              placeholder="How others see you"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interests</label>
            <div className="flex gap-2 mb-3">
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
                className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. music, anime, programming..."
              />
              <button 
                onClick={addInterest}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {interests.map(i => (
                <span key={i} className="px-3 py-1 bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200 rounded-full text-sm flex items-center gap-2 border border-violet-200 dark:border-violet-800">
                  {i}
                  <button onClick={() => removeInterest(i)} className="hover:text-red-500 font-bold">&times;</button>
                </span>
              ))}
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 mt-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>

        </div>
      </div>
    </main>
  );
}
