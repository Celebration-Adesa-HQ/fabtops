'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartData, CartItem } from './types';
import { getBrowserStorage } from './storage';

interface GuestCartSnapshot {
  items: CartItem[];
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  subtotal: number;
  totalAmount: number;
  discountCodes: Array<{ code: string; applicable: boolean }>;
  couponError: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  hasHydratedGuestState: boolean;
  isAnonymousSession: boolean;
  guestSnapshot: GuestCartSnapshot;
  setIsCartOpen: (isOpen: boolean) => void;
  setAnonymousSession: (isAnonymous: boolean) => void;
  markGuestHydrated: () => void;
  seedFromGuestSnapshot: () => void;
  syncCart: (cart: CartData) => void;
  initializeCart: () => Promise<void>;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  applyDiscountCode: (code: string) => Promise<string | null>;
  removeDiscountCode: (code: string) => Promise<string | null>;
  replaceFromServer: (cart: CartData) => void;
  clearGuestSnapshot: () => void;
  clearUserScopedState: () => void;
  getGuestMergePayload: () => GuestCartSnapshot;
  totalItems: () => number;
}

async function fetchCartApi(body: Record<string, unknown>) {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    throw new Error(result?.error || 'Cart request failed');
  }
  return result.data as CartData;
}

function toGuestSnapshot(items: CartItem[]): GuestCartSnapshot {
  return {
    items: items.map((item) => ({
      ...item,
      selectedOptions: item.selectedOptions || [],
    })),
  };
}

const emptyState = {
  items: [] as CartItem[],
  subtotal: 0,
  totalAmount: 0,
  discountCodes: [] as Array<{ code: string; applicable: boolean }>,
  couponError: null as string | null,
  checkoutUrl: null as string | null,
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...emptyState,
      isCartOpen: false,
      isLoading: true,
      hasHydratedGuestState: false,
      isAnonymousSession: false,
      guestSnapshot: { items: [] },
      setIsCartOpen(isOpen) {
        set({ isCartOpen: isOpen });
      },
      setAnonymousSession(isAnonymous) {
        set({ isAnonymousSession: isAnonymous });
      },
      markGuestHydrated() {
        set({ hasHydratedGuestState: true });
      },
      seedFromGuestSnapshot() {
        const guestItems = get().guestSnapshot.items;
        if (!guestItems.length) {
          return;
        }

        set((state) => (
          state.items.length
            ? state
            : {
                items: guestItems,
                checkoutUrl: '/checkout',
              }
        ));
      },
      syncCart(cart) {
        set((state) => ({
          items: cart.items || [],
          subtotal: cart.subtotal || 0,
          totalAmount: cart.totalAmount || 0,
          discountCodes: cart.discountCodes || [],
          couponError: null,
          checkoutUrl: (cart.items || []).length ? '/checkout' : null,
          guestSnapshot: state.isAnonymousSession ? toGuestSnapshot(cart.items || []) : state.guestSnapshot,
        }));
      },
      async initializeCart() {
        if (get().isAnonymousSession) {
          get().seedFromGuestSnapshot();
        }

        set({ isLoading: true });
        try {
          const cart = await fetchCartApi({ action: 'get' });
          get().syncCart(cart);
        } catch (error) {
          console.error('Unable to load WooCommerce cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      async addToCart(variantId, quantity = 1) {
        const productId = Number(variantId);
        if (!Number.isInteger(productId) || productId <= 0) {
          console.error('Invalid WooCommerce product or variation ID');
          return;
        }

        set({ isLoading: true, couponError: null });
        try {
          const cart = await fetchCartApi({ action: 'add', productId, quantity });
          get().syncCart(cart);
          set({ isCartOpen: true });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Cart request failed';
          if (message !== 'Cart request failed') {
            set({ couponError: message });
          } else {
            console.error('WooCommerce cart operation failed:', error);
          }
        } finally {
          set({ isLoading: false });
        }
      },
      async removeFromCart(lineKey) {
        set({ isLoading: true, couponError: null });
        try {
          get().syncCart(await fetchCartApi({ action: 'remove', lineKey }));
        } catch (error) {
          console.error('WooCommerce cart operation failed:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      async updateQuantity(lineKey, quantity) {
        set({ isLoading: true, couponError: null });
        try {
          get().syncCart(await fetchCartApi({ action: 'update', lineKey, quantity }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Cart request failed';
          if (message !== 'Cart request failed') {
            set({ couponError: message });
          } else {
            console.error('WooCommerce cart operation failed:', error);
          }
        } finally {
          set({ isLoading: false });
        }
      },
      async applyDiscountCode(code) {
        if (get().isLoading) {
          return null;
        }

        set({ isLoading: true, couponError: null });
        try {
          get().syncCart(await fetchCartApi({ action: 'applyCoupon', code }));
          return null;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Cart request failed';
          if (message !== 'Cart request failed') {
            set({ couponError: message });
            return message;
          }
          console.error('WooCommerce cart operation failed:', error);
          return null;
        } finally {
          set({ isLoading: false });
        }
      },
      async removeDiscountCode(code) {
        if (get().isLoading) {
          return null;
        }

        set({ isLoading: true, couponError: null });
        try {
          get().syncCart(await fetchCartApi({ action: 'removeCoupon', code }));
          return null;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Cart request failed';
          if (message !== 'Cart request failed') {
            set({ couponError: message });
            return message;
          }
          console.error('WooCommerce cart operation failed:', error);
          return null;
        } finally {
          set({ isLoading: false });
        }
      },
      replaceFromServer(cart) {
        get().syncCart(cart);
      },
      clearGuestSnapshot() {
        set({ guestSnapshot: { items: [] } });
      },
      clearUserScopedState() {
        set({
          ...emptyState,
          isCartOpen: false,
          isLoading: false,
          guestSnapshot: { items: [] },
        });
      },
      getGuestMergePayload() {
        return get().guestSnapshot;
      },
      totalItems() {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'fabtops-guest-cart',
      storage: createJSONStorage(getBrowserStorage),
      partialize: (state) => ({
        guestSnapshot: state.guestSnapshot,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markGuestHydrated();
      },
    },
  ),
);
