import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { StorefrontProduct } from '../../lib/woocommerce/types';
import {
  BreadcrumbStructuredData,
  ProductStructuredData,
} from '../../components/seo/StructuredData';

const product: StorefrontProduct = {
  id: '632',
  handle: 'isla-dress',
  title: 'Isla Dress',
  description: 'Elegant evening dress',
  descriptionHtml: '<p>Elegant evening dress</p>',
  shortDescription: 'Elegant evening dress',
  shortDescriptionHtml: '<p>Elegant evening dress</p>',
  sku: 'ISLA-632',
  productType: 'Dresses',
  tags: ['occasion'],
  brands: ['FabTops'],
  averageRating: 4.8,
  reviewCount: 12,
  featuredImage: { url: 'https://fabtops.com.ng/isla.jpg', altText: 'Isla Dress' },
  gallery: [{ url: 'https://fabtops.com.ng/isla.jpg', altText: 'Isla Dress' }],
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
  options: [],
  categories: [{ id: '1', handle: 'dresses', title: 'Dresses' }],
  variationIds: [],
  variations: [],
  relatedProductIds: [],
  upsellProductIds: [],
  crossSellProductIds: [],
};

function extractJson(html: string) {
  return JSON.parse(html.match(/<script[^>]*>(.*)<\/script>/)?.[1] || '{}');
}

describe('structured data', () => {
  it('renders product schema with product url and review aggregate data', () => {
    const html = renderToStaticMarkup(React.createElement(ProductStructuredData, { product }));
    const json = extractJson(html);

    expect(json['@type']).toBe('Product');
    expect(json.url).toBe('https://fabtops.com.ng/product/isla-dress');
    expect(json.aggregateRating.ratingValue).toBe(4.8);
    expect(json.brand.name).toBe('FabTops');
  });

  it('renders breadcrumb schema for the product trail', () => {
    const html = renderToStaticMarkup(
      React.createElement(BreadcrumbStructuredData, {
        items: [
          { label: 'Home', href: '/' },
          { label: 'Women', href: '/shop' },
          { label: 'Dresses', href: '/shop/dresses' },
          { label: 'Isla Dress' },
        ],
      }),
    );
    const json = extractJson(html);

    expect(json['@type']).toBe('BreadcrumbList');
    expect(json.itemListElement).toHaveLength(4);
    expect(json.itemListElement[2].item).toBe('https://fabtops.com.ng/shop/dresses');
    expect(json.itemListElement[3].name).toBe('Isla Dress');
  });
});
