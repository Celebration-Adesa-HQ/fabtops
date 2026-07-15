import { describe, expect, it } from 'vitest';
import {
  buildAggregateQuery,
  buildStoreApiProductQueryFromShopQuery,
  normalizePaginatedCollectionResult,
  type StoreApiPaginationHeaders,
} from '../../lib/woocommerce/storefront';

describe('shop storefront query builders', () => {
  it('translates size into a Woo attribute filter instead of a top-level parameter', () => {
    const query = buildStoreApiProductQueryFromShopQuery(
      {
        page: 2,
        perPage: 24,
        category: 'dresses',
        size: 'uk-10',
        search: 'midi',
        minPrice: 1000,
        maxPrice: 2500,
        stockStatus: 'instock',
        orderby: 'price',
        order: 'asc',
      },
      {
        categoryId: 9,
        sizeAttribute: { id: 2, taxonomy: 'pa_size' },
        sizeTermId: 22,
      },
    );

    expect(query).toMatchObject({
      page: 2,
      per_page: 24,
      category: '9',
      search: 'midi',
      min_price: '100000',
      max_price: '250000',
      stock_status: 'instock',
      orderby: 'price',
      order: 'asc',
      'attributes[0][attribute]': 'pa_size',
      'attributes[0][term_id]': '22',
    });
    expect(query).not.toHaveProperty('size');
  });

  it('builds self-excluding aggregate queries', () => {
    const query = buildAggregateQuery(
      {
        page: 3,
        perPage: 24,
        category: 'dresses',
        size: 'uk-10',
        search: 'midi',
        minPrice: 1000,
        maxPrice: 2500,
        stockStatus: 'instock',
        orderby: 'price',
        order: 'asc',
      },
      {
        categoryId: 9,
        sizeAttribute: { id: 2, taxonomy: 'pa_size' },
        sizeTermId: 22,
      },
      'size',
    );

    expect(query).toMatchObject({
      category: '9',
      search: 'midi',
      min_price: '100000',
      max_price: '250000',
      stock_status: 'instock',
      calculate_price_range: true,
      calculate_rating_counts: true,
      calculate_taxonomy_counts: 'product_cat',
      'calculate_attribute_counts[0][taxonomy]': 'pa_size',
    });
    expect(query).not.toHaveProperty('attributes[0][attribute]');
  });
});

describe('paginated storefront results', () => {
  it('uses Woo pagination headers when present', () => {
    expect(
      normalizePaginatedCollectionResult(
        [{ id: 1 }],
        { total: '31', totalPages: '4', link: '</products?page=4>; rel="last"' },
        { page: 2, perPage: 10 },
      ),
    ).toMatchObject({
      total: 31,
      totalPages: 4,
      currentPage: 2,
      perPage: 10,
      hasNextPage: true,
      hasPrevPage: true,
    });
  });

  it('falls back safely when pagination headers are malformed or absent', () => {
    const headers: StoreApiPaginationHeaders = { total: 'NaN', totalPages: undefined, link: null };

    expect(
      normalizePaginatedCollectionResult(
        [{ id: 1 }, { id: 2 }],
        headers,
        { page: 5, perPage: 24 },
      ),
    ).toMatchObject({
      total: 2,
      totalPages: 5,
      currentPage: 5,
      perPage: 24,
      hasPrevPage: true,
      hasNextPage: false,
    });
  });
});
