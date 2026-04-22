import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOpenProducts } from '../api/products';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import ProductImage from '../components/ProductImage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductListingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getOpenProducts()
      .then(({ data }) => setProducts(data))
      .catch(() => setError('Failed to load products. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading products…" />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="text-5xl">😕</span>
        <p className="text-gray-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Open Bids</h1>
        <p className="text-gray-500 mt-1">
          {products.length} product{products.length !== 1 ? 's' : ''} available for bidding
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="text-6xl">📦</span>
          <h2 className="text-xl font-semibold text-gray-700">No open bids right now</h2>
          <p className="text-gray-400 text-sm">Check back soon for new products!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }) {
  const remaining = product.totalBidsRequired - product.bidsCompleted;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Image */}
      <ProductImage
        src={product.imageUrl}
        alt={product.name}
        className="h-48 w-full"
      />

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2">
            {product.name}
          </h3>
          <StatusBadge status={product.status} />
        </div>

        {product.description && (
          <p className="text-gray-500 text-sm line-clamp-2">{product.description}</p>
        )}

        {/* Bid Price */}
        <div className="flex items-center gap-1">
          <span className="text-2xl font-bold text-indigo-600">
            ₹{product.bidPrice?.toLocaleString('en-IN')}
          </span>
          <span className="text-gray-400 text-sm">/ bid</span>
        </div>

        {/* Progress */}
        <ProgressBar
          completed={product.bidsCompleted}
          total={product.totalBidsRequired}
        />

        {/* Remaining */}
        <p className="text-xs text-gray-500">
          <span className="font-medium text-gray-700">{remaining}</span>{' '}
          bid{remaining !== 1 ? 's' : ''} remaining
        </p>

        {/* CTA */}
        <Link
          to={`/products/${product.id}`}
          className="mt-1 w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold text-center hover:bg-indigo-700 transition-colors group-hover:shadow-md"
        >
          Bid Now →
        </Link>
      </div>
    </div>
  );
}
