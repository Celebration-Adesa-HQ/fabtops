import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const preparePaystackCheckout = vi.fn();

vi.mock('@/lib/security', () => ({
  validateCsrf: vi.fn(() => true),
}));

vi.mock('@/lib/paystack/checkout', () => ({
  CART_TOKEN_COOKIE: 'woocommerce_cart_token',
  preparePaystackCheckout,
}));

describe('checkout route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prepares direct Paystack checkout with the refreshed cart token returned by the server helper', async () => {
    preparePaystackCheckout.mockResolvedValue({
      checkout: {
        orderId: 321,
        reference: 'fabtops_ref_123',
        authorizationUrl: 'https://paystack.test/authorize',
      },
      cartToken: 'cart-token-2',
    });

    const { POST } = await import('../../app/api/checkout/route');
    const request = new NextRequest('https://fabtops.test/api/checkout', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: 'woocommerce_cart_token=cart-token-1',
      },
      body: JSON.stringify({
        billing_address: {
          first_name: 'Ada',
          last_name: 'Okafor',
          address_1: '1 Marina Road',
          city: 'Lagos',
          state: 'LA',
          postcode: '100001',
          country: 'NG',
          email: 'ada@example.com',
          phone: '+2348000000000',
        },
        shipping_address: {
          first_name: 'Ada',
          last_name: 'Okafor',
          address_1: '1 Marina Road',
          city: 'Lagos',
          state: 'LA',
          postcode: '100001',
          country: 'NG',
        },
        payment_method: 'paystack',
        selected_currency: 'NGN',
        payment_data: [],
        customer_note: '',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(preparePaystackCheckout).toHaveBeenCalledWith(
      'cart-token-1',
      expect.objectContaining({
        payment_method: 'paystack',
        selected_currency: 'NGN',
      }),
      null,
    );
    expect(response.headers.get('set-cookie')).toContain('woocommerce_cart_token=cart-token-2');
    expect(body.success).toBe(true);
    expect(body.reference).toBe('fabtops_ref_123');
    expect(body.authorizationUrl).toBe('https://paystack.test/authorize');
    expect(body.data).toBeUndefined();
  });

  it('accepts a Cart-Token header for guest checkout preparation', async () => {
    preparePaystackCheckout.mockResolvedValue({
      checkout: {
        orderId: 654,
        reference: 'fabtops_ref_guest',
        authorizationUrl: 'https://paystack.test/authorize',
      },
      cartToken: 'guest-cart-token-2',
    });

    const { POST } = await import('../../app/api/checkout/route');
    const request = new NextRequest('https://fabtops.test/api/checkout', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Cart-Token': 'guest-cart-token-1',
      },
      body: JSON.stringify({
        billing_address: {
          first_name: 'Ada',
          last_name: 'Okafor',
          address_1: '1 Marina Road',
          city: 'Lagos',
          state: 'LA',
          postcode: '100001',
          country: 'NG',
          email: 'guest@example.com',
          phone: '+2348000000000',
        },
        shipping_address: {
          first_name: 'Ada',
          last_name: 'Okafor',
          address_1: '1 Marina Road',
          city: 'Lagos',
          state: 'LA',
          postcode: '100001',
          country: 'NG',
        },
        payment_method: 'paystack',
        selected_currency: 'USD',
        payment_data: [],
        customer_note: '',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(preparePaystackCheckout).toHaveBeenCalledWith(
      'guest-cart-token-1',
      expect.objectContaining({
        selected_currency: 'USD',
      }),
      null,
    );
    expect(response.headers.get('set-cookie')).toContain('woocommerce_cart_token=guest-cart-token-2');
    expect(body.success).toBe(true);
  });

  it('does not require an order id and never falls back to Woo hosted redirect flow', async () => {
    preparePaystackCheckout.mockRejectedValue(new Error('PAYSTACK_UNSUPPORTED_CURRENCY'));

    const { POST } = await import('../../app/api/checkout/route');
    const request = new NextRequest('https://fabtops.test/api/checkout', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: 'woocommerce_cart_token=cart-token-1',
      },
      body: JSON.stringify({
        billing_address: {
          first_name: 'Ada',
          last_name: 'Okafor',
          address_1: '1 Marina Road',
          city: 'Lagos',
          state: 'LA',
          postcode: '100001',
          country: 'NG',
          email: 'ada@example.com',
          phone: '+2348000000000',
        },
        shipping_address: {
          first_name: 'Ada',
          last_name: 'Okafor',
          address_1: '1 Marina Road',
          city: 'Lagos',
          state: 'LA',
          postcode: '100001',
          country: 'NG',
        },
        payment_method: 'paystack',
        selected_currency: 'EUR',
        payment_data: [],
        customer_note: '',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.code).toBe('PAYSTACK_UNSUPPORTED_CURRENCY');
    expect(body.data).toBeUndefined();
    expect(body.redirectUrl).toBeUndefined();
  });
});
