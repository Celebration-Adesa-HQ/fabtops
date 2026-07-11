import React from 'react';
import { fromMinorUnits } from '@/lib/woocommerce/store-api';

export function OrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FabTops',
    url: 'https://fabtops.com.ng',
    logo: 'https://fabtops.com.ng/logo.png', // Replace with actual logo URL
    description: 'Contemporary, premium fashion for the modern woman. Sophisticated, feminine, and powerful.',
    sameAs: [
      'https://www.instagram.com/fabtops', // Examples
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
    url: 'https://fabtops.com.ng',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://fabtops.com.ng/shop?q={search_term_string}',
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

export function ProductStructuredData({ product }: { product: any }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.gallery.map((image: any) => image.url),
    description: product.shortDescription || product.description,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brands?.[0] || 'FabTops',
    },
    offers: {
      '@type': 'Offer',
      url: `https://fabtops.com.ng/product/${product.handle}`,
      priceCurrency: product.price.currencyCode,
      price: fromMinorUnits(product.price.amountMinor, product.price.minorUnit),
      availability: product.availability?.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
