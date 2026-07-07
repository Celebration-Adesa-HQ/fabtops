'use client';

import { CartProvider } from '@/components/cart/CartProvider';
import { FavoritesProvider } from '@/lib/favorites-context';
import { CurrencyProvider } from '@/lib/currency-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      <FavoritesProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </FavoritesProvider>
    </CurrencyProvider>
  );
}
