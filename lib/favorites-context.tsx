'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);

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
      void product;
      router.push(`/wishlist?redirect=${getRedirectPath()}`);
    },
    [router],
  );

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
