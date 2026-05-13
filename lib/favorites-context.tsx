'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './use-auth';

const wishlistApiCall = async (body: any) => {
  try {
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  } catch (error) {
    console.error('Wishlist API sync failed:', error);
  }
};

export interface FavoriteProduct {
  id: string;
  variantId: string;
  title: string;
  handle: string;
  price: string;
  currencyCode: string;
  imageUrl: string;
  imageAlt: string;
}

interface FavoritesContextType {
  favorites: FavoriteProduct[];
  isFavorited: (id: string) => boolean;
  toggleFavorite: (product: FavoriteProduct, isAuthenticated: boolean) => void;
  count: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);
const BASE_STORAGE_KEY = 'fabtops_favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const { customer, isAuthenticated } = useAuth();

  // Determine storage key based on user
  const storageKey = customer?.id 
    ? `${BASE_STORAGE_KEY}_${customer.id.replace(/[^a-zA-Z0-9]/g, '_')}` 
    : BASE_STORAGE_KEY;

  // Hydrate from localStorage when storageKey changes (user logs in/out)
  useEffect(() => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        setFavorites([]);
      }
    } catch {
      setFavorites([]);
    }
  }, [storageKey, isAuthenticated]);

  // Persist to localStorage on change
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    }
  }, [favorites, storageKey, isAuthenticated]);

  const isFavorited = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (product: FavoriteProduct, isAuthenticated: boolean) => {
      if (!isAuthenticated) {
        // Redirect to login — handled in the UI layer
        window.location.href = `/login?redirect=/wishlist`;
        return;
      }

      const isAdding = !favorites.some((f) => f.id === product.id);

      setFavorites((prev) =>
        isAdding
          ? [...prev, product]
          : prev.filter((f) => f.id !== product.id)
      );

      // Sync with API for architectural consistency
      await wishlistApiCall({
        action: isAdding ? 'add' : 'remove',
        customerId: customer?.id,
        product
      });
    },
    [favorites, customer?.id],
  );

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorited, toggleFavorite, count: favorites.length }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
