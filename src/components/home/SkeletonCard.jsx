export default function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="h-48 w-full shimmer" />
      <div className="p-5 flex flex-col gap-3.5">
        <div className="h-4.5 w-3/4 rounded-lg shimmer" style={{ height: 18 }} />
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-full rounded shimmer" />
          <div className="h-3 w-2/3 rounded shimmer" />
        </div>
        <div className="h-6 w-1/3 rounded-lg shimmer" />
        <div className="flex flex-col gap-2">
          <div className="h-1.5 w-full rounded-full shimmer" />
          <div className="h-3 w-1/2 rounded shimmer" />
        </div>
        <div className="h-10 w-full rounded-xl shimmer mt-1" />
      </div>
    </div>
  );
}
