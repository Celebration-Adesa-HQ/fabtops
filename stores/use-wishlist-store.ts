'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FavoriteProduct } from './types';
import { getBrowserStorage } from './storage';

interface WishlistState {
  favorites: FavoriteProduct[];
  isLoading: boolean;
  isAnonymousSession: boolean;
  guestFavorites: FavoriteProduct[];
  setAnonymousSession: (isAnonymous: boolean) => void;
  initializeWishlist: () => Promise<void>;
  replaceFromServer: (items: FavoriteProduct[]) => void;
  isFavorited: (id: string) => boolean;
  toggleFavorite: (product: FavoriteProduct) => Promise<void>;
  clearGuestFavorites: () => void;
  clearUserScopedState: () => void;
  count: () => number;
  getGuestMergePayload: () => FavoriteProduct[];
}

async function fetchWishlist() {
  const response = await fetch('/api/wishlist', { cache: 'no-store' });

  if (response.status === 401) {
    return {
      authenticated: false,
      data: [] as FavoriteProduct[],
    };
  }

  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    throw new Error(result?.error || 'Wishlist request failed');
  }

  return {
    authenticated: true,
    data: (result.data || []) as FavoriteProduct[],
  };
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isLoading: true,
      isAnonymousSession: false,
      guestFavorites: [],
      setAnonymousSession(isAnonymous) {
        set({ isAnonymousSession: isAnonymous });
        if (isAnonymous) {
          set({ favorites: get().guestFavorites });
        }
      },
      async initializeWishlist() {
        if (get().isAnonymousSession) {
          set({ favorites: get().guestFavorites, isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const result = await fetchWishlist();
          if (result.authenticated) {
            set({ favorites: result.data });
          }
        } catch (error) {
          console.error('Unable to load wishlist:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      replaceFromServer(items) {
        set({ favorites: items, isLoading: false });
      },
      isFavorited(id) {
        return get().favorites.some((favorite) => favorite.id === id);
      },
      async toggleFavorite(product) {
        if (get().isAnonymousSession) {
          const next = get().favorites.some((favorite) => favorite.id === product.id)
            ? get().favorites.filter((favorite) => favorite.id !== product.id)
            : [...get().favorites.filter((favorite) => favorite.id !== product.id), product];

          set({
            favorites: next,
            guestFavorites: next,
            isLoading: false,
          });
          return;
        }

        const action = get().favorites.some((favorite) => favorite.id === product.id) ? 'remove' : 'add';
        set({ isLoading: true });

        try {
          const response = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, product }),
          });
          const result = await response.json().catch(() => null);
          if (!response.ok || !result?.success) {
            throw new Error(result?.error || 'Wishlist request failed');
          }

          set({
            favorites: (result.data || []) as FavoriteProduct[],
          });
        } catch (error) {
          console.error('Unable to update wishlist:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      clearGuestFavorites() {
        set({ guestFavorites: [] });
      },
      clearUserScopedState() {
        set({
          favorites: [],
          guestFavorites: [],
          isLoading: false,
        });
      },
      count() {
        return get().favorites.length;
      },
      getGuestMergePayload() {
        return get().guestFavorites;
      },
    }),
    {
      name: 'fabtops-guest-wishlist',
      storage: createJSONStorage(getBrowserStorage),
      partialize: (state) => ({
        guestFavorites: state.guestFavorites,
      }),
    },
  ),
);
