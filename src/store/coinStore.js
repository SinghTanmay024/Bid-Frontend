import { create } from 'zustand';

const STORAGE_KEY = 'bidwin_coins';

const getInitialCoins = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
};

export const useCoinStore = create((set, get) => ({
  coins: getInitialCoins(),

  addCoins: (amount) => {
    const newBalance = get().coins + amount;
    try { localStorage.setItem(STORAGE_KEY, String(newBalance)); } catch { /* ignore */ }
    set({ coins: newBalance });
  },

  spendCoins: (amount) => {
    const current = get().coins;
    if (current < amount) return false;
    const newBalance = current - amount;
    try { localStorage.setItem(STORAGE_KEY, String(newBalance)); } catch { /* ignore */ }
    set({ coins: newBalance });
    return true;
  },

  resetCoins: () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    set({ coins: 0 });
  },
}));
