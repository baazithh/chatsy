import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-violet-50 dark:from-gray-950 dark:to-indigo-950 -z-10" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-fuchsia-300/30 rounded-full blur-[120px] -z-10 animate-pulse mix-blend-multiply dark:mix-blend-lighten" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-violet-400/20 rounded-full blur-[120px] -z-10 mix-blend-multiply dark:mix-blend-lighten" />

      <div className="text-center space-y-8 glassmorphism p-12 rounded-3xl max-w-2xl mx-auto shadow-2xl relative z-10 border border-white/40 dark:border-white/10">
        <div className="space-y-4">
          <h1 className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 tracking-tight pb-2">
            Chatsy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Connect instantly. <br/> Match by interests. Build permanent connections.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/chat" className="px-8 py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Start Chatting
          </Link>
          <Link href="/profile" className="px-8 py-4 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white rounded-full font-semibold hover:bg-white dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 backdrop-blur-md">
            Create Profile
          </Link>
        </div>
      </div>
    </main>
  );
}
