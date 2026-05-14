import React from 'react';

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
    image: product.images.edges.map((edge: any) => edge.node.url),
    description: product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'FabTops',
    },
    offers: {
      '@type': 'Offer',
      url: `https://fabtops.com.ng/product/${product.handle}`,
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      price: product.priceRange.minVariantPrice.amount,
      availability: product.availableForSale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
