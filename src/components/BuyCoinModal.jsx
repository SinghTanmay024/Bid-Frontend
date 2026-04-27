import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCoinStore } from '../store/coinStore';

/* ── Razorpay loader ── */
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/* ── Stripe loader ── */
function loadStripe() {
  return new Promise((resolve) => {
    if (window.Stripe) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://js.stripe.com/v3/';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/* ── Packages ── */
const PACKAGES = [
  {
    id: 'starter',
    coins: 20,
    inr: 9,
    usd: 0.99,
    label: 'Starter',
    icon: '🪙',
    tag: null,
    gradient: 'from-slate-600 to-slate-700',
    glow: 'shadow-slate-500/20',
    perCoinInr: '₹0.45/coin',
    perCoinUsd: '$0.050/coin',
  },
  {
    id: 'popular',
    coins: 75,
    inr: 29,
    usd: 2.99,
    label: 'Popular',
    icon: '💰',
    tag: 'MOST POPULAR',
    gradient: 'from-[#6366F1] to-[#A855F7]',
    glow: 'shadow-indigo-500/30',
    perCoinInr: '₹0.39/coin',
    perCoinUsd: '$0.040/coin',
  },
  {
    id: 'value',
    coins: 150,
    inr: 49,
    usd: 5.99,
    label: 'Value',
    icon: '💎',
    tag: 'BEST VALUE',
    gradient: 'from-[#F59E0B] to-[#EF4444]',
    glow: 'shadow-amber-500/30',
    perCoinInr: '₹0.33/coin',
    perCoinUsd: '$0.040/coin',
  },
  {
    id: 'pro',
    coins: 400,
    inr: 99,
    usd: 11.99,
    label: 'Pro',
    icon: '🚀',
    tag: 'POWER USER',
    gradient: 'from-[#10B981] to-[#06B6D4]',
    glow: 'shadow-emerald-500/30',
    perCoinInr: '₹0.25/coin',
    perCoinUsd: '$0.030/coin',
  },
];

export default function BuyCoinModal({ onClose, userEmail }) {
  const { coins, addCoins } = useCoinStore();
  const [selected, setSelected] = useState(PACKAGES[1].id);
  const [currency, setCurrency] = useState('INR'); // 'INR' | 'USD'
  const [paying, setPaying] = useState(false);

  const pkg = PACKAGES.find((p) => p.id === selected);
  const price = currency === 'INR' ? pkg.inr : pkg.usd;
  const priceLabel = currency === 'INR' ? `₹${pkg.inr}` : `$${pkg.usd}`;
  const perCoin = currency === 'INR' ? pkg.perCoinInr : pkg.perCoinUsd;

  /* ── INR via Razorpay ── */
  const payWithRazorpay = async () => {
    const loaded = await loadRazorpay();
    if (!loaded) { toast.error('Payment gateway unavailable. Please try again.'); return false; }

    return new Promise((resolve) => {
      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
        amount: pkg.inr * 100, // paise
        currency: 'INR',
        name: 'BidWin',
        description: `${pkg.coins} Bid Coins`,
        prefill: { email: userEmail || '' },
        theme: { color: '#6366F1' },
        handler: () => resolve(true),
        modal: {
          ondismiss: () => {
            toast('Payment cancelled.', { icon: '↩️' });
            resolve(false);
          },
        },
      });
      rzp.on('payment.failed', (r) => {
        toast.error(`Payment failed: ${r.error.description}`);
        resolve(false);
      });
      rzp.open();
    });
  };

  /* ── USD via Stripe ── */
  const payWithStripe = async () => {
    const loaded = await loadStripe();
    if (!loaded) { toast.error('Stripe unavailable. Please try again.'); return false; }

    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'YOUR_STRIPE_PUBLISHABLE_KEY';

    try {
      // Call your backend to create a Stripe Checkout session
      const res = await fetch('/api/payments/stripe/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ packageId: pkg.id, coins: pkg.coins, amountUsd: pkg.usd, email: userEmail }),
      });

      if (!res.ok) throw new Error('Failed to create payment session');
      const { sessionId } = await res.json();

      const stripe = window.Stripe(stripeKey);
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) { toast.error(error.message); return false; }
      // After redirect back (success URL), coins are credited via webhook
      return true;
    } catch {
      // Fallback: show a message to configure Stripe
      toast.error('Stripe checkout requires backend setup. Configure VITE_STRIPE_PUBLISHABLE_KEY and /api/payments/stripe/create-session.');
      return false;
    }
  };

  const handlePurchase = async () => {
    setPaying(true);
    try {
      let success = false;
      if (currency === 'INR') {
        success = await payWithRazorpay();
      } else {
        success = await payWithStripe();
      }
      if (success && currency === 'INR') {
        // For INR/Razorpay: credit coins immediately in client (backend webhook is the source of truth in prod)
        addCoins(pkg.coins);
        toast.success(`🪙 ${pkg.coins} coins added to your wallet!`, { duration: 4000 });
        onClose();
      }
      // For USD/Stripe: coins are credited after redirect + webhook — user sees updated balance on return
    } catch {
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-lg bg-[#111827] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-fade-up">

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-[#9CA3AF] hover:text-white transition-colors text-sm">✕</button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#A855F7] flex items-center justify-center text-xl">🪙</div>
            <div>
              <h2 className="text-xl font-bold text-white">Buy Bid Coins</h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Use coins to place bids — 1 coin = 1 bid slot</p>
            </div>
          </div>

          {/* Balance pill */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e2538] border border-white/10 text-sm">
            <span className="text-yellow-400">🪙</span>
            <span className="text-[#E5E7EB] font-medium">Balance:</span>
            <span className="text-white font-bold">{coins} coins</span>
          </div>
        </div>

        {/* Currency toggle */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { key: 'INR', label: '₹ INR', flag: '🇮🇳', sub: 'Razorpay' },
              { key: 'USD', label: '$ USD', flag: '🇺🇸', sub: 'Stripe' },
            ].map((c) => (
              <button
                key={c.key}
                onClick={() => setCurrency(c.key)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: currency === c.key ? '#6366F1' : 'transparent',
                  color: currency === c.key ? '#fff' : '#6B7280',
                }}
              >
                <span>{c.flag}</span>
                <span>{c.label}</span>
                <span className="text-[10px] font-normal opacity-70">· {c.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Packages */}
        <div className="px-6 pb-2 grid grid-cols-2 gap-3">
          {PACKAGES.map((p) => {
            const isSelected = selected === p.id;
            const displayPrice = currency === 'INR' ? `₹${p.inr}` : `$${p.usd}`;
            const displayPerCoin = currency === 'INR' ? p.perCoinInr : p.perCoinUsd;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`relative rounded-xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? `border-transparent ring-2 ring-[#6366F1] bg-[#1a1f35] shadow-lg ${p.glow}`
                    : 'border-white/10 bg-[#0A0E1A] hover:border-white/20'
                }`}
              >
                {p.tag && (
                  <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${p.gradient} text-white whitespace-nowrap`}>
                    {p.tag}
                  </span>
                )}
                <div className="flex items-center gap-2 mb-2 mt-1">
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">{p.label}</span>
                </div>
                <div className={`text-2xl font-extrabold bg-gradient-to-r ${p.gradient} bg-clip-text text-transparent`}>
                  {p.coins}<span className="text-sm font-semibold ml-1 text-[#9CA3AF]">coins</span>
                </div>
                <div className="mt-1 text-lg font-bold text-white">{displayPrice}</div>
                <div className="text-[10px] text-[#6B7280] mt-0.5">{displayPerCoin}</div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#6366F1] flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Summary + CTA */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4 px-4 py-3 rounded-xl bg-[#0A0E1A] border border-white/5">
            <div className="text-sm text-[#9CA3AF]">
              You get: <span className="text-white font-semibold">{pkg.coins} Bid Coins</span>
            </div>
            <div className="text-lg font-bold text-white">{priceLabel}</div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={paying}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white font-semibold hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            {paying ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                Opening payment…
              </>
            ) : (
              <>
                <span>{currency === 'INR' ? '💳' : '🌐'}</span>
                Pay {priceLabel} &amp; Get {pkg.coins} Coins
                <span className="text-xs opacity-70">· {currency === 'INR' ? 'Razorpay' : 'Stripe'}</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-[#4B5563] mt-3 flex items-center justify-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
            {currency === 'INR' ? 'Secured by Razorpay · 256-bit SSL' : 'Secured by Stripe · 256-bit SSL'}
          </p>
        </div>
      </div>
    </div>
  );
}
