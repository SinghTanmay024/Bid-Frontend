import { useAuthStore } from '../store/authStore';

export default function WinnerBanner({ winnerId, productName }) {
  const { userId } = useAuthStore();
  const isCurrentUser = userId && winnerId && userId === winnerId;

  return (
    <div className={`rounded-2xl p-6 text-center border-2 ${
      isCurrentUser
        ? 'bg-yellow-50 border-yellow-300'
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="text-5xl mb-3">{isCurrentUser ? '🏆' : '🎉'}</div>
      <h2 className="text-2xl font-bold mb-1 text-gray-900">
        {isCurrentUser ? 'You Won!' : 'Bidding Complete!'}
      </h2>
      <p className="text-gray-500 text-sm mb-3">{productName}</p>
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
        isCurrentUser
          ? 'bg-yellow-200 text-yellow-800'
          : 'bg-gray-200 text-gray-700'
      }`}>
        <span>🥇</span>
        <span>Winner: <strong>{winnerId || 'Unknown'}</strong></span>
      </div>
      {isCurrentUser && (
        <p className="mt-3 text-yellow-700 text-sm font-medium">
          Congratulations! You placed the winning bid.
        </p>
      )}
    </div>
  );
}
