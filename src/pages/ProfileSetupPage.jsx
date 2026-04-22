import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createProfile } from '../api/users';
import { useAuthStore } from '../store/authStore';

const FIELDS = [
  { name: 'username', label: 'Username', required: true, type: 'text', colSpan: 2 },
  { name: 'firstName', label: 'First Name', required: true, type: 'text' },
  { name: 'lastName', label: 'Last Name', required: true, type: 'text' },
  { name: 'email', label: 'Email', required: true, type: 'email' },
  { name: 'phoneNumber', label: 'Phone Number', required: false, type: 'tel', colSpan: 2 },
  { name: 'addressLine1', label: 'Address Line 1', required: false, type: 'text', colSpan: 2 },
  { name: 'addressLine2', label: 'Address Line 2', required: false, type: 'text', colSpan: 2 },
  { name: 'city', label: 'City', required: false, type: 'text' },
  { name: 'state', label: 'State', required: false, type: 'text' },
  { name: 'pincode', label: 'Pincode', required: false, type: 'text' },
  { name: 'country', label: 'Country', required: false, type: 'text' },
];

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { userId, email } = useAuthStore();
  const [form, setForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: email || '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createProfile({ ...form, userId });
      toast.success('Profile saved! Welcome to BidWave.');
      navigate('/');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Failed to save profile.';
      toast.error(typeof msg === 'string' ? msg : 'Profile already exists for this email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-4xl">👤</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Complete Your Profile</h1>
          <p className="text-gray-500 mt-1">Just a few more details before you start bidding</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FIELDS.map((field) => (
                <div
                  key={field.name}
                  className={field.colSpan === 2 ? 'sm:col-span-2' : ''}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    required={field.required}
                    value={form[field.name]}
                    onChange={handleChange}
                    readOnly={field.name === 'email'}
                    className={`w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent ${
                      field.name === 'email' ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                    placeholder={field.label}
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving…' : 'Save Profile & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
