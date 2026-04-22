import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!form.email) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!form.password) {
      newErrors.password = 'Password is required.';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    // Re-check confirmPassword match live when password changes
    if (name === 'password' && form.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value !== form.confirmPassword ? 'Passwords do not match.' : '',
      }));
    }
    if (name === 'confirmPassword') {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value !== form.password ? 'Passwords do not match.' : '',
      }));
    }
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
      const { data } = await register(form.email, form.password);
      storeLogin(data);
      toast.success('Account created! Complete your profile.');
      navigate('/profile/setup');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Registration failed. Please try again.';
      toast.error(typeof msg === 'string' ? msg : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E1A] px-4 pt-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-4xl">🎯</span>
          <h1 className="text-3xl font-bold text-white mt-2">Join BidWin</h1>
          <p className="text-[#9CA3AF] mt-1">Create your account to start bidding</p>
        </div>

        {/* Card */}
        <div className="bg-[#111827] rounded-2xl shadow-lg p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-1">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:border-transparent text-sm bg-[#0A0E1A] text-[#E5E7EB] placeholder-[#6B7280] ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500/40'
                    : 'border-white/10 focus:ring-indigo-500/50'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:border-transparent text-sm bg-[#0A0E1A] text-[#E5E7EB] placeholder-[#6B7280] ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-500/40'
                    : 'border-white/10 focus:ring-indigo-500/50'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:border-transparent text-sm bg-[#0A0E1A] text-[#E5E7EB] placeholder-[#6B7280] ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500/40'
                    : form.confirmPassword && !errors.confirmPassword
                    ? 'border-green-500 focus:ring-green-500/40'
                    : 'border-white/10 focus:ring-indigo-500/50'
                }`}
              />
              {errors.confirmPassword ? (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
              ) : form.confirmPassword && form.password === form.confirmPassword ? (
                <p className="mt-1 text-xs text-green-500">Passwords match!</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#9CA3AF] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#818CF8] font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
