'use client';
import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import ChatInterface from '../../components/ChatInterface';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function ChatPage() {
  const { user } = useAuth();
  const [interests, setInterests] = useState<string[]>([]);
  
  useEffect(() => {
    if (user) {
      const fetchInterests = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().interests) {
          setInterests(docSnap.data().interests);
        }
      };
      fetchInterests();
    }
  }, [user]);

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-violet-50 dark:from-gray-950 dark:to-indigo-950 -z-10" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-fuchsia-300/30 rounded-full blur-[120px] -z-10 animate-pulse mix-blend-multiply dark:mix-blend-lighten" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-400/20 rounded-full blur-[120px] -z-10 mix-blend-multiply dark:mix-blend-lighten" />
      
      <NavBar />
      <ChatInterface interests={interests} />
    </main>
  );
}
