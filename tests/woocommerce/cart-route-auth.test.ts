import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const cookieStore = {
  get: vi.fn(),
  set: vi.fn(),
};

const getCart = vi.fn();
const updateCartCustomer = vi.fn();
const updateWooCustomer = vi.fn();
const getServerAuthSession = vi.fn();
const ensureWooCustomerLink = vi.fn();
const applyCartCoupon = vi.fn();
const removeCartCoupon = vi.fn();

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
  addCartItem: vi.fn(),
  applyCartCoupon,
  getCart,
  removeCartCoupon,
  removeCartItem: vi.fn(),
  selectShippingRate: vi.fn(),
  updateCartCustomer,
  updateCartItem: vi.fn(),
}));

vi.mock('@/lib/woocommerce/customers', () => ({
  updateCustomer: updateWooCustomer,
}));

describe('cart route customer auth bridge', () => {
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
        firstName: 'Ada',
        lastName: 'Lovelace',
        wooCustomerId: '18',
      },
    });
    ensureWooCustomerLink.mockResolvedValue({
      wooCustomerId: '18',
      customer: {
        id: 18,
        email: 'ada@example.com',
        first_name: 'Ada',
        last_name: 'Lovelace',
        billing: {
          first_name: 'Ada',
          last_name: 'Lovelace',
          address_1: '1 Marina Road',
          city: 'Lagos',
          state: 'LA',
          postcode: '100001',
          country: 'NG',
          email: 'ada@example.com',
          phone: '+2348000000000',
        },
        shipping: {
          first_name: 'Ada',
          last_name: 'Lovelace',
          address_1: '1 Marina Road',
          city: 'Lagos',
          state: 'LA',
          postcode: '100001',
          country: 'NG',
        },
      },
    });
    updateCartCustomer.mockImplementation(async (cartToken: string | null) => ({
      cart: {
        items: [],
        subtotal: 0,
        totalAmount: 0,
        discountCodes: [],
      },
      cartToken: cartToken || 'cart-token-1',
    }));
    updateWooCustomer.mockResolvedValue({
      id: 18,
      email: 'ada@example.com',
      first_name: 'Ada',
      last_name: 'Lovelace',
      billing: {},
      shipping: {},
    });
  });

  it('rejects unauthenticated cart access', async () => {
    getServerAuthSession.mockResolvedValue(null);

    const { POST } = await import('../../app/api/cart/route');
    const request = new NextRequest('https://fabtops.test/api/cart', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'get' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toMatchObject({
      success: false,
      error: 'SESSION_EXPIRED',
    });
    expect(getCart).not.toHaveBeenCalled();
  });

  it('loads the authenticated cart without sending customer addresses to the base cart endpoint', async () => {
    getCart.mockResolvedValue({
      cart: {
        items: [],
        subtotal: 0,
        totalAmount: 0,
        discountCodes: [],
      },
      cartToken: 'cart-token-2',
    });

    const { POST } = await import('../../app/api/cart/route');
    const request = new NextRequest('https://fabtops.test/api/cart', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'get' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(getCart).toHaveBeenCalledWith('cart-token-1', null);
    expect(updateCartCustomer).not.toHaveBeenCalled();
    expect(cookieStore.set).toHaveBeenCalledWith(
      'woocommerce_cart_token',
      'cart-token-2',
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('bootstraps a cart token before customer updates when the cart cookie is missing', async () => {
    cookieStore.get.mockImplementation(() => undefined);
    getCart.mockResolvedValueOnce({
      cart: {
        items: [],
        subtotal: 0,
        totalAmount: 0,
        discountCodes: [],
      },
      cartToken: 'bootstrapped-cart-token',
    });
    updateCartCustomer.mockResolvedValue({
      cart: {
        items: [],
        subtotal: 0,
        totalAmount: 0,
        discountCodes: [],
      },
      cartToken: 'bootstrapped-cart-token',
    });

    const { POST } = await import('../../app/api/cart/route');
    const request = new NextRequest('https://fabtops.test/api/cart', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        action: 'updateCustomer',
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
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(getCart).toHaveBeenCalledWith(null, null);
    expect(updateCartCustomer).toHaveBeenCalledWith(
      'bootstrapped-cart-token',
      expect.objectContaining({ first_name: 'Ada' }),
      expect.objectContaining({ first_name: 'Ada' }),
      null,
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      'woocommerce_cart_token',
      'bootstrapped-cart-token',
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('normalizes coupon codes before applying them', async () => {
    applyCartCoupon.mockResolvedValue({
      cart: {
        items: [],
        subtotal: 2500,
        totalAmount: 2375,
        currencyCode: 'NGN',
        discountCodes: [{
          code: 'WELCOME10',
          applicable: true,
          discountTotal: 125,
          currencyCode: 'NGN',
        }],
      },
      cartToken: 'cart-token-1',
    });

    const { POST } = await import('../../app/api/cart/route');
    const request = new NextRequest('https://fabtops.test/api/cart', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'applyCoupon', code: ' welcome10 ' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(applyCartCoupon).toHaveBeenCalledWith('cart-token-1', 'WELCOME10', null);
    expect(body.data.discountCodes).toEqual([
      expect.objectContaining({
        code: 'WELCOME10',
        discountTotal: 125,
      }),
    ]);
  });

  it('returns user-facing 422 errors for invalid coupons', async () => {
    const { StoreApiError } = await import('../../lib/woocommerce/store-api');
    applyCartCoupon.mockRejectedValue(new StoreApiError(400, 'WooCommerce Store API error 400: Coupon is not valid.'));

    const { POST } = await import('../../app/api/cart/route');
    const request = new NextRequest('https://fabtops.test/api/cart', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'applyCoupon', code: 'badcode' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body).toMatchObject({
      success: false,
      error: 'Coupon is not valid.',
    });
  });

  it('normalizes coupon codes before removing them', async () => {
    removeCartCoupon.mockResolvedValue({
      cart: {
        items: [],
        subtotal: 2500,
        totalAmount: 2500,
        currencyCode: 'NGN',
        discountCodes: [],
      },
      cartToken: 'cart-token-1',
    });

    const { POST } = await import('../../app/api/cart/route');
    const request = new NextRequest('https://fabtops.test/api/cart', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'removeCoupon', code: ' welcome10 ' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(removeCartCoupon).toHaveBeenCalledWith('cart-token-1', 'WELCOME10', null);
  });
});
