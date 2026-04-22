import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { getProduct } from '../api/products';
import { placeBid, getBidsByUser, getWinner } from '../api/bids';
import { useAuthStore } from '../store/authStore';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import ProductImage from '../components/ProductImage';
import WinnerBanner from '../components/WinnerBanner';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [winner, setWinner] = useState(null);
  const [userHasBid, setUserHasBid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      const { data } = await getProduct(id);
      setProduct(data);

      if (data.status === 'COMPLETED') {
        try {
          const { data: winnerData } = await getWinner(id);
          setWinner(winnerData);
        } catch {
          // winner fetch is non-critical
        }
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        setNotFound(true);
      } else {
        toast.error('Failed to load product.');
      }
    }
  }, [id]);

  const fetchUserBids = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await getBidsByUser(userId);
      const alreadyBid = data.some((bid) => bid.productId === id);
      setUserHasBid(alreadyBid);
    } catch {
      // non-critical
    }
  }, [userId, id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProduct(), fetchUserBids()]).finally(() => setLoading(false));
  }, [fetchProduct, fetchUserBids]);

  const handleBid = async () => {
    if (!userId) {
      toast.error('Please log in to place a bid.');
      navigate('/login');
      return;
    }
    setBidding(true);
    try {
      await placeBid(id, userId);
      toast.success('Bid placed successfully!');
      setUserHasBid(true);
      // Refresh product to update bidsCompleted
      const { data: updated } = await getProduct(id);
      setProduct(updated);

      if (updated.status === 'COMPLETED') {
        // Trigger confetti
        confetti({
          particleCount: 200,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981'],
        });
        // Fetch winner
        try {
          const { data: winnerData } = await getWinner(id);
          setWinner(winnerData);
        } catch {
          // ignore
        }
        toast.success('Bidding complete! A winner has been selected!', { duration: 5000 });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        '';
      const msgStr = typeof msg === 'string' ? msg.toLowerCase() : '';
      if (msgStr.includes('already') || msgStr.includes('duplicate')) {
        toast.error('You have already placed a bid on this product.');
        setUserHasBid(true);
      } else if (msgStr.includes('closed') || msgStr.includes('completed')) {
        toast.error('Bidding is already closed for this product.');
        fetchProduct();
      } else {
        toast.error('Failed to place bid. Please try again.');
      }
    } finally {
      setBidding(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading product…" />;

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="text-6xl">🔍</span>
        <h2 className="text-xl font-semibold text-gray-700">Product not found</h2>
        <Link
          to="/"
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const remaining = product.totalBidsRequired - product.bidsCompleted;
  const isOpen = product.status === 'OPEN';
  const isCompleted = product.status === 'COMPLETED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        ← Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div>
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-80 lg:h-96 rounded-2xl"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>
            <StatusBadge status={product.status} />
          </div>

          {product.description && (
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          )}

          {/* Price */}
          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="text-sm text-indigo-500 font-medium mb-1">Bid Price</p>
            <p className="text-3xl font-bold text-indigo-700">
              ₹{product.bidPrice?.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-indigo-400 mt-1">per bid slot</p>
          </div>

          {/* Progress */}
          <div>
            <ProgressBar
              completed={product.bidsCompleted}
              total={product.totalBidsRequired}
            />
            {isOpen && (
              <p className="text-sm text-gray-500 mt-2">
                <span className="font-semibold text-gray-700">{remaining}</span>{' '}
                bid slot{remaining !== 1 ? 's' : ''} remaining
              </p>
            )}
          </div>

          {/* Action */}
          {isOpen && (
            <div>
              {!userId ? (
                <Link
                  to="/login"
                  className="w-full block text-center py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Log in to Bid
                </Link>
              ) : userHasBid ? (
                <div className="w-full py-3 rounded-xl bg-gray-100 text-gray-500 font-medium text-center border border-gray-200">
                  ✓ You have already bid on this product
                </div>
              ) : (
                <button
                  onClick={handleBid}
                  disabled={bidding}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-lg shadow-sm hover:shadow-md"
                >
                  {bidding
                    ? 'Placing bid…'
                    : `Place Bid — ₹${product.bidPrice?.toLocaleString('en-IN')}`}
                </button>
              )}
            </div>
          )}

          {/* Completed State */}
          {isCompleted && (
            <WinnerBanner
              winnerId={winner?.winnerId || product.winnerId}
              productName={product.name}
            />
          )}
        </div>
      </div>
    </div>
  );
}
