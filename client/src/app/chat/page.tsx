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
    <main className="min-h-screen relative flex flex-col pt-24">
      {/* HUD Background Elements - Light */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#f8fafc]" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.08)_0%,transparent_70%)] pointer-events-none -z-10" />
      
      <NavBar />
      <div className="relative z-10 flex-1">
        <ChatInterface interests={interests} />
      </div>
    </main>
  );
}
