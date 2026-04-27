const STEPS = [
  {
    number: '01',
    title: 'Browse & Choose',
    description: 'Find a product you want. See the fixed bid price and how many slots remain before the winner is drawn.',
  },
  {
    number: '02',
    title: 'Pay & Claim Your Slot',
    description: 'Pay the flat bid price to secure your slot. No bidding wars — everyone pays the same, one slot per person.',
  },
  {
    number: '03',
    title: 'Winner is Drawn',
    description: 'Once all slots are filled, a certified random draw picks one winner instantly. The product is theirs.',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 px-5 sm:px-8"
      style={{ background: '#111114', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="max-w-xl mb-14">
          <span className="section-label mb-4 inline-flex">How It Works</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-3 mb-3">
            Three steps to win
          </h2>
          <p className="text-[#6B6B78] text-sm leading-relaxed">
            No auctions. No price wars. Just a fair flat-fee entry and one randomly selected winner.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="relative flex flex-col gap-5 p-6 rounded-2xl"
              style={{
                background: '#18181C',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Number */}
              <div className="flex items-center justify-between">
                <span
                  className="text-5xl font-black tabular-nums"
                  style={{
                    background: 'linear-gradient(135deg, rgba(91,95,239,0.3), rgba(91,95,239,0.05))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {step.number}
                </span>

                {/* Connector arrow (not on last) */}
                {i < STEPS.length - 1 && (
                  <svg className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2A2A32] z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-[#6B6B78] leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-10 flex items-center gap-3 px-5 py-3.5 rounded-xl max-w-sm"
          style={{ background: 'rgba(245,166,35,0.07)', border: '1px solid rgba(245,166,35,0.15)' }}>
          <span className="text-lg">✨</span>
          <p className="text-sm text-[#F5A623] font-medium">No skill required — just pay, bid, and get lucky!</p>
        </div>
      </div>
    </section>
  );
}
