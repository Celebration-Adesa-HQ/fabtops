'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  toggleFavorite: (product: FavoriteProduct) => void;
  count: number;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getRedirectPath = () => {
    if (typeof window === 'undefined') return '';
    const currentPath = window.location.pathname + window.location.search;
    return encodeURIComponent(currentPath);
  };

  const isFavorited = useCallback(
    (id: string) => favorites.some((fav) => fav.id === id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (product: FavoriteProduct) => {
      const action = favorites.some((fav) => fav.id === product.id) ? 'remove' : 'add';
      setIsLoading(true);

      try {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, product }),
        });

        if (response.status === 401) {
          router.push(`/login?redirect=${getRedirectPath()}`);
          return;
        }

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Wishlist request failed');
        }

        setFavorites(result.data || []);
      } catch (error) {
        console.error('Unable to update wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [favorites, router],
  );

  useEffect(() => {
    let active = true;

    fetch('/api/wishlist')
      .then(async (response) => {
        if (response.status === 401) {
          return [];
        }

        const result = await response.json();
        return response.ok && result.success ? result.data || [] : [];
      })
      .then((items) => {
        if (active) {
          setFavorites(items);
        }
      })
      .catch((error) => {
        console.error('Unable to load wishlist:', error);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const count = useMemo(() => favorites.length, [favorites]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorited,
        toggleFavorite,
        count,
        isLoading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
