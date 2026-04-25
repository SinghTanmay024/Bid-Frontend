import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { getProduct } from '../api/products';
import { placeBid, getBidsByUser, getWinner } from '../api/bids';
import { useAuthStore } from '../store/authStore';
import { useCoinStore } from '../store/coinStore';
import BuyCoinModal from './BuyCoinModal';

/* ── Coins required per bid (1 coin = 1 bid slot) ── */
const COINS_PER_BID = 1;

/* ── Animated progress bar ── */
function ProgressBar({ completed, total }) {
  const pct = total > 0 ? Math.min((completed / total) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-[#9CA3AF] mb-1.5">
        <span className="font-medium text-[#E5E7EB]">
          {completed} / {total} slots filled
        </span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #6366F1, #A855F7)',
          }}
        />
      </div>
      <p className="text-xs text-[#9CA3AF] mt-1.5">
        <span className="font-semibold text-[#E5E7EB]">{total - completed}</span>{' '}
        slot{total - completed !== 1 ? 's' : ''} remaining
      </p>
    </div>
  );
}

/* ── Image with fallback ── */
function ProductImage({ src, alt }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#1a1f35] to-[#111827]">
        <span className="text-5xl opacity-40">📦</span>
        <span className="text-xs text-[#9CA3AF]">No image</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setError(true)}
    />
  );
}

/* ── Main BidModal ── */
export default function BidModal({ product: initialProduct, onClose, onBidSuccess }) {
  const navigate = useNavigate();
  const { userId, email } = useAuthStore();
  const { coins, spendCoins } = useCoinStore();

  const [product, setProduct] = useState(initialProduct);
  const [userHasBid, setUserHasBid] = useState(false);
  const [bidding, setBidding] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showBuyCoins, setShowBuyCoins] = useState(false);

  const isOpen = product?.status === 'OPEN';
  const isCompleted = product?.status === 'COMPLETED';
  const hasEnoughCoins = coins >= COINS_PER_BID;

  // Check if user already bid
  const checkUserBid = useCallback(async () => {
    if (!userId || !product?.id) return;
    try {
      const { data } = await getBidsByUser(userId);
      setUserHasBid(data.some((bid) => bid.productId === product.id));
    } catch {
      // non-critical
    }
  }, [userId, product?.id]);

  // Fetch winner if completed
  const fetchWinner = useCallback(async () => {
    if (!product?.id || product?.status !== 'COMPLETED') return;
    try {
      const { data } = await getWinner(product.id);
      setWinner(data);
    } catch {
      // non-critical
    }
  }, [product?.id, product?.status]);

  useEffect(() => {
    checkUserBid();
    fetchWinner();
  }, [checkUserBid, fetchWinner]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleBid = async () => {
    if (!userId) {
      toast.error('Please log in to place a bid.');
      onClose();
      navigate('/login');
      return;
    }

    if (!hasEnoughCoins) {
      setShowBuyCoins(true);
      return;
    }

    setBidding(true);
    try {
      // Deduct coin optimistically
      const deducted = spendCoins(COINS_PER_BID);
      if (!deducted) {
        toast.error('Not enough coins. Please buy more.');
        setShowBuyCoins(true);
        setBidding(false);
        return;
      }

      // Place the bid
      await placeBid(product.id, userId);

      // Refresh product state
      const { data: updated } = await getProduct(product.id);
      setProduct(updated);
      setUserHasBid(true);

      toast.success(`Bid placed! 🪙 1 coin used.`);

      if (updated.status === 'COMPLETED') {
        confetti({
          particleCount: 200,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981'],
        });
        try {
          const { data: winnerData } = await getWinner(updated.id);
          setWinner(winnerData);
        } catch { /* ignore */ }
        toast.success('Bidding complete! A winner has been selected!', { duration: 5000 });
      }

      if (onBidSuccess) onBidSuccess(updated);
    } catch (err) {
      // Refund coin on API failure
      const { addCoins } = useCoinStore.getState();
      addCoins(COINS_PER_BID);

      const msg = err?.response?.data?.message || err?.response?.data || '';
      const msgStr = typeof msg === 'string' ? msg.toLowerCase() : '';
      if (msgStr.includes('already') || msgStr.includes('duplicate')) {
        toast.error('You have already placed a bid on this product.');
        setUserHasBid(true);
      } else {
        toast.error('Bid failed. Your coin has been refunded.');
      }
    } finally {
      setBidding(false);
    }
  };

  if (!product) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Modal panel */}
        <div className="relative w-full max-w-lg bg-[#111827] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-fade-up">

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-[#9CA3AF] hover:text-white transition-colors"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Product image */}
          <div className="relative h-52 bg-[#0A0E1A]">
            <ProductImage src={product.imageUrl} alt={product.name} />

            {/* Status badge */}
            <div className="absolute top-3 left-3">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isOpen
                    ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                    : 'bg-[#9CA3AF]/15 text-[#9CA3AF] border border-[#9CA3AF]/20'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-[#10B981] animate-pulse' : 'bg-[#9CA3AF]'}`} />
                {isOpen ? 'OPEN' : 'COMPLETED'}
              </span>
            </div>

            {/* Gradient overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, transparent, #111827)' }}
            />
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col gap-4">

            {/* Name */}
            <h2 className="text-xl font-bold text-white leading-tight pr-8">
              {product.name}
            </h2>

            {/* Description */}
            {product.description && (
              <p className="text-[#9CA3AF] text-sm leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Bid cost row */}
            <div className="flex items-center justify-between bg-[#0A0E1A] rounded-xl px-4 py-3 border border-white/5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#F59E0B]">
                  ₹{product.bidPrice?.toLocaleString('en-IN')}
                </span>
                <span className="text-[#9CA3AF] text-sm">product value</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                <span className="text-base">🪙</span>
                <span className="text-yellow-400 font-bold text-sm">{COINS_PER_BID} coin</span>
                <span className="text-[#9CA3AF] text-xs">to bid</span>
              </div>
            </div>

            {/* Coin balance info (only for logged-in users on open bids) */}
            {isOpen && userId && !userHasBid && (
              <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs border ${
                hasEnoughCoins
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-red-500/10 border-red-500/20'
              }`}>
                <span className={hasEnoughCoins ? 'text-emerald-400' : 'text-red-400'}>
                  {hasEnoughCoins ? '✓ You have enough coins' : '✗ Not enough coins'}
                </span>
                <div className="flex items-center gap-1">
                  <span>🪙</span>
                  <span className={`font-bold ${hasEnoughCoins ? 'text-yellow-400' : 'text-red-400'}`}>
                    {coins} balance
                  </span>
                </div>
              </div>
            )}

            {/* Progress */}
            <ProgressBar
              completed={product.bidsCompleted}
              total={product.totalBidsRequired}
            />

            {/* Winner banner */}
            {isCompleted && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="text-amber-400 font-semibold text-sm">Bidding Complete!</p>
                  {winner?.winnerId && (
                    <p className="text-[#9CA3AF] text-xs mt-0.5">
                      Winner: <span className="text-white font-medium">{winner.winnerId}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* CTA */}
            {isOpen && (
              <div className="pt-1 flex flex-col gap-2">
                {!userId ? (
                  <button
                    onClick={() => { onClose(); navigate('/login'); }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white font-semibold hover:opacity-90 transition-opacity text-sm shadow-lg shadow-indigo-500/25"
                  >
                    Log in to Bid
                  </button>
                ) : userHasBid ? (
                  <div className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[#9CA3AF] text-sm font-medium text-center">
                    ✓ You have already bid on this product
                  </div>
                ) : hasEnoughCoins ? (
                  <button
                    onClick={handleBid}
                    disabled={bidding}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white font-semibold hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                  >
                    {bidding ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Placing bid…
                      </>
                    ) : (
                      <>
                        <span>🪙</span>
                        Use 1 Coin &amp; Bid Now
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <div className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                      You need at least 1 coin to bid
                    </div>
                    <button
                      onClick={() => setShowBuyCoins(true)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#EF4444] text-white font-semibold hover:opacity-90 transition-opacity text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                    >
                      <span>🪙</span>
                      Buy Coins to Bid
                    </button>
                  </>
                )}
              </div>
            )}

            {isCompleted && (
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl border border-white/10 text-[#9CA3AF] text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Buy Coin Modal (stacked on top) */}
      {showBuyCoins && (
        <BuyCoinModal
          onClose={() => setShowBuyCoins(false)}
          userEmail={email}
        />
      )}
    </>
  );
}
