'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartData, CartItem } from './types';
import { getBrowserStorage } from './storage';

interface CartState {
  items: CartItem[];
  guestSnapshot: { items: CartItem[] };
  isCartOpen: boolean;
  subtotal: number;
  totalAmount: number;
  currencyCode: string;
  discountCodes: CartData['discountCodes'];
  shippingRates: CartData['shippingRates'];
  needsShipping: boolean;
  couponFeedback: {
    action: 'apply' | 'remove' | null;
    code: string | null;
    message: string | null;
    status: 'idle' | 'success' | 'error';
  };
  checkoutUrl: string | null;
  isLoading: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  markGuestHydrated: () => void;
  getGuestMergePayload: () => { items: CartItem[] };
  clearGuestSnapshot: () => void;
  syncCart: (cart: CartData) => void;
  initializeCart: () => Promise<void>;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  applyDiscountCode: (code: string) => Promise<string | null>;
  removeDiscountCode: (code: string) => Promise<string | null>;
  replaceFromServer: (cart: CartData) => void;
  clearUserScopedState: () => void;
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

const emptyState = {
  items: [] as CartItem[],
  subtotal: 0,
  totalAmount: 0,
  currencyCode: 'NGN',
  discountCodes: [] as CartData['discountCodes'],
  shippingRates: [] as CartData['shippingRates'],
  needsShipping: false,
  couponFeedback: {
    action: null as 'apply' | 'remove' | null,
    code: null as string | null,
    message: null as string | null,
    status: 'idle' as 'idle' | 'success' | 'error',
  },
  checkoutUrl: null as string | null,
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...emptyState,
      guestSnapshot: { items: [] },
      isCartOpen: false,
      isLoading: false,
      setIsCartOpen(isOpen) {
        set({ isCartOpen: isOpen });
      },
      markGuestHydrated() {
        // storage rehydration is handled by zustand persist
      },
      getGuestMergePayload() {
        return get().guestSnapshot;
      },
      clearGuestSnapshot() {
        set({ guestSnapshot: { items: [] } });
      },
      syncCart(cart) {
        set({
          items: cart.items || [],
          subtotal: cart.subtotal || 0,
          totalAmount: cart.totalAmount || 0,
          currencyCode: cart.currencyCode || 'NGN',
          discountCodes: cart.discountCodes || [],
          shippingRates: cart.shippingRates || [],
          needsShipping: cart.needsShipping || false,
          checkoutUrl: (cart.items || []).length ? '/checkout' : null,
        });
      },
      async initializeCart() {
        set({ isLoading: true });
        try {
          const cart = await fetchCartApi({ action: 'get' });
          get().syncCart(cart);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Cart request failed';
          if (message === 'SESSION_EXPIRED') {
            set({ ...emptyState, guestSnapshot: get().guestSnapshot, isLoading: false });
            return;
          }
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

        set({
          isLoading: true,
          couponFeedback: { action: null, code: null, message: null, status: 'idle' },
        });
        try {
          const cart = await fetchCartApi({ action: 'add', productId, quantity });
          get().syncCart(cart);
          set({ isCartOpen: true });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Cart request failed';
          if (message !== 'Cart request failed') {
            set({
              couponFeedback: {
                action: null,
                code: null,
                message,
                status: 'error',
              },
            });
          } else {
            console.error('WooCommerce cart operation failed:', error);
          }
        } finally {
          set({ isLoading: false });
        }
      },
      async removeFromCart(lineKey) {
        set({
          isLoading: true,
          couponFeedback: { action: null, code: null, message: null, status: 'idle' },
        });
        try {
          get().syncCart(await fetchCartApi({ action: 'remove', lineKey }));
        } catch (error) {
          console.error('WooCommerce cart operation failed:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      async updateQuantity(lineKey, quantity) {
        set({
          isLoading: true,
          couponFeedback: { action: null, code: null, message: null, status: 'idle' },
        });
        try {
          get().syncCart(await fetchCartApi({ action: 'update', lineKey, quantity }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Cart request failed';
          if (message !== 'Cart request failed') {
            set({
              couponFeedback: {
                action: null,
                code: null,
                message,
                status: 'error',
              },
            });
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

        set({
          isLoading: true,
          couponFeedback: {
            action: 'apply',
            code,
            message: null,
            status: 'idle',
          },
        });
        try {
          get().syncCart(await fetchCartApi({ action: 'applyCoupon', code }));
          set({
            couponFeedback: {
              action: 'apply',
              code: code.trim().toUpperCase(),
              message: `Coupon ${code.trim().toUpperCase()} applied.`,
              status: 'success',
            },
          });
          return null;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Cart request failed';
          if (message !== 'Cart request failed') {
            set({
              couponFeedback: {
                action: 'apply',
                code: code.trim().toUpperCase(),
                message,
                status: 'error',
              },
            });
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

        set({
          isLoading: true,
          couponFeedback: {
            action: 'remove',
            code,
            message: null,
            status: 'idle',
          },
        });
        try {
          get().syncCart(await fetchCartApi({ action: 'removeCoupon', code }));
          set({
            couponFeedback: {
              action: 'remove',
              code: code.trim().toUpperCase(),
              message: `Coupon ${code.trim().toUpperCase()} removed.`,
              status: 'success',
            },
          });
          return null;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Cart request failed';
          if (message !== 'Cart request failed') {
            set({
              couponFeedback: {
                action: 'remove',
                code: code.trim().toUpperCase(),
                message,
                status: 'error',
              },
            });
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
        // Ensure the loading overlay is always cleared after a server-driven
        // cart replacement (e.g. post-login merge) so the UI never stays stuck.
        set({ isLoading: false });
      },
      clearUserScopedState() {
        set({
          ...emptyState,
          guestSnapshot: get().guestSnapshot,
          isCartOpen: false,
          isLoading: false,
        });
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
    },
  ),
);
