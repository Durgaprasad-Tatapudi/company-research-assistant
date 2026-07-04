import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-32 sm:pb-10">
      {/* Header */}
      <header className="mb-8 sm:mb-14">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex items-center justify-center w-3 h-3">
            <span className="absolute w-3 h-3 rounded-full bg-cyan/40 animate-ping2" />
            <span className="w-2 h-2 rounded-full bg-cyan" />
          </div>
          <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.3em] text-cream-dim uppercase">
            Case File System · Live
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
          <span className="gradient-text">Company Research</span>
          <br />
          <span className="text-cream">Assistant</span>
        </h1>

        <p className="mt-5 text-cream-muted max-w-xl text-sm sm:text-[15px] leading-relaxed">
          Drop a company name or URL. I crawl the site, cross-reference public data,
          run AI reasoning, and deliver a full dossier with competitors — ready as PDF.
        </p>
      </header>

      <ChatInterface />

      <footer className="mt-16 sm:mt-20 flex justify-center">
        <div className="badge bg-base-100 border border-line text-cream-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald/50" />
          Relu Consultancy AI Hackathon · Stateless by design
        </div>
      </footer>
    </main>
  );
}
