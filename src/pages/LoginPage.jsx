import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login, sendOtp, verifyOtp, forgotPassword, socialLogin } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { auth, googleProvider, facebookProvider, signInWithPopup } from '../firebase';

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
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function ForgotPasswordModal({ onClose }) {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Could not send reset email. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl p-7 shadow-2xl"
        style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.08)' }}>
        {sent ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(91,95,239,0.12)] border border-[rgba(91,95,239,0.2)] flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-[#7477F5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Check your inbox</h3>
            <p className="text-sm text-[#6B6B78] mb-6">Reset link sent to <span className="text-white">{email}</span></p>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#5B5FEF' }}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Reset Password</h3>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B6B78] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-[#6B6B78] mb-5">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSend} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-[#6B6B78] focus:outline-none transition-all"
                style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(91,95,239,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(91,95,239,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: '#5B5FEF' }}
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
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
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
          className="w-10 h-11 text-center text-lg font-bold text-white rounded-xl focus:outline-none transition-all"
          style={{
            background: '#111114',
            border: `1px solid ${digit ? 'rgba(91,95,239,0.5)' : 'rgba(255,255,255,0.08)'}`,
          }}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(91,95,239,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(91,95,239,0.12)'; }}
          onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
        />
      ))}
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();

  const [tab, setTab]                     = useState('password');
  const [form, setForm]                   = useState({ email: '', password: '' });
  const [showPass, setShowPass]           = useState(false);
  const [loading, setLoading]             = useState(false);
  const [forgotOpen, setForgotOpen]       = useState(false);
  const [otpEmail, setOtpEmail]           = useState('');
  const [otpStep, setOtpStep]             = useState(1);
  const [otp, setOtp]                     = useState(Array(6).fill(''));
  const [otpLoading, setOtpLoading]       = useState(false);
  const [resendTimer, setResendTimer]     = useState(0);
  const [socialLoading, setSocialLoading] = useState(null);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  const afterLogin = (data) => {
    storeLogin(data);
    toast.success('Welcome back!');
    navigate('/');
  };

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

  const handleSendOtp = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!otpEmail) return;
    setOtpLoading(true);
    try {
      await sendOtp(otpEmail);
      setOtpStep(2);
      setResendTimer(30);
      toast.success('OTP sent! Check your inbox.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || '';
      toast.error(typeof msg === 'string' && msg ? msg : 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

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

  const handleSocial = async (providerName) => {
    const provider = providerName === 'google' ? googleProvider : facebookProvider;
    setSocialLoading(providerName);
    try {
      const result  = await signInWithPopup(auth, provider);
      const user    = result.user;
      const idToken = await user.getIdToken();
      try {
        const { data } = await socialLogin(providerName, idToken, user.email, user.displayName);
        afterLogin(data);
      } catch (backendErr) {
        const status = backendErr?.response?.status;
        if (status === 404 || status === undefined) {
          storeLogin({ token: idToken, email: user.email, role: 'USER' });
          toast.success(`Welcome, ${user.displayName || user.email}!`);
          navigate('/');
        } else {
          toast.error(backendErr?.response?.data?.message || 'Social login failed.');
        }
      }
    } catch (firebaseErr) {
      if (firebaseErr.code === 'auth/popup-closed-by-user') {
        toast('Sign-in cancelled.', { icon: '↩️' });
      } else {
        toast.error(firebaseErr.message || 'Social sign-in failed.');
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-[#6B6B78] focus:outline-none transition-all";
  const inputStyle = { background: '#111114', border: '1px solid rgba(255,255,255,0.08)' };
  const focusInput = (e) => {
    e.target.style.borderColor = 'rgba(91,95,239,0.5)';
    e.target.style.boxShadow = '0 0 0 3px rgba(91,95,239,0.12)';
  };
  const blurInput = (e) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-10" style={{ background: '#0C0C0E' }}>
      {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}

      <div className="w-full max-w-[400px]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#5B5FEF] flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-sm text-[#6B6B78] mt-1">Sign in to continue bidding</p>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: '#18181C', border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Social */}
          <div className="p-5 pb-4 space-y-2.5">
            <button
              onClick={() => handleSocial('google')}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium text-[#A0A0AB] hover:text-white transition-all disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {socialLoading === 'google'
                ? <span className="w-4 h-4 border-2 border-[#6B6B78] border-t-white rounded-full animate-spin" />
                : <GoogleIcon />}
              Continue with Google
            </button>

            <button
              onClick={() => handleSocial('facebook')}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium text-[#A0A0AB] hover:text-white transition-all disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {socialLoading === 'facebook'
                ? <span className="w-4 h-4 border-2 border-[#6B6B78] border-t-white rounded-full animate-spin" />
                : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>}
              Continue with Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 px-5 mb-1">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
            <span className="text-xs text-[#6B6B78] uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[rgba(255,255,255,0.06)] mx-5 mt-3">
            {[
              { key: 'password', label: 'Password' },
              { key: 'otp',      label: 'Email OTP' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  tab === key
                    ? 'border-[#5B5FEF] text-white'
                    : 'border-transparent text-[#6B6B78] hover:text-[#A0A0AB]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-5 pt-4">
            {/* Password tab */}
            {tab === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4" noValidate>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#A0A0AB]">Email address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className={inputClass}
                    style={inputStyle}
                    onFocus={focusInput}
                    onBlur={blurInput}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#A0A0AB]">Password</label>
                    <button
                      type="button"
                      onClick={() => setForgotOpen(true)}
                      className="text-xs text-[#5B5FEF] hover:text-[#7477F5] transition-colors"
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
                      className={`${inputClass} pr-10`}
                      style={inputStyle}
                      onFocus={focusInput}
                      onBlur={blurInput}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B78] hover:text-[#A0A0AB] transition-colors"
                    >
                      <EyeIcon open={showPass} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                  style={{ background: '#5B5FEF' }}
                >
                  {loading
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in…
                      </span>
                    : 'Sign In'}
                </button>
              </form>
            )}

            {/* OTP tab */}
            {tab === 'otp' && (
              <div className="space-y-4">
                {otpStep === 1 && (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#A0A0AB]">Email address</label>
                      <input
                        type="email"
                        required
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={inputClass}
                        style={inputStyle}
                        onFocus={focusInput}
                        onBlur={blurInput}
                      />
                    </div>
                    <p className="text-xs text-[#6B6B78]">We'll send a 6-digit code. No password needed.</p>
                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
                      style={{ background: '#5B5FEF' }}
                    >
                      {otpLoading
                        ? <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending…
                          </span>
                        : 'Send OTP'}
                    </button>
                  </form>
                )}

                {otpStep === 2 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="text-center">
                      <p className="text-sm text-[#A0A0AB]">Code sent to</p>
                      <p className="text-sm font-semibold text-white">{otpEmail}</p>
                    </div>

                    <OtpInput otp={otp} setOtp={setOtp} />

                    <button
                      type="submit"
                      disabled={otpLoading || otp.join('').length < 6}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
                      style={{ background: '#5B5FEF' }}
                    >
                      {otpLoading
                        ? <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Verifying…
                          </span>
                        : 'Verify & Sign In'}
                    </button>

                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => { setOtpStep(1); setOtp(Array(6).fill('')); }}
                        className="text-[#6B6B78] hover:text-[#A0A0AB] transition-colors"
                      >
                        ← Change email
                      </button>
                      {resendTimer > 0 ? (
                        <span className="text-[#6B6B78]">Resend in {resendTimer}s</span>
                      ) : (
                        <button type="button" onClick={handleSendOtp} className="text-[#5B5FEF] hover:text-[#7477F5] transition-colors">
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

            <p className="text-center text-xs text-[#6B6B78] mt-5">
              No account?{' '}
              <Link to="/register" className="text-[#7477F5] hover:text-white transition-colors font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[#6B6B78] mt-4 flex items-center justify-center gap-1.5">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          256-bit SSL encrypted
        </p>
      </div>
    </div>
  );
}
