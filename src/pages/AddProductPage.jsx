import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createProduct } from '../api/products';

const INITIAL = {
  name: '',
  description: '',
  bidPrice: '',
  totalBidsRequired: '',
  imageUrl: '',
};

export default function AddProductPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Product name is required.';
    if (!form.bidPrice) {
      e.bidPrice = 'Bid price is required.';
    } else if (Number(form.bidPrice) < 1) {
      e.bidPrice = 'Bid price must be at least ₹1.';
    }
    if (!form.totalBidsRequired) {
      e.totalBidsRequired = 'Total bids required is required.';
    } else if (Number(form.totalBidsRequired) < 1) {
      e.totalBidsRequired = 'Must be at least 1.';
    }
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'imageUrl') setImagePreview(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await createProduct({
        name: form.name.trim(),
        description: form.description.trim() || null,
        bidPrice: Number(form.bidPrice),
        totalBidsRequired: Number(form.totalBidsRequired),
        imageUrl: form.imageUrl.trim() || null,
      });
      toast.success('Product added successfully!');
      navigate('/');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Failed to add product.';
      toast.error(typeof msg === 'string' ? msg : 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-[#9CA3AF] hover:text-white transition-colors mb-4 flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-white">Add New Product</h1>
          <p className="text-[#9CA3AF] mt-1 text-sm">
            List a product for bidding — users will pay per bid slot.
          </p>
        </div>

        <div className="bg-[#111827] rounded-2xl border border-white/10 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. iPhone 15 Pro Max"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-white bg-[#0A0E1A] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:border-transparent ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-500/40'
                    : 'border-white/10 focus:ring-indigo-500/50'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-1">
                Description <span className="text-[#6B7280] font-normal">(optional)</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the product, condition, specs..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 text-sm text-white bg-[#0A0E1A] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent resize-none"
              />
            </div>

            {/* Bid Price + Total Bids — 2 column */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-1">
                  Bid Price (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm">₹</span>
                  <input
                    type="number"
                    name="bidPrice"
                    value={form.bidPrice}
                    onChange={handleChange}
                    placeholder="100"
                    min="1"
                    className={`w-full pl-7 pr-4 py-2.5 rounded-xl border text-sm text-white bg-[#0A0E1A] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.bidPrice
                        ? 'border-red-500 focus:ring-red-500/40'
                        : 'border-white/10 focus:ring-indigo-500/50'
                    }`}
                  />
                </div>
                {errors.bidPrice && <p className="mt-1 text-xs text-red-400">{errors.bidPrice}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-1">
                  Total Bid Slots <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalBidsRequired"
                  value={form.totalBidsRequired}
                  onChange={handleChange}
                  placeholder="50"
                  min="1"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-white bg-[#0A0E1A] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:border-transparent ${
                    errors.totalBidsRequired
                      ? 'border-red-500 focus:ring-red-500/40'
                      : 'border-white/10 focus:ring-indigo-500/50'
                  }`}
                />
                {errors.totalBidsRequired && (
                  <p className="mt-1 text-xs text-red-400">{errors.totalBidsRequired}</p>
                )}
              </div>
            </div>

            {/* Total revenue hint */}
            {form.bidPrice && form.totalBidsRequired && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-[#A5B4FC]">
                <span>💡</span>
                Total revenue when full:{' '}
                <span className="font-bold text-white ml-1">
                  ₹{(Number(form.bidPrice) * Number(form.totalBidsRequired)).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-1">
                Image URL <span className="text-[#6B7280] font-normal">(optional)</span>
              </label>
              <input
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 text-sm text-white bg-[#0A0E1A] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
              />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="rounded-xl overflow-hidden border border-white/10 h-48">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-[#9CA3AF] font-medium hover:bg-white/5 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-lg shadow-indigo-500/25"
              >
                {loading ? 'Adding Product…' : 'Add Product'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
