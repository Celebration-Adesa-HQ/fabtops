import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkoutSchema } from '../../lib/schemas';

const { storeApiRequest } = vi.hoisted(() => ({
  storeApiRequest: vi.fn(),
}));

vi.mock('../../lib/woocommerce/store-api', () => ({
  storeApiRequest,
}));

import {
  assertPaymentMethodAvailable,
  getCheckoutDraft,
  normalizeCheckoutResult,
  submitCheckout,
  updateCheckout,
} from '../../lib/woocommerce/checkout';

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('loads the current draft checkout order with the cart token', async () => {
    storeApiRequest.mockResolvedValueOnce({
      data: {
        order_id: 146,
        status: 'checkout-draft',
        order_key: 'wc_order_VPffqyvgWVqWL',
      },
      cartToken: 'cart-token-2',
      pagination: {},
    });

    await expect(getCheckoutDraft('cart-token-1')).resolves.toEqual({
      checkout: {
        order_id: 146,
        status: 'checkout-draft',
        order_key: 'wc_order_VPffqyvgWVqWL',
      },
      cartToken: 'cart-token-2',
    });

    expect(storeApiRequest).toHaveBeenCalledWith('/checkout', expect.objectContaining({
      cartToken: 'cart-token-1',
      cache: 'no-store',
    }));
  });

  it('persists checkout payment method through the checkout update endpoint', async () => {
    storeApiRequest.mockResolvedValueOnce({
      data: {
        order_id: 146,
        status: 'checkout-draft',
        order_key: 'wc_order_VPffqyvgWVqWL',
        payment_method: 'paystack',
      },
      cartToken: 'cart-token-2',
      pagination: {},
    });

    await expect(updateCheckout('cart-token-1', {
      payment_method: 'paystack',
    })).resolves.toEqual({
      checkout: {
        order_id: 146,
        status: 'checkout-draft',
        order_key: 'wc_order_VPffqyvgWVqWL',
        payment_method: 'paystack',
      },
      cartToken: 'cart-token-2',
    });

    expect(storeApiRequest).toHaveBeenCalledWith('/checkout', {
      method: 'PUT',
      cartToken: 'cart-token-1',
      bearerToken: undefined,
      query: undefined,
      body: JSON.stringify({
        payment_method: 'paystack',
      }),
    });
  });

  it('persists checkout notes and additional fields with totals recalculation when requested', async () => {
    storeApiRequest.mockResolvedValueOnce({
      data: {
        order_id: 146,
        status: 'checkout-draft',
        order_key: 'wc_order_VPffqyvgWVqWL',
        customer_note: 'Leave package on back porch',
        additional_fields: {
          'plugin-namespace/leave-on-porch': true,
        },
      },
      cartToken: 'cart-token-2',
      pagination: {},
    });

    await expect(updateCheckout('cart-token-1', {
      order_notes: 'Leave package on back porch',
      additional_fields: {
        'plugin-namespace/leave-on-porch': true,
      },
      calcTotals: true,
    })).resolves.toEqual({
      checkout: {
        order_id: 146,
        status: 'checkout-draft',
        order_key: 'wc_order_VPffqyvgWVqWL',
        customer_note: 'Leave package on back porch',
        additional_fields: {
          'plugin-namespace/leave-on-porch': true,
        },
      },
      cartToken: 'cart-token-2',
    });

    expect(storeApiRequest).toHaveBeenCalledWith('/checkout', {
      method: 'PUT',
      cartToken: 'cart-token-1',
      bearerToken: undefined,
      query: {
        __experimental_calc_totals: true,
      },
      body: JSON.stringify({
        order_notes: 'Leave package on back porch',
        additional_fields: {
          'plugin-namespace/leave-on-porch': true,
        },
      }),
    });
  });

  it('processes payment through the checkout endpoint using the current cart token', async () => {
    storeApiRequest.mockResolvedValueOnce({
      data: {
        order_id: 146,
        status: 'pending',
        order_key: 'wc_order_VPffqyvgWVqWL',
        payment_result: {
          payment_status: 'pending',
          payment_details: [],
          redirect_url: 'https://payments.example.com/authorize',
        },
      },
      cartToken: 'cart-token-3',
      pagination: {},
    });

    const payload = {
      billing_address: address,
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
      customer_note: 'Leave package with concierge',
    } as const;

    await expect(submitCheckout('cart-token-1', payload)).resolves.toEqual({
      checkout: {
        orderId: 146,
        status: 'pending',
        paymentStatus: 'pending',
        redirectUrl: 'https://payments.example.com/authorize',
      },
      cartToken: 'cart-token-3',
    });

    expect(storeApiRequest).toHaveBeenCalledTimes(1);
    expect(storeApiRequest).toHaveBeenCalledWith('/checkout', {
      method: 'POST',
      cartToken: 'cart-token-1',
      bearerToken: undefined,
      body: JSON.stringify({
        billing_address: payload.billing_address,
        shipping_address: payload.shipping_address,
        payment_method: 'paystack',
        payment_data: [],
        customer_note: 'Leave package with concierge',
      }),
    });
    expect(storeApiRequest).not.toHaveBeenCalledWith(
      expect.stringMatching(/^\/checkout\/\d+$/),
      expect.anything(),
    );
  });
});
