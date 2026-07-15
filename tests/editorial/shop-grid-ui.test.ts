import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { PaginatedStoreResult, StorefrontProduct } from '../../lib/woocommerce/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement('img', props),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => React.createElement('div', props, children),
  },
}));

vi.mock('../../components/ui/Drawer', () => ({
  Drawer: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
}));

vi.mock('../../components/editorial/ProductCard', () => ({
  ProductCard: ({ product }: { product: StorefrontProduct }) => React.createElement('article', null, product.title),
}));

function createProduct(id: string): StorefrontProduct {
  return {
    id,
    handle: `product-${id}`,
    title: `Product ${id}`,
    description: '',
    descriptionHtml: '',
    shortDescription: '',
    shortDescriptionHtml: '',
    sku: id,
    productType: 'Dresses',
    tags: [],
    brands: [],
    averageRating: 0,
    reviewCount: 0,
    featuredImage: null,
    gallery: [],
    price: { amountMinor: '129900', currencyCode: 'NGN', minorUnit: 2 },
    regularPrice: null,
    salePrice: null,
    priceRange: {
      min: { amountMinor: '129900', currencyCode: 'NGN', minorUnit: 2 },
      max: { amountMinor: '129900', currencyCode: 'NGN', minorUnit: 2 },
    },
    hasOptions: false,
    availability: {
      inStock: true,
      purchasable: true,
      onBackorder: false,
      stockStatus: 'instock',
    },
    options: [],
    categories: [],
    variationIds: [],
    relatedProductIds: [],
    upsellProductIds: [],
    crossSellProductIds: [],
  };
}

describe('shop grid UI', () => {
  it('uses the widened 2/3/4/5 column product grid', async () => {
    const { ShopContent } = await import('../../components/editorial/ShopContent');
    const result: PaginatedStoreResult<StorefrontProduct> = {
      items: [createProduct('1'), createProduct('2')],
      total: 2,
      totalPages: 1,
      currentPage: 1,
      perPage: 24,
      hasNextPage: false,
      hasPrevPage: false,
    };

    const html = renderToStaticMarkup(React.createElement(ShopContent, {
      result,
      filters: {
        categories: [],
        brands: [],
        sizes: [],
        tags: [],
        stockStatuses: [],
        priceRange: null,
        ratingCounts: [],
      },
      query: { page: 1, perPage: 24, search: '', orderby: 'date', order: 'desc' },
      basePath: '/shop',
    }));

    expect(html).toContain('grid-cols-2');
    expect(html).toContain('md:grid-cols-3');
    expect(html).toContain('xl:grid-cols-4');
    expect(html).toContain('2xl:grid-cols-5');
  });
});
