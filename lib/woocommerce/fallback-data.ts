/**
 * @file lib/woocommerce/fallback-data.ts
 *
 * Copy fallback data for WooCommerce REST and Store API calls when the WooCommerce
 * backend server is unreachable (e.g. ETIMEDOUT, network failure, or invalid host).
 *
 * Prevents catalog & shop pages from crashing with 500 errors when offline or timing out.
 */

import type {
  PaginatedStoreResult,
  RestProduct,
  StoreApiProductCategory,
  StorefrontCategory,
  StorefrontFilters,
  StorefrontProduct,
  WooRestProduct,
} from './types';

/**
 * Helper to determine if an error was caused by WooCommerce REST or Store API connectivity failure / timeout.
 */
export function isWooUnreachableError(error: unknown): boolean {
  if (!error) return false;
  if (typeof error === 'object' && error !== null) {
    const err = error as { name?: string; message?: string; code?: string };
    if (err.name === 'WooRestApiError' || err.name === 'StoreApiError') return true;
    if (err.code && ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'ENOTFOUND', 'ECONNABORTED'].includes(err.code)) {
      return true;
    }
    const msg = String(err.message || '');
    if (
      msg.includes('unreachable') ||
      msg.includes('ETIMEDOUT') ||
      msg.includes('ECONNRESET') ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('ENOTFOUND') ||
      msg.includes('WOOCOMMERCE_URL') ||
      msg.includes('fetch failed')
    ) {
      return true;
    }
  }
  return false;
}

export const FALLBACK_STORE_CATEGORIES: StoreApiProductCategory[] = [
  { id: 94, name: 'Dresses', slug: 'dresses', description: 'Polished midi, gown, and occasion dresses.' },
  { id: 95, name: 'Tops', slug: 'tops', description: 'Sculptural blouses, corsets, and everyday tops.' },
  { id: 96, name: 'Sets', slug: 'sets', description: 'Coordinated two-piece blazers, skirts, and pant sets.' },
  { id: 97, name: 'Accessories', slug: 'accessories', description: 'Statement jewelry, eyewear, and silk scarves.' },
  { id: 98, name: 'Archive', slug: 'archive', description: 'Archival pieces and iconic past collection drops.' },
];

export const FALLBACK_CATEGORIES: StorefrontCategory[] = FALLBACK_STORE_CATEGORIES.map((cat) => ({
  id: String(cat.id),
  handle: cat.slug,
  title: cat.name,
  description: cat.description || '',
  image: null,
}));

export const FALLBACK_PRODUCTS: StorefrontProduct[] = [
  {
    id: '632',
    handle: 'isla-satin-tie-midi-dress',
    title: 'Isla Satin Tie Midi Dress',
    description: 'Isla Satin Tie Midi Dress is crafted from liquid-touch satin with a flattering waist tie and fluid midi silhouette, designed for polished FabTops occasion styling.',
    descriptionHtml: '<p>Isla Satin Tie Midi Dress is crafted from liquid-touch satin with a flattering waist tie and fluid midi silhouette, designed for polished FabTops occasion styling.</p>',
    shortDescription: 'A satin tie midi dress for soft occasion styling.',
    shortDescriptionHtml: '<p>A satin tie midi dress for soft occasion styling.</p>',
    sku: 'FAB-DRS-016',
    productType: 'Dresses',
    tags: ['midi', 'satin', 'Fab Babe Circle'],
    brands: ['FabTops'],
    averageRating: 4.9,
    reviewCount: 14,
    featuredImage: {
      url: '/Highlights/AF-10800.jpg',
      altText: 'Isla Satin Tie Midi Dress in brown satin',
    },
    gallery: [
      { url: '/Highlights/AF-10800.jpg', altText: 'Isla Satin Tie Midi Dress front view' },
      { url: '/Highlights/AF-10814.jpg', altText: 'Isla Satin Tie Midi Dress styling detail' },
    ],
    price: { amountMinor: '12000000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
    regularPrice: { amountMinor: '12000000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
    salePrice: null,
    priceRange: {
      min: { amountMinor: '12000000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
      max: { amountMinor: '12000000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
    },
    hasOptions: true,
    availability: {
      inStock: true,
      purchasable: true,
      onBackorder: false,
      stockStatus: 'instock',
    },
    cardBadge: { label: 'New', key: 'new' },
    options: [
      { id: '2', name: 'Size', values: ['XS', 'S', 'M', 'L', 'XL'] },
      { id: '3', name: 'Color', values: ['Rose', 'Terracotta'] },
    ],
    categories: [{ id: '94', handle: 'dresses', title: 'Dresses' }],
    variationIds: ['652', '653', '654', '655', '656'],
    variations: [
      {
        id: '654',
        title: 'M / Rose',
        availability: { inStock: true, purchasable: true, onBackorder: false, stockStatus: 'instock' },
        selectedOptions: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'Rose' },
        ],
        price: { amountMinor: '12000000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
        regularPrice: { amountMinor: '12000000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
        salePrice: null,
        image: { url: '/Highlights/AF-10800.jpg', altText: 'Isla Satin Tie Midi Dress M Rose' },
      },
    ],
    relatedProductIds: ['633', '634'],
    upsellProductIds: ['634'],
    crossSellProductIds: ['635'],
  },
  {
    id: '633',
    handle: 'aurelia-draped-top',
    title: 'Aurelia Draped Top',
    description: 'Aurelia Draped Top features sculptural asymmetric draping in a rich forest green print, bringing statement editorial flare to any ensemble.',
    descriptionHtml: '<p>Aurelia Draped Top features sculptural asymmetric draping in a rich forest green print, bringing statement editorial flare to any ensemble.</p>',
    shortDescription: 'Asymmetric draped top in vibrant forest print.',
    shortDescriptionHtml: '<p>Asymmetric draped top in vibrant forest print.</p>',
    sku: 'FAB-TOP-008',
    productType: 'Tops',
    tags: ['draped', 'green', 'statement'],
    brands: ['FabTops'],
    averageRating: 4.8,
    reviewCount: 9,
    featuredImage: {
      url: '/Highlights/AF-10721.jpg',
      altText: 'Aurelia Draped Top in green print',
    },
    gallery: [
      { url: '/Highlights/AF-10721.jpg', altText: 'Aurelia Draped Top front view' },
      { url: '/Highlights/AF-10595.jpg', altText: 'Aurelia Draped Top detail' },
    ],
    price: { amountMinor: '8500000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
    regularPrice: { amountMinor: '8500000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
    salePrice: null,
    priceRange: {
      min: { amountMinor: '8500000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
      max: { amountMinor: '8500000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
    },
    hasOptions: true,
    availability: {
      inStock: true,
      purchasable: true,
      onBackorder: false,
      stockStatus: 'instock',
    },
    cardBadge: { label: 'Bestseller', key: 'bestseller' },
    options: [{ id: '2', name: 'Size', values: ['S', 'M', 'L'] }],
    categories: [{ id: '95', handle: 'tops', title: 'Tops' }],
    variationIds: [],
    relatedProductIds: ['632', '634'],
    upsellProductIds: [],
    crossSellProductIds: ['635'],
  },
  {
    id: '634',
    handle: 'structured-blazer-trouser-set',
    title: 'Structured Blazer & Trouser Set',
    description: 'Coordinated two-piece tailored ensemble featuring a structured lapel blazer and wide-leg trousers.',
    descriptionHtml: '<p>Coordinated two-piece tailored ensemble featuring a structured lapel blazer and wide-leg trousers.</p>',
    shortDescription: 'Tailored 2-piece blazer and pant set.',
    shortDescriptionHtml: '<p>Tailored 2-piece blazer and pant set.</p>',
    sku: 'FAB-SET-004',
    productType: 'Sets',
    tags: ['tailored', 'blazer', 'set'],
    brands: ['FabTops'],
    averageRating: 5.0,
    reviewCount: 22,
    featuredImage: {
      url: '/Highlights/AF-10902.jpg',
      altText: 'Structured Blazer & Trouser Set',
    },
    gallery: [
      { url: '/Highlights/AF-10902.jpg', altText: 'Structured Blazer & Trouser Set portrait' },
      { url: '/Highlights/AF-10955.jpg', altText: 'Structured Blazer & Trouser Set detail' },
    ],
    price: { amountMinor: '18500000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
    regularPrice: { amountMinor: '18500000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
    salePrice: null,
    priceRange: {
      min: { amountMinor: '18500000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
      max: { amountMinor: '18500000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
    },
    hasOptions: true,
    availability: {
      inStock: true,
      purchasable: true,
      onBackorder: false,
      stockStatus: 'instock',
    },
    options: [{ id: '2', name: 'Size', values: ['XS', 'S', 'M', 'L'] }],
    categories: [{ id: '96', handle: 'sets', title: 'Sets' }],
    variationIds: [],
    relatedProductIds: ['632', '633'],
    upsellProductIds: [],
    crossSellProductIds: ['635'],
  },
  {
    id: '635',
    handle: 'statement-floral-earring-eyewear-set',
    title: 'Statement Floral Earring & Eyewear Set',
    description: 'Curated accessory pairing including statement sculpted floral earrings and oversized tinted sunglasses.',
    descriptionHtml: '<p>Curated accessory pairing including statement sculpted floral earrings and oversized tinted sunglasses.</p>',
    shortDescription: 'Sculpted floral earrings & sunglasses set.',
    shortDescriptionHtml: '<p>Sculpted floral earrings & sunglasses set.</p>',
    sku: 'FAB-ACC-002',
    productType: 'Accessories',
    tags: ['accessories', 'earrings', 'eyewear'],
    brands: ['FabTops'],
    averageRating: 4.7,
    reviewCount: 7,
    featuredImage: {
      url: '/Highlights/AF-10611.jpg',
      altText: 'Statement Floral Earring & Eyewear Set',
    },
    gallery: [
      { url: '/Highlights/AF-10611.jpg', altText: 'Eyewear and earrings detail' },
      { url: '/Highlights/AF-10674.jpg', altText: 'Floral earring close up' },
    ],
    price: { amountMinor: '4500000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
    regularPrice: { amountMinor: '4500000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
    salePrice: null,
    priceRange: {
      min: { amountMinor: '4500000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
      max: { amountMinor: '4500000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
    },
    hasOptions: false,
    availability: {
      inStock: true,
      purchasable: true,
      onBackorder: false,
      stockStatus: 'instock',
    },
    options: [],
    categories: [{ id: '97', handle: 'accessories', title: 'Accessories' }],
    variationIds: [],
    relatedProductIds: ['632', '633'],
    upsellProductIds: [],
    crossSellProductIds: [],
  },
  {
    id: '636',
    handle: 'mustard-ribbon-detail-skirt-set',
    title: 'Mustard Ribbon Detail Skirt Set',
    description: 'Archival signature piece featuring hand-stitched ribbon paneling in vibrant mustard tones.',
    descriptionHtml: '<p>Archival signature piece featuring hand-stitched ribbon paneling in vibrant mustard tones.</p>',
    shortDescription: 'Archival mustard ribbon skirt set.',
    shortDescriptionHtml: '<p>Archival mustard ribbon skirt set.</p>',
    sku: 'FAB-ARC-001',
    productType: 'Archive',
    tags: ['archive', 'ribbon', 'mustard'],
    brands: ['FabTops'],
    averageRating: 5.0,
    reviewCount: 31,
    featuredImage: {
      url: '/Highlights/AF-11081.jpg',
      altText: 'Mustard Ribbon Detail Skirt Set',
    },
    gallery: [
      { url: '/Highlights/AF-11081.jpg', altText: 'Mustard Ribbon Skirt Set front' },
      { url: '/Highlights/AF-11072.jpg', altText: 'Mustard Ribbon Skirt Set full look' },
    ],
    price: { amountMinor: '14000000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
    regularPrice: { amountMinor: '14000000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
    salePrice: null,
    priceRange: {
      min: { amountMinor: '14000000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
      max: { amountMinor: '14000000', currencyCode: 'NGN', minorUnit: 2, symbol: '₦' },
    },
    hasOptions: true,
    availability: {
      inStock: false,
      purchasable: false,
      onBackorder: false,
      stockStatus: 'outofstock',
    },
    cardBadge: { label: 'Sold Out', key: 'sold_out' },
    options: [{ id: '2', name: 'Size', values: ['S', 'M', 'L'] }],
    categories: [{ id: '98', handle: 'archive', title: 'Archive' }],
    variationIds: [],
    relatedProductIds: ['632', '634'],
    upsellProductIds: [],
    crossSellProductIds: [],
  },
];

export const FALLBACK_REST_PRODUCTS: WooRestProduct[] = FALLBACK_PRODUCTS.map((prod) => ({
  id: Number(prod.id),
  name: prod.title,
  slug: prod.handle,
  permalink: `https://fabtops.example/product/${prod.handle}`,
  date_created: '2026-07-01T00:00:00',
  type: prod.hasOptions ? 'variable' : 'simple',
  status: 'publish',
  featured: prod.cardBadge?.key === 'bestseller',
  description: prod.descriptionHtml,
  short_description: prod.shortDescriptionHtml,
  sku: prod.sku,
  price: String(Number(prod.price.amountMinor) / 100),
  regular_price: String(Number(prod.price.amountMinor) / 100),
  sale_price: '',
  price_html: `<span>₦${(Number(prod.price.amountMinor) / 100).toLocaleString()}</span>`,
  on_sale: false,
  purchasable: prod.availability.purchasable,
  total_sales: 10,
  virtual: false,
  downloadable: false,
  manage_stock: false,
  stock_quantity: prod.availability.inStock ? 50 : 0,
  stock_status: prod.availability.stockStatus,
  backorders: 'no',
  backorders_allowed: false,
  backordered: false,
  sold_individually: false,
  categories: prod.categories.map((c) => ({ id: Number(c.id), name: c.title, slug: c.handle })),
  tags: prod.tags.map((t, idx) => ({ id: idx + 1, name: t, slug: t.toLowerCase() })),
  brands: [{ id: 174, name: 'FabTops', slug: 'fabtops' }],
  images: prod.gallery.map((g, idx) => ({ id: idx + 1, src: g.url, name: g.altText, alt: g.altText })),
  attributes: prod.options.map((opt, idx) => ({
    id: Number(opt.id),
    name: opt.name,
    slug: `pa_${opt.name.toLowerCase()}`,
    position: idx,
    visible: true,
    variation: true,
    options: opt.values,
  })),
  default_attributes: [],
  variations: prod.variationIds.map(Number),
  average_rating: String(prod.averageRating),
  rating_count: prod.reviewCount,
  related_ids: prod.relatedProductIds.map(Number),
  upsell_ids: prod.upsellProductIds.map(Number),
  cross_sell_ids: prod.crossSellProductIds.map(Number),
}));

/**
 * Get fallback product list filtered optionally by perPage and categoryId.
 */
export function getFallbackProducts(
  perPage = 20,
  categoryId?: number | string,
): StorefrontProduct[] {
  let list = FALLBACK_PRODUCTS;
  if (categoryId !== undefined && categoryId !== null && String(categoryId).trim() !== '') {
    const catStr = String(categoryId).toLowerCase();
    list = list.filter((p) =>
      p.categories.some((c) => c.id === catStr || c.handle.toLowerCase() === catStr),
    );
  }
  return list.slice(0, perPage);
}

/**
 * Get single fallback product by slug.
 */
export function getFallbackProductBySlug(slug: string): StorefrontProduct | null {
  return FALLBACK_PRODUCTS.find((p) => p.handle.toLowerCase() === slug.toLowerCase()) || null;
}

/**
 * Get single fallback product by ID.
 */
export function getFallbackProductById(id: number | string): StorefrontProduct | null {
  const idStr = String(id);
  return FALLBACK_PRODUCTS.find((p) => p.id === idStr) || null;
}

/**
 * Search fallback products by text query.
 */
export function searchFallbackProducts(search: string, perPage = 20): StorefrontProduct[] {
  const q = search.toLowerCase().trim();
  if (!q) return [];
  return FALLBACK_PRODUCTS.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)),
  ).slice(0, perPage);
}

/**
 * Return paginated fallback store result.
 */
export function getFallbackPaginatedStoreProducts(
  query: { page?: number; per_page?: number; category?: string; search?: string } = {},
): PaginatedStoreResult<StorefrontProduct> {
  const page = query.page || 1;
  const perPage = query.per_page || 24;

  let items = FALLBACK_PRODUCTS;
  if (query.category) {
    const cat = query.category.toLowerCase();
    items = items.filter((p) => p.categories.some((c) => c.id === cat || c.handle === cat));
  }
  if (query.search) {
    const s = query.search.toLowerCase().trim();
    items = items.filter((p) => p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
  }

  const total = items.length;
  const totalPages = Math.ceil(total / perPage) || 1;
  const pagedItems = items.slice((page - 1) * perPage, page * perPage);

  return {
    items: pagedItems,
    total,
    totalPages,
    currentPage: page,
    perPage,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Return fallback storefront filters.
 */
export function getFallbackStorefrontFilters(): StorefrontFilters {
  return {
    categories: FALLBACK_STORE_CATEGORIES.map((c) => ({ label: c.name, value: c.slug, count: 2 })),
    brands: [{ label: 'FabTops', value: 'fabtops' }],
    sizes: [
      { label: 'XS', value: 'xs', count: 2 },
      { label: 'S', value: 's', count: 5 },
      { label: 'M', value: 'm', count: 5 },
      { label: 'L', value: 'l', count: 5 },
      { label: 'XL', value: 'xl', count: 2 },
    ],
    tags: [
      { label: 'Midi', value: 'midi' },
      { label: 'Satin', value: 'satin' },
    ],
    stockStatuses: [
      { label: 'In Stock', value: 'instock' },
      { label: 'On Backorder', value: 'onbackorder' },
      { label: 'Out of Stock', value: 'outofstock' },
    ],
    priceRange: {
      min: 45000,
      max: 210000,
      currencyCode: 'NGN',
      minorUnit: 2,
    },
    ratingCounts: [{ rating: 5, count: 12 }],
  };
}
