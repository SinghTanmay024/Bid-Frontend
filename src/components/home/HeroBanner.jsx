export default function HeroBanner() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-mesh pt-16">

      {/* ── Floating orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large indigo orb — top left */}
        <div
          className="orb-float-slow absolute rounded-full"
          style={{
            width: 480,
            height: 480,
            top: '-120px',
            left: '-120px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          }}
        />
        {/* Violet orb — top right */}
        <div
          className="orb-float-medium absolute rounded-full"
          style={{
            width: 380,
            height: 380,
            top: '-60px',
            right: '-60px',
            background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%)',
          }}
        />
        {/* Gold orb — bottom center */}
        <div
          className="orb-float-fast absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            bottom: '10%',
            left: '40%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)',
          }}
        />
        {/* Small accent orb — mid right */}
        <div
          className="orb-float-medium absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            top: '40%',
            right: '10%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
            animationDelay: '2s',
          }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* ── Hero content ── */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">

        {/* Eyebrow tag */}
        <div className="animate-fade-up stagger-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#6366F1]/30 bg-[#6366F1]/10 text-[#A5B4FC] text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          Live Bidding Platform — India&apos;s Fairest Way to Win
        </div>

        {/* Main headline */}
        <h1
          className="animate-fade-up stagger-2 font-bold leading-tight mb-6"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', letterSpacing: '-0.02em' }}
        >
          <span className="text-white">Bid Smart.</span>{' '}
          <span className="gradient-text">Win Big.</span>
        </h1>

        {/* Subheadline */}
        <p
          className="animate-fade-up stagger-3 text-[#9CA3AF] max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}
        >
          Pay once. Get a chance to win. One lucky bidder takes it all —{' '}
          <span className="text-[#E5E7EB] font-medium">will it be you?</span>
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-up stagger-4 flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={() => scrollTo('products')}
            className="btn-glow w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white font-semibold text-[15px] transition-transform hover:scale-[1.03] shadow-lg shadow-indigo-500/30"
          >
            Explore Products →
          </button>
          <button
            onClick={() => scrollTo('how-it-works')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/15 text-[#E5E7EB] font-semibold text-[15px] hover:bg-white/5 hover:border-white/25 transition-all"
          >
            How It Works
          </button>
        </div>

        {/* Trust badges */}
        <div className="animate-fade-up stagger-5 flex flex-wrap items-center justify-center gap-6 text-sm text-[#9CA3AF]">
          <span className="flex items-center gap-1.5">
            <span>🔒</span>
            <span>Secure Payments</span>
          </span>
          <span className="hidden sm:block w-px h-4 bg-white/10" />
          <span className="flex items-center gap-1.5">
            <span>🎲</span>
            <span>Fair Random Draw</span>
          </span>
          <span className="hidden sm:block w-px h-4 bg-white/10" />
          <span className="flex items-center gap-1.5">
            <span>🚀</span>
            <span>Instant Winner Notification</span>
          </span>
        </div>
      </div>

      {/* ── Bottom fade ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #0A0E1A)' }}
      />
    </section>
  );
}
