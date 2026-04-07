import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="holographic-panel mx-6 mt-6 px-8 py-4 flex justify-between items-center mb-6 sticky top-6 z-50 hover-3d">
      <Link href="/" className="text-2xl font-black neon-text-cyan uppercase tracking-widest flex items-center gap-2">
        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse block" />
        Chatsy
      </Link>
      <div className="flex gap-8 items-center font-bold text-xs tracking-widest uppercase text-cyan-200/70">
        <Link href="/chat" className="hover:text-cyan-400 hover:text-shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all">Chat</Link>
        <Link href="/friends" className="hover:text-cyan-400 hover:text-shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all">Friends</Link>
        <Link href="/profile" className="hover:text-cyan-400 hover:text-shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all">Profile</Link>
      </div>
    </nav>
  );
}
