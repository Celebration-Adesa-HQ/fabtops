import { describe, expect, it } from 'vitest';
import { buildStorefrontFilters } from '../../lib/woocommerce/storefront';

describe('buildStorefrontFilters', () => {
  it('maps Store API collection data into shopper-facing category, size, brand, tag, and rating filters', () => {
    const filters = buildStorefrontFilters({
      categories: [
        { id: 8, name: 'Dresses', slug: 'dresses' },
        { id: 12, name: 'Tops', slug: 'tops' },
      ],
      brands: [
        { id: 51, name: 'FabTops Atelier', slug: 'fabtops-atelier' },
        { id: 52, name: 'Signature Line', slug: 'signature-line' },
      ],
      tags: [
        { id: 61, name: 'Evening', slug: 'evening' },
        { id: 62, name: 'Resort', slug: 'resort' },
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
      categories: [
        { label: 'Dresses', value: 'dresses', count: 2 },
        { label: 'Tops', value: 'tops', count: 5 },
      ],
      brands: [
        { label: 'FabTops Atelier', value: 'fabtops-atelier' },
        { label: 'Signature Line', value: 'signature-line' },
      ],
      sizes: [
        { label: 'M', value: 'm', count: 4 },
        { label: 'S', value: 's', count: 7 },
      ],
      tags: [
        { label: 'Evening', value: 'evening' },
        { label: 'Resort', value: 'resort' },
      ],
      stockStatuses: [
        { label: 'In Stock', value: 'instock' },
        { label: 'On Backorder', value: 'onbackorder' },
        { label: 'Out of Stock', value: 'outofstock' },
      ],
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
        brands: [],
        tags: [],
        sizeTerms: [],
        collectionData: null,
      }),
    ).toEqual({
      categories: [],
      brands: [],
      sizes: [],
      tags: [],
      stockStatuses: [
        { label: 'In Stock', value: 'instock' },
        { label: 'On Backorder', value: 'onbackorder' },
        { label: 'Out of Stock', value: 'outofstock' },
      ],
      priceRange: null,
      ratingCounts: [],
    });
  });
});
