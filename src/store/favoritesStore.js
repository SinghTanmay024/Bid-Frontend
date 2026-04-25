import { create } from 'zustand';

const storageKey = (userId) => `favourites_${userId}`;

const loadFromStorage = (userId) => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (userId, ids) => {
  if (!userId) return;
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(ids));
  } catch {
    // storage full or unavailable — silently ignore
  }
};

export const useFavoritesStore = create((set, get) => ({
  favoriteIds: [],
  currentUserId: null,

  // Call this when the user logs in / on app load to hydrate the store
  hydrate: (userId) => {
    const ids = loadFromStorage(userId);
    set({ favoriteIds: ids, currentUserId: userId });
  },

  toggleFavorite: (productId, userId) => {
    const { favoriteIds } = get();
    const exists = favoriteIds.includes(productId);
    const updated = exists
      ? favoriteIds.filter((id) => id !== productId)
      : [...favoriteIds, productId];
    saveToStorage(userId, updated);
    set({ favoriteIds: updated });
    return !exists; // true = added, false = removed
  },

  isFavorite: (productId) => get().favoriteIds.includes(productId),

  clearFavorites: () => set({ favoriteIds: [], currentUserId: null }),
}));
