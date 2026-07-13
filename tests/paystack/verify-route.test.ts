import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const verifyPaystackPayment = vi.fn();
const clearCheckoutCart = vi.fn();

vi.mock('@/lib/security', () => ({
  validateCsrf: vi.fn(() => true),
}));

vi.mock('@/lib/paystack/checkout', () => ({
  CART_TOKEN_COOKIE: 'woocommerce_cart_token',
  verifyPaystackPayment,
  clearCheckoutCart,
}));

describe('checkout verify route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('marks Woo order processing only after successful server-side verification', async () => {
    verifyPaystackPayment.mockResolvedValue({
      result: {
        orderId: 222,
        orderNumber: '222',
        status: 'processing',
        reference: 'fabtops_ref_123',
        amountMinor: 8000,
        currency: 'NGN',
        redirectUrl: '/checkout/success?reference=fabtops_ref_123&order=222',
      },
    });
    clearCheckoutCart.mockResolvedValue('cart-token-2');

    const { POST } = await import('../../app/api/checkout/verify/route');
    const request = new NextRequest('https://fabtops.test/api/checkout/verify', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: 'woocommerce_cart_token=cart-token-1',
      },
      body: JSON.stringify({
        reference: 'fabtops_ref_123',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(verifyPaystackPayment).toHaveBeenCalledWith('fabtops_ref_123');
    expect(clearCheckoutCart).toHaveBeenCalledWith('cart-token-1', null);
    expect(response.headers.get('set-cookie')).toContain('woocommerce_cart_token=');
    expect(body.data.status).toBe('processing');
  });

  it('marks verification failures as errors and does not trust the frontend callback', async () => {
    verifyPaystackPayment.mockRejectedValue(new Error('PAYMENT_AMOUNT_MISMATCH'));

    const { POST } = await import('../../app/api/checkout/verify/route');
    const request = new NextRequest('https://fabtops.test/api/checkout/verify', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        reference: 'fabtops_ref_123',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.code).toBe('PAYMENT_AMOUNT_MISMATCH');
    expect(clearCheckoutCart).not.toHaveBeenCalled();
  });
});
