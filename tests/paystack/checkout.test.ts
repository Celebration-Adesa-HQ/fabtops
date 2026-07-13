import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getCart } = vi.hoisted(() => ({
  getCart: vi.fn(),
}));

const { getProductBySlug } = vi.hoisted(() => ({
  getProductBySlug: vi.fn(),
}));

const {
  createPendingOrder,
  getOrderById,
  mergeOrderMetaData,
  paymentCompleteOrder,
  updateOrder,
} = vi.hoisted(() => ({
  createPendingOrder: vi.fn(),
  getOrderById: vi.fn(),
  mergeOrderMetaData: vi.fn((existing, updates) => [
    ...(existing || []),
    ...updates.map((update: { key: string; value: unknown }) => ({ key: update.key, value: update.value })),
  ]),
  paymentCompleteOrder: vi.fn(),
  updateOrder: vi.fn(),
}));

const {
  getPaystackEnv,
  initializeTransaction,
  verifyTransaction,
} = vi.hoisted(() => ({
  getPaystackEnv: vi.fn(),
  initializeTransaction: vi.fn(),
  verifyTransaction: vi.fn(),
}));

vi.mock('../../lib/woocommerce/cart', () => ({
  getCart,
}));

vi.mock('../../lib/auth/session', () => ({
  getServerAuthSession: vi.fn(async () => null),
}));

vi.mock('../../lib/woocommerce/products', () => ({
  getProductBySlug,
}));

vi.mock('../../lib/woocommerce/orders', () => ({
  createPendingOrder,
  getOrderById,
  mergeOrderMetaData,
  paymentCompleteOrder,
  updateOrder,
  getOrderMetaValue: vi.fn((metaData, key) => metaData?.find((item: { key: string }) => item.key === key)?.value),
}));

vi.mock('../../lib/paystack/env', () => ({
  getPaystackEnv,
}));

vi.mock('../../lib/paystack/client', () => ({
  initializeTransaction,
  verifyTransaction,
}));

describe('direct Paystack checkout helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPaystackEnv.mockReturnValue({
      secretKey: 'sk_test',
      webhookSecret: 'whsec_test',
      publicKey: 'pk_test',
      siteUrl: 'https://fabtops.test',
      apiBaseUrl: 'https://api.paystack.test',
    });
  });

  it('creates a pending Woo order directly from the current cart before Paystack initialization', async () => {
    getCart.mockResolvedValue({
      cartToken: 'cart-token-2',
      cart: {
        items: [
          {
            id: 'line-key-1',
            variantId: '901',
            title: 'Rose Top - Medium',
            handle: 'rose-top',
            price: '1250.00',
            quantity: 2,
            image: 'https://shop.example.com/rose.jpg',
            selectedOptions: [{ name: 'Size', value: 'M' }],
          },
        ],
        subtotal: 2500,
        totalAmount: 2375,
        currencyCode: 'NGN',
        discountCodes: [{ code: 'WELCOME10', applicable: true, discountTotal: 125, currencyCode: 'NGN' }],
        shippingRates: [{
          package_id: 0,
          name: 'Delivery',
          destination: {},
          shipping_rates: [{
            rate_id: 'flat_rate:1',
            name: 'Lagos Delivery',
            description: '',
            delivery_time: '1-2 business days',
            price: '2500',
            taxes: '0',
            instance_id: 1,
            method_id: 'flat_rate',
            meta_data: [],
            selected: true,
            currency_code: 'NGN',
            currency_minor_unit: 2,
          }],
        }],
        paymentMethods: ['paystack'],
        needsShipping: true,
      },
    });

    getProductBySlug.mockResolvedValue({
      id: '42',
      handle: 'rose-top',
      title: 'Rose Top',
      description: '',
      descriptionHtml: '',
      shortDescription: '',
      shortDescriptionHtml: '',
      sku: 'ROSE-TOP',
      productType: 'Tops',
      tags: [],
      brands: [],
      averageRating: 0,
      reviewCount: 0,
      featuredImage: null,
      gallery: [],
      price: { amountMinor: '125000', currencyCode: 'NGN', minorUnit: 2 },
      regularPrice: null,
      salePrice: null,
      priceRange: {
        min: { amountMinor: '125000', currencyCode: 'NGN', minorUnit: 2 },
        max: { amountMinor: '125000', currencyCode: 'NGN', minorUnit: 2 },
      },
      hasOptions: true,
      availability: { inStock: true, purchasable: true, onBackorder: false, stockStatus: 'instock' },
      options: [{ id: '1', name: 'Size', values: ['S', 'M'] }],
      categories: [],
      variationIds: ['901'],
      variations: [{
        id: '901',
        title: 'M',
        availability: { inStock: true, purchasable: true, onBackorder: false, stockStatus: 'instock' },
        selectedOptions: [{ name: 'Size', value: 'M' }],
        price: { amountMinor: '125000', currencyCode: 'NGN', minorUnit: 2 },
        regularPrice: null,
        salePrice: null,
        image: null,
      }],
      relatedProductIds: [],
      upsellProductIds: [],
      crossSellProductIds: [],
    });

    createPendingOrder.mockResolvedValue({
      id: 321,
      number: '321',
      status: 'pending',
      currency: 'NGN',
      total: '26.25',
      customer_id: 0,
      order_key: 'wc_order_321',
      customer_note: '',
      billing: {},
      shipping: {},
      line_items: [],
      meta_data: [],
    });

    initializeTransaction.mockResolvedValue({
      status: true,
      message: 'Authorization URL created',
      data: {
        authorization_url: 'https://paystack.test/authorize/321',
        access_code: 'ACCESS_CODE_321',
        reference: 'fabtops_ref_321',
      },
    });

    updateOrder.mockResolvedValue({
      id: 321,
      number: '321',
      status: 'pending',
      currency: 'NGN',
      total: '26.25',
      customer_id: 0,
      order_key: 'wc_order_321',
      customer_note: '',
      billing: {},
      shipping: {},
      line_items: [],
      meta_data: [],
    });

    const { preparePaystackCheckout, DIRECT_PAYSTACK_PAYMENT_METHOD_ID } = await import('../../lib/paystack/checkout');

    const result = await preparePaystackCheckout('cart-token-1', {
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
      selected_currency: 'NGN',
      payment_data: [],
      customer_note: 'Leave at the front desk',
      coupon_codes: ['WELCOME10'],
      selected_shipping_rate: {
        package_id: 0,
        rate_id: 'flat_rate:1',
      },
    });

    expect(createPendingOrder).toHaveBeenCalledWith(expect.objectContaining({
      status: 'pending',
      set_paid: false,
      payment_method: DIRECT_PAYSTACK_PAYMENT_METHOD_ID,
      coupon_lines: [{ code: 'WELCOME10' }],
      shipping_lines: [{
        method_id: 'flat_rate',
        method_title: 'Lagos Delivery',
        total: '25.00',
      }],
      line_items: [{
        product_id: 42,
        variation_id: 901,
        quantity: 2,
      }],
    }));
    expect(initializeTransaction).toHaveBeenCalledWith(expect.objectContaining({
      email: 'ada@example.com',
      amount: 2625,
      currency: 'NGN',
      metadata: expect.objectContaining({
        woo_order_id: 321,
      }),
    }));
    expect(updateOrder).toHaveBeenCalledWith(321, expect.objectContaining({
      meta_data: expect.arrayContaining([
        expect.objectContaining({ key: 'fabtops_paystack_reference' }),
        expect.objectContaining({ key: 'fabtops_order_key', value: 'wc_order_321' }),
      ]),
    }));
    expect(result.cartToken).toBe('cart-token-2');
    expect(result.checkout.orderId).toBe(321);
    expect(result.checkout.authorizationUrl).toBe('https://paystack.test/authorize/321');
  });

  it('verifies Paystack transactions idempotently and completes the Woo order once', async () => {
    verifyTransaction.mockResolvedValue({
      status: true,
      message: 'Verification successful',
      data: {
        status: 'success',
        reference: 'fabtops_ref_321',
        amount: 2625,
        currency: 'NGN',
        paid_at: '2026-07-13T10:00:00.000Z',
        metadata: {
          woo_order_id: 321,
        },
        gateway_response: 'Successful',
      },
    });

    getOrderById.mockResolvedValue({
      id: 321,
      number: '321',
      status: 'pending',
      currency: 'NGN',
      total: '26.25',
      customer_id: 0,
      order_key: 'wc_order_321',
      customer_note: '',
      billing: {},
      shipping: {},
      line_items: [],
      meta_data: [
        { key: 'fabtops_payment_state', value: 'initialized' },
        { key: 'fabtops_paystack_reference', value: 'fabtops_ref_321' },
        { key: 'fabtops_selected_currency', value: 'NGN' },
        { key: 'fabtops_paystack_amount_minor', value: 2625 },
      ],
    });

    paymentCompleteOrder.mockResolvedValue({
      id: 321,
      number: '321',
      status: 'processing',
      currency: 'NGN',
      total: '26.25',
      customer_id: 0,
      order_key: 'wc_order_321',
      customer_note: '',
      billing: {},
      shipping: {},
      line_items: [],
      meta_data: [],
    });

    updateOrder.mockResolvedValue({
      id: 321,
      number: '321',
      status: 'processing',
      currency: 'NGN',
      total: '26.25',
      customer_id: 0,
      order_key: 'wc_order_321',
      customer_note: '',
      billing: {},
      shipping: {},
      line_items: [],
      meta_data: [],
    });

    const { verifyPaystackPayment } = await import('../../lib/paystack/checkout');
    const result = await verifyPaystackPayment('fabtops_ref_321');

    expect(paymentCompleteOrder).toHaveBeenCalledWith(321, expect.objectContaining({
      transaction_id: 'fabtops_ref_321',
    }));
    expect(updateOrder).toHaveBeenCalledWith(321, expect.objectContaining({
      meta_data: expect.arrayContaining([
        expect.objectContaining({ key: 'fabtops_payment_state', value: 'verified' }),
      ]),
    }));
    expect(result.result.status).toBe('processing');
    expect(result.result.reference).toBe('fabtops_ref_321');
  });
});
