import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '../api/users';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

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

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) { navigate('/login'); return; }
    getProfile(userId)
      .then(({ data }) => setForm(data))
      .catch(() => {
        toast.error('Could not load profile. Please set it up first.');
        navigate('/profile/setup');
      })
      .finally(() => setLoading(false));
  }, [userId, navigate]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(userId, { ...form, userId });
      toast.success('Profile updated!');
      navigate('/');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Failed to update profile.';
      toast.error(typeof msg === 'string' ? msg : 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading profile…" />;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Update your personal information</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
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
                    value={form?.[field.name] || ''}
                    onChange={handleChange}
                    readOnly={field.name === 'email'}
                    className={`w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent ${
                      field.name === 'email' ? 'bg-gray-50 !text-gray-500 cursor-not-allowed' : ''
                    }`}
                    placeholder={field.label}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
