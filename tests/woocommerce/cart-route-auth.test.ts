import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const cookieStore = {
  get: vi.fn(),
  set: vi.fn(),
};

const getCart = vi.fn();
const updateCartCustomer = vi.fn();

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => cookieStore),
}));

vi.mock('@/lib/security', () => ({
  validateCsrf: vi.fn(() => true),
}));

vi.mock('@/lib/woocommerce/cart', () => ({
  addCartItem: vi.fn(),
  applyCartCoupon: vi.fn(),
  getCart,
  removeCartCoupon: vi.fn(),
  removeCartItem: vi.fn(),
  selectShippingRate: vi.fn(),
  updateCartCustomer,
  updateCartItem: vi.fn(),
}));

describe('cart route customer auth bridge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieStore.get.mockImplementation((name: string) => {
      if (name === 'woocommerce_cart_token') return { value: 'cart-token-1' };
      if (name === 'fabtops_access_token') return { value: 'customer-access-token' };
      return undefined;
    });
  });

  it('keeps cart reads guest/session-scoped when storefront auth is local only', async () => {
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
});
