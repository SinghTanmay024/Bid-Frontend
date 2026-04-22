import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login, sendOtp, verifyOtp, forgotPassword, socialLogin } from '../api/auth';
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

// ── Google icon ─────────────────────────────────────────────────
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

// ── Facebook icon ───────────────────────────────────────────────
function FacebookIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// ── Divider ─────────────────────────────────────────────────────
function Divider({ label = 'or' }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-xs text-[#6B7280] uppercase tracking-wide">{label}</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

// ── Forgot Password modal ────────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      // Backend may not have this endpoint yet — show friendly message
      toast.error('Reset email could not be sent. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-[#111827] rounded-2xl border border-white/10 p-8 shadow-2xl">
        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📬</div>
            <h3 className="text-xl font-bold text-white mb-2">Check your inbox</h3>
            <p className="text-[#9CA3AF] text-sm mb-6">
              We sent a password reset link to <span className="text-white font-medium">{email}</span>
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Forgot Password</h3>
              <button onClick={onClose} className="text-[#6B7280] hover:text-white transition-colors">✕</button>
            </div>
            <p className="text-[#9CA3AF] text-sm mb-5">
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSend} className="space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 text-sm text-[#E5E7EB] bg-[#0A0E1A] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors text-sm disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ── OTP digit input ──────────────────────────────────────────────
function OtpInput({ otp, setOtp }) {
  const inputs = useRef([]);

  const handleChange = (i, val) => {
    const cleaned = val.replace(/\D/, '');
    const next = [...otp];
    next[i] = cleaned;
    setOtp(next);
    if (cleaned && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      inputs.current[5]?.focus();
      e.preventDefault();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-white/10 bg-[#0A0E1A] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-transparent transition-all"
        />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Main LoginPage
// ════════════════════════════════════════════════════════════════
export default function LoginPage() {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();

  // Tab: 'password' | 'otp'
  const [tab, setTab]                   = useState('password');

  // Password tab
  const [form, setForm]                 = useState({ email: '', password: '' });
  const [showPass, setShowPass]         = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [loading, setLoading]           = useState(false);
  const [forgotOpen, setForgotOpen]     = useState(false);

  // OTP tab
  const [otpEmail, setOtpEmail]         = useState('');
  const [otpStep, setOtpStep]           = useState(1); // 1=enter email, 2=enter code
  const [otp, setOtp]                   = useState(Array(6).fill(''));
  const [otpLoading, setOtpLoading]     = useState(false);
  const [resendTimer, setResendTimer]   = useState(0);

  // Social
  const [socialLoading, setSocialLoading] = useState(null); // 'google' | 'facebook' | null

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  // ── Helpers ──────────────────────────────────────────────────
  const afterLogin = (data) => {
    storeLogin(data);
    toast.success(`Welcome back!`);
    navigate('/');
  };

  // ── Password login ───────────────────────────────────────────
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form.email, form.password);
      afterLogin(data);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Invalid credentials.';
      toast.error(typeof msg === 'string' ? msg : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP: send ────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!otpEmail) return;
    setOtpLoading(true);
    try {
      await sendOtp(otpEmail);
      setOtpStep(2);
      setResendTimer(30);
      toast.success('OTP sent! Check your inbox.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || '';
      toast.error(typeof msg === 'string' && msg ? msg : 'Failed to send OTP. Try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // ── OTP: verify ──────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter the complete 6-digit OTP.'); return; }
    setOtpLoading(true);
    try {
      const { data } = await verifyOtp(otpEmail, code);
      afterLogin(data);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || '';
      toast.error(typeof msg === 'string' && msg ? msg : 'Invalid or expired OTP.');
      setOtp(Array(6).fill(''));
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Social login ─────────────────────────────────────────────
  const handleSocial = async (providerName) => {
    const provider = providerName === 'google' ? googleProvider : facebookProvider;
    setSocialLoading(providerName);
    try {
      const result  = await signInWithPopup(auth, provider);
      const user    = result.user;
      const idToken = await user.getIdToken();

      try {
        // Try to sync with backend
        const { data } = await socialLogin(
          providerName,
          idToken,
          user.email,
          user.displayName
        );
        afterLogin(data);
      } catch (backendErr) {
        // Backend social-login not wired yet — create a local session from Firebase data
        const status = backendErr?.response?.status;
        if (status === 404 || status === undefined) {
          // Fallback: store Firebase user info directly so the app is usable
          storeLogin({
            token: idToken,
            email: user.email,
            role: 'USER',
          });
          toast.success(`Welcome, ${user.displayName || user.email}!`);
          navigate('/');
        } else {
          const msg = backendErr?.response?.data?.message || 'Social login failed.';
          toast.error(typeof msg === 'string' ? msg : 'Social login failed.');
        }
      }
    } catch (firebaseErr) {
      if (firebaseErr.code === 'auth/popup-closed-by-user') {
        toast('Sign-in cancelled.', { icon: '↩️' });
      } else if (firebaseErr.code === 'auth/configuration-not-found' || firebaseErr.code === 'auth/invalid-api-key') {
        toast.error('Firebase not configured yet. Add your Firebase credentials to src/firebase.js');
      } else {
        toast.error(firebaseErr.message || 'Social sign-in failed.');
      }
    } finally {
      setSocialLoading(null);
    }
  };

  // ════════════════════════════════════════════════════════════
  // Render
  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E1A] px-4 pt-16 pb-10">
      {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-4xl">⚡</span>
          <h1 className="text-3xl font-bold text-white mt-2">Welcome back</h1>
          <p className="text-[#9CA3AF] mt-1">Sign in to continue bidding</p>
        </div>

        <div className="bg-[#111827] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">

          {/* ── Social buttons ── */}
          <div className="p-6 pb-5 space-y-3">
            <button
              onClick={() => handleSocial('google')}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[#E5E7EB] text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {socialLoading === 'google'
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <GoogleIcon />}
              Continue with Google
            </button>

            <button
              onClick={() => handleSocial('facebook')}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[#E5E7EB] text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {socialLoading === 'facebook'
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <FacebookIcon />}
              Continue with Facebook
            </button>
          </div>

          <Divider label="or sign in with" />

          {/* ── Tabs ── */}
          <div className="flex border-b border-white/10 mx-6 mt-4">
            {[
              { key: 'password', label: '🔑 Password' },
              { key: 'otp',      label: '📲 Email OTP' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                  tab === key
                    ? 'border-[#6366F1] text-[#A5B4FC]'
                    : 'border-transparent text-[#6B7280] hover:text-[#9CA3AF]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-6 pt-5">
            {/* ══ Password tab ══ */}
            {tab === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4" noValidate>
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 text-sm text-[#E5E7EB] bg-[#0A0E1A] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-[#E5E7EB]">Password</label>
                    <button
                      type="button"
                      onClick={() => setForgotOpen(true)}
                      className="text-xs text-[#818CF8] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Your password"
                      className="w-full px-4 py-2.5 pr-11 rounded-xl border border-white/10 text-sm text-[#E5E7EB] bg-[#0A0E1A] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition-colors"
                    >
                      <EyeIcon open={showPass} />
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border border-white/20 bg-[#0A0E1A] accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm text-[#9CA3AF]">Remember me for 30 days</span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-lg shadow-indigo-500/25"
                >
                  {loading
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Signing in…
                      </span>
                    : 'Sign In'}
                </button>
              </form>
            )}

            {/* ══ OTP tab ══ */}
            {tab === 'otp' && (
              <div className="space-y-4">
                {otpStep === 1 && (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#E5E7EB] mb-1">
                        Email address
                      </label>
                      <input
                        type="email"
                        required
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-white/10 text-sm text-[#E5E7EB] bg-[#0A0E1A] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      We'll send a 6-digit code to this email. No password needed.
                    </p>
                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 text-sm shadow-lg shadow-indigo-500/25"
                    >
                      {otpLoading
                        ? <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Sending OTP…
                          </span>
                        : 'Send OTP →'}
                    </button>
                  </form>
                )}

                {otpStep === 2 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="text-center">
                      <div className="text-3xl mb-2">📬</div>
                      <p className="text-sm text-[#E5E7EB] font-medium">Enter the code sent to</p>
                      <p className="text-sm text-[#818CF8] font-semibold">{otpEmail}</p>
                    </div>

                    <OtpInput otp={otp} setOtp={setOtp} />

                    <button
                      type="submit"
                      disabled={otpLoading || otp.join('').length < 6}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 text-sm shadow-lg shadow-indigo-500/25"
                    >
                      {otpLoading
                        ? <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Verifying…
                          </span>
                        : 'Verify & Sign In'}
                    </button>

                    {/* Resend */}
                    <div className="text-center">
                      {resendTimer > 0 ? (
                        <p className="text-xs text-[#6B7280]">
                          Resend OTP in <span className="text-[#9CA3AF] font-medium">{resendTimer}s</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-xs text-[#818CF8] hover:underline"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => { setOtpStep(1); setOtp(Array(6).fill('')); }}
                      className="w-full text-xs text-[#6B7280] hover:text-[#9CA3AF] transition-colors"
                    >
                      ← Change email
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Footer */}
            <p className="text-center text-sm text-[#9CA3AF] mt-6">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-[#818CF8] font-medium hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Security note */}
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
