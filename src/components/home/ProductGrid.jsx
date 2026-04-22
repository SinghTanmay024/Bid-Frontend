import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOpenProducts } from '../../api/products';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';

const SKELETON_COUNT = 6;

function ErrorBanner({ onRetry }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      <span className="text-lg">⚠️</span>
      <span>Could not load products. Please refresh.</span>
      <button
        onClick={onRetry}
        className="ml-auto px-3 py-1 rounded-lg border border-red-400/30 text-red-400 hover:bg-red-500/10 text-xs transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5">
      {/* Illustration */}
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-30"
          style={{ background: 'radial-gradient(circle, #6366F1, #A855F7)' }}
        />
        <span className="relative text-7xl">📦</span>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">No live bids right now</h3>
        <p className="text-[#9CA3AF] text-sm max-w-sm">
          Check back soon — new products drop daily! Subscribe to get notified when new bids open.
        </p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#A5B4FC] text-sm">
        <span className="animate-pulse">🔔</span>
        New products coming soon
      </div>
    </div>
  );
}

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getOpenProducts()
      .then(({ data }) => setProducts(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <section id="products" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* ── Section header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              🔥 Live Bids
            </h2>
            <p className="text-[#9CA3AF]">Grab your slot before it&apos;s gone</p>
          </div>
          {!loading && !error && products.length > 0 && (
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-[#6366F1] hover:text-[#A5B4FC] transition-colors font-medium"
            >
              View All Products
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="mb-6">
            <ErrorBanner onRetry={load} />
          </div>
        )}

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && products.length === 0 && <EmptyState />}

        {/* ── Product grid ── */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        )}

        {/* ── View all link ── */}
        {!loading && !error && products.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-[#9CA3AF] text-sm hover:text-white hover:border-[#6366F1]/40 transition-all"
            >
              Explore all open bids
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
