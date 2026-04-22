export default function ProductImage({ src, alt, className = '' }) {
  return (
    <div className={`bg-gray-100 overflow-hidden flex items-center justify-center ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div
        className="w-full h-full flex-col items-center justify-center text-gray-400"
        style={{ display: src ? 'none' : 'flex' }}
      >
        <span className="text-5xl">📦</span>
        <span className="text-sm mt-2">No image</span>
      </div>
    </div>
  );
}
