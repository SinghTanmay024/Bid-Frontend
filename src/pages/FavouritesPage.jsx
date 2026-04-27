import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOpenProducts, getAllProducts } from '../api/products';
import { useAuthStore } from '../store/authStore';
import { useFavoritesStore } from '../store/favoritesStore';
import ProductCard from '../components/home/ProductCard';
import BidModal from '../components/BidModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function FavouritesPage() {
  const { userId } = useAuthStore();
  const { favoriteIds, isFavorite } = useFavoritesStore();
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    getAllProducts()
      .then(({ data }) => setProducts(data))
      .catch(() => getOpenProducts().then(({ data }) => setProducts(data)))
      .finally(() => setLoading(false));
  }, [userId]);

  const favourited = products.filter((p) => isFavorite(p.id));

  const handleBidSuccess = (updatedProduct) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
  };

  if (loading) return <LoadingSpinner message="Loading favourites…" />;

  return (
    <div className="min-h-screen py-12 px-5 sm:px-8" style={{ background: '#0C0C0E' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B6B78] hover:text-[#A0A0AB] transition-colors mb-6"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <svg className="w-5 h-5 fill-[#EF4444]" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">My Favourites</h1>
              <p className="text-sm text-[#6B6B78] mt-0.5">
                {favourited.length} product{favourited.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </div>
        </div>

        {favourited.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {favourited.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  style={{ animationDelay: `${i * 60}ms` }}
                  onBidClick={() => setSelectedProduct(product)}
                />
              ))}
            </div>

            {selectedProduct && (
              <BidModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onBidSuccess={handleBidSuccess}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <svg className="w-7 h-7 fill-none text-[#EF4444]" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-white mb-2">No favourites yet</h2>
        <p className="text-sm text-[#6B6B78] max-w-sm">
          Click the <span className="text-[#EF4444] font-medium">♥ heart</span> on any product card to save it here.
        </p>
      </div>
      <Link
        to="/"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        style={{ background: '#5B5FEF', boxShadow: '0 2px 12px rgba(91,95,239,0.3)' }}
      >
        Browse Products
      </Link>
    </div>
  );
}
