export default function ProgressBar({ completed, total }) {
  const pct = total > 0 ? Math.min((completed / total) * 100, 100) : 0;

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{completed} / {total} bids filled</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
