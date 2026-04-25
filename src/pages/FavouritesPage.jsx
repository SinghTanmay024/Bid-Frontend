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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (!userId) return;

    // Fetch all products (open + completed) to show any favourited product
    getAllProducts()
      .then(({ data }) => setProducts(data))
      .catch(() =>
        // fallback to open only
        getOpenProducts().then(({ data }) => setProducts(data))
      )
      .finally(() => setLoading(false));
  }, [userId]);

  const favourited = products.filter((p) => isFavorite(p.id));

  const handleBidSuccess = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  if (loading) return <LoadingSpinner message="Loading favourites…" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">❤️</span> My Favourites
        </h1>
        <p className="text-[#9CA3AF] mt-1 text-sm">
          {favourited.length} product{favourited.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {favourited.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favourited.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                style={{ animationDelay: `${i * 80}ms` }}
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
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5">
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-30"
          style={{ background: 'radial-gradient(circle, #ef4444, #f97316)' }}
        />
        <span className="relative text-7xl">🤍</span>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white mb-2">No favourites yet</h2>
        <p className="text-[#9CA3AF] text-sm max-w-sm">
          Click the{' '}
          <span className="text-red-400 font-semibold">♥ heart</span> on any product to
          save it here for quick access.
        </p>
      </div>
      <Link
        to="/"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
      >
        Browse Products
      </Link>
    </div>
  );
}
