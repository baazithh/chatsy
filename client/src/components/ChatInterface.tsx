'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, User as UserIcon, SkipForward, UserPlus, ShieldAlert, Cpu, Activity, Volume2, VolumeX, Languages, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebaseConfig';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Scifi SFX URLs (Royalty free)
const SFX = {
  MATCH: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  MESSAGE: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
  PULSE: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
};

export default function ChatInterface({ interests = [] }: { interests?: string[] }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('Looking for a match...');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [peerUid, setPeerUid] = useState<string | null>(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // SFX Player
  const playSFX = useCallback((url: string) => {
    if (!isMuted) {
      const audio = new Audio(url);
      audio.volume = 0.4;
      audio.play().catch(() => {}); // Browser may block auto-play
    }
  }, [isMuted]);

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
      playSFX(SFX.MATCH);
    });

    newSocket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
      playSFX(SFX.MESSAGE);
    });

    newSocket.on('peer_typing', () => setIsPeerTyping(true));
    newSocket.on('peer_stop_typing', () => setIsPeerTyping(false));

    newSocket.on('receive_reaction', (data) => {
       if (data.type === 'pulse') {
          setShowPulse(true);
          playSFX(SFX.PULSE);
          setTimeout(() => setShowPulse(false), 2000);
       }
    });

    newSocket.on('peer_disconnected', () => {
      setStatus('Stranger disconnected. Finding new match...');
      setRoomId(null);
      setPeerUid(null);
      setIsPeerTyping(false);
      setMessages((prev) => [...prev, { type: 'system', text: 'Stranger Disconnected' }]);
      setTimeout(() => {
        newSocket.emit('join_queue', { interests, uid: user?.uid });
      }, 1000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [interests, user, playSFX]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!socket || !roomId) return;

    socket.emit('typing');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing');
    }, 2000);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !roomId) return;
    
    const msg = { text: input, type: 'text' };
    socket.emit('send_message', msg);
    socket.emit('stop_typing');
    setMessages((prev) => [...prev, { ...msg, senderId: socket.id, isMe: true }]);
    setInput('');
  };

  const sendReaction = () => {
    if (!socket || !roomId) return;
    socket.emit('send_reaction', { type: 'pulse' });
    playSFX(SFX.CLICK);
  };

  const translateMessage = async (index: number) => {
    const msg = messages[index];
    if (msg.translatedText) return;

    try {
       const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(msg.text)}&langpair=auto|en`);
       const data = await res.json();
       const translated = data.responseData.translatedText;
       
       setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[index] = { ...newMsgs[index], translatedText: translated };
          return newMsgs;
       });
    } catch(e) {
       alert("Translation matrix offline.");
    }
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
      alert("Stranger is using a guest account.");
      return;
    }

    try {
      const friendRef = doc(collection(db, 'users', user.uid, 'friends'), peerUid);
      await setDoc(friendRef, { 
        addedAt: serverTimestamp(),
        peerUid: peerUid,
        roomId: roomId
      });
      alert("Friend saved to network!");
    } catch (err) {
      alert("Failed to save friend.");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto w-full p-4 relative z-10 perspective-container">
      
      {/* Reaction Overlay */}
      <AnimatePresence>
        {showPulse && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.3, scale: 2.5 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
             <div className="w-[80vw] h-[80vw] rounded-full border-[20px] border-cyan-500 shadow-[0_0_100px_rgba(6,182,212,0.8)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - Black HUD */}
      <div className="holographic-panel p-5 flex justify-between items-center mb-4 transition-all bg-black/60 relative overflow-visible">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center border-2 ${roomId ? 'border-cyan-500 bg-cyan-500/20' : 'border-slate-800 bg-slate-900'} relative`}>
            {roomId ? <UserIcon className="text-cyan-400" size={28} /> : <Cpu className="text-slate-600 animate-pulse" size={28} />}
            {roomId && (
               <button onClick={sendReaction} className="absolute -top-2 -right-2 p-1.5 bg-cyan-500 rounded-full text-black hover:scale-110 transition-all shadow-[0_0_15px_rgba(6,182,212,0.6)]" title="Send Pulse">
                  <Zap size={12} fill="currentColor" />
               </button>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
               <h2 className={`font-black text-xl uppercase tracking-widest ${roomId ? 'neon-text-cyan' : 'text-slate-600'}`}>
                 {roomId ? 'Stranger' : 'Searching...'}
               </h2>
               {isPeerTyping && (
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest bg-cyan-900/40 px-2 py-0.5 rounded border border-cyan-500/30">
                     Synchronizing Signal...
                  </motion.span>
               )}
            </div>
            <p className="text-xs text-cyan-400/70 font-mono tracking-[0.2em] uppercase">{status}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => setIsMuted(!isMuted)} className={`p-3 rounded-lg border transition-all ${isMuted ? 'bg-red-900/20 border-red-500/30 text-red-500' : 'bg-slate-900/40 border-white/5 text-slate-400'}`}>
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          {roomId && (
            <div className="flex gap-3">
              <button onClick={handleAddFriend} className="p-3 rounded-lg bg-cyan-900/40 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]" title="Add Friend">
                <UserPlus size={20} />
              </button>
              <button className="p-3 rounded-lg bg-magenta-900/40 border border-magenta-500/50 text-magenta-400 hover:bg-magenta-500/20 transition-all hover:shadow-[0_0_15px_rgba(217,70,239,0.5)]" title="Report/Block">
                <ShieldAlert size={20} />
              </button>
              <button onClick={handleSkip} className="px-6 py-2 bg-transparent border-2 border-red-500/50 hover:border-red-500 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center gap-2 font-black tracking-widest uppercase transition-all" title="Skip">
                 Skip
                 <SkipForward size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages - Black Frosted */}
      <div className="flex-1 holographic-panel mb-4 p-6 overflow-y-auto flex flex-col gap-5 relative bg-black/40 scanlines">
        <div className="scanner-line opacity-40" />
        
        {!roomId && (
          <div className="absolute inset-0 flex items-center justify-center -z-0 pointer-events-none overflow-hidden">
             <div className="radar-circle" style={{ animationDelay: '0s' }} />
             <div className="radar-circle" style={{ animationDelay: '1s' }} />
             <div className="radar-circle" style={{ animationDelay: '2s' }} />
             <Activity className="w-24 h-24 text-cyan-500/10 animate-pulse relative z-10" />
          </div>
        )}
        
        {messages.map((msg, idx) => (
           msg.type === 'system' ? (
             <motion.div 
               key={idx} 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="w-full flex justify-center my-6"
             >
                <div className="px-6 py-1.5 border-x border-magenta-500/50 text-magenta-400 text-[10px] font-black uppercase tracking-[0.4em] bg-magenta-950/30 rounded-lg">
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
              <div className="relative z-10 space-y-2">
                 <p>{msg.text}</p>
                 {msg.translatedText && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-cyan-400/80 italic pt-2 border-t border-white/5 font-mono">
                       {msg.translatedText}
                    </motion.p>
                 )}
              </div>

              {!msg.isMe && !msg.translatedText && (
                 <button 
                   onClick={() => translateMessage(idx)}
                   className="absolute -top-3 -right-3 p-1.5 bg-black border border-white/10 rounded-full text-slate-500 hover:text-cyan-400 transition-all opacity-0 group-hover:opacity-100 z-20"
                 >
                   <Languages size={10} />
                 </button>
              )}
              
              <div className={`absolute top-0 ${msg.isMe ? 'right-0' : 'left-0'} w-2 h-2 ${msg.isMe ? 'bg-cyan-400' : 'bg-slate-700'} opacity-30`} />
            </motion.div>
           )
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Black Frosted */}
      <form onSubmit={sendMessage} className="relative mt-auto">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/50 font-mono text-xl">{'>'}</div>
        <input 
          type="text" 
          value={input}
          onChange={handleInputChange}
          disabled={!roomId}
          placeholder={roomId ? "Type a message..." : "Awaiting signal parity..."}
          className="w-full holographic-panel glass-input rounded-xl pl-10 pr-20 py-5 focus:outline-none focus:ring-0 disabled:opacity-50 text-white placeholder:text-slate-800 tracking-widest uppercase font-mono text-sm"
        />
        <button 
          type="submit"
          disabled={!roomId || !input.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg disabled:opacity-50 hover:bg-cyan-500 hover:text-slate-900 transition-all font-bold"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
