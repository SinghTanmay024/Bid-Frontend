const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Fair & Transparent',
    description: 'Every winner is chosen by certified random draw — no manipulation, no bias.',
    accent: '#5B5FEF',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Secure Payments',
    description: '100% safe transactions. Full refund if a bid round is cancelled.',
    accent: '#22C55E',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    title: 'Fixed Bid Price',
    description: 'No price wars. Everyone pays exactly the same flat entry fee.',
    accent: '#F5A623',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Instant Results',
    description: 'Winner announced the moment the last slot is filled. No waiting.',
    accent: '#7477F5',
  },
];

function FeatureCard({ icon, title, description, accent }) {
  return (
    <div
      className="flex flex-col gap-4 p-5 rounded-2xl transition-all duration-200"
      style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}18`, color: accent }}
      >
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
        <p className="text-sm text-[#6B6B78] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function TrustSection() {
  return (
    <section className="py-24 px-5 sm:px-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          {/* Left */}
          <div className="lg:w-72 shrink-0">
            <span className="section-label mb-4 inline-flex">Why BidWin</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-3 mb-4">
              Built on fairness,<br />security, and simplicity.
            </h2>
            <p className="text-sm text-[#6B6B78] leading-relaxed">
              We believe winning something should feel truly earned by luck — not by who has the most money.
            </p>
          </div>

          {/* Right grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
