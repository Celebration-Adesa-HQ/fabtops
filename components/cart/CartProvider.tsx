'use client';

import type { ReactNode } from 'react';
import { useCartStore } from '@/stores/use-cart-store';

interface CartContextType {
  items: ReturnType<typeof useCartStore.getState>['items'];
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  applyDiscountCode: (code: string) => Promise<string | null>;
  removeDiscountCode: (code: string) => Promise<string | null>;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  totalItems: number;
  subtotal: number;
  totalAmount: number;
  currencyCode: string;
  discountCodes: ReturnType<typeof useCartStore.getState>['discountCodes'];
  couponFeedback: ReturnType<typeof useCartStore.getState>['couponFeedback'];
  checkoutUrl: string | null;
  isLoading: boolean;
}

export function CartProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useCart(): CartContextType {
  const items = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const applyDiscountCode = useCartStore((state) => state.applyDiscountCode);
  const removeDiscountCode = useCartStore((state) => state.removeDiscountCode);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);
  const subtotal = useCartStore((state) => state.subtotal);
  const totalAmount = useCartStore((state) => state.totalAmount);
  const currencyCode = useCartStore((state) => state.currencyCode);
  const discountCodes = useCartStore((state) => state.discountCodes);
  const couponFeedback = useCartStore((state) => state.couponFeedback);
  const checkoutUrl = useCartStore((state) => state.checkoutUrl);
  const isLoading = useCartStore((state) => state.isLoading);
  const totalItems = useCartStore((state) => state.totalItems());

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyDiscountCode,
    removeDiscountCode,
    isCartOpen,
    setIsCartOpen,
    totalItems,
    subtotal,
    totalAmount,
    currencyCode,
    discountCodes,
    couponFeedback,
    checkoutUrl,
    isLoading,
  };
}
