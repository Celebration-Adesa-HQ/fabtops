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

export interface ShippingRateOption {
  rate_id: string;
  name: string;
  description: string;
  delivery_time: string;
  price: string;
  taxes: string;
  instance_id: number;
  method_id: string;
  meta_data: Array<{ key: string; value: string }>;
  selected: boolean;
  currency_code: string;
  currency_minor_unit: number;
}

export interface ShippingRatePackage {
  package_id: number;
  name: string;
  destination: Record<string, string>;
  shipping_rates: ShippingRateOption[];
}

export interface CartData {
  items: CartItem[];
  subtotal: number;
  totalAmount: number;
  currencyCode?: string;
  discountCodes: Array<{
    code: string;
    applicable: boolean;
    discountTotal: number;
    currencyCode: string;
  }>;
  shippingRates?: ShippingRatePackage[];
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
