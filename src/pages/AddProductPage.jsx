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

function Field({ label, required, optional, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#A0A0AB] flex items-center gap-1.5">
        {label}
        {required && <span className="text-[#EF4444]">*</span>}
        {optional && <span className="text-[#6B6B78] font-normal">(optional)</span>}
      </label>
      {children}
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
}

export default function AddProductPage() {
  const navigate = useNavigate();
  const [form, setForm]               = useState(INITIAL);
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Product name is required.';
    if (!form.bidPrice) e.bidPrice = 'Bid price is required.';
    else if (Number(form.bidPrice) < 1) e.bidPrice = 'Bid price must be at least ₹1.';
    if (!form.totalBidsRequired) e.totalBidsRequired = 'Total bid slots are required.';
    else if (Number(form.totalBidsRequired) < 1) e.totalBidsRequired = 'Must be at least 1.';
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
      const msg = err?.response?.data?.message || err?.response?.data || 'Failed to add product.';
      toast.error(typeof msg === 'string' ? msg : 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-[#6B6B78] focus:outline-none transition-all";
  const inputStyle = (hasError) => ({
    background: '#111114',
    border: `1px solid ${hasError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
  });
  const focusInput = (e) => {
    e.target.style.borderColor = 'rgba(91,95,239,0.5)';
    e.target.style.boxShadow = '0 0 0 3px rgba(91,95,239,0.12)';
  };
  const blurInput = (hasError) => (e) => {
    e.target.style.borderColor = hasError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div className="min-h-screen py-12 px-5" style={{ background: '#0C0C0E' }}>
      <div className="max-w-xl mx-auto">

        {/* Back + Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-[#6B6B78] hover:text-[#A0A0AB] transition-colors mb-5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight">Add New Product</h1>
          <p className="text-sm text-[#6B6B78] mt-1">List a product — users will pay per bid slot to win it.</p>
        </div>

        <div className="rounded-2xl p-7 space-y-5" style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.07)' }}>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Product name */}
            <Field label="Product Name" required error={errors.name}>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. iPhone 15 Pro Max"
                className={inputBase}
                style={inputStyle(!!errors.name)}
                onFocus={focusInput}
                onBlur={blurInput(!!errors.name)}
              />
            </Field>

            {/* Description */}
            <Field label="Description" optional>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the product, condition, specs…"
                rows={3}
                className={inputBase + ' resize-none'}
                style={inputStyle(false)}
                onFocus={focusInput}
                onBlur={blurInput(false)}
              />
            </Field>

            {/* Price + Slots */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Bid Price (₹)" required error={errors.bidPrice}>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#6B6B78] font-medium">₹</span>
                  <input
                    type="number"
                    name="bidPrice"
                    value={form.bidPrice}
                    onChange={handleChange}
                    placeholder="100"
                    min="1"
                    className={inputBase + ' pl-7'}
                    style={inputStyle(!!errors.bidPrice)}
                    onFocus={focusInput}
                    onBlur={blurInput(!!errors.bidPrice)}
                  />
                </div>
              </Field>

              <Field label="Total Bid Slots" required error={errors.totalBidsRequired}>
                <input
                  type="number"
                  name="totalBidsRequired"
                  value={form.totalBidsRequired}
                  onChange={handleChange}
                  placeholder="50"
                  min="1"
                  className={inputBase}
                  style={inputStyle(!!errors.totalBidsRequired)}
                  onFocus={focusInput}
                  onBlur={blurInput(!!errors.totalBidsRequired)}
                />
              </Field>
            </div>

            {/* Revenue hint */}
            {form.bidPrice && form.totalBidsRequired && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(91,95,239,0.07)', border: '1px solid rgba(91,95,239,0.15)' }}>
                <svg className="w-4 h-4 text-[#7477F5] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[#7477F5]">Total revenue when full:</span>
                <span className="font-bold text-white ml-auto">
                  ₹{(Number(form.bidPrice) * Number(form.totalBidsRequired)).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {/* Image URL */}
            <Field label="Image URL" optional>
              <input
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className={inputBase}
                style={inputStyle(false)}
                onFocus={focusInput}
                onBlur={blurInput(false)}
              />
            </Field>

            {/* Image preview */}
            {imagePreview && (
              <div className="rounded-xl overflow-hidden" style={{ height: 180, border: '1px solid rgba(255,255,255,0.07)' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[#A0A0AB] hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
                style={{ background: '#5B5FEF' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding…
                  </span>
                ) : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
