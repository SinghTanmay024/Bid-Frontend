import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register, socialLogin } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import {
  auth,
  googleProvider,
  facebookProvider,
  signInWithPopup,
} from '../firebase';

// ── Eye icon ────────────────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// ── Password strength meter ──────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const label = ['', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const colors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : 'rgba(255,255,255,0.1)' }}
          />
        ))}
      </div>
      {label && (
        <p className="text-xs" style={{ color: colors[score] }}>
          {label} password
        </p>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Main RegisterPage
// ════════════════════════════════════════════════════════════════
export default function RegisterPage() {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const [form, setForm]               = useState({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors]           = useState({});
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 6) e.password = 'Min 6 characters.';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'password' && form.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value !== form.confirmPassword ? 'Passwords do not match.' : '',
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
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      const { data } = await register(form.email, form.password);
      storeLogin(data);
      toast.success('Account created! Complete your profile.');
      navigate('/profile/setup');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Registration failed.';
      toast.error(typeof msg === 'string' ? msg : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (providerName) => {
    const provider = providerName === 'google' ? googleProvider : facebookProvider;
    setSocialLoading(providerName);
    try {
      const result  = await signInWithPopup(auth, provider);
      const user    = result.user;
      const idToken = await user.getIdToken();
      try {
        const { data } = await socialLogin(providerName, idToken, user.email, user.displayName);
        storeLogin(data);
        toast.success(`Welcome, ${user.displayName || user.email}!`);
        navigate('/profile/setup');
      } catch (backendErr) {
        const status = backendErr?.response?.status;
        if (status === 404 || status === undefined) {
          storeLogin({ token: idToken, email: user.email, role: 'USER' });
          toast.success(`Welcome, ${user.displayName || user.email}!`);
          navigate('/profile/setup');
        } else {
          const msg = backendErr?.response?.data?.message || 'Social sign-up failed.';
          toast.error(typeof msg === 'string' ? msg : 'Social sign-up failed.');
        }
      }
    } catch (firebaseErr) {
      if (firebaseErr.code === 'auth/popup-closed-by-user') {
        toast('Sign-up cancelled.', { icon: '↩️' });
      } else if (firebaseErr.code === 'auth/configuration-not-found' || firebaseErr.code === 'auth/invalid-api-key') {
        toast.error('Firebase not configured. Add credentials to src/firebase.js');
      } else {
        toast.error(firebaseErr.message || 'Social sign-up failed.');
      }
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E1A] px-4 pt-16 pb-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-4xl">🎯</span>
          <h1 className="text-3xl font-bold text-white mt-2">Join BidWin</h1>
          <p className="text-[#9CA3AF] mt-1">Create your account to start bidding</p>
        </div>

        <div className="bg-[#111827] rounded-2xl shadow-xl border border-white/10 overflow-hidden">

          {/* Social buttons */}
          <div className="p-6 pb-5 space-y-3">
            <button
              onClick={() => handleSocial('google')}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[#E5E7EB] text-sm font-medium transition-all disabled:opacity-60"
            >
              {socialLoading === 'google'
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <GoogleIcon />}
              Sign up with Google
            </button>

            <button
              onClick={() => handleSocial('facebook')}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[#E5E7EB] text-sm font-medium transition-all disabled:opacity-60"
            >
              {socialLoading === 'facebook'
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <FacebookIcon />}
              Sign up with Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 px-6 my-1">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-[#6B7280] uppercase tracking-wide">or with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email form */}
          <div className="p-6 pt-5">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-1">Email address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-[#E5E7EB] bg-[#0A0E1A] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:border-transparent ${
                    errors.email ? 'border-red-500 focus:ring-red-500/40' : 'border-white/10 focus:ring-indigo-500/50'
                  }`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm text-[#E5E7EB] bg-[#0A0E1A] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.password ? 'border-red-500 focus:ring-red-500/40' : 'border-white/10 focus:ring-indigo-500/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition-colors"
                  >
                    <EyeIcon open={showPass} />
                  </button>
                </div>
                <PasswordStrength password={form.password} />
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm text-[#E5E7EB] bg-[#0A0E1A] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.confirmPassword
                        ? 'border-red-500 focus:ring-red-500/40'
                        : form.confirmPassword && !errors.confirmPassword
                        ? 'border-green-500 focus:ring-green-500/40'
                        : 'border-white/10 focus:ring-indigo-500/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition-colors"
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {errors.confirmPassword ? (
                  <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
                ) : form.confirmPassword && form.password === form.confirmPassword ? (
                  <p className="mt-1 text-xs text-green-400">✓ Passwords match</p>
                ) : null}
              </div>

              {/* Terms */}
              <p className="text-xs text-[#6B7280]">
                By creating an account, you agree to our{' '}
                <span className="text-[#818CF8] hover:underline cursor-pointer">Terms of Service</span>{' '}
                and{' '}
                <span className="text-[#818CF8] hover:underline cursor-pointer">Privacy Policy</span>.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-lg shadow-indigo-500/25"
              >
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Creating account…
                    </span>
                  : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-[#9CA3AF] mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-[#818CF8] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[#4B5563] mt-4 flex items-center justify-center gap-1.5">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Secured with 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
}
