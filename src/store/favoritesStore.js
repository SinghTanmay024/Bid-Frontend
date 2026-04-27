import { create } from 'zustand';
import { getFavourites, addFavourite, removeFavourite } from '../api/favourites';

export const useFavoritesStore = create((set, get) => ({
  favoriteIds: [],
  loading: false,

  // Called on login / app load — fetches from backend
  hydrate: async (userId) => {
    if (!userId) return;
    set({ loading: true });
    try {
      const { data } = await getFavourites();
      // Backend returns array of productIds (numbers or strings)
      const ids = Array.isArray(data) ? data.map(String) : [];
      set({ favoriteIds: ids });
    } catch {
      // Silently fail — user just won't see saved state
    } finally {
      set({ loading: false });
    }
  },

  // Optimistic toggle — updates UI instantly, syncs with backend in background
  toggleFavorite: async (productId) => {
    const id = String(productId);
    const { favoriteIds } = get();
    const exists = favoriteIds.includes(id);

    // Optimistic update
    set({
      favoriteIds: exists
        ? favoriteIds.filter((i) => i !== id)
        : [...favoriteIds, id],
    });

    try {
      if (exists) {
        await removeFavourite(productId);
      } else {
        await addFavourite(productId);
      }
    } catch {
      // Rollback on failure
      set({ favoriteIds: get().favoriteIds.includes(id)
        ? get().favoriteIds.filter((i) => i !== id)
        : [...get().favoriteIds, id],
      });
    }

    return !exists; // true = added
  },

  isFavorite: (productId) => get().favoriteIds.includes(String(productId)),

  clearFavorites: () => set({ favoriteIds: [] }),
}));
