import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { searchProducts } from '../../lib/woocommerce/products';
import type { RestProduct } from '../../lib/woocommerce/types';

const wooRequest = vi.fn();

vi.mock('../../lib/woocommerce/rest-client', () => ({
  wooRequest,
}));

const restProduct: Partial<RestProduct> = {
  id: 99,
  name: 'Mauve Cami',
  slug: 'mauve-cami',
  type: 'simple',
  status: 'publish',
  description: '<p>Elegant cami top.</p>',
  short_description: '',
  price: '850.00',
  regular_price: '950.00',
  stock_status: 'instock',
  purchasable: true,
  categories: [{ id: 1, name: 'Tops', slug: 'tops' } as never],
  tags: [],
  images: [{ id: 1, src: 'https://shop.example.com/cami.jpg', alt: 'Mauve Cami' } as never],
  attributes: [],
  variations: [],
};

describe('searchProducts', () => {
  beforeEach(() => {
    vi.stubEnv('WOOCOMMERCE_STORE_URL', 'https://shop.example.com');
    vi.stubEnv('WOOCOMMERCE_CONSUMER_KEY', 'ck_test');
    vi.stubEnv('WOOCOMMERCE_CONSUMER_SECRET', 'cs_test');
    vi.stubEnv('WOOCOMMERCE_API_VERSION', 'wc/v3');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('calls wc/v3 products with the search term and returns adapted products', async () => {
    wooRequest.mockResolvedValueOnce([restProduct]);

    const results = await searchProducts('mauve');

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: '99',
      handle: 'mauve-cami',
      title: 'Mauve Cami',
    });

    expect(wooRequest).toHaveBeenCalledWith('/products', {
      query: { search: 'mauve', per_page: 20, status: 'publish' },
      cache: 'no-store',
    });
  });

  it('returns an empty array for a blank query without making a network request', async () => {
    const results = await searchProducts('   ');

    expect(results).toEqual([]);
    expect(wooRequest).not.toHaveBeenCalled();
  });

  it('stays on the package-backed wc/v3 client instead of the Store API', async () => {
    wooRequest.mockResolvedValueOnce([]);

    await searchProducts('silk');

    expect(wooRequest).toHaveBeenCalledTimes(1);
    expect(wooRequest).toHaveBeenCalledWith('/products', {
      query: { search: 'silk', per_page: 20, status: 'publish' },
      cache: 'no-store',
    });
  });
});
