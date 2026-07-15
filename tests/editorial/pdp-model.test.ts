import { describe, expect, it } from 'vitest';
import type { StorefrontProduct, StorefrontVariation } from '../../lib/woocommerce/types';
import {
  buildProductBreadcrumbs,
  buildRatingDistribution,
  findMatchingVariation,
  isVariationOptionAvailable,
} from '../../components/editorial/product/pdp-model';

function createVariation(
  id: string,
  selectedOptions: Array<{ name: string; value: string }>,
  purchasable = true,
): StorefrontVariation {
  return {
    id,
    title: selectedOptions.map((option) => option.value).join(' / '),
    selectedOptions,
    availability: {
      inStock: purchasable,
      purchasable,
      onBackorder: false,
      stockStatus: purchasable ? 'instock' : 'outofstock',
    },
    price: {
      amountMinor: '129900',
      currencyCode: 'NGN',
      minorUnit: 2,
    },
    regularPrice: null,
    salePrice: null,
    image: null,
  };
}

function createProduct(overrides: Partial<StorefrontProduct> = {}): StorefrontProduct {
  return {
    id: 'p-1',
    handle: 'isla-dress',
    title: 'Isla Dress',
    description: 'Dress description',
    descriptionHtml: '<p>Dress description</p>',
    shortDescription: 'Short description',
    shortDescriptionHtml: '<p>Short description</p>',
    sku: 'ISLA-01',
    productType: 'Dresses',
    tags: ['occasion'],
    brands: ['FabTops'],
    averageRating: 4.7,
    reviewCount: 8,
    featuredImage: { url: 'https://example.com/1.jpg', altText: 'Isla Dress' },
    gallery: [{ url: 'https://example.com/1.jpg', altText: 'Isla Dress' }],
    price: { amountMinor: '129900', currencyCode: 'NGN', minorUnit: 2 },
    regularPrice: null,
    salePrice: null,
    priceRange: {
      min: { amountMinor: '129900', currencyCode: 'NGN', minorUnit: 2 },
      max: { amountMinor: '149900', currencyCode: 'NGN', minorUnit: 2 },
    },
    hasOptions: true,
    availability: {
      inStock: true,
      purchasable: true,
      onBackorder: false,
      stockStatus: 'instock',
    },
    options: [
      { id: '1', name: 'Size', values: ['S', 'M', 'L'] },
      { id: '2', name: 'Color', values: ['Rose', 'Ivory'] },
    ],
    categories: [{ id: 'cat-1', handle: 'dresses', title: 'Dresses' }],
    variationIds: ['v1', 'v2'],
    variations: [
      createVariation('v1', [
        { name: 'Size', value: 'S' },
        { name: 'Color', value: 'Rose' },
      ]),
      createVariation('v2', [
        { name: 'Size', value: 'M' },
        { name: 'Color', value: 'Rose' },
      ], false),
    ],
    relatedProductIds: [],
    upsellProductIds: [],
    crossSellProductIds: [],
    ...overrides,
  };
}

describe('pdp view model helpers', () => {
  it('builds luxury breadcrumbs with a women root and product title', () => {
    const crumbs = buildProductBreadcrumbs(createProduct());

    expect(crumbs).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Women', href: '/shop' },
      { label: 'Dresses', href: '/shop/dresses' },
      { label: 'Isla Dress' },
    ]);
  });

  it('matches a variation from selected options and falls back to the first purchasable one', () => {
    const product = createProduct();

    expect(findMatchingVariation(product.variations, { Size: 'S', Color: 'Rose' })?.id).toBe('v1');
    expect(findMatchingVariation(product.variations, { Size: 'L', Color: 'Ivory' })?.id).toBe('v1');
  });

  it('marks unavailable option values based on purchasable variations', () => {
    const product = createProduct();

    expect(isVariationOptionAvailable(product.variations, 'Size', 'S', { Color: 'Rose' })).toBe(true);
    expect(isVariationOptionAvailable(product.variations, 'Size', 'M', { Color: 'Rose' })).toBe(false);
  });

  it('builds a full five-star rating distribution', () => {
    expect(buildRatingDistribution([
      { rating: 5 },
      { rating: 5 },
      { rating: 4 },
      { rating: 2 },
    ])).toEqual([
      { rating: 5, count: 2 },
      { rating: 4, count: 1 },
      { rating: 3, count: 0 },
      { rating: 2, count: 1 },
      { rating: 1, count: 0 },
    ]);
  });
});
