import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOpenProducts } from '../../api/products';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';
import BidModal from '../BidModal';

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
          Check back soon — new products drop daily!
        </p>
      </div>
      <Link
        to="/products/add"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
      >
        + Add First Product
      </Link>
    </div>
  );
}

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const load = () => {
    setLoading(true);
    setError(null);
    getOpenProducts()
      .then(({ data }) => setProducts(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  // When a bid succeeds, refresh the product in the list
  const handleBidSuccess = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    // If product is now completed, remove from open list after a short delay
    if (updatedProduct.status === 'COMPLETED') {
      setTimeout(() => {
        setProducts((prev) => prev.filter((p) => p.id !== updatedProduct.id));
      }, 3000);
    }
  };

  return (
    <section id="products" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">🔥 Live Bids</h2>
            <p className="text-[#9CA3AF]">Grab your slot before it's gone</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/products/add"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
            >
              + Add Product
            </Link>
            {!loading && !error && products.length > 0 && (
              <Link
                to="/"
                className="flex items-center gap-1.5 text-sm text-[#6366F1] hover:text-[#A5B4FC] transition-colors font-medium"
              >
                View All
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Search bar */}
        {!loading && !error && products.length > 0 && (
          <div className="relative mb-8 max-w-lg">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-[#6366F1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products to bid on…"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#E5E7EB] placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#6366F1]/60 focus:bg-white/8 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-3 flex items-center text-[#6B7280] hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && <div className="mb-6"><ErrorBanner onRetry={load} /></div>}

        {/* Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty — no products at all */}
        {!loading && !error && products.length === 0 && <EmptyState />}

        {/* Empty — no search results */}
        {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="text-5xl">🔍</span>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-1">No products found</h3>
              <p className="text-[#9CA3AF] text-sm">
                No results for &ldquo;<span className="text-[#A5B4FC]">{searchQuery}</span>&rdquo;. Try a different keyword.
              </p>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl border border-white/10 text-sm text-[#9CA3AF] hover:text-white hover:border-[#6366F1]/40 transition-all"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                style={{ animationDelay: `${i * 80}ms` }}
                onBidClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}

        {/* View all */}
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

      {/* Bid Modal */}
      {selectedProduct && (
        <BidModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBidSuccess={handleBidSuccess}
        />
      )}
    </section>
  );
}
