export default function HeroBanner() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-14"
      style={{ background: '#0C0C0E' }}
    >
      {/* Subtle radial glow — single, top-center */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width: 800,
          height: 500,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(91,95,239,0.14) 0%, transparent 70%)',
        }}
      />

      {/* Grid overlay — very subtle */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-5 sm:px-8 max-w-5xl mx-auto">

        {/* Status pill */}
        <div className="animate-fade-up stagger-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
          style={{
            background: 'rgba(91,95,239,0.1)',
            border: '1px solid rgba(91,95,239,0.2)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-sm font-medium text-[#7477F5]">Live Bidding Platform</span>
          <span className="hidden sm:block h-3 w-px bg-[rgba(255,255,255,0.1)]" />
          <span className="hidden sm:block text-xs text-[#6B6B78]">India's Fairest Way to Win</span>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up stagger-2 font-bold text-white leading-[1.1] tracking-tight mb-6"
          style={{ fontSize: 'clamp(2.8rem, 8vw, 5.5rem)', letterSpacing: '-0.03em' }}
        >
          Bid Smart.{' '}
          <span className="gradient-text">Win Big.</span>
        </h1>

        {/* Sub */}
        <p
          className="animate-fade-up stagger-3 text-[#6B6B78] max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}
        >
          Pay a fixed price. Claim your slot. One random winner takes the product home —{' '}
          <span className="text-[#A0A0AB]">will it be you?</span>
        </p>

        {/* CTAs */}
        <div className="animate-fade-up stagger-4 flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <button
            onClick={() => scrollTo('products')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-white font-semibold text-[15px] transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: '#5B5FEF',
              boxShadow: '0 4px 24px rgba(91,95,239,0.35)',
            }}
          >
            Explore Live Bids
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          <button
            onClick={() => scrollTo('how-it-works')}
            className="w-full sm:w-auto px-7 py-3 rounded-xl text-[#A0A0AB] font-semibold text-[15px] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] hover:text-white hover:bg-[rgba(255,255,255,0.03)] transition-all"
          >
            How It Works
          </button>
        </div>

        {/* Trust row */}
        <div className="animate-fade-up stagger-5 flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-sm text-[#6B6B78]">
          {[
            { icon: '🔒', label: 'Secure Payments' },
            { icon: '🎲', label: 'Fair Random Draw' },
            { icon: '⚡', label: 'Instant Notification' },
          ].map(({ icon, label }, i) => (
            <span key={i} className="flex items-center gap-2">
              <span>{icon}</span>
              <span>{label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <span className="text-xs text-[#6B6B78] tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-[#6B6B78] to-transparent" />
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #0C0C0E)' }}
      />
    </section>
  );
}
