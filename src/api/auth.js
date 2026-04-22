import api from './axios';

// ── Email + Password ──────────────────────────
export const register = (email, password) =>
  api.post('/api/auth/register', { email, password });

export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

// ── Email OTP ─────────────────────────────────
export const sendOtp = (email) =>
  api.post('/api/auth/send-otp', { email });

export const verifyOtp = (email, otp) =>
  api.post('/api/auth/verify-otp', { email, otp });

// ── Forgot Password ───────────────────────────
export const forgotPassword = (email) =>
  api.post('/api/auth/forgot-password', { email });

// ── Social Login (Google / Facebook) ─────────
// Backend should accept the Firebase ID token, verify it,
// and return the same { token, email, role } shape as /login.
export const socialLogin = (provider, idToken, email, name) =>
  api.post('/api/auth/social-login', { provider, idToken, email, name });
