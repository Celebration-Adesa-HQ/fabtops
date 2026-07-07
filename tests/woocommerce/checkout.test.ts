import { describe, expect, it } from 'vitest';
import { checkoutSchema } from '../../lib/schemas';
import { assertPaymentMethodAvailable, normalizeCheckoutResult } from '../../lib/woocommerce/checkout';

const address = {
  first_name: 'Ada',
  last_name: 'Okafor',
  address_1: '1 Marina Road',
  city: 'Lagos',
  state: 'LA',
  postcode: '100001',
  country: 'NG',
  email: 'ada@example.com',
  phone: '+2348000000000',
};

describe('WooCommerce checkout', () => {
  it('validates a complete guest checkout payload', () => {
    expect(checkoutSchema.safeParse({
      billing_address: address,
      shipping_address: address,
      payment_method: 'paystack',
      payment_data: [],
    }).success).toBe(true);
  });

  it('fails closed when Paystack is unavailable from WooCommerce', () => {
    expect(() => assertPaymentMethodAvailable(['bacs'], 'paystack')).toThrow('PAYMENT_GATEWAY_UNAVAILABLE');
  });

  it('removes the order key from the browser-facing checkout result', () => {
    expect(normalizeCheckoutResult({
      order_id: 123,
      status: 'pending',
      order_key: 'wc_order_secret',
      payment_result: {
        payment_status: 'pending',
        payment_details: [],
        redirect_url: 'https://payments.example.com/authorize',
      },
    })).toEqual({
      orderId: 123,
      status: 'pending',
      paymentStatus: 'pending',
      redirectUrl: 'https://payments.example.com/authorize',
    });
  });
});
