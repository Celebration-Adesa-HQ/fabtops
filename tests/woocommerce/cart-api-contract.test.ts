import { beforeEach, describe, expect, it, vi } from 'vitest';

const { storeApiRequest } = vi.hoisted(() => ({
  storeApiRequest: vi.fn(),
}));

vi.mock('../../lib/woocommerce/store-api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/woocommerce/store-api')>('../../lib/woocommerce/store-api');
  return {
    ...actual,
    storeApiRequest,
  };
});

describe('WooCommerce cart API contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeApiRequest.mockResolvedValue({
      data: {
        items: [],
        coupons: [],
        totals: {
          total_items: '0',
          total_price: '0',
          currency_code: 'NGN',
          currency_minor_unit: 2,
        },
        shipping_rates: [],
        payment_methods: [],
        needs_shipping: false,
      },
      cartToken: 'cart-token-1',
      pagination: {},
    });
  });

  it('initializes the cart with GET /cart and no body', async () => {
    const { getCart } = await import('../../lib/woocommerce/cart');

    await getCart('cart-token-1', null);

    expect(storeApiRequest).toHaveBeenCalledWith('/cart', {
      cartToken: 'cart-token-1',
      bearerToken: null,
    });
  });

  it('sends customer addresses to POST /cart/update-customer', async () => {
    const { updateCartCustomer } = await import('../../lib/woocommerce/cart');

    await updateCartCustomer(
      'cart-token-1',
      {
        first_name: 'Ada',
        last_name: 'Okafor',
        address_1: '1 Marina Road',
        city: 'Lagos',
        country: 'NG',
        email: 'ada@example.com',
      },
      {
        first_name: 'Ada',
        last_name: 'Okafor',
        address_1: '1 Marina Road',
        city: 'Lagos',
        country: 'NG',
      },
      null,
    );

    expect(storeApiRequest).toHaveBeenCalledWith('/cart/update-customer', {
      method: 'POST',
      body: JSON.stringify({
        billing_address: {
          first_name: 'Ada',
          last_name: 'Okafor',
          address_1: '1 Marina Road',
          city: 'Lagos',
          country: 'NG',
          email: 'ada@example.com',
        },
        shipping_address: {
          first_name: 'Ada',
          last_name: 'Okafor',
          address_1: '1 Marina Road',
          city: 'Lagos',
          country: 'NG',
        },
      }),
      cartToken: 'cart-token-1',
      bearerToken: null,
    });
  });

  it('skips update-customer when both addresses are empty', async () => {
    const { updateCartCustomer } = await import('../../lib/woocommerce/cart');

    await updateCartCustomer('cart-token-1', {}, {}, null);

    expect(storeApiRequest).toHaveBeenCalledTimes(1);
    expect(storeApiRequest).toHaveBeenCalledWith('/cart', {
      cartToken: 'cart-token-1',
      bearerToken: null,
    });
  });
});
