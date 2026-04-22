export default function StatusBadge({ status }) {
  const isOpen = status === 'OPEN';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isOpen
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-200 text-gray-600'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOpen ? 'bg-green-500' : 'bg-gray-400'}`} />
      {isOpen ? 'Open' : 'Completed'}
    </span>
  );
}
