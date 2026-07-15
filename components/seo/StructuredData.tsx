import React from 'react';
import { absoluteUrl, getSiteUrl } from '@/lib/site';
import { fromMinorUnits } from '@/lib/woocommerce/store-api';
import type { StorefrontProduct } from '@/lib/woocommerce/types';

interface BreadcrumbStructuredDataProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
}

export function OrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FabTops',
    url: getSiteUrl(),
    logo: absoluteUrl('/logo.png'),
    description: 'Contemporary, premium fashion for the modern woman. Sophisticated, feminine, and powerful.',
    sameAs: [
      'https://www.instagram.com/fabtops',
      'https://www.facebook.com/fabtops',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NG',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function WebsiteStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FabTops',
    url: getSiteUrl(),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: absoluteUrl('/shop?q={search_term_string}'),
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function ProductStructuredData({ product }: { product: StorefrontProduct }) {
  const price = fromMinorUnits(product.price.amountMinor, product.price.minorUnit);
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    url: absoluteUrl(`/product/${product.handle}`),
    name: product.title,
    image: product.gallery.map((image) => image.url),
    description: product.shortDescription || product.description,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brands?.[0] || 'FabTops',
    },
    category: product.categories.map((category) => category.title).join(', '),
    aggregateRating: product.reviewCount > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.averageRating,
          reviewCount: product.reviewCount,
        }
      : undefined,
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/product/${product.handle}`),
      priceCurrency: product.price.currencyCode,
      price,
      availability: product.availability?.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
