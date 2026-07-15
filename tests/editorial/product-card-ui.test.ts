import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { StorefrontProduct } from '../../lib/woocommerce/types';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    React.createElement('a', { href, ...props }, children)
  ),
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement('img', props),
}));

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => React.createElement('button', props, children),
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => React.createElement('div', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

vi.mock('../../components/editorial/FavoriteButton', () => ({
  FavoriteButton: () => React.createElement('button', { type: 'button' }, 'Wishlist'),
}));

vi.mock('../../components/cart/CartProvider', () => ({
  useCart: () => ({
    addToCart: vi.fn(),
  }),
}));

vi.mock('../../lib/favorites-context', () => ({
  useFavorites: () => ({
    favorites: [],
    isFavorited: () => false,
    toggleFavorite: vi.fn(),
    count: 0,
    isLoading: false,
  }),
}));

vi.mock('../../lib/currency-context', () => ({
  useCurrency: () => ({
    formatPrice: (amount: number | string, currencyCode: string) => `${currencyCode} ${Number(amount).toFixed(2)}`,
  }),
}));

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
    options: [{ id: '1', name: 'Color', values: ['Rose', 'Ivory', 'Black', 'White', 'Gold', 'Blue'] }],
    categories: [{ id: 'cat-1', handle: 'dresses', title: 'Dresses' }],
    variationIds: [],
    relatedProductIds: [],
    upsellProductIds: [],
    crossSellProductIds: [],
    ...overrides,
  };
}

describe('product card UI', () => {
  it('renders quick view for optioned products, caps swatches, and suppresses ratings without verified summary', async () => {
    const { ProductCard } = await import('../../components/editorial/ProductCard');
    const html = renderToStaticMarkup(React.createElement(ProductCard, {
      product: createProduct(),
    }));

    expect(html).toContain('Quick View');
    expect(html).not.toContain('Quick Add');
    expect(html).toContain('+1');
    expect(html).not.toContain('4.8');
  });

  it('renders quick add for simple products and one sale badge', async () => {
    const { ProductCard } = await import('../../components/editorial/ProductCard');
    const html = renderToStaticMarkup(React.createElement(ProductCard, {
      product: createProduct({
        hasOptions: false,
        salePrice: { amountMinor: '99900', currencyCode: 'NGN', minorUnit: 2 },
        regularPrice: { amountMinor: '129900', currencyCode: 'NGN', minorUnit: 2 },
      }),
    }));

    expect(html).toContain('Quick Add');
    expect(html).toContain('-23%');
    expect(html).not.toContain('Sold Out');
  });

  it('does not render a struck regular price when there is no real discount', async () => {
    const { ProductCard } = await import('../../components/editorial/ProductCard');
    const html = renderToStaticMarkup(React.createElement(ProductCard, {
      product: createProduct({
        salePrice: { amountMinor: '129900', currencyCode: 'NGN', minorUnit: 2 },
        regularPrice: { amountMinor: '129900', currencyCode: 'NGN', minorUnit: 2 },
      }),
    }));

    expect(html).not.toContain('line-through');
  });
});
