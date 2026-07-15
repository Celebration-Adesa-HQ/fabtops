import { describe, expect, it } from 'vitest';
import type { StorefrontProduct, StorefrontVariation } from '../../lib/woocommerce/types';
import {
  canShowCardRating,
  getCardBadge,
  getQuickViewPresentation,
  getSwatchImageMap,
} from '../../components/editorial/product-card-model';

function createVariation(
  id: string,
  selectedOptions: Array<{ name: string; value: string }>,
  imageUrl?: string,
): StorefrontVariation {
  return {
    id,
    title: selectedOptions.map((option) => option.value).join(' / '),
    selectedOptions,
    availability: {
      inStock: true,
      purchasable: true,
      onBackorder: false,
      stockStatus: 'instock',
    },
    price: { amountMinor: '129900', currencyCode: 'NGN', minorUnit: 2 },
    regularPrice: null,
    salePrice: null,
    image: imageUrl ? { url: imageUrl, altText: 'Variant image' } : null,
  };
}

function createProduct(overrides: Partial<StorefrontProduct> = {}): StorefrontProduct {
  return {
    id: '42',
    handle: 'rose-dress',
    title: 'Rose Dress',
    description: '',
    descriptionHtml: '',
    shortDescription: '',
    shortDescriptionHtml: '',
    sku: 'ROSE-42',
    productType: 'Dresses',
    tags: [],
    brands: ['FabTops'],
    averageRating: 4.8,
    reviewCount: 12,
    featuredImage: { url: 'https://example.com/primary.jpg', altText: 'Primary' },
    gallery: [
      { url: 'https://example.com/primary.jpg', altText: 'Primary' },
      { url: 'https://example.com/secondary.jpg', altText: 'Secondary' },
    ],
    price: { amountMinor: '129900', currencyCode: 'NGN', minorUnit: 2 },
    regularPrice: null,
    salePrice: null,
    priceRange: {
      min: { amountMinor: '129900', currencyCode: 'NGN', minorUnit: 2 },
      max: { amountMinor: '129900', currencyCode: 'NGN', minorUnit: 2 },
    },
    hasOptions: true,
    availability: {
      inStock: true,
      purchasable: true,
      onBackorder: false,
      stockStatus: 'instock',
    },
    options: [{ id: '1', name: 'Color', values: ['Rose', 'Ivory'] }],
    categories: [{ id: 'cat-1', handle: 'dresses', title: 'Dresses' }],
    variationIds: ['v1', 'v2'],
    variations: [
      createVariation('v1', [{ name: 'Color', value: 'Rose' }], 'https://example.com/rose.jpg'),
      createVariation('v2', [{ name: 'Color', value: 'Ivory' }], 'https://example.com/ivory.jpg'),
    ],
    relatedProductIds: [],
    upsellProductIds: [],
    crossSellProductIds: [],
    ...overrides,
  };
}

describe('product card model helpers', () => {
  it('uses strict badge precedence with sold out over sale and tag-derived badges', () => {
    expect(getCardBadge(createProduct({
      availability: { inStock: false, purchasable: false, onBackorder: false, stockStatus: 'outofstock' },
      salePrice: { amountMinor: '99900', currencyCode: 'NGN', minorUnit: 2 },
      regularPrice: { amountMinor: '129900', currencyCode: 'NGN', minorUnit: 2 },
      tags: ['limited'],
    }))?.label).toBe('Sold Out');

    expect(getCardBadge(createProduct({
      salePrice: { amountMinor: '99900', currencyCode: 'NGN', minorUnit: 2 },
      regularPrice: { amountMinor: '129900', currencyCode: 'NGN', minorUnit: 2 },
      tags: ['new'],
    }))?.label).toBe('Sale');
  });

  it('shows card ratings only when verified review credibility is available', () => {
    expect(canShowCardRating(createProduct())).toBe(false);
    expect(canShowCardRating(createProduct({
      reviewSummary: {
        averageRating: 4.8,
        reviewCount: 12,
        verifiedReviewCount: 3,
      },
    }))).toBe(true);
  });

  it('creates a swatch-to-image map from variation images when available', () => {
    expect(getSwatchImageMap(createProduct())).toEqual({
      Rose: { url: 'https://example.com/rose.jpg', altText: 'Variant image' },
      Ivory: { url: 'https://example.com/ivory.jpg', altText: 'Variant image' },
    });
  });

  it('selects quick view presentation by viewport width', () => {
    expect(getQuickViewPresentation(375)).toBe('none');
    expect(getQuickViewPresentation(1200)).toBe('dialog');
    expect(getQuickViewPresentation(1600)).toBe('dialog');
  });
});
