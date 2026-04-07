'use client';
import { useState } from 'react';
import { auth } from '@/lib/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/profile');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 perspective-container">
      <div className="holographic-panel hover-3d p-12 max-w-md w-full relative z-10 border border-cyan-500/30">
        <div className="flex justify-center mb-6">
           <div className="w-16 h-16 border-2 border-cyan-400 rounded-lg flex items-center justify-center rotate-45">
             <div className="w-8 h-8 bg-cyan-400 animate-pulse pointer-events-none" />
           </div>
        </div>

        <h1 className="text-3xl font-black neon-text-cyan mb-8 text-center uppercase tracking-widest">
          {isLogin ? 'Login to Chatsy' : 'Register'}
        </h1>
        
        <form onSubmit={handleAuth} className="flex flex-col gap-6">
          <div>
            <label className="text-cyan-500/80 font-mono text-xs uppercase tracking-widest block mb-2">Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 holographic-panel glass-input font-mono text-sm uppercase"
              required
            />
          </div>
          <div>
            <label className="text-cyan-500/80 font-mono text-xs uppercase tracking-widest block mb-2">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 holographic-panel glass-input tracking-widest"
              required
            />
          </div>
          
          {error && (
             <div className="p-3 border border-red-500/50 bg-red-900/30 text-red-400 font-mono text-xs uppercase">
                ERROR: {error}
             </div>
          )}
          
          <button 
            type="submit" 
            className="mt-4 w-full py-4 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg font-bold hover:bg-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] transition-all uppercase tracking-widest"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 font-mono text-xs uppercase">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-cyan-400 hover:neon-text-cyan font-bold"
          >
            {isLogin ? 'Register Here' : 'Login Here'}
          </button>
        </p>
      </div>
    </main>
  );
}
