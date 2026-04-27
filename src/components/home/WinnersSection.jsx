import { useState, useEffect } from 'react';
import { getAllProducts } from '../../api/products';

function WinnerCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const displayWinner = product.winnerId
    ? product.winnerId.split('@')[0]
    : 'Lucky Bidder';

  return (
    <div
      className="flex-shrink-0 w-60 sm:w-64 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
      style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Image */}
      <div className="relative h-36 bg-[#111114] overflow-hidden">
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover grayscale opacity-60"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[#2A2A32]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        {/* Completed badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ background: 'rgba(245,166,35,0.15)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.2)' }}>
            Completed
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <h4 className="text-sm font-semibold text-white line-clamp-1">{product.name}</h4>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#F5A623] flex items-center justify-center text-[9px] font-bold text-black shrink-0">
            W
          </div>
          <span className="text-xs text-[#6B6B78]">
            <span className="text-[#F5A623] font-medium">{displayWinner}</span> won
          </span>
        </div>
      </div>
    </div>
  );
}

function WinnerSkeleton() {
  return (
    <div className="flex-shrink-0 w-60 sm:w-64 rounded-2xl overflow-hidden"
      style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="h-36 shimmer" />
      <div className="p-4 flex flex-col gap-2.5">
        <div className="h-3.5 w-3/4 rounded shimmer" />
        <div className="h-3 w-1/2 rounded shimmer" />
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
        setWinners(data.filter((p) => p.status === 'COMPLETED').slice(0, 8));
      })
      .catch(() => setWinners([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && winners.length === 0) return null;

  return (
    <section
      className="py-20 px-5 sm:px-8"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="section-label mb-3 inline-flex">Winners</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-3">Recent Winners</h2>
            <p className="text-sm text-[#6B6B78] mt-1">Real people. Real products. Real wins.</p>
          </div>
        </div>

        {/* Scroll row */}
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <WinnerSkeleton key={i} />)
            : winners.map((product) => <WinnerCard key={product.id} product={product} />)
          }
        </div>
      </div>
    </section>
  );
}
