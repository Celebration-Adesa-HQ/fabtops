'use client';

import { useEffect } from 'react';
import { useAuthSessionStore } from '@/stores/use-auth-session-store';
import { useCartStore } from '@/stores/use-cart-store';

export function StoreBootstrap() {
  useEffect(() => {
    useCartStore.getState().markGuestHydrated();
    void useAuthSessionStore.getState().refreshSession();
  }, []);

  return null;
}
