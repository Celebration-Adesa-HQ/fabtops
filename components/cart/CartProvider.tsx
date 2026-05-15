'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  variantId: string;
  title: string;
  handle: string;
  price: string;
  quantity: number;
  image: string;
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
  discountCodes: { code: string; applicable: boolean }[];
  checkoutUrl: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountCodes, setDiscountCodes] = useState<{ code: string; applicable: boolean }[]>([]);
  
  const { customer, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const fetchCartApi = async (body: any) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  };

  // Determine storage key based on user
  const storageKey = React.useMemo(() => {
    if (!customer?.id) return null;
    const safeId = customer.id.replace(/[^a-zA-Z0-9]/g, '_');
    return `fabtops_cart_id_${safeId}`;
  }, [customer]);

  const refreshCart = async (id: string) => {
    try {
      const cart = await fetchCartApi({ action: 'get', cartId: id });

      if (cart) {
        setCheckoutUrl(cart.checkoutUrl);
        setSubtotal(parseFloat(cart.cost.subtotalAmount.amount));
        setTotalAmount(parseFloat(cart.cost.totalAmount.amount));
        setDiscountCodes(cart.discountCodes || []);
        
        const mappedItems = cart.lines.edges.map((edge: any) => ({
          id: edge.node.id,
          variantId: edge.node.merchandise.id,
          title: edge.node.merchandise.product.title,
          handle: edge.node.merchandise.product.handle,
          price: edge.node.merchandise.price.amount,
          quantity: edge.node.quantity,
          image: edge.node.merchandise.product.images.edges[0]?.node.url
        }));
        
        setItems(mappedItems);
      } else if (storageKey) {
        localStorage.removeItem(storageKey);
        setCartId(null);
        setItems([]);
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
    }
  };

  const createCart = async () => {
    try {
      const cart = await fetchCartApi({ action: 'create', lines: [] });
      const newCartId = cart.id;
      if (storageKey) {
        localStorage.setItem(storageKey, newCartId);
      }
      setCartId(newCartId);
      setCheckoutUrl(cart.checkoutUrl);
      return newCartId;
    } catch (error) {
      console.error('Error creating cart:', error);
      return null;
    }
  };

  // Initialize/Refresh cart when user or storageKey changes
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setItems([]);
      setCartId(null);
      setCheckoutUrl(null);
      setSubtotal(0);
      setTotalAmount(0);
      setDiscountCodes([]);
      return;
    }

    if (storageKey) {
      const savedCartId = localStorage.getItem(storageKey);
      if (savedCartId) {
        setCartId(savedCartId);
        refreshCart(savedCartId);
      }
    }
  }, [storageKey, isAuthenticated, authLoading]);

  const addToCart = async (variantId: string, quantity = 1) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }

    let currentCartId = cartId;
    if (!currentCartId) {
      currentCartId = await createCart();
    }

    if (currentCartId) {
      try {
        await fetchCartApi({
          action: 'add',
          cartId: currentCartId,
          lines: [{ merchandiseId: variantId, quantity }]
        });
        await refreshCart(currentCartId);
        setIsCartOpen(true);
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!isAuthenticated) return;
    
    if (cartId) {
      try {
        await fetchCartApi({
          action: 'remove',
          cartId,
          lineIds: [itemId]
        });
        await refreshCart(cartId);
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!isAuthenticated) return;

    if (cartId) {
      try {
        await fetchCartApi({
          action: 'update',
          cartId,
          lineId: itemId,
          quantity
        });
        await refreshCart(cartId);
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    }
  };

  const applyDiscountCode = async (code: string) => {
    if (!cartId) return;
    try {
      await fetchCartApi({
        action: 'updateDiscount',
        cartId,
        discountCodes: [code]
      });
      await refreshCart(cartId);
    } catch (error) {
      console.error('Error applying discount:', error);
    }
  };

  const removeDiscountCode = async (code: string) => {
    if (!cartId) return;
    try {
      const remainingCodes = discountCodes
        .filter(dc => dc.code !== code)
        .map(dc => dc.code);
      
      await fetchCartApi({
        action: 'updateDiscount',
        cartId,
        discountCodes: remainingCodes
      });
      await refreshCart(cartId);
    } catch (error) {
      console.error('Error removing discount:', error);
    }
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
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
        checkoutUrl
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * Helper to enhance the Shopify checkout URL with a custom return path.
 * This is useful for redirecting users back to a specific part of your headless site
 * after they interact with the payment gateway (like Paystack).
 */
export function getEnhancedCheckoutUrl(url: string | null, returnPath: string = '/shop') {
  if (!url) return null;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const returnUrl = `${baseUrl}${returnPath}`;
  
  try {
    const checkoutObj = new URL(url);
    checkoutObj.searchParams.set('return_to', returnUrl);
    // Automatically bypass Shopify Storefront Password
    checkoutObj.searchParams.set('password', 'stunti');
    return checkoutObj.toString();
  } catch (e) {
    return url;
  }
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
