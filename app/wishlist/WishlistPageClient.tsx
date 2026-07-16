'use client';

import { useFavorites } from '@/lib/favorites-context';
import { EmptyWishlist } from '@/components/wishlist/EmptyWishlist';
import { WishlistGrid } from '@/components/wishlist/WishlistGrid';

export default function WishlistPageClient() {
  const { favorites, count, isLoading } = useFavorites();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-light pt-40 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 rounded-full border-2 border-brand-primary/20 border-t-brand-primary animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-dark/75">Synchronizing Collection…</p>
        </div>
      </div>
    );
  }

  // Empty wishlist state
  if (count === 0) {
    return <EmptyWishlist />;
  }

  // Filled wishlist grid
  return (
    <WishlistGrid 
      favorites={favorites} 
      customer={null} 
      count={count} 
    />
  );
}
