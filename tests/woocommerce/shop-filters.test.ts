import { describe, expect, it } from 'vitest';
import { buildStorefrontFilters } from '../../lib/woocommerce/storefront';

describe('buildStorefrontFilters', () => {
  it('maps Store API collection data into shopper-facing category, size, and price filters', () => {
    const filters = buildStorefrontFilters({
      categories: [
        { id: 8, name: 'Dresses', slug: 'dresses' },
        { id: 12, name: 'Tops', slug: 'tops' },
      ],
      sizeTerms: [
        { id: 21, name: 'S', slug: 's', count: 7 },
        { id: 22, name: 'M', slug: 'm', count: 4 },
        { id: 23, name: 'XL', slug: 'xl', count: 0 },
      ],
      collectionData: {
        price_range: {
          min_price: '100000',
          max_price: '450000',
          currency_code: 'NGN',
          currency_minor_unit: 2,
        },
        attribute_counts: [
          { term: 21, count: 7 },
          { term: 22, count: 4 },
        ],
        rating_counts: [{ rating: 5, count: 2 }],
        taxonomy_counts: [
          { term: 8, count: 2 },
          { term: 12, count: 5 },
        ],
      },
    });

    expect(filters).toEqual({
      categories: ['Dresses', 'Tops'],
      sizes: ['M', 'S'],
      priceRange: {
        min: 1000,
        max: 4500,
        currencyCode: 'NGN',
        minorUnit: 2,
      },
      ratingCounts: [{ rating: 5, count: 2 }],
    });
  });

  it('falls back gracefully when collection aggregates are missing', () => {
    expect(
      buildStorefrontFilters({
        categories: [],
        sizeTerms: [],
        collectionData: null,
      }),
    ).toEqual({
      categories: [],
      sizes: [],
      priceRange: null,
      ratingCounts: [],
    });
  });
});
