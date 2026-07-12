import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { storeApiRequest } = vi.hoisted(() => ({
  storeApiRequest: vi.fn(),
}));

vi.mock('../../lib/woocommerce/store-api', () => ({
  storeApiRequest,
}));

describe('WooCommerce Storefront helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requests collection aggregates from the Store API with shopper-facing filter params', async () => {
    storeApiRequest.mockResolvedValue({
      data: {
        price_range: null,
        attribute_counts: [],
        rating_counts: [],
        taxonomy_counts: [],
      },
      cartToken: null,
    });

    const { getStoreProductCollectionData } = await import('../../lib/woocommerce/storefront');
    await getStoreProductCollectionData({
      category: 'dresses',
      calculate_price_range: true,
      calculate_rating_counts: true,
      calculate_taxonomy_counts: 'product_cat',
      'calculate_attribute_counts[0][taxonomy]': 'pa_size',
      'calculate_attribute_counts[0][query_type]': 'or',
    });

    expect(storeApiRequest).toHaveBeenCalledWith('/products/collection-data', {
      query: {
        category: 'dresses',
        calculate_price_range: true,
        calculate_rating_counts: true,
        calculate_taxonomy_counts: 'product_cat',
        'calculate_attribute_counts[0][taxonomy]': 'pa_size',
        'calculate_attribute_counts[0][query_type]': 'or',
      },
      next: { revalidate: 60, tags: ['woo-store-collection-data'] },
    });
  });

  it('loads product reviews from the Store API with product-scoped query params', async () => {
    storeApiRequest.mockResolvedValue({
      data: [],
      cartToken: null,
    });

    const { getStoreProductReviews } = await import('../../lib/woocommerce/storefront');
    await getStoreProductReviews({ product_id: '42', orderby: 'rating', order: 'desc', per_page: 5 });

    expect(storeApiRequest).toHaveBeenCalledWith('/products/reviews', {
      query: {
        product_id: '42',
        orderby: 'rating',
        order: 'desc',
        per_page: 5,
      },
      next: { revalidate: 60, tags: ['woo-product-reviews-42'] },
    });
  });

  it('loads pay-for-order details from the Store API order endpoint', async () => {
    storeApiRequest.mockResolvedValue({
      data: { id: 321, status: 'pending' },
      cartToken: null,
    });

    const { getStoreOrder } = await import('../../lib/woocommerce/storefront');
    await getStoreOrder(321, 'wc_order_abc', 'guest@example.com');

    expect(storeApiRequest).toHaveBeenCalledWith('/order/321', {
      query: {
        key: 'wc_order_abc',
        billing_email: 'guest@example.com',
      },
      cache: 'no-store',
    });
  });

  it('submits recovery payments through the checkout-order endpoint only', async () => {
    storeApiRequest.mockResolvedValue({
      data: {
        order_id: 321,
        status: 'pending',
        order_key: 'wc_order_abc',
        payment_result: {
          payment_status: 'pending',
          payment_details: [],
          redirect_url: 'https://payments.example.com/authorize',
        },
      },
      cartToken: 'cart-token-2',
      pagination: {},
    });

    const { submitStoreCheckoutOrder } = await import('../../lib/woocommerce/storefront');
    await submitStoreCheckoutOrder(321, {
      key: 'wc_order_abc',
      billing_email: 'guest@example.com',
      payment_method: 'paystack',
      payment_data: [],
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
    }, 'cart-token-1');

    expect(storeApiRequest).toHaveBeenCalledWith('/checkout/321', {
      method: 'POST',
      cartToken: 'cart-token-1',
      bearerToken: undefined,
      body: JSON.stringify({
        key: 'wc_order_abc',
        billing_email: 'guest@example.com',
        payment_method: 'paystack',
        payment_data: [],
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
      }),
    });
    expect(storeApiRequest).not.toHaveBeenCalledWith('/checkout', expect.anything());
  });

  it('loads attribute terms through the Store API attribute taxonomy endpoint', async () => {
    storeApiRequest.mockResolvedValue({
      data: [],
      cartToken: null,
    });

    const { getStoreProductAttributeTerms } = await import('../../lib/woocommerce/storefront');
    await getStoreProductAttributeTerms(2);

    expect(storeApiRequest).toHaveBeenCalledWith('/products/attributes/2/terms', {
      next: { revalidate: 300, tags: ['woo-store-attribute-terms-2'] },
    });
  });
});
