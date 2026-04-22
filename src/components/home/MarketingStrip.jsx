import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function MarketingStrip() {
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
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">

        {/* ── Card 1: Your Next Big Win ── */}
        <div
          className="relative flex-1 rounded-3xl overflow-hidden px-8 py-12 flex flex-col justify-between"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1a0533 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          {/* Orb */}
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none orb-float-slow"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
              transform: 'translate(30%, -30%)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none orb-float-medium"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)',
              transform: 'translate(-30%, 30%)',
            }}
          />

          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6366F1]/15 border border-[#6366F1]/30 text-[#A5B4FC] text-xs font-semibold mb-5 uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Live Now
            </div>

            <h2
              className="font-bold text-white mb-4 leading-tight"
              style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}
            >
              Your Next Big Win{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #6366F1, #A855F7)' }}
              >
                Starts Here!
              </span>
            </h2>

            <p className="text-[#9CA3AF] leading-relaxed mb-8" style={{ fontSize: '1rem' }}>
              Join thousands of users who've won amazing products for just a few dollars.
              Why pay full price when you can{' '}
              <span className="text-white font-medium">win it?</span>
            </p>

            {/* Stats row */}
            <div className="flex gap-6 mb-8">
              {[
                { value: '10K+', label: 'Winners' },
                { value: '₹50L+', label: 'Products Won' },
                { value: '99%', label: 'Fair Draw' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-xl font-bold text-white">{value}</p>
                  <p className="text-xs text-[#9CA3AF]">{label}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleCTA}
              className="btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white font-semibold text-sm hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
            >
              🎯 Claim Your Slot
            </button>
          </div>
        </div>

        {/* ── Card 2: Win Big With Tiny Bids ── */}
        <div
          className="relative flex-1 rounded-3xl overflow-hidden px-8 py-12 flex flex-col justify-between"
          style={{
            background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1a0a 50%, #1a0a00 100%)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          {/* Orbs */}
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none orb-float-fast"
            style={{
              background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)',
              transform: 'translate(30%, -30%)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none orb-float-slow"
            style={{
              background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)',
              transform: 'translate(-30%, 30%)',
            }}
          />

          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-[#FCD34D] text-xs font-semibold mb-5 uppercase tracking-wide">
              <span>💰</span>
              Save Up To 99%
            </div>

            <h2
              className="font-bold text-white mb-4 leading-tight"
              style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}
            >
              Win Big With{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #F59E0B, #EF4444)' }}
              >
                Tiny Bids!
              </span>
            </h2>

            <p className="text-[#9CA3AF] leading-relaxed mb-8" style={{ fontSize: '1rem' }}>
              Turn every shopping cart into a potential jackpot. With{' '}
              <span className="text-white font-medium">BidWin</span>, you could win premium
              products for just a fraction of their retail price. The thrill of winning is
              just a bid away!
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['🔒 Secure Payment', '🎲 Fair Random Draw', '⚡ Instant Win', '🏆 Real Products'].map((f) => (
                <span
                  key={f}
                  className="px-3 py-1 rounded-full text-xs font-medium text-[#E5E7EB] border border-white/10 bg-white/5"
                >
                  {f}
                </span>
              ))}
            </div>

            <button
              onClick={handleCTA}
              className="btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              style={{
                background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
                color: '#fff',
                boxShadow: '0 10px 30px rgba(245,158,11,0.25)',
              }}
            >
              🚀 Start Winning Now
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
