'use client';
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, User as UserIcon, SkipForward, UserPlus, ShieldAlert, Cpu, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebaseConfig';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function ChatInterface({ interests = [] }: { interests?: string[] }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('Looking for a match...');
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
      setStatus('Matched with a stranger!');
      setMessages([]); 
    });

    newSocket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('peer_disconnected', () => {
      setStatus('Stranger disconnected. Finding new match...');
      setRoomId(null);
      setPeerUid(null);
      setMessages((prev) => [...prev, { type: 'system', text: 'Stranger Disconnected' }]);
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
    setStatus('Looking for a match...');
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
      const friendRef = doc(collection(db, 'users', user.uid, 'friends'), peerUid);
      await setDoc(friendRef, { 
        addedAt: serverTimestamp(),
        peerUid: peerUid,
        roomId: roomId
      });
      alert("Friend saved to your network!");
    } catch (err) {
      alert("Failed to save friend.");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto w-full p-4 relative z-10 perspective-container">
      
      {/* Header - Pure Black HUD */}
      <div className="holographic-panel p-5 flex justify-between items-center mb-4 transition-all bg-black/60">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center border-2 ${roomId ? 'border-cyan-500 bg-cyan-500/20' : 'border-slate-800 bg-slate-900'}`}>
            {roomId ? <UserIcon className="text-cyan-400" size={28} /> : <Cpu className="text-slate-600 animate-pulse" size={28} />}
          </div>
          <div>
            <h2 className={`font-black text-xl uppercase tracking-widest ${roomId ? 'neon-text-cyan' : 'text-slate-600'}`}>
              {roomId ? 'Stranger' : 'Searching...'}
            </h2>
            <p className="text-xs text-cyan-400/70 font-mono tracking-[0.2em] uppercase">{status}</p>
          </div>
        </div>
        
        {roomId && (
          <div className="flex gap-3">
            <button onClick={handleAddFriend} className="p-3 rounded-lg bg-cyan-900/40 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.6)]" title="Add Friend">
              <UserPlus size={20} />
            </button>
            <button className="p-3 rounded-lg bg-magenta-900/40 border border-magenta-500/50 text-magenta-400 hover:bg-magenta-500/20 transition-all hover:shadow-[0_0_15px_rgba(217,70,239,0.6)]" title="Report/Block">
              <ShieldAlert size={20} />
            </button>
            <button onClick={handleSkip} className="px-6 py-2 bg-transparent border-2 border-red-500/50 hover:border-red-500 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center gap-2 font-black tracking-widest uppercase transition-all" title="Skip">
               Skip
               <SkipForward size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Messages - Pure Black Frosted */}
      <div className="flex-1 holographic-panel mb-4 p-6 overflow-y-auto flex flex-col gap-5 relative bg-black/40 scanlines">
        <div className="scanner-line opacity-40" />
        
        {!roomId && (
          <div className="absolute inset-0 flex items-center justify-center -z-0 pointer-events-none overflow-hidden">
             <div className="radar-circle" style={{ animationDelay: '0s' }} />
             <div className="radar-circle" style={{ animationDelay: '1s' }} />
             <div className="radar-circle" style={{ animationDelay: '2s' }} />
             <Activity className="w-24 h-24 text-cyan-500/10 animate-pulse relative z-10" />
             <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-cyan-400/40 text-[10px] font-mono tracking-[0.5em] uppercase">
                Synchronizing Signal...
             </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
           msg.type === 'system' ? (
             <motion.div 
               key={idx} 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="w-full flex justify-center my-6"
             >
                <div className="px-6 py-1.5 border-x border-magenta-500/50 text-magenta-400 text-[10px] font-black uppercase tracking-[0.4em] bg-magenta-950/30 rounded-lg relative">
                   <div className="absolute inset-0 bg-magenta-500/5 animate-pulse rounded-lg" />
                   {msg.text}
                </div>
             </motion.div>
           ) : (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: msg.isMe ? 20 : -20, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              className={`max-w-[75%] p-4 rounded-2xl text-sm tracking-wide shadow-2xl border relative group transition-all
                ${msg.isMe 
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-white self-end rounded-tr-none' 
                  : 'bg-slate-900 border-slate-800 text-white self-start rounded-tl-none'}`}
            >
              <div className="relative z-10">{msg.text}</div>
              {/* Subtle bubble corner accent */}
              <div className={`absolute top-0 ${msg.isMe ? 'right-0' : 'left-0'} w-2 h-2 ${msg.isMe ? 'bg-cyan-500' : 'bg-slate-700'} opacity-30`} />
            </motion.div>
           )
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Pure Black Frosted */}
      <form onSubmit={sendMessage} className="relative mt-auto">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/50 font-mono text-xl">{'>'}</div>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!roomId}
          placeholder={roomId ? "Type a message..." : "Awaiting signal parity..."}
          className="w-full holographic-panel glass-input rounded-xl pl-10 pr-20 py-5 focus:outline-none focus:ring-0 disabled:opacity-50 text-white placeholder:text-slate-700 tracking-widest uppercase font-mono text-sm"
        />
        <button 
          type="submit"
          disabled={!roomId || !input.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg disabled:opacity-50 hover:bg-cyan-500 hover:text-slate-900 transition-all font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
