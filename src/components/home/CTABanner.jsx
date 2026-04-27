import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function CTABanner() {
  const { userId } = useAuthStore();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (userId) {
      const el = document.getElementById('products');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/register');
    }
  };

  return (
    <section className="py-16 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div
          className="relative rounded-2xl overflow-hidden px-8 py-16 sm:py-20 text-center"
          style={{
            background: 'linear-gradient(135deg, #0E0E1A 0%, #14143A 40%, #1A103A 100%)',
            border: '1px solid rgba(91,95,239,0.2)',
          }}
        >
          {/* Subtle top glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              width: 600,
              height: 250,
              background: 'radial-gradient(ellipse at 50% 0%, rgba(91,95,239,0.25) 0%, transparent 70%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 text-xs font-semibold tracking-wide uppercase"
              style={{ background: 'rgba(91,95,239,0.15)', border: '1px solid rgba(91,95,239,0.25)', color: '#7477F5' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B5FEF] animate-pulse" />
              Join thousands of winners
            </div>

            <h2
              className="font-bold text-white leading-tight mb-4 tracking-tight"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)' }}
            >
              Ready to win your first product?
            </h2>

            <p className="text-[#A0A0AB] text-base mb-10 max-w-md mx-auto leading-relaxed">
              One bid. One winner. Your slot is waiting — claim it before someone else does.
            </p>

            <button
              onClick={handleCTA}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: '#5B5FEF',
                boxShadow: '0 4px 24px rgba(91,95,239,0.4)',
              }}
            >
              Start Bidding Now
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            <p className="mt-5 text-xs text-[#6B6B78]">
              No subscription · Fixed bid price · Certified fair draw
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
