import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const cookieStore = {
  get: vi.fn(),
  set: vi.fn(),
};

const getServerAuthSession = vi.fn();
const ensureWooCustomerLink = vi.fn();
const getCart = vi.fn();
const submitCheckout = vi.fn();
const assertPaymentMethodAvailable = vi.fn();

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => cookieStore),
}));

vi.mock('@/lib/auth/session', () => ({
  getServerAuthSession,
}));

vi.mock('@/lib/auth/woo-customer', () => ({
  ensureWooCustomerLink,
}));

vi.mock('@/lib/security', () => ({
  validateCsrf: vi.fn(() => true),
}));

vi.mock('@/lib/woocommerce/cart', () => ({
  getCart,
}));

vi.mock('@/lib/woocommerce/checkout', () => ({
  submitCheckout,
  assertPaymentMethodAvailable,
}));

describe('checkout route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieStore.get.mockImplementation((name: string) => {
      if (name === 'woocommerce_cart_token') return { value: 'cart-token-1' };
      return undefined;
    });
    getServerAuthSession.mockResolvedValue({
      user: {
        id: 'user_12',
        email: 'ada@example.com',
        wooCustomerId: '18',
      },
    });
    ensureWooCustomerLink.mockResolvedValue({
      wooCustomerId: '18',
      customer: {
        id: 18,
        email: 'ada@example.com',
      },
    });
    assertPaymentMethodAvailable.mockReturnValue(undefined);
  });

  it('submits checkout with the refreshed cart token returned by cart initialization', async () => {
    getCart.mockResolvedValue({
      cart: {
        items: [
          {
            id: 'line-1',
            variantId: '101',
            title: 'Rose Top',
            handle: 'rose-top',
            price: '80.00',
            quantity: 1,
            image: '/rose.jpg',
            selectedOptions: [],
          },
        ],
        subtotal: 80,
        totalAmount: 80,
        discountCodes: [],
        paymentMethods: ['paystack'],
      },
      cartToken: 'cart-token-2',
    });
    submitCheckout.mockResolvedValue({
      checkout: {
        orderId: 321,
        status: 'pending',
        paymentStatus: 'pending',
        redirectUrl: 'https://payments.example.com/authorize',
      },
      cartToken: 'cart-token-3',
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
        payment_data: [],
        customer_note: '',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getCart).toHaveBeenCalledWith('cart-token-1', null);
    expect(submitCheckout).toHaveBeenCalledWith(
      'cart-token-2',
      expect.objectContaining({
        payment_method: 'paystack',
      }),
      null,
    );
    expect(response.headers.get('set-cookie')).toContain('woocommerce_cart_token=cart-token-3');
    expect(body.success).toBe(true);
  });

  it('accepts a Cart-Token header for guest checkout without requiring a session', async () => {
    cookieStore.get.mockReturnValue(undefined);
    getServerAuthSession.mockResolvedValue(null);
    getCart.mockResolvedValue({
      cart: {
        items: [
          {
            id: 'line-1',
            variantId: '101',
            title: 'Rose Top',
            handle: 'rose-top',
            price: '80.00',
            quantity: 1,
            image: '/rose.jpg',
            selectedOptions: [],
          },
        ],
        subtotal: 80,
        totalAmount: 80,
        discountCodes: [],
        paymentMethods: ['paystack'],
      },
      cartToken: 'guest-cart-token-2',
    });
    submitCheckout.mockResolvedValue({
      checkout: {
        orderId: 654,
        status: 'pending',
        paymentStatus: 'pending',
        redirectUrl: 'https://payments.example.com/guest-authorize',
      },
      cartToken: 'guest-cart-token-3',
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
        payment_data: [],
        customer_note: '',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getCart).toHaveBeenCalledWith('guest-cart-token-1', null);
    expect(ensureWooCustomerLink).not.toHaveBeenCalled();
    expect(submitCheckout).toHaveBeenCalledWith(
      'guest-cart-token-2',
      expect.objectContaining({
        payment_method: 'paystack',
      }),
      null,
    );
    expect(response.headers.get('set-cookie')).toContain('woocommerce_cart_token=guest-cart-token-3');
    expect(body.success).toBe(true);
  });
});
