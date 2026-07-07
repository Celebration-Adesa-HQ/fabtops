import { fromMinorUnits, storeApiRequest } from './store-api';
import type { StoreApiProduct } from './types';

type StorefrontQueryValue = string | number | boolean | undefined;

export interface StoreApiTermCount {
  term: number;
  count: number;
}

export interface StoreApiRatingCount {
  rating: number;
  count: number;
}

export interface StoreApiCollectionPriceRange {
  min_price: string;
  max_price: string;
  currency_code: string;
  currency_minor_unit: number;
}

export interface StoreApiCollectionData {
  price_range: StoreApiCollectionPriceRange | null;
  attribute_counts: StoreApiTermCount[] | null;
  rating_counts: StoreApiRatingCount[] | null;
  taxonomy_counts: StoreApiTermCount[] | null;
}

export interface StoreApiProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: { id?: number; src: string; alt?: string | null } | null;
}

export interface StoreApiProductBrand {
  id: number;
  name: string;
  slug: string;
}

export interface StoreApiProductTag {
  id: number;
  name: string;
  slug: string;
}

export interface StoreApiProductAttribute {
  id: number;
  name: string;
  taxonomy: string;
  type?: string;
  order?: string;
  has_archives?: boolean;
}

export interface StoreApiProductAttributeTerm {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent?: number;
  count?: number;
  __experimentalVisual?: {
    type: string;
    value: string;
  };
}

export interface StoreApiProductReview {
  id: number;
  product_id: number;
  product_name: string;
  product_permalink: string;
  product_image?: {
    id: number;
    src: string;
    thumbnail: string;
    srcset: string;
    sizes: string;
    name: string;
    alt: string;
  };
  reviewer: string;
  review: string;
  rating: number;
  verified: boolean;
  formatted_date_created: string;
  date_created: string;
}

export interface StoreApiOrder {
  id: number;
  status: string;
  key?: string;
  totals?: Record<string, unknown>;
  items?: unknown[];
}

export interface StorefrontFilters {
  categories: string[];
  sizes: string[];
  priceRange: {
    min: number;
    max: number;
    currencyCode: string;
    minorUnit: number;
  } | null;
  ratingCounts: StoreApiRatingCount[];
}

interface BuildStorefrontFiltersInput {
  categories: StoreApiProductCategory[];
  sizeTerms: StoreApiProductAttributeTerm[];
  collectionData: StoreApiCollectionData | null;
}

interface StorefrontCollectionQuery extends Record<string, StorefrontQueryValue> {
  category?: string;
  calculate_price_range?: boolean;
  calculate_rating_counts?: boolean;
  calculate_taxonomy_counts?: string;
  'calculate_attribute_counts[0][taxonomy]'?: string;
  'calculate_attribute_counts[0][query_type]'?: 'and' | 'or';
}

interface StoreApiReviewQuery extends Record<string, StorefrontQueryValue> {
  page?: number;
  per_page?: number;
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'date_gmt' | 'id' | 'rating' | 'product';
  category_id?: string;
  product_id?: string;
}

export interface StoreApiProductQuery extends Record<string, StorefrontQueryValue> {
  page?: number;
  per_page?: number;
  search?: string;
  featured?: boolean;
  category?: string;
  brand?: string;
  tag?: string;
  min_price?: string;
  max_price?: string;
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'modified' | 'id' | 'include' | 'title' | 'slug' | 'price' | 'popularity' | 'rating' | 'menu_order' | 'comment_count';
}

export function buildStorefrontFilters({
  categories,
  sizeTerms,
  collectionData,
}: BuildStorefrontFiltersInput): StorefrontFilters {
  if (!collectionData) {
    return {
      categories: [],
      sizes: [],
      priceRange: null,
      ratingCounts: [],
    };
  }

  const taxonomyCounts = collectionData.taxonomy_counts || [];
  const attributeCounts = collectionData.attribute_counts || [];
  const priceRange = collectionData.price_range
    ? {
        min: Number(fromMinorUnits(collectionData.price_range.min_price, collectionData.price_range.currency_minor_unit)),
        max: Number(fromMinorUnits(collectionData.price_range.max_price, collectionData.price_range.currency_minor_unit)),
        currencyCode: collectionData.price_range.currency_code,
        minorUnit: collectionData.price_range.currency_minor_unit,
      }
    : null;

  const categoryLookup = new Map(categories.map((category) => [category.id, category.name]));
  const termLookup = new Map(sizeTerms.map((term) => [term.id, term.name]));

  return {
    categories: taxonomyCounts
      .filter((entry) => entry.count > 0 && categoryLookup.has(entry.term))
      .map((entry) => categoryLookup.get(entry.term) as string)
      .sort((left, right) => left.localeCompare(right)),
    sizes: attributeCounts
      .filter((entry) => entry.count > 0 && termLookup.has(entry.term))
      .map((entry) => termLookup.get(entry.term) as string)
      .sort((left, right) => left.localeCompare(right)),
    priceRange,
    ratingCounts: collectionData.rating_counts || [],
  };
}

export async function getStoreProducts(query: StoreApiProductQuery = {}) {
  const result = await storeApiRequest<StoreApiProduct[]>('/products', {
    query,
    next: { revalidate: 60, tags: ['woo-store-products'] },
  });

  return result.data;
}

export async function getStoreProductCategories() {
  const result = await storeApiRequest<StoreApiProductCategory[]>('/products/categories', {
    next: { revalidate: 300, tags: ['woo-store-categories'] },
  });

  return result.data;
}

export async function getStoreProductBrands() {
  const result = await storeApiRequest<StoreApiProductBrand[]>('/products/brands', {
    next: { revalidate: 300, tags: ['woo-store-brands'] },
  });

  return result.data;
}

export async function getStoreProductTags() {
  const result = await storeApiRequest<StoreApiProductTag[]>('/products/tags', {
    next: { revalidate: 300, tags: ['woo-store-tags'] },
  });

  return result.data;
}

export async function getStoreProductAttributes() {
  const result = await storeApiRequest<StoreApiProductAttribute[]>('/products/attributes', {
    next: { revalidate: 300, tags: ['woo-store-attributes'] },
  });

  return result.data;
}

export async function getStoreProductAttributeTerms(attributeId: number) {
  const result = await storeApiRequest<StoreApiProductAttributeTerm[]>(`/products/attributes/${attributeId}/terms`, {
    next: { revalidate: 300, tags: [`woo-store-attribute-terms-${attributeId}`] },
  });

  return result.data;
}

export async function getStoreProductCollectionData(query: StorefrontCollectionQuery = {}) {
  const result = await storeApiRequest<StoreApiCollectionData>('/products/collection-data', {
    query,
    cache: 'no-store',
  });

  return result.data;
}

export async function getStoreProductReviews(query: StoreApiReviewQuery = {}) {
  const reviewScope = query.product_id || query.category_id || 'all';
  const result = await storeApiRequest<StoreApiProductReview[]>('/products/reviews', {
    query,
    next: { revalidate: 60, tags: [`woo-product-reviews-${reviewScope}`] },
  });

  return result.data;
}

export async function getStoreCheckoutOrder(orderId: number | string, orderKey: string) {
  const result = await storeApiRequest<StoreApiOrder>(`/checkout/${orderId}`, {
    query: { key: orderKey },
    cache: 'no-store',
  });

  return result.data;
}

export async function getStoreOrder(orderId: number | string, orderKey: string, billingEmail?: string) {
  const result = await storeApiRequest<StoreApiOrder>(`/order/${orderId}`, {
    query: {
      key: orderKey,
      ...(billingEmail ? { billing_email: billingEmail } : {}),
    },
    cache: 'no-store',
  });

  return result.data;
}

export async function getStorefrontFilters(categorySlug?: string): Promise<StorefrontFilters> {
  const [categories, attributes] = await Promise.all([
    getStoreProductCategories(),
    getStoreProductAttributes(),
  ]);

  const sizeAttribute = attributes.find(
    (attribute) => attribute.taxonomy === 'pa_size' || attribute.name.toLowerCase() === 'size',
  );
  const selectedCategory = categorySlug
    ? categories.find((category) => category.slug === categorySlug)
    : null;

  const collectionData = await getStoreProductCollectionData({
    ...(selectedCategory ? { category: String(selectedCategory.id) } : {}),
    calculate_price_range: true,
    calculate_rating_counts: true,
    calculate_taxonomy_counts: 'product_cat',
    ...(sizeAttribute
      ? {
          'calculate_attribute_counts[0][taxonomy]': sizeAttribute.taxonomy,
          'calculate_attribute_counts[0][query_type]': 'or' as const,
        }
      : {}),
  });

  const sizeTerms = sizeAttribute
    ? await getStoreProductAttributeTerms(sizeAttribute.id)
    : [];

  return buildStorefrontFilters({
    categories,
    sizeTerms,
    collectionData,
  });
}
