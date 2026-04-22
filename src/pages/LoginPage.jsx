import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form.email, form.password);
      storeLogin(data);
      toast.success(`Welcome back, ${data.email}!`);
      navigate('/');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Invalid credentials. Please try again.';
      toast.error(typeof msg === 'string' ? msg : 'Login failed.');
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
          <h1 className="text-3xl font-bold text-white mt-2">Welcome back</h1>
          <p className="text-[#9CA3AF] mt-1">Sign in to continue bidding</p>
        </div>

        {/* Card */}
        <div className="bg-[#111827] rounded-2xl shadow-lg p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-1">
                Email address
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-sm bg-[#0A0E1A] text-[#E5E7EB] placeholder-[#6B7280]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-sm bg-[#0A0E1A] text-[#E5E7EB] placeholder-[#6B7280]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-[#9CA3AF] mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-[#818CF8] font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
