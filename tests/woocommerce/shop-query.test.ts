import { describe, expect, it } from 'vitest';
import {
  APP_PAGE_SIZE,
  buildNextShopQuery,
  parseShopQuery,
  serializeShopQuery,
  type ShopQueryConstraints,
} from '../../lib/shop/shop-query';

const baseConstraints: ShopQueryConstraints = {
  basePath: '/shop',
  allowedCategorySlugs: ['tops', 'dresses', 'sets'],
  sizeAttributeTaxonomy: 'pa_size',
};

describe('shop query parsing', () => {
  it('normalizes invalid values without relying on previous state', () => {
    const result = parseShopQuery(
      {
        page: ['0', '3'],
        per_page: '999',
        category: ['tops', 'unknown'],
        size: ['uk-10', 'uk-12'],
        min_price: '9000',
        max_price: '1000',
        stock_status: ['instock', 'invalid'],
        orderby: 'bogus',
        order: 'sideways',
        search: '  rose   top  ',
      },
      baseConstraints,
    );

    expect(result.query).toEqual({
      page: 1,
      perPage: APP_PAGE_SIZE,
      category: 'tops',
      size: 'uk-10',
      stockStatus: 'instock',
      search: 'rose top',
      orderby: 'date',
      order: 'desc',
    });
    expect(result.canonicalPath).toBe('/shop?category=tops&size=uk-10&search=rose+top&stock_status=instock');
  });

  it('enforces fixed collection constraints and ignores override attempts', () => {
    const result = parseShopQuery(
      {
        category: 'tops',
        page: '4',
      },
      {
        ...baseConstraints,
        basePath: '/collections/dresses',
        fixedCategorySlug: 'dresses',
      },
    );

    expect(result.query.category).toBe('dresses');
    expect(result.query.page).toBe(4);
    expect(result.canonicalPath).toBe('/collections/dresses?page=4');
  });

  it('serializes stable committed state without defaults', () => {
    expect(
      serializeShopQuery({
        page: 1,
        perPage: APP_PAGE_SIZE,
        category: undefined,
        size: 'uk-10',
        search: '',
        minPrice: undefined,
        maxPrice: undefined,
        stockStatus: undefined,
        orderby: 'date',
        order: 'desc',
      }),
    ).toBe('size=uk-10');
  });
});

describe('shop query navigation updates', () => {
  it('resets page when committed filters change', () => {
    const nextQuery = buildNextShopQuery(
      {
        page: 4,
        perPage: APP_PAGE_SIZE,
        category: 'tops',
        size: undefined,
        search: '',
        minPrice: undefined,
        maxPrice: undefined,
        stockStatus: undefined,
        orderby: 'date',
        order: 'desc',
      },
      {
        size: 'uk-10',
      },
    );

    expect(nextQuery.page).toBe(1);
    expect(nextQuery.size).toBe('uk-10');
  });

  it('keeps page when only per-page changes', () => {
    const nextQuery = buildNextShopQuery(
      {
        page: 3,
        perPage: APP_PAGE_SIZE,
        category: 'tops',
        size: undefined,
        search: '',
        minPrice: undefined,
        maxPrice: undefined,
        stockStatus: undefined,
        orderby: 'date',
        order: 'desc',
      },
      {
        perPage: 24,
      },
    );

    expect(nextQuery.page).toBe(3);
    expect(nextQuery.perPage).toBe(24);
  });
});
