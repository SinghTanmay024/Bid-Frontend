const FEATURES = [
  {
    icon: '🎲',
    title: 'Fair & Transparent',
    description:
      'Every winner is picked by a certified random draw — no manipulation, no bias. Just pure chance.',
    accent: 'from-[#6366F1] to-[#4F46E5]',
    glow: 'rgba(99,102,241,0.15)',
  },
  {
    icon: '🔒',
    title: 'Secure Payments',
    description:
      'Your payment is 100% safe. If the bid round fails or is cancelled, you receive a full refund instantly.',
    accent: 'from-[#10B981] to-[#059669]',
    glow: 'rgba(16,185,129,0.12)',
  },
  {
    icon: '🏷️',
    title: 'Fixed Bid Price',
    description:
      'No price wars. Everyone pays the exact same flat bid price — the odds are equal for everyone.',
    accent: 'from-[#F59E0B] to-[#D97706]',
    glow: 'rgba(245,158,11,0.12)',
  },
  {
    icon: '⚡',
    title: 'Instant Results',
    description:
      'The moment the last slot is filled, a winner is announced immediately. No waiting, no suspense.',
    accent: 'from-[#A855F7] to-[#7C3AED]',
    glow: 'rgba(168,85,247,0.12)',
  },
];

function FeatureCard({ icon, title, description, accent, glow, index }) {
  return (
    <div
      className="glass-card rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 animate-fade-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Icon bubble */}
      <div className="relative w-14 h-14 shrink-0">
        <div
          className="absolute inset-0 rounded-2xl blur-md opacity-60"
          style={{ background: `radial-gradient(circle, ${glow}, transparent)` }}
        />
        <div
          className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center text-2xl shadow-lg`}
        >
          {icon}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-[#9CA3AF] text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function TrustSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Why BidWin?</h2>
          <p className="text-[#9CA3AF] max-w-xl mx-auto">
            We built BidWin on three pillars: fairness, security, and simplicity.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
