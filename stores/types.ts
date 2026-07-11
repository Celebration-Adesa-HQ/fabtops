'use client';

export interface SelectedOption {
  name: string;
  value: string;
}

export interface CartItem {
  id: string;
  variantId: string;
  title: string;
  handle: string;
  price: string;
  quantity: number;
  image: string;
  selectedOptions: SelectedOption[];
}

export interface CartData {
  items: CartItem[];
  subtotal: number;
  totalAmount: number;
  currencyCode?: string;
  discountCodes: Array<{ code: string; applicable: boolean }>;
  shippingRates?: unknown[];
  paymentMethods?: string[];
  needsShipping?: boolean;
}

export interface FavoriteProduct {
  id: string;
  variantId: string;
  title: string;
  handle: string;
  price: string;
  currencyCode: string;
  imageUrl: string;
  imageAlt: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  wooCustomerId?: string | null;
}

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';
