import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBidsByUser } from '../api/bids';
import { getProduct } from '../api/products';
import { useAuthStore } from '../store/authStore';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MyBidsPage() {
  const { userId } = useAuthStore();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    getBidsByUser(userId)
      .then(async ({ data }) => {
        // Enrich each bid with product details
        const enriched = await Promise.all(
          data.map(async (bid) => {
            try {
              const { data: product } = await getProduct(bid.productId);
              return { ...bid, product };
            } catch {
              return { ...bid, product: null };
            }
          })
        );
        // Sort newest first
        enriched.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
        setBids(enriched);
      })
      .catch(() => setError('Failed to load your bids.'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <LoadingSpinner message="Loading your bids…" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {bids.length} bid{bids.length !== 1 ? 's' : ''} placed
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {bids.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="text-6xl">🎯</span>
          <h2 className="text-xl font-semibold text-gray-700">No bids yet</h2>
          <p className="text-gray-400 text-sm">Start bidding to see your history here.</p>
          <Link
            to="/"
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bids.map((bid) => (
            <BidCard key={bid.id} bid={bid} userId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}

function BidCard({ bid, userId }) {
  const product = bid.product;
  const isWinner =
    product?.status === 'COMPLETED' && product?.winnerId === userId;
  const isCompleted = product?.status === 'COMPLETED';

  const formattedDate = bid.placedAt
    ? new Date(bid.placedAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Unknown date';

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${
        isWinner ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100'
      }`}
    >
      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
          isWinner ? 'bg-yellow-200' : isCompleted ? 'bg-gray-100' : 'bg-indigo-50'
        }`}
      >
        {isWinner ? '🏆' : isCompleted ? '🔒' : '🎯'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-900 truncate">
            {product?.name || bid.productId}
          </h3>
          {product && <StatusBadge status={product.status} />}
          {isWinner && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-300 text-yellow-900">
              You Won!
            </span>
          )}
        </div>
        <p className="text-gray-400 text-xs mt-1">{formattedDate}</p>
        {product?.description && (
          <p className="text-gray-500 text-sm mt-1 line-clamp-1">{product.description}</p>
        )}
      </div>

      {/* Amount & Link */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <p className="text-xl font-bold text-indigo-600">
          ₹{bid.amount?.toLocaleString('en-IN')}
        </p>
        <Link
          to={`/products/${bid.productId}`}
          className="text-xs text-indigo-500 hover:underline"
        >
          View Product →
        </Link>
      </div>
    </div>
  );
}
