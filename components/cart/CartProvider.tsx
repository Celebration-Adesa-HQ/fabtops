'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface CartItem {
  id: string;
  variantId: string;
  title: string;
  handle: string;
  price: string;
  quantity: number;
  image: string;
}

interface CartData {
  items: CartItem[];
  subtotal: number;
  totalAmount: number;
  discountCodes: Array<{ code: string; applicable: boolean }>;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  applyDiscountCode: (code: string) => Promise<void>;
  removeDiscountCode: (code: string) => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  totalItems: number;
  subtotal: number;
  totalAmount: number;
  discountCodes: Array<{ code: string; applicable: boolean }>;
  checkoutUrl: string | null;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountCodes, setDiscountCodes] = useState<Array<{ code: string; applicable: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const syncCart = (cart: CartData) => {
    setItems(cart.items || []);
    setSubtotal(cart.subtotal || 0);
    setTotalAmount(cart.totalAmount || 0);
    setDiscountCodes(cart.discountCodes || []);
  };

  const fetchCartApi = async (body: Record<string, unknown>) => {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || 'Cart request failed');
    return result.data as CartData;
  };

  useEffect(() => {
    fetchCartApi({ action: 'get' })
      .then(syncCart)
      .catch((error) => console.error('Unable to load WooCommerce cart:', error))
      .finally(() => setIsLoading(false));
  }, []);

  const runCartAction = async (body: Record<string, unknown>) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      syncCart(await fetchCartApi(body));
    } catch (error) {
      console.error('WooCommerce cart operation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (variantId: string, quantity = 1) => {
    const productId = Number(variantId);
    if (!Number.isInteger(productId) || productId <= 0) {
      console.error('Invalid WooCommerce product or variation ID');
      return;
    }
    await runCartAction({ action: 'add', productId, quantity });
    setIsCartOpen(true);
  };

  const removeFromCart = (lineKey: string) => runCartAction({ action: 'remove', lineKey });
  const updateQuantity = (lineKey: string, quantity: number) => runCartAction({ action: 'update', lineKey, quantity });
  const applyDiscountCode = (code: string) => runCartAction({ action: 'applyCoupon', code });
  const removeDiscountCode = (code: string) => runCartAction({ action: 'removeCoupon', code });
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{
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
      discountCodes,
      checkoutUrl: items.length ? '/checkout' : null,
      isLoading,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
