import { createHmac } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const verifyPaystackPayment = vi.fn();

vi.mock('@/lib/paystack/env', () => ({
  getPaystackEnv: vi.fn(() => ({
    webhookSecret: 'whsec_test',
  })),
}));

vi.mock('@/lib/paystack/checkout', () => ({
  verifyPaystackPayment,
}));

describe('paystack webhook route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates the order once for a valid signed charge.success webhook', async () => {
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

    const payload = JSON.stringify({
      event: 'charge.success',
      data: {
        reference: 'fabtops_ref_123',
      },
    });

    const signature = createHmac('sha512', 'whsec_test')
      .update(payload)
      .digest('hex');

    const { POST } = await import('../../app/api/paystack/webhook/route');
    const response = await POST(
      new Request('https://fabtops.test/api/paystack/webhook', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-paystack-signature': signature,
        },
        body: payload,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(verifyPaystackPayment).toHaveBeenCalledWith('fabtops_ref_123');
    expect(body.success).toBe(true);
  });

  it('rejects invalid webhook signatures', async () => {
    const { POST } = await import('../../app/api/paystack/webhook/route');
    const response = await POST(
      new Request('https://fabtops.test/api/paystack/webhook', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-paystack-signature': 'invalid',
        },
        body: JSON.stringify({
          event: 'charge.success',
          data: {
            reference: 'fabtops_ref_123',
          },
        }),
      }),
    );

    expect(response.status).toBe(401);
    expect(verifyPaystackPayment).not.toHaveBeenCalled();
  });
});
