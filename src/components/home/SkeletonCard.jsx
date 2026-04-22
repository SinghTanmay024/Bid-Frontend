export default function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Image skeleton */}
      <div className="h-48 w-full shimmer bg-white/5" />

      {/* Content */}
      <div className="p-5 flex flex-col gap-3">
        {/* Title */}
        <div className="h-5 w-3/4 rounded-lg shimmer bg-white/5" />
        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-full rounded shimmer bg-white/5" />
          <div className="h-3.5 w-2/3 rounded shimmer bg-white/5" />
        </div>
        {/* Bid price */}
        <div className="h-7 w-1/3 rounded-lg shimmer bg-white/5" />
        {/* Progress bar */}
        <div className="flex flex-col gap-1.5">
          <div className="h-2.5 w-full rounded-full shimmer bg-white/5" />
          <div className="h-3 w-1/2 rounded shimmer bg-white/5" />
        </div>
        {/* Button */}
        <div className="h-11 w-full rounded-xl shimmer bg-white/5 mt-1" />
      </div>
    </div>
  );
}
