import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mapStoreCart } from '../../lib/woocommerce/cart';

/** Minimal Store API cart shape used to test buy-now cart mapping */
const storeApiCart = {
  items: [
    {
      key: 'abc123',
      id: 42,
      quantity: 1,
      name: 'Rose Top',
      permalink: 'https://shop.example.com/product/rose-top/',
      images: [{ src: 'https://shop.example.com/rose-top.jpg', alt: 'Rose Top' }],
      prices: { currency_code: 'NGN', currency_minor_unit: 2, price: '125000' },
      variation: [],
    },
  ],
  coupons: [],
  totals: { currency_code: 'NGN', currency_minor_unit: 2, total_items: '125000', total_price: '125000' },
  shipping_rates: [],
  payment_methods: ['paystack'],
  needs_shipping: false,
};

describe('buy-now cart mapping', () => {
  it('maps a store cart with one item to the Storefront shape', () => {
    const cart = mapStoreCart(storeApiCart);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toMatchObject({
      id: 'abc123',
      variantId: '42',
      title: 'Rose Top',
      handle: 'rose-top',
      price: '1250.00',
      quantity: 1,
      image: 'https://shop.example.com/rose-top.jpg',
    });
  });

  it('calculates totalAmount in major currency units', () => {
    const cart = mapStoreCart(storeApiCart);
    expect(cart.totalAmount).toBe(1250);
    expect(cart.currencyCode).toBe('NGN');
  });

  it('exposes the paystack payment method from WooCommerce', () => {
    const cart = mapStoreCart(storeApiCart);
    expect(cart.paymentMethods).toContain('paystack');
  });
});
