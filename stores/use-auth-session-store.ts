'use client';

import { create } from 'zustand';
import type { AuthStatus, SessionUser } from './types';
import { useCartStore } from './use-cart-store';
import { useWishlistStore } from './use-wishlist-store';

interface MergeGuestStateResponse {
  cart: {
    items: ReturnType<typeof useCartStore.getState>['items'];
    subtotal: number;
    totalAmount: number;
    discountCodes: ReturnType<typeof useCartStore.getState>['discountCodes'];
    currencyCode?: string;
  };
  wishlist: ReturnType<typeof useWishlistStore.getState>['favorites'];
  merged: boolean;
  wishlistMerged?: boolean;
}

interface AuthSessionState {
  authStatus: AuthStatus;
  sessionUser: SessionUser | null;
  isHydrating: boolean;
  mergeStatus: 'idle' | 'running' | 'succeeded' | 'failed';
  refreshSession: () => Promise<SessionUser | null>;
  runPostAuthMerge: () => Promise<void>;
  logout: () => Promise<void>;
}

async function fetchSession() {
  const response = await fetch('/api/account/session', {
    cache: 'no-store',
  });
  const result = await response.json().catch(() => null);

  if (response.status === 401) {
    return null;
  }

  if (!response.ok || !result?.success) {
    throw new Error(result?.error || 'SESSION_EXPIRED');
  }

  return (result.data?.user || null) as SessionUser | null;
}

function createMergeKey(payload: {
  cartItems: ReturnType<typeof useCartStore.getState>['guestSnapshot']['items'];
  wishlistItems: ReturnType<typeof useWishlistStore.getState>['guestFavorites'];
}) {
  return JSON.stringify(payload);
}

export const useAuthSessionStore = create<AuthSessionState>((set, get) => ({
  authStatus: 'unknown',
  sessionUser: null,
  isHydrating: true,
  mergeStatus: 'idle',
  async refreshSession() {
    const previousStatus = get().authStatus;
    const user = await fetchSession().catch((error) => {
      console.error('Unable to confirm session:', error);
      return null;
    });

    if (!user) {
      useWishlistStore.getState().setAnonymousSession(true);
      useCartStore.getState().clearUserScopedState();
      set({
        authStatus: 'unauthenticated',
        sessionUser: null,
        isHydrating: false,
        mergeStatus: 'idle',
      });
      await useWishlistStore.getState().initializeWishlist();
      return null;
    }

    set({
      authStatus: 'authenticated',
      sessionUser: user,
      isHydrating: false,
    });
    useWishlistStore.getState().setAnonymousSession(false);

    if (previousStatus !== 'authenticated') {
      await get().runPostAuthMerge();
    } else {
      await Promise.all([
        useCartStore.getState().initializeCart(),
        useWishlistStore.getState().initializeWishlist(),
      ]);
    }

    return user;
  },
  async runPostAuthMerge() {
    const guestCart = useCartStore.getState().getGuestMergePayload();
    const guestWishlist = useWishlistStore.getState().getGuestMergePayload();

    set({ mergeStatus: 'running' });

    try {
      const response = await fetch('/api/commerce/merge-guest-state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mergeKey: createMergeKey({
            cartItems: guestCart.items,
            wishlistItems: guestWishlist,
          }),
          guestCart,
          guestWishlist,
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Unable to merge guest commerce state');
      }

      const data = result.data as MergeGuestStateResponse;
      useCartStore.getState().replaceFromServer(data.cart);
      useCartStore.getState().clearGuestSnapshot();
      useWishlistStore.getState().replaceFromServer(data.wishlist);
      if (data.wishlistMerged !== false) {
        useWishlistStore.getState().clearGuestFavorites();
      }
      set({ mergeStatus: 'succeeded' });
    } catch (error) {
      console.error('Unable to merge guest commerce state:', error);
      set({ mergeStatus: 'failed' });
      await Promise.all([
        useCartStore.getState().initializeCart(),
        useWishlistStore.getState().initializeWishlist(),
      ]);
    }
  },
  async logout() {
    await fetch('/api/account/logout', { method: 'POST' }).catch(() => null);
    useCartStore.getState().clearUserScopedState();
    useWishlistStore.getState().clearUserScopedState();
    useWishlistStore.getState().setAnonymousSession(true);
    set({
      authStatus: 'unauthenticated',
      sessionUser: null,
      mergeStatus: 'idle',
    });
  },
}));
