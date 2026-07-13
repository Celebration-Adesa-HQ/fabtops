import { describe, expect, it } from 'vitest';
import { mapStoreCart } from '../../lib/woocommerce/cart';
import { cartActionSchema } from '../../lib/schemas';

const cart = {
  items: [{
    key: 'line-key',
    id: 101,
    quantity: 2,
    name: 'Rose Top - Medium',
    permalink: 'https://shop.example.com/product/rose-top/',
    images: [{ src: 'https://shop.example.com/rose.jpg', alt: 'Rose Top' }],
    prices: { price: '125000', currency_code: 'NGN', currency_minor_unit: 2 },
    variation: [{ attribute: 'Size', value: 'M' }],
  }],
  coupons: [{ code: 'welcome10', totals: { total_discount: '12500', currency_code: 'NGN', currency_minor_unit: 2 } }],
  totals: {
    total_items: '250000',
    total_price: '237500',
    currency_code: 'NGN',
    currency_minor_unit: 2,
  },
  shipping_rates: [],
  payment_methods: ['paystack'],
  needs_shipping: true,
};

describe('WooCommerce cart', () => {
  it('normalizes Store API cart values for the existing cart context', () => {
    expect(mapStoreCart(cart)).toMatchObject({
      items: [{
        id: 'line-key',
        variantId: '101',
        handle: 'rose-top',
        price: '1250.00',
        quantity: 2,
      }],
      subtotal: 2500,
      totalAmount: 2375,
      discountCodes: [{
        code: 'WELCOME10',
        applicable: true,
        discountTotal: 125,
        currencyCode: 'NGN',
      }],
      paymentMethods: ['paystack'],
    });
  });

  it('normalizes coupon discount totals using Woo minor-unit metadata', () => {
    const mapped = mapStoreCart(cart);

    expect(mapped.discountCodes).toEqual([
      {
        code: 'WELCOME10',
        applicable: true,
        discountTotal: 125,
        currencyCode: 'NGN',
      },
    ]);
  });

  it('accepts a valid add action with numeric WooCommerce IDs', () => {
    expect(cartActionSchema.safeParse({ action: 'add', productId: 101, quantity: 2 }).success).toBe(true);
  });

  it('rejects malformed cart actions instead of accepting arbitrary lines', () => {
    expect(cartActionSchema.safeParse({ action: 'add', productId: 'legacy-product-id', quantity: 0 }).success).toBe(false);
  });
});
