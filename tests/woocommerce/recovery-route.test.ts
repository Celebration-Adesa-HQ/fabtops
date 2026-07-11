import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getStoreCheckoutOrder = vi.fn();
const getStoreOrder = vi.fn();
const submitStoreCheckoutOrder = vi.fn();
const cookieStore = {
  get: vi.fn(),
  set: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => cookieStore),
}));

vi.mock('@/lib/woocommerce/storefront', () => ({
  getStoreCheckoutOrder,
  getStoreOrder,
  submitStoreCheckoutOrder,
}));

vi.mock('@/lib/auth/session', () => ({
  getAccessToken: vi.fn(async () => 'customer-access-token'),
}));

describe('checkout recovery route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieStore.get.mockImplementation((name: string) => {
      if (name === 'woocommerce_cart_token') return { value: 'cart-token-1' };
      return undefined;
    });
  });

  it('uses the guest order endpoint when a billing email is supplied', async () => {
    getStoreOrder.mockResolvedValue({ id: 321, status: 'pending' });

    const { GET } = await import('../../app/api/checkout/recover/route');
    const request = new NextRequest(
      'https://fabtops.test/api/checkout/recover?orderId=321&key=wc_order_abc&billingEmail=guest@example.com',
    );

    const response = await GET(request);
    const body = await response.json();

    expect(getStoreOrder).toHaveBeenCalledWith('321', 'wc_order_abc', 'guest@example.com');
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('uses the checkout-order endpoint when billing email is omitted', async () => {
    getStoreCheckoutOrder.mockResolvedValue({ id: 321, status: 'pending' });

    const { GET } = await import('../../app/api/checkout/recover/route');
    const request = new NextRequest(
      'https://fabtops.test/api/checkout/recover?orderId=321&key=wc_order_abc',
    );

    const response = await GET(request);

    expect(getStoreCheckoutOrder).toHaveBeenCalledWith('321', 'wc_order_abc');
    expect(response.status).toBe(200);
  });

  it('retries payment for an existing order through the checkout-order endpoint', async () => {
    submitStoreCheckoutOrder.mockResolvedValue({
      checkout: {
        orderId: 321,
        status: 'pending',
        paymentStatus: 'pending',
        redirectUrl: 'https://payments.example.com/authorize',
      },
      cartToken: 'cart-token-2',
    });

    const { POST } = await import('../../app/api/checkout/recover/route');
    const request = new NextRequest('https://fabtops.test/api/checkout/recover', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        orderId: '321',
        key: 'wc_order_abc',
        billingEmail: 'guest@example.com',
        paymentMethod: 'paystack',
        paymentData: [],
        billingAddress: {
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
        shippingAddress: {
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

    expect(submitStoreCheckoutOrder).toHaveBeenCalledWith(
      '321',
      expect.objectContaining({
        key: 'wc_order_abc',
        billing_email: 'guest@example.com',
        payment_method: 'paystack',
      }),
      'cart-token-1',
      'customer-access-token',
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      'woocommerce_cart_token',
      'cart-token-2',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });
});
