'use client';

import { create } from 'zustand';
import type { AuthStatus, SessionUser } from './types';
import { useCartStore } from './use-cart-store';
import { useWishlistStore } from './use-wishlist-store';

interface AuthSessionState {
  authStatus: AuthStatus;
  sessionUser: SessionUser | null;
  isHydrating: boolean;
  mergeStatus: 'idle' | 'running' | 'succeeded' | 'failed';
  refreshSession: () => Promise<SessionUser | null>;
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
      set({
        authStatus: 'unauthenticated',
        sessionUser: null,
        isHydrating: false,
        mergeStatus: 'idle',
      });
      await Promise.all([
        useCartStore.getState().initializeCart(),
        useWishlistStore.getState().initializeWishlist(),
      ]);
      return null;
    }

    set({
      authStatus: 'authenticated',
      sessionUser: user,
      isHydrating: false,
    });
    useWishlistStore.getState().setAnonymousSession(false);

    if (previousStatus !== 'authenticated') {
      set({ mergeStatus: 'succeeded' });
      await Promise.all([
        useCartStore.getState().initializeCart(),
        useWishlistStore.getState().initializeWishlist(),
      ]);
    } else {
      await Promise.all([
        useCartStore.getState().initializeCart(),
        useWishlistStore.getState().initializeWishlist(),
      ]);
    }

    return user;
  },
  async logout() {
    await fetch('/api/account/logout', { method: 'POST' }).catch(() => null);
    useWishlistStore.getState().setAnonymousSession(true);
    set({
      authStatus: 'unauthenticated',
      sessionUser: null,
      mergeStatus: 'idle',
    });
    await Promise.all([
      useCartStore.getState().initializeCart(),
      useWishlistStore.getState().initializeWishlist(),
    ]);
  },
}));
