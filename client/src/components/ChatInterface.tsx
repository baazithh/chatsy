'use client';
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, User as UserIcon, SkipForward, UserPlus, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebaseConfig';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function ChatInterface({ interests = [] }: { interests?: string[] }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('Finding a match...');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [peerUid, setPeerUid] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_queue', { interests, uid: user?.uid });
    });

    newSocket.on('match_found', (data) => {
      setRoomId(data.roomId);
      setPeerUid(data.peerUid || null);
      setStatus('Matched with a stranger');
      setMessages([]); 
    });

    newSocket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('peer_disconnected', () => {
      setStatus('Stranger disconnected. Finding new match...');
      setRoomId(null);
      setPeerUid(null);
      setMessages((prev) => [...prev, { type: 'system', text: 'Stranger left.' }]);
      setTimeout(() => {
        newSocket.emit('join_queue', { interests, uid: user?.uid });
      }, 1000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [interests, user]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !roomId) return;
    
    const msg = { text: input, type: 'text' };
    socket.emit('send_message', msg);
    setMessages((prev) => [...prev, { ...msg, senderId: socket.id, isMe: true }]);
    setInput('');
  };

  const handleSkip = () => {
    if (!socket) return;
    socket.emit('skip');
    setStatus('Finding a new match...');
    setRoomId(null);
    setPeerUid(null);
    setMessages([]);
    socket.emit('join_queue', { interests, uid: user?.uid });
  };

  const handleAddFriend = async () => {
    if (!user) {
      alert("You must be logged in to save friends!");
      return;
    }
    if (!peerUid) {
      alert("Stranger is using a guest account and cannot be added as a permanent friend.");
      return;
    }

    try {
      // Save friend record for the current user
      const friendRef = doc(collection(db, 'users', user.uid, 'friends'), peerUid);
      await setDoc(friendRef, { 
        addedAt: serverTimestamp(),
        peerUid: peerUid,
        roomId: roomId
      });
      alert("Friend saved to your network!");
    } catch (err) {
      console.error(err);
      alert("Failed to save friend.");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto w-full p-4 relative z-10">
      {/* Header */}
      <div className="glassmorphism rounded-t-2xl p-4 flex justify-between items-center mb-2 border border-white/40 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center border border-violet-200 dark:border-violet-800">
            <UserIcon className="text-violet-500 dark:text-violet-300" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">
              {status.includes('Matched') ? 'Stranger' : 'Searching...'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{status}</p>
          </div>
        </div>
        
        {roomId && (
          <div className="flex gap-2">
            <button onClick={handleAddFriend} className="p-3 rounded-full bg-white dark:bg-gray-800 hover:bg-violet-50 dark:hover:bg-violet-900/50 text-violet-600 transition-colors shadow-sm border border-gray-200 dark:border-gray-700" title="Add Friend">
              <UserPlus size={20} />
            </button>
            <button className="p-3 rounded-full bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/50 text-red-500 transition-colors shadow-sm border border-gray-200 dark:border-gray-700" title="Report/Block">
              <ShieldAlert size={20} />
            </button>
            <button onClick={handleSkip} className="px-5 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full flex items-center gap-2 font-bold transition-colors shadow-sm border border-gray-200 dark:border-gray-700" title="Skip">
               Skip
               <SkipForward size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 glassmorphism rounded-b-2xl mb-4 p-4 overflow-y-auto flex flex-col gap-4 border border-white/40 dark:border-white/10 shadow-sm">
        {messages.map((msg, idx) => (
           msg.type === 'system' ? (
             <div key={idx} className="text-center text-xs font-medium text-gray-400 my-2 uppercase tracking-wide">
               {msg.text}
             </div>
           ) : (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[75%] rounded-2xl p-4 shadow-sm text-[15px] ${msg.isMe ? 'bg-primary text-white self-end rounded-tr-sm' : 'bg-white dark:bg-gray-800 dark:text-gray-100 self-start rounded-tl-sm border border-gray-100 dark:border-gray-700'}`}
            >
              {msg.text}
            </motion.div>
           )
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="relative mt-auto">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!roomId}
          placeholder={roomId ? "Type a message..." : "Waiting for match..."}
          className="w-full glassmorphism rounded-full px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 border border-white/40 dark:border-white/10 shadow-sm transition-all text-[15px]"
        />
        <button 
          type="submit"
          disabled={!roomId || !input.trim()}
          className="absolute right-2 top-2 p-3 bg-primary text-white rounded-full disabled:opacity-50 hover:bg-primary-dark transition-all shadow-md hover:shadow-lg disabled:hover:shadow-none"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
