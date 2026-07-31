import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getCategories,
  getEditorialRecommendationsForProduct,
  getProductBySlug,
  getProducts,
} from '../../lib/woocommerce/products';
import type { RestProduct } from '../../lib/woocommerce/types';
import { liveVariableProduct, liveVariableVariations } from './fixtures/live-rest-product';

const { wooRequest } = vi.hoisted(() => ({
  wooRequest: vi.fn(),
}));

vi.mock('../../lib/woocommerce/rest-client', () => ({
  wooRequest,
}));

const env = {
  WOOCOMMERCE_STORE_URL: 'https://shop.example.com',
  WOOCOMMERCE_CONSUMER_KEY: 'ck_test',
  WOOCOMMERCE_CONSUMER_SECRET: 'cs_test',
  WOOCOMMERCE_API_VERSION: 'wc/v3',
};

/** Minimal RestProduct fixture for the listing test. */
const restProduct: Partial<RestProduct> = {
  id: 42,
  name: 'Rose Top',
  slug: 'rose-top',
  type: 'simple',
  status: 'publish',
  description: '',
  short_description: '',
  price: '1250.00',
  regular_price: '1250.00',
  stock_status: 'instock',
  purchasable: true,
  categories: [],
  tags: [],
  images: [],
  attributes: [],
  variations: [],
};

describe('WooCommerce product helpers', () => {
  beforeEach(() => {
    vi.stubEnv('WOOCOMMERCE_STORE_URL', env.WOOCOMMERCE_STORE_URL);
    vi.stubEnv('WOOCOMMERCE_CONSUMER_KEY', env.WOOCOMMERCE_CONSUMER_KEY);
    vi.stubEnv('WOOCOMMERCE_CONSUMER_SECRET', env.WOOCOMMERCE_CONSUMER_SECRET);
    vi.stubEnv('WOOCOMMERCE_API_VERSION', env.WOOCOMMERCE_API_VERSION);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('loads public product listings from wc/v3 product queries', async () => {
    wooRequest.mockResolvedValueOnce([restProduct]);

    const products = await getProducts(1);

    expect(products[0]).toMatchObject({ id: '42', handle: 'rose-top', title: 'Rose Top' });
    expect(wooRequest).toHaveBeenCalledWith('/products', {
      query: {
        per_page: 1,
        status: 'publish',
      },
      next: { revalidate: 60, tags: ['woo-products'] },
    });
  });

  it('loads a product and its variations through wc/v3 product queries', async () => {
    wooRequest
      .mockResolvedValueOnce([liveVariableProduct])
      .mockResolvedValueOnce(liveVariableVariations);

    const product = await getProductBySlug('isla-satin-tie-midi-dress');

    expect(product?.handle).toBe('isla-satin-tie-midi-dress');
    expect(product?.options).toEqual([
      { id: '2', name: 'Size', values: ['L', 'M', 'S', 'XL', 'XS'] },
      { id: '3', name: 'Color', values: ['Rose'] },
    ]);
    expect(product?.variations?.[0].selectedOptions).toEqual([
      { name: 'Size', value: 'M' },
      { name: 'Color', value: 'Rose' },
    ]);
    expect(wooRequest).toHaveBeenNthCalledWith(1, '/products', {
      query: { slug: 'isla-satin-tie-midi-dress', status: 'publish', per_page: 1 },
      next: { revalidate: 60, tags: ['woo-product-isla-satin-tie-midi-dress'] },
    });
    expect(wooRequest).toHaveBeenNthCalledWith(2, '/products/632/variations', {
      query: { per_page: 100 },
      next: { revalidate: 60, tags: ['woo-product-632'] },
    });
  });

  it('normalizes WooCommerce categories', async () => {
    wooRequest.mockResolvedValueOnce([
      {
        id: 3,
        name: 'Tops',
        slug: 'tops',
        description: 'Everyday tops',
        image: { src: 'https://shop.example.com/tops.jpg', alt: 'Tops' },
      },
    ]);

    await expect(getCategories()).resolves.toEqual([
      {
        id: '3',
        handle: 'tops',
        title: 'Tops',
        description: 'Everyday tops',
        image: { url: 'https://shop.example.com/tops.jpg', altText: 'Tops' },
      },
    ]);
  });

  it('splits editorial recommendation groups without duplicating products', async () => {
    const product = {
      id: '42',
      handle: 'rose-top',
      title: 'Rose Top',
      description: '',
      descriptionHtml: '',
      shortDescription: '',
      shortDescriptionHtml: '',
      sku: '',
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
      hasOptions: false,
      availability: {
        inStock: true,
        purchasable: true,
        onBackorder: false,
        stockStatus: 'instock' as const,
      },
      options: [],
      categories: [{ id: '3', handle: 'tops', title: 'Tops' }],
      variationIds: [],
      relatedProductIds: ['100', '101', '102'],
      upsellProductIds: ['101'],
      crossSellProductIds: ['103'],
    };

    wooRequest
      .mockResolvedValueOnce([
        { ...restProduct, id: 103, slug: 'matching-skirt', name: 'Matching Skirt' },
        { ...restProduct, id: 101, slug: 'structured-blazer', name: 'Structured Blazer' },
      ])
      .mockResolvedValueOnce([
        { ...restProduct, id: 100, slug: 'silk-pants', name: 'Silk Pants' },
        { ...restProduct, id: 102, slug: 'evening-heels', name: 'Evening Heels' },
      ]);

    const recommendations = await getEditorialRecommendationsForProduct(product, 2);

    expect(recommendations.completeTheLook.map((item) => item.id)).toEqual(['103', '101']);
    expect(recommendations.related.map((item) => item.id)).toEqual(['100', '102']);
  });

  it('falls back to copy product data when WooCommerce REST API is unreachable (ETIMEDOUT)', async () => {
    wooRequest.mockRejectedValueOnce(
      new Error(
        'WooCommerce REST API unreachable (ETIMEDOUT) [GET /products]. Check your WOOCOMMERCE_URL environment variable and server connectivity.',
      ),
    );

    const products = await getProducts(10);
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty('handle');
    expect(products[0]).toHaveProperty('title');

    wooRequest.mockRejectedValueOnce(
      new Error(
        'WooCommerce REST API unreachable (ETIMEDOUT) [GET /products/categories]. Check your WOOCOMMERCE_URL environment variable and server connectivity.',
      ),
    );

    const categories = await getCategories();
    expect(categories.length).toBeGreaterThan(0);
  });
});
