import { Link } from 'react-router-dom';

const STEPS = [
  {
    number: '01',
    icon: '🔍',
    title: 'Explore Available Products',
    description:
      'Browse through our selection of exclusive products listed for bidding. Each product has a fixed, minimal bid price.',
  },
  {
    number: '02',
    icon: '💳',
    title: 'Place Your Bid',
    description:
      'Pay the single bid price for the product of your choice to participate in the bidding process.',
  },
  {
    number: '03',
    icon: '⏳',
    title: 'Bidding Completion',
    description:
      'Once all bids for a product are completed, the bidding phase closes automatically.',
  },
  {
    number: '04',
    icon: '🎲',
    title: 'Random Winner Selection',
    description:
      'Among all participants who placed a bid, one lucky winner is randomly selected to receive the product.',
  },
  {
    number: '05',
    icon: '🚚',
    title: 'Product Delivery',
    description:
      'The selected winner will be notified, and the product will be shipped to them at no additional cost.',
  },
  {
    number: '06',
    icon: '🛡️',
    title: 'Admin-Controlled Product Listings',
    description:
      'All products on WinBid are genuine and added exclusively by our admin to ensure quality and authenticity.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#0A0E1A] pt-16">
      {/* Hero */}
      <div
        className="relative py-20 px-4 text-center overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 65%), #0A0E1A',
        }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#6366F1]/30 bg-[#6366F1]/10 text-[#A5B4FC] text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            Simple &amp; Transparent Process
          </div>
          <h1
            className="font-bold text-white mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', lineHeight: 1.15 }}
          >
            How{' '}
            <span className="gradient-text">WinBid</span>{' '}
            Works
          </h1>
          <p className="text-[#9CA3AF] text-lg leading-relaxed">
            Our simple and transparent process ensures a fair chance for everyone
            to win amazing products at incredible prices.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="glass-card rounded-2xl p-6 flex gap-5 group hover:border-[#6366F1]/40 transition-all duration-300"
            >
              {/* Icon bubble */}
              <div className="shrink-0">
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#A855F7] flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <span className="text-2xl">{step.icon}</span>
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#F59E0B] flex items-center justify-center text-[10px] font-bold text-black shadow">
                    {i + 1}
                  </div>
                </div>
              </div>

              {/* Text */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-1 leading-snug">
                  {step.title}
                </h3>
                <p className="text-[#9CA3AF] text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom callout */}
        <div className="mt-14 rounded-2xl border border-[#6366F1]/20 bg-[#6366F1]/5 p-8 text-center">
          <div className="text-3xl mb-3">✨</div>
          <h2 className="text-white font-bold text-xl mb-2">
            Ready to try your luck?
          </h2>
          <p className="text-[#9CA3AF] text-sm mb-6 max-w-md mx-auto">
            Browse our live bids, pick a product you love, place your bid, and
            wait for the draw. It&apos;s that simple!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
            >
              Explore Products →
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 rounded-xl border border-white/15 text-[#E5E7EB] font-semibold text-sm hover:bg-white/5 hover:border-white/25 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
