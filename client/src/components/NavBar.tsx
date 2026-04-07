import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="glassmorphism sticky top-0 z-50 px-6 py-4 flex justify-between items-center mb-6">
      <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
        Chatsy
      </Link>
      <div className="flex gap-6 items-center font-medium">
        <Link href="/chat" className="hover:text-primary transition-colors">Chat</Link>
        <Link href="/friends" className="hover:text-primary transition-colors">Friends</Link>
        <Link href="/profile" className="hover:text-primary transition-colors">Profile</Link>
      </div>
    </nav>
  );
}
