import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOpenProducts } from '../../api/products';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';
import BidModal from '../BidModal';

const SKELETON_COUNT = 6;

function ErrorBanner({ onRetry }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm"
      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#EF4444' }}>
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <span>Could not load products. Please try again.</span>
      <button
        onClick={onRetry}
        className="ml-auto px-3 py-1 rounded-lg text-xs font-semibold border border-[rgba(239,68,68,0.25)] hover:bg-[rgba(239,68,68,0.1)] transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="w-16 h-16 rounded-2xl bg-[#18181C] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
        <svg className="w-7 h-7 text-[#6B6B78]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">No live bids right now</h3>
        <p className="text-sm text-[#6B6B78] max-w-sm">New products drop daily. Check back soon or be the first to list one.</p>
      </div>
      <Link
        to="/products/add"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ background: '#5B5FEF', boxShadow: '0 2px 12px rgba(91,95,239,0.3)' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add First Product
      </Link>
    </div>
  );
}

export default function ProductGrid() {
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
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
    return p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
  });

  const handleBidSuccess = (updatedProduct) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    if (updatedProduct.status === 'COMPLETED') {
      setTimeout(() => {
        setProducts((prev) => prev.filter((p) => p.id !== updatedProduct.id));
      }, 3000);
    }
  };

  return (
    <section id="products" className="py-20 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
          <div className="flex flex-col gap-3">
            <span className="section-label">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              Live Now
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Open Bid Rounds</h2>
            <p className="text-sm text-[#6B6B78]">Grab a slot before it's filled — one winner takes it all.</p>
          </div>

          <Link
            to="/products/add"
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#5B5FEF', boxShadow: '0 2px 12px rgba(91,95,239,0.25)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Link>
        </div>

        {/* Search */}
        {!loading && !error && products.length > 0 && (
          <div className="relative mb-8 max-w-md">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-[#6B6B78]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-white placeholder-[#6B6B78] focus:outline-none transition-all"
              style={{
                background: '#18181C',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(91,95,239,0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(91,95,239,0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                e.target.style.boxShadow = 'none';
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-3 flex items-center text-[#6B6B78] hover:text-white transition-colors"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && products.length === 0 && <EmptyState />}

        {/* No search results */}
        {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#18181C] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#6B6B78]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-base font-semibold text-white mb-1">No results found</h3>
              <p className="text-sm text-[#6B6B78]">
                Nothing matched &ldquo;<span className="text-[#A0A0AB]">{searchQuery}</span>&rdquo;
              </p>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-lg text-sm text-[#A0A0AB] hover:text-white border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-all"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                style={{ animationDelay: `${i * 60}ms` }}
                onBidClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}
      </div>

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
