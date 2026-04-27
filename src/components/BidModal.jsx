import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { getProduct } from '../api/products';
import { placeBid, getBidsByUser, getWinner } from '../api/bids';
import { useAuthStore } from '../store/authStore';
import { useCoinStore } from '../store/coinStore';
import BuyCoinModal from './BuyCoinModal';

const COINS_PER_BID = 1;

function ProgressBar({ completed, total }) {
  const pct = total > 0 ? Math.min((completed / total) * 100, 100) : 0;
  const urgency = pct >= 80 ? 'high' : pct >= 50 ? 'mid' : 'low';
  const barColor = urgency === 'high' ? '#EF4444' : urgency === 'mid' ? '#F5A623' : '#5B5FEF';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs">
        <span className="text-[#6B6B78]">{completed} / {total} slots filled</span>
        <span className="font-semibold" style={{ color: barColor }}>{Math.round(pct)}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      <p className="text-xs text-[#6B6B78]">
        <span className="font-semibold text-[#A0A0AB]">{total - completed}</span>{' '}
        slot{total - completed !== 1 ? 's' : ''} remaining
      </p>
    </div>
  );
}

function ProductImage({ src, alt }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #111114, #18181C)' }}>
        <svg className="w-10 h-10 text-[#2A2A32]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 21h18" />
        </svg>
      </div>
    );
  }
  return (
    <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setError(true)} />
  );
}

export default function BidModal({ product: initialProduct, onClose, onBidSuccess }) {
  const navigate  = useNavigate();
  const { userId, email } = useAuthStore();
  const { coins, spendCoins } = useCoinStore();

  const [product, setProduct]           = useState(initialProduct);
  const [userHasBid, setUserHasBid]     = useState(false);
  const [bidding, setBidding]           = useState(false);
  const [winner, setWinner]             = useState(null);
  const [showBuyCoins, setShowBuyCoins] = useState(false);

  const isOpen      = product?.status === 'OPEN';
  const isCompleted = product?.status === 'COMPLETED';
  const hasEnough   = coins >= COINS_PER_BID;

  const checkUserBid = useCallback(async () => {
    if (!userId || !product?.id) return;
    try {
      const { data } = await getBidsByUser(userId);
      setUserHasBid(data.some((bid) => bid.productId === product.id));
    } catch { /* non-critical */ }
  }, [userId, product?.id]);

  const fetchWinner = useCallback(async () => {
    if (!product?.id || product?.status !== 'COMPLETED') return;
    try {
      const { data } = await getWinner(product.id);
      setWinner(data);
    } catch { /* non-critical */ }
  }, [product?.id, product?.status]);

  useEffect(() => { checkUserBid(); fetchWinner(); }, [checkUserBid, fetchWinner]);

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
    if (!hasEnough) { setShowBuyCoins(true); return; }

    setBidding(true);
    try {
      const deducted = spendCoins(COINS_PER_BID);
      if (!deducted) {
        toast.error('Not enough coins.');
        setShowBuyCoins(true);
        setBidding(false);
        return;
      }

      await placeBid(product.id, userId);
      const { data: updated } = await getProduct(product.id);
      setProduct(updated);
      setUserHasBid(true);
      toast.success('Bid placed! 1 coin used.');

      if (updated.status === 'COMPLETED') {
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ['#5B5FEF', '#7477F5', '#F5A623', '#22C55E'] });
        try {
          const { data: winnerData } = await getWinner(updated.id);
          setWinner(winnerData);
        } catch { /* ignore */ }
        toast.success('Bidding complete! A winner has been selected!', { duration: 5000 });
      }

      if (onBidSuccess) onBidSuccess(updated);
    } catch (err) {
      const { addCoins } = useCoinStore.getState();
      addCoins(COINS_PER_BID);
      const msg = err?.response?.data?.message || err?.response?.data || '';
      const msgStr = typeof msg === 'string' ? msg.toLowerCase() : '';
      if (msgStr.includes('already') || msgStr.includes('duplicate')) {
        toast.error('You have already bid on this product.');
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
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Panel */}
        <div
          className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden animate-fade-up"
          style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-10 w-7 h-7 flex items-center justify-center rounded-full text-[#6B6B78] hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            aria-label="Close"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image */}
          <div className="relative h-52 bg-[#111114]">
            <ProductImage src={product.imageUrl} alt={product.name} />
            {/* Status */}
            <div className="absolute top-3 left-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                isOpen
                  ? 'bg-[rgba(34,197,94,0.12)] text-[#4ADE80] border border-[rgba(34,197,94,0.2)]'
                  : 'bg-[rgba(107,107,120,0.15)] text-[#6B6B78] border border-[rgba(107,107,120,0.2)]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-[#22C55E] animate-pulse' : 'bg-[#6B6B78]'}`} />
                {isOpen ? 'Live' : 'Ended'}
              </span>
            </div>
            {/* Scrim */}
            <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
              style={{ background: 'linear-gradient(to top, #18181C, transparent)' }} />
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col gap-4">
            {/* Name */}
            <h2 className="text-lg font-bold text-white leading-snug pr-8">{product.name}</h2>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-[#6B6B78] leading-relaxed">{product.description}</p>
            )}

            {/* Price + coin row */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-[#F5A623]">
                  ₹{product.bidPrice?.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#6B6B78]">bid price</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.15)' }}>
                <span className="text-sm">🪙</span>
                <span className="text-xs font-bold text-[#F5A623]">{COINS_PER_BID} coin</span>
              </div>
            </div>

            {/* Coin balance indicator */}
            {isOpen && userId && !userHasBid && (
              <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                hasEnough
                  ? 'bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.15)]'
                  : 'bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)]'
              }`}>
                <span className={hasEnough ? 'text-[#4ADE80]' : 'text-[#EF4444]'}>
                  {hasEnough ? '✓ Enough coins' : '✗ Not enough coins'}
                </span>
                <span className={`font-bold ${hasEnough ? 'text-[#F5A623]' : 'text-[#EF4444]'}`}>
                  🪙 {coins} balance
                </span>
              </div>
            )}

            {/* Progress */}
            <ProgressBar completed={product.bidsCompleted} total={product.totalBidsRequired} />

            {/* Winner banner */}
            {isCompleted && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)' }}>
                <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#F5A623]">Bidding Closed</p>
                  {winner?.winnerId && (
                    <p className="text-xs text-[#6B6B78] mt-0.5">
                      Winner: <span className="text-white font-medium">{winner.winnerId}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* CTA */}
            {isOpen && (
              <div className="flex flex-col gap-2 pt-1">
                {!userId ? (
                  <button
                    onClick={() => { onClose(); navigate('/login'); }}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: '#5B5FEF', boxShadow: '0 2px 12px rgba(91,95,239,0.3)' }}
                  >
                    Sign In to Bid
                  </button>
                ) : userHasBid ? (
                  <div className="w-full py-3 rounded-xl text-sm font-medium text-center text-[#6B6B78]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <svg className="w-3.5 h-3.5 inline mr-1.5 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Already bid on this product
                  </div>
                ) : hasEnough ? (
                  <button
                    onClick={handleBid}
                    disabled={bidding}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                    style={{ background: '#5B5FEF', boxShadow: '0 2px 12px rgba(91,95,239,0.3)' }}
                  >
                    {bidding ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                    <div className="w-full py-2.5 rounded-xl text-sm text-center text-[#EF4444]"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                      You need at least 1 coin to bid
                    </div>
                    <button
                      onClick={() => setShowBuyCoins(true)}
                      className="w-full py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #F5A623, #EF4444)', boxShadow: '0 2px 12px rgba(245,166,35,0.25)' }}
                    >
                      <span>🪙</span> Buy Coins to Bid
                    </button>
                  </>
                )}
              </div>
            )}

            {isCompleted && (
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-sm font-medium text-[#A0A0AB] hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {showBuyCoins && (
        <BuyCoinModal onClose={() => setShowBuyCoins(false)} userEmail={email} />
      )}
    </>
  );
}
