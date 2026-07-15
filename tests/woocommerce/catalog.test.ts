import { beforeEach, describe, expect, it, vi } from 'vitest';

const getStoreProductCategories = vi.fn();
const getCategories = vi.fn();
const getStoreProductAttributes = vi.fn();
const getStoreProductAttributeTerms = vi.fn();
const getPaginatedStoreProducts = vi.fn();
const getStorefrontFilters = vi.fn();

vi.mock('@/lib/woocommerce/storefront', () => ({
  getStoreProductCategories,
  getStoreProductAttributes,
  getStoreProductAttributeTerms,
  getPaginatedStoreProducts,
  getStorefrontFilters,
  buildStoreApiProductQueryFromShopQuery: vi.fn((_query, context) => context),
  buildAggregateQuery: vi.fn((_query, context) => context),
}));

vi.mock('@/lib/woocommerce/products', () => ({
  getCategories,
}));

describe('catalog loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStoreProductCategories.mockResolvedValue([]);
    getCategories.mockResolvedValue([
      {
        id: '12',
        handle: 'tops',
        title: 'Tops',
        description: 'Signature tops',
        image: null,
      },
    ]);
    getStoreProductAttributes.mockResolvedValue([]);
    getPaginatedStoreProducts.mockResolvedValue({
      items: [{ id: 'product-1' }],
      total: 1,
      totalPages: 1,
      currentPage: 1,
      perPage: 24,
      hasPrevPage: false,
      hasNextPage: false,
    });
    getStorefrontFilters.mockResolvedValue({
      categories: [],
      brands: [],
      sizes: [],
      tags: [],
      stockStatuses: [],
      priceRange: null,
      ratingCounts: [],
    });
  });

  it('resolves fixed collection categories from the REST fallback when Store API categories are empty', async () => {
    const { loadCatalogPageData } = await import('../../lib/woocommerce/catalog');

    const result = await loadCatalogPageData({}, {
      basePath: '/collections/tops',
      fixedCategorySlug: 'tops',
      sizeAttributeTaxonomy: 'pa_size',
    });

    expect(result).not.toBeNull();
    expect(getPaginatedStoreProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: 12,
      }),
    );
    expect(result?.categoryHandle).toBe('tops');
  });
});
