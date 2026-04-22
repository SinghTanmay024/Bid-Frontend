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
    <section className="py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div
          className="relative rounded-3xl overflow-hidden px-8 py-16 text-center"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 70%, #2e1065 100%)',
          }}
        >
          {/* Background orbs */}
          <div
            className="absolute top-0 left-0 w-72 h-72 rounded-full pointer-events-none orb-float-slow"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
              transform: 'translate(-40%, -40%)',
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-56 h-56 rounded-full pointer-events-none orb-float-fast"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)',
              transform: 'translate(30%, 30%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm mb-6">
              <span className="animate-pulse">✨</span>
              Join thousands of lucky winners
            </div>

            <h2
              className="font-bold text-white mb-4 leading-tight"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)' }}
            >
              Ready to win your first product?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of bidders and claim your slot today. One bid. One winner. Your turn.
            </p>

            <button
              onClick={handleCTA}
              className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-[#312e81] font-bold text-[15px] hover:bg-white/90 transition-all hover:scale-[1.03] shadow-2xl shadow-black/30 active:scale-[0.98]"
            >
              🚀 Start Bidding Now
            </button>

            {/* Trust micro-line */}
            <p className="mt-4 text-white/40 text-xs">
              No subscription · Fixed bid price · Fair random draw
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
