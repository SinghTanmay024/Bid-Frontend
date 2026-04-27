import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useFavoritesStore } from '../../store/favoritesStore';

/* ── Animated progress bar ── */
function AnimatedProgressBar({ completed, total }) {
  const pct = total > 0 ? Math.min((completed / total) * 100, 100) : 0;
  const [width, setWidth] = useState(0);
  const observed = useRef(false);
  const barRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !observed.current) {
          observed.current = true;
          requestAnimationFrame(() => setWidth(pct));
        }
      },
      { threshold: 0.2 }
    );
    if (barRef.current) observer.observe(barRef.current);
    return () => observer.disconnect();
  }, [pct]);

  const remaining = total - completed;
  const urgency = pct >= 80 ? 'high' : pct >= 50 ? 'mid' : 'low';
  const barColor =
    urgency === 'high' ? '#EF4444' :
    urgency === 'mid'  ? '#F5A623' : '#5B5FEF';

  return (
    <div ref={barRef} className="flex flex-col gap-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-[#6B6B78]">{completed} / {total} slots filled</span>
        <span className="font-semibold" style={{ color: barColor }}>{Math.round(pct)}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, background: barColor }}
        />
      </div>
      <p className="text-xs text-[#6B6B78]">
        <span className="font-semibold text-[#A0A0AB]">{remaining}</span>{' '}
        slot{remaining !== 1 ? 's' : ''} remaining
      </p>
    </div>
  );
}

/* ── Image fallback ── */
function ProductImage({ src, alt }) {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #111114, #18181C)' }}>
        <svg className="w-10 h-10 text-[#2A2A32]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 21h18" />
        </svg>
        <span className="text-xs text-[#3A3A45]">No image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      onError={() => setImgError(true)}
    />
  );
}

/* ── Status badge ── */
function StatusBadge({ status }) {
  const isOpen = status === 'OPEN';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
      isOpen
        ? 'bg-[rgba(34,197,94,0.12)] text-[#4ADE80] border border-[rgba(34,197,94,0.2)]'
        : 'bg-[rgba(107,107,120,0.15)] text-[#6B6B78] border border-[rgba(107,107,120,0.2)]'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-[#22C55E] animate-pulse' : 'bg-[#6B6B78]'}`} />
      {isOpen ? 'Live' : 'Ended'}
    </span>
  );
}

/* ── Heart button ── */
function HeartButton({ productId }) {
  const { userId } = useAuthStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const [animating, setAnimating] = useState(false);
  const favorited = isFavorite(productId);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (!userId) {
      toast.error('Please log in to save favourites');
      return;
    }
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
    const added = await toggleFavorite(productId);
    if (added) toast.success('Added to favourites ❤️');
    else toast('Removed from favourites', { icon: '🤍' });
  };

  return (
    <button
      onClick={handleClick}
      aria-label={favorited ? 'Remove from favourites' : 'Add to favourites'}
      className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
        favorited
          ? 'bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.3)]'
          : 'bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(0,0,0,0.7)]'
      } ${animating ? 'scale-125' : 'scale-100'}`}
    >
      <svg
        className={`w-3.5 h-3.5 transition-colors ${favorited ? 'fill-[#EF4444] text-[#EF4444]' : 'fill-none text-white/80'}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}

/* ── Main card ── */
export default function ProductCard({ product, style, onBidClick }) {
  const { userId } = useAuthStore();
  const navigate = useNavigate();
  const isCompleted = product.status === 'COMPLETED';

  const handleBid = () => {
    if (!userId) {
      toast.error('Please log in to place a bid');
      navigate('/login');
      return;
    }
    if (onBidClick) onBidClick();
  };

  return (
    <div
      className="group card-interactive overflow-hidden flex flex-col animate-fade-up"
      style={style}
    >
      {/* Image area */}
      <div className="relative h-48 overflow-hidden bg-[#111114] shrink-0">
        <ProductImage src={product.imageUrl} alt={product.name} />

        {/* Heart — top left */}
        <div className="absolute top-3 left-3 z-10">
          <HeartButton productId={product.id} />
        </div>

        {/* Status — top right */}
        <div className="absolute top-3 right-3 z-10">
          <StatusBadge status={product.status} />
        </div>

        {/* Bottom gradient scrim */}
        <div
          className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #111114, transparent)' }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3.5 p-5 flex-1">

        {/* Product name */}
        <h3 className="font-semibold text-white text-base leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-[#6B6B78] leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Coin cost row */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)]">
            <span className="text-base leading-none">🪙</span>
            <span className="text-lg font-bold text-[#F5A623]">{product.bidPrice ?? 1}</span>
            <span className="text-xs text-[#A0A0AB]">coin{(product.bidPrice ?? 1) !== 1 ? 's' : ''} per bid</span>
          </div>
        </div>

        {/* Progress */}
        <AnimatedProgressBar
          completed={product.bidsCompleted}
          total={product.totalBidsRequired}
        />

        <div className="flex-1" />

        {/* CTA */}
        <button
          onClick={handleBid}
          disabled={isCompleted}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isCompleted
              ? 'bg-[rgba(255,255,255,0.04)] text-[#6B6B78] cursor-not-allowed border border-[rgba(255,255,255,0.06)]'
              : 'text-white hover:opacity-90 active:scale-[0.98]'
          }`}
          style={!isCompleted ? {
            background: '#5B5FEF',
            boxShadow: '0 2px 12px rgba(91,95,239,0.3)',
          } : {}}
        >
          {isCompleted
            ? 'Bidding Closed'
            : `Bid Now — 🪙 ${product.bidPrice ?? 1} coin${(product.bidPrice ?? 1) !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}
