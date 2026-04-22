import { useState, useEffect } from 'react';
import { getAllProducts } from '../../api/products';

function WinnerCard({ product }) {
  const [imgError, setImgError] = useState(false);

  const displayWinner = product.winnerId
    ? product.winnerId.split('@')[0]
    : 'Lucky Bidder';

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex-shrink-0 w-64 sm:w-72 transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover grayscale"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1f35] to-[#111827]">
            <span className="text-4xl opacity-30">📦</span>
          </div>
        )}
        {/* Gold overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, transparent 60%)',
          }}
        />
        {/* COMPLETED badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30">
            🏆 COMPLETED
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <h4 className="font-semibold text-white text-sm leading-snug line-clamp-2">
          {product.name}
        </h4>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#F97316] flex items-center justify-center text-[8px] font-bold text-black">
            W
          </div>
          <span className="text-xs text-[#9CA3AF]">
            Winner: <span className="text-[#F59E0B] font-medium">{displayWinner}</span>
          </span>
        </div>
        <p className="text-[10px] text-[#9CA3AF]/70 italic mt-0.5">
          This could be you next time!
        </p>
      </div>
    </div>
  );
}

function WinnerSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex-shrink-0 w-64 sm:w-72">
      <div className="h-40 shimmer bg-white/5" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-4 w-3/4 rounded shimmer bg-white/5" />
        <div className="h-3.5 w-1/2 rounded shimmer bg-white/5" />
      </div>
    </div>
  );
}

export default function WinnersSection() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProducts()
      .then(({ data }) => {
        const completed = data
          .filter((p) => p.status === 'COMPLETED')
          .slice(0, 6);
        setWinners(completed);
      })
      .catch(() => setWinners([]))
      .finally(() => setLoading(false));
  }, []);

  // Don't render the section if no winners
  if (!loading && winners.length === 0) return null;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">🏆 Recent Winners</h2>
          <p className="text-[#9CA3AF]">Real people. Real products. Real wins.</p>
        </div>

        {/* Horizontal scroll row */}
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <WinnerSkeleton key={i} />)
            : winners.map((product) => (
                <WinnerCard key={product.id} product={product} />
              ))}
        </div>

        {/* Fade edge hint */}
        <div className="mt-2 text-center">
          <span className="text-xs text-[#9CA3AF]/50">← Scroll to see more →</span>
        </div>
      </div>
    </section>
  );
}
