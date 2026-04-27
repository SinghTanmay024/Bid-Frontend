import { create } from 'zustand';

const getInitialState = () => {
  try {
    return {
      userId: localStorage.getItem('userId') || null,
      email: localStorage.getItem('email') || null,
      token: localStorage.getItem('token') || null,
      role: localStorage.getItem('role') || null,
    };
  } catch {
    return { userId: null, email: null, token: null, role: null };
  }
};

export const useAuthStore = create((set) => ({
  ...getInitialState(),

  login: (data) => {
    const token = data?.token ?? data?.accessToken ?? null;
    const email = data?.email ?? null;
    const role  = data?.role  ?? 'USER';
    const userId = email;
    if (!token || !email) {
      console.error('[authStore] login() received unexpected shape:', data);
      return;
    }
    localStorage.setItem('userId', userId);
    localStorage.setItem('email', email);
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    set({ userId, email, token, role });
  },

  logout: () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    set({ userId: null, email: null, token: null, role: null });
  },
}));
