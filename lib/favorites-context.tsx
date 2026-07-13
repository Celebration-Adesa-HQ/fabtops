'use client';

import type { ReactNode } from 'react';
import { useWishlistStore } from '@/stores/use-wishlist-store';
import type { FavoriteProduct } from '@/stores/types';

interface FavoritesContextType {
  favorites: FavoriteProduct[];
  isFavorited: (id: string) => boolean;
  toggleFavorite: (product: FavoriteProduct) => Promise<void>;
  count: number;
  isLoading: boolean;
}

export type { FavoriteProduct };

export function FavoritesProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useFavorites(): FavoritesContextType {
  const favorites = useWishlistStore((state) => state.favorites);
  const isLoading = useWishlistStore((state) => state.isLoading);
  const toggleFavorite = useWishlistStore((state) => state.toggleFavorite);
  const count = useWishlistStore((state) => state.count());
  const isFavorited = useWishlistStore((state) => state.isFavorited);

  return {
    favorites,
    isFavorited,
    toggleFavorite,
    count,
    isLoading,
  };
}
