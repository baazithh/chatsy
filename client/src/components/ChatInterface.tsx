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
      
      {/* Header */}
      <div className="holographic-panel p-5 flex justify-between items-center mb-4 transition-all">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center border-2 ${roomId ? 'border-cyan-500 bg-cyan-500/20' : 'border-gray-600 bg-gray-800'}`}>
            {roomId ? <UserIcon className="text-cyan-400" size={28} /> : <Cpu className="text-gray-400 animate-pulse" size={28} />}
          </div>
          <div>
            <h2 className={`font-black text-xl uppercase tracking-widest ${roomId ? 'neon-text-cyan' : 'text-gray-400'}`}>
              {roomId ? 'Stranger' : 'Searching...'}
            </h2>
            <p className="text-xs text-cyan-500/70 uppercase tracking-[0.2em]">{status}</p>
          </div>
        </div>
        
        {roomId && (
          <div className="flex gap-3">
            <button onClick={handleAddFriend} className="p-3 rounded-lg bg-cyan-900/40 border border-cyan-500/50 hover:bg-cyan-500/20 text-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] transition-all" title="Add Friend">
              <UserPlus size={20} />
            </button>
            <button className="p-3 rounded-lg bg-magenta-900/40 border border-magenta-500/50 hover:bg-magenta-500/20 text-magenta-400 hover:shadow-[0_0_15px_rgba(217,70,239,0.6)] transition-all" title="Report/Block">
              <ShieldAlert size={20} />
            </button>
            <button onClick={handleSkip} className="px-6 py-2 bg-transparent border-2 border-red-500/50 hover:border-red-500 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center gap-2 font-black tracking-widest uppercase transition-all" title="Skip">
               Skip
               <SkipForward size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 holographic-panel scanlines mb-4 p-6 overflow-y-auto flex flex-col gap-5 relative">
        <div className="scanner-line" />
        
        {!roomId && (
          <div className="absolute inset-0 flex items-center justify-center -z-0 pointer-events-none overflow-hidden">
             <div className="radar-circle" style={{ animationDelay: '0s' }} />
             <div className="radar-circle" style={{ animationDelay: '1s' }} />
             <div className="radar-circle" style={{ animationDelay: '2s' }} />
             <Activity className="w-24 h-24 text-cyan-500/30 animate-pulse relative z-10" />
             <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-cyan-400/40 text-[10px] font-mono tracking-[0.5em] uppercase">
                Scanning Frequencies...
             </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
           msg.type === 'system' ? (
             <div key={idx} className="w-full flex justify-center my-4">
                <span className="px-4 py-1 border border-magenta-500/30 text-magenta-400 text-xs font-bold uppercase tracking-[0.3em] bg-magenta-950/50 rounded-sm">
                  {msg.text}
                </span>
             </div>
           ) : (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-[80%] p-4 rounded-lg text-sm tracking-wide shadow-lg border backdrop-blur-md
                ${msg.isMe 
                  ? 'bg-cyan-900/20 border-cyan-500/50 text-cyan-50 self-end [box-shadow:-5px_5px_0_rgba(6,182,212,0.2)] rounded-tr-none' 
                  : 'bg-magenta-900/20 border-magenta-500/50 text-magenta-50 self-start [box-shadow:5px_5px_0_rgba(217,70,239,0.2)] rounded-tl-none'}`}
            >
              {msg.text}
            </motion.div>
           )
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="relative mt-auto">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/50 font-mono text-xl">{'>'}</div>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!roomId}
          placeholder={roomId ? "Type a message..." : "Waiting for match..."}
          className="w-full holographic-panel glass-input rounded-xl pl-10 pr-20 py-5 focus:outline-none focus:ring-0 disabled:opacity-50 text-cyan-100 placeholder:text-cyan-800 tracking-widest uppercase font-mono text-sm"
        />
        <button 
          type="submit"
          disabled={!roomId || !input.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg disabled:opacity-50 hover:bg-cyan-500 hover:text-gray-900 transition-all font-bold"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
