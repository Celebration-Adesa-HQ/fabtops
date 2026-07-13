import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildWooRestUrl } from '../../lib/woocommerce/rest-client';
import { fromMinorUnits, buildStoreApiUrl } from '../../lib/woocommerce/store-api';

const { apiGet, apiPost, WooCommerceRestApiMock } = vi.hoisted(() => {
  const apiGet = vi.fn();
  const apiPost = vi.fn();
  const WooCommerceRestApiMock = vi.fn(function MockWooClient() {
    return {
      get: apiGet,
      post: apiPost,
      put: vi.fn(),
      delete: vi.fn(),
      options: vi.fn(),
    };
  });

  return { apiGet, apiPost, WooCommerceRestApiMock };
});

vi.mock('@woocommerce/woocommerce-rest-api', () => ({
  default: WooCommerceRestApiMock,
}));

describe('WooCommerce clients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds an HTTPS REST URL with encoded query parameters', () => {
    expect(
      buildWooRestUrl(
        'https://shop.example.com/wp-json/wc/v3',
        '/products',
        { slug: 'rose top', per_page: 1 },
      ),
    ).toBe('https://shop.example.com/wp-json/wc/v3/products?slug=rose+top&per_page=1');
  });

  it('builds the package client from server env and performs GET requests', async () => {
    vi.stubEnv('WOOCOMMERCE_STORE_URL', 'https://shop.example.com');
    vi.stubEnv('WOOCOMMERCE_CONSUMER_KEY', 'ck_test');
    vi.stubEnv('WOOCOMMERCE_CONSUMER_SECRET', 'cs_test');
    vi.stubEnv('WOOCOMMERCE_API_VERSION', 'wc/v3');
    apiGet.mockResolvedValue({ data: [] });

    const { wooRequest } = await import('../../lib/woocommerce/rest-client');
    await wooRequest('/products', { query: { per_page: 1 } });

    expect(WooCommerceRestApiMock).toHaveBeenCalledWith({
      url: 'https://shop.example.com',
      consumerKey: 'ck_test',
      consumerSecret: 'cs_test',
      version: 'wc/v3',
      queryStringAuth: false,
      axiosConfig: { timeout: 30_000 },
    });
    expect(apiGet).toHaveBeenCalledWith('products', { per_page: '1' });

    vi.unstubAllEnvs();
  });

  it('builds a Store API URL without credentials', () => {
    expect(
      buildStoreApiUrl(
        'https://shop.example.com/wp-json/wc/store/v1',
        '/products',
        { search: 'silk top' },
      ),
    ).toBe('https://shop.example.com/wp-json/wc/store/v1/products?search=silk+top');
  });

  it('converts minor currency units using the supplied precision', () => {
    expect(fromMinorUnits('125000', 2)).toBe('1250.00');
    expect(fromMinorUnits('500', 0)).toBe('500');
  });

  it('dispatches write-capable wc/v3 requests through the package for customer CRUD', async () => {
    vi.stubEnv('WOOCOMMERCE_STORE_URL', 'https://shop.example.com');
    vi.stubEnv('WOOCOMMERCE_CONSUMER_KEY', 'ck_test');
    vi.stubEnv('WOOCOMMERCE_CONSUMER_SECRET', 'cs_test');
    vi.stubEnv('WOOCOMMERCE_API_VERSION', 'wc/v3');
    apiPost.mockResolvedValue({ data: { id: 12 } });

    const { wooRequest } = await import('../../lib/woocommerce/rest-client');
    const result = await wooRequest('/customers', {
      method: 'POST',
      data: { email: 'ada@example.com' },
    });

    expect(result).toEqual({ id: 12 });
    expect(apiPost).toHaveBeenCalledWith('customers', { email: 'ada@example.com' }, {});
  });
});

describe('Store API authentication', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('forwards a bearer token only when supplied by server code', async () => {
    vi.stubEnv('WOOCOMMERCE_STORE_URL', 'https://shop.example.com');
    vi.stubEnv('WOOCOMMERCE_CONSUMER_KEY', 'ck_example');
    vi.stubEnv('WOOCOMMERCE_CONSUMER_SECRET', 'cs_example');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    const { storeApiRequest } = await import('../../lib/woocommerce/store-api');

    await storeApiRequest('/cart', { bearerToken: 'opaque-access-token' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer opaque-access-token' }),
      }),
    );
  });
});
