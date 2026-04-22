const STEPS = [
  {
    number: '01',
    icon: '🔍',
    title: 'Browse & Pick',
    description:
      'Find a product you love. See the fixed bid price and how many slots are still available before the winner is drawn.',
  },
  {
    number: '02',
    icon: '💳',
    title: 'Pay & Bid',
    description:
      'Pay the fixed bid price to claim your slot. Each user gets one slot per product — simple, fair, and no bidding wars.',
  },
  {
    number: '03',
    icon: '🎉',
    title: 'Winner Drawn',
    description:
      'Once all slots are filled, one random winner is chosen by a certified fair draw and wins the product instantly.',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-20 px-4 sm:px-6 lg:px-8"
      style={{
        background:
          'linear-gradient(180deg, #0A0E1A 0%, #0d1220 50%, #0A0E1A 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">How BidWin Works</h2>
          <p className="text-[#9CA3AF] max-w-xl mx-auto">
            Three simple steps. One fair winner. No auctions, no price wars — just luck and
            a flat entry fee.
          </p>
        </div>

        {/* ── Steps grid ── */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

          {/* Connector line (desktop only) */}
          <div
            className="hidden md:block absolute top-14 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px step-connector opacity-30"
            aria-hidden
          />

          {STEPS.map((step, i) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">

              {/* Step bubble */}
              <div className="relative mb-6">
                {/* Outer glow ring */}
                <div
                  className="absolute inset-0 rounded-full blur-md opacity-40"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)' }}
                />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#6366F1] to-[#A855F7] flex flex-col items-center justify-center shadow-lg shadow-indigo-500/30">
                  <span className="text-2xl">{step.icon}</span>
                </div>
                {/* Step number badge */}
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#F59E0B] flex items-center justify-center text-xs font-bold text-black shadow">
                  {i + 1}
                </div>
              </div>

              {/* Step card */}
              <div className="glass-card rounded-2xl p-6 w-full">
                <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                <p className="text-[#9CA3AF] text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom note ── */}
        <div className="mt-14 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/5 text-[#F59E0B] text-sm">
            <span>✨</span>
            No skill required — just pay, bid, and get lucky!
          </div>
        </div>
      </div>
    </section>
  );
}
