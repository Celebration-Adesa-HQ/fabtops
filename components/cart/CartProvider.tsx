'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { shopifyFetch } from '@/lib/shopify';

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
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  totalItems: number;
  subtotal: number;
  checkoutUrl: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GET_CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                product {
                  title
                  handle
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      cost {
        subtotalAmount {
          amount
          currencyCode
        }
      }
    }
  }
`;

const ADD_TO_CART_MUTATION = `
  mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
      }
    }
  }
`;

const REMOVE_FROM_CART_MUTATION = `
  mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
      }
    }
  }
`;

const UPDATE_CART_QUANTITY_MUTATION = `
  mutation updateCartQuantity($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
      }
    }
  }
`;

const CREATE_CART_MUTATION = `
  mutation createCart($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
    }
  }
`;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [subtotal, setSubtotal] = useState(0);

  // Initialize cart from localStorage
  useEffect(() => {
    const savedCartId = localStorage.getItem('fabtops_cart_id');
    if (savedCartId) {
      setCartId(savedCartId);
      refreshCart(savedCartId);
    }
  }, []);

  const refreshCart = async (id: string) => {
    try {
      const data: any = await shopifyFetch({
        query: GET_CART_QUERY,
        variables: { cartId: id }
      });

      if (data?.cart) {
        setCheckoutUrl(data.cart.checkoutUrl);
        setSubtotal(parseFloat(data.cart.cost.subtotalAmount.amount));
        
        const mappedItems = data.cart.lines.edges.map((edge: any) => ({
          id: edge.node.id,
          variantId: edge.node.merchandise.id,
          title: edge.node.merchandise.product.title,
          handle: edge.node.merchandise.product.handle,
          price: edge.node.merchandise.price.amount,
          quantity: edge.node.quantity,
          image: edge.node.merchandise.product.images.edges[0]?.node.url
        }));
        
        setItems(mappedItems);
      } else {
        // Cart might be expired
        localStorage.removeItem('fabtops_cart_id');
        setCartId(null);
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
    }
  };

  const createCart = async () => {
    try {
      const data: any = await shopifyFetch({
        query: CREATE_CART_MUTATION,
        variables: { input: {} }
      });
      const newCartId = data.cartCreate.cart.id;
      localStorage.setItem('fabtops_cart_id', newCartId);
      setCartId(newCartId);
      setCheckoutUrl(data.cartCreate.cart.checkoutUrl);
      return newCartId;
    } catch (error) {
      console.error('Error creating cart:', error);
      return null;
    }
  };

  const addToCart = async (variantId: string, quantity = 1) => {
    let currentCartId = cartId;
    if (!currentCartId) {
      currentCartId = await createCart();
    }

    if (currentCartId) {
      try {
        await shopifyFetch({
          query: ADD_TO_CART_MUTATION,
          variables: {
            cartId: currentCartId,
            lines: [{ merchandiseId: variantId, quantity }]
          }
        });
        await refreshCart(currentCartId);
        setIsCartOpen(true);
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (cartId) {
      try {
        await shopifyFetch({
          query: REMOVE_FROM_CART_MUTATION,
          variables: {
            cartId,
            lineIds: [itemId]
          }
        });
        await refreshCart(cartId);
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (cartId) {
      try {
        await shopifyFetch({
          query: UPDATE_CART_QUANTITY_MUTATION,
          variables: {
            cartId,
            lines: [{ id: itemId, quantity }]
          }
        });
        await refreshCart(cartId);
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
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
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        checkoutUrl
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
