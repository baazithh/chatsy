'use client';
import { useState } from 'react';
import { auth } from '@/lib/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { ShieldCheck, Activity } from 'lucide-react';

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
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 perspective-container bg-black">
      {/* HUD Background Elements - Pure Black */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#000000]" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.15)_0%,transparent_70%)] pointer-events-none -z-10" />
      
      <NavBar />

      <div className="holographic-panel hover-3d p-12 max-w-md w-full relative z-10 border border-cyan-500/30 bg-black/60 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <div className="flex justify-center mb-10">
           <div className="w-20 h-20 border-2 border-cyan-400 rounded-xl flex items-center justify-center -rotate-12 transition-transform hover:rotate-0">
              <Activity className="text-cyan-400 w-10 h-10 animate-pulse" />
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

        <p className="mt-8 text-center text-slate-500 font-mono text-xs uppercase">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-cyan-400 hover:text-white font-bold transition-colors"
          >
            {isLogin ? 'Register Here' : 'Login Here'}
          </button>
        </p>
      </div>
    </main>
  );
}
