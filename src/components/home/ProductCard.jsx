import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

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
          // Tiny delay so CSS transition fires after mount
          requestAnimationFrame(() => setWidth(pct));
        }
      },
      { threshold: 0.2 }
    );
    if (barRef.current) observer.observe(barRef.current);
    return () => observer.disconnect();
  }, [pct]);

  const remaining = total - completed;

  return (
    <div ref={barRef}>
      <div className="flex justify-between text-xs text-[#9CA3AF] mb-1.5">
        <span className="font-medium text-[#E5E7EB]">{completed} / {total} slots filled</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${width}%`,
            background: 'linear-gradient(90deg, #6366F1, #A855F7)',
          }}
        />
      </div>
      <p className="text-xs text-[#9CA3AF] mt-1">
        <span className="font-semibold text-[#E5E7EB]">{remaining}</span>{' '}
        slot{remaining !== 1 ? 's' : ''} remaining
      </p>
    </div>
  );
}

/* ── Image with fallback ── */
function ProductImage({ src, alt }) {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#1a1f35] to-[#111827]">
        <span className="text-5xl opacity-40">📦</span>
        <span className="text-xs text-[#9CA3AF] opacity-60">No image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setImgError(true)}
    />
  );
}

/* ── Status badge ── */
function StatusBadge({ status }) {
  const isOpen = status === 'OPEN';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isOpen
          ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
          : 'bg-[#9CA3AF]/15 text-[#9CA3AF] border border-[#9CA3AF]/20'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isOpen ? 'bg-[#10B981] animate-pulse' : 'bg-[#9CA3AF]'
        }`}
      />
      {isOpen ? 'OPEN' : 'COMPLETED'}
    </span>
  );
}

/* ── Main product card ── */
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
      className="glass-card rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 animate-fade-up"
      style={style}
    >
      {/* ── Image ── */}
      <div className="relative h-48 overflow-hidden shrink-0">
        <ProductImage src={product.imageUrl} alt={product.name} />
        {/* Status badge overlay */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={product.status} />
        </div>
        {/* Gradient overlay on bottom of image */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(17,24,39,0.8))' }}
        />
      </div>

      {/* ── Content ── */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Name */}
        <h3 className="font-semibold text-white text-[18px] leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-[#9CA3AF] text-sm leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Bid price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-[#F59E0B]">
            ₹{product.bidPrice?.toLocaleString('en-IN')}
          </span>
          <span className="text-[#9CA3AF] text-sm">per bid</span>
        </div>

        {/* Progress */}
        <AnimatedProgressBar
          completed={product.bidsCompleted}
          total={product.totalBidsRequired}
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA button */}
        <button
          onClick={handleBid}
          disabled={isCompleted}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 mt-1 ${
            isCompleted
              ? 'bg-white/5 text-[#9CA3AF] cursor-not-allowed border border-white/10'
              : 'btn-glow bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white hover:scale-[1.02] shadow-lg shadow-indigo-500/25 active:scale-[0.98]'
          }`}
        >
          {isCompleted
            ? 'Bidding Closed'
            : `BID NOW — ₹${product.bidPrice?.toLocaleString('en-IN')}`}
        </button>
      </div>
    </div>
  );
}
