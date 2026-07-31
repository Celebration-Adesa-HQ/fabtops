import { normalizeCheckoutResult, type SafeCheckoutResult } from './checkout';
import { adaptStoreProduct } from './adapters';
import {
  FALLBACK_STORE_CATEGORIES,
  getFallbackPaginatedStoreProducts,
  getFallbackProducts,
  getFallbackStorefrontFilters,
  isWooUnreachableError,
} from './fallback-data';
import { storeApiRequest, type StoreApiPaginationHeaders } from './store-api';
import type {
  PaginatedStoreResult,
  StoreApiProductCategory,
  StoreApiProductReview,
  StoreApiRatingCount,
  StorefrontFilterOption,
  StorefrontFilters,
  StorefrontProduct,
  WooStoreProduct,
} from './types';
export type { StoreApiPaginationHeaders } from './store-api';
export type {
  StoreApiProductCategory,
  StoreApiProductReview,
  StoreApiRatingCount,
  StorefrontFilterOption,
  StorefrontFilters,
} from './types';
import type { NormalizedShopQuery, StockStatus } from '../shop/shop-query';

type StorefrontQueryValue = string | number | boolean | undefined;

export interface StoreApiTermCount {
  term: number;
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

export interface StoreApiOrder {
  id: number;
  status: string;
  key?: string;
  payment_method?: string;
  totals?: {
    total_price?: string;
    currency_code?: string;
    currency_minor_unit?: number;
    [key: string]: unknown;
  };
  billing_address?: {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    state?: string;
    postcode?: string;
    country: string;
    email?: string;
    phone?: string;
  };
  shipping_address?: {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    state?: string;
    postcode?: string;
    country: string;
    phone?: string;
  };
  items?: Array<{
    id: number;
    quantity: number;
    name: string;
    images?: Array<{
      id?: number;
      src: string;
      thumbnail?: string;
      alt?: string;
    }>;
    totals?: {
      line_total?: string;
      currency_code?: string;
      currency_minor_unit?: number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }>;
}

interface BuildStorefrontFiltersInput {
  categories: StoreApiProductCategory[];
  brands: StoreApiProductBrand[];
  tags: StoreApiProductTag[];
  sizeTerms: StoreApiProductAttributeTerm[];
  collectionData: StoreApiCollectionData | null;
}

interface StorefrontCollectionQuery extends Record<string, StorefrontQueryValue> {
  category?: string;
  search?: string;
  min_price?: string;
  max_price?: string;
  stock_status?: StockStatus;
  calculate_price_range?: boolean;
  calculate_rating_counts?: boolean;
  calculate_taxonomy_counts?: string;
  'calculate_attribute_counts[0][taxonomy]'?: string;
  'calculate_attribute_counts[0][query_type]'?: 'and' | 'or';
  'attributes[0][attribute]'?: string;
  'attributes[0][term_id]'?: string;
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
  category?: string;
  min_price?: string;
  max_price?: string;
  stock_status?: StockStatus;
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'modified' | 'id' | 'include' | 'title' | 'slug' | 'price' | 'popularity' | 'rating' | 'menu_order' | 'comment_count';
  'attributes[0][attribute]'?: string;
  'attributes[0][term_id]'?: string;
}

export interface ProductQueryContext {
  categoryId?: number;
  sizeAttribute?: Pick<StoreApiProductAttribute, 'id' | 'taxonomy'> | null;
  sizeTermId?: number | null;
  priceMinorUnit?: number;
}

const STOCK_STATUS_OPTIONS: StorefrontFilterOption[] = [
  { label: 'In Stock', value: 'instock' },
  { label: 'On Backorder', value: 'onbackorder' },
  { label: 'Out of Stock', value: 'outofstock' },
];

function fromMinor(value: string, minorUnit: number) {
  if (minorUnit === 0) return Number(value || 0);
  return Number(value || 0) / (10 ** minorUnit);
}

function toMinor(value: number, minorUnit: number) {
  return Math.round(value * (10 ** minorUnit));
}

export function buildStorefrontFilters({
  categories,
  brands,
  tags,
  sizeTerms,
  collectionData,
}: BuildStorefrontFiltersInput): StorefrontFilters {
  if (!collectionData) {
    return {
      categories: [],
      brands: [],
      sizes: [],
      tags: [],
      stockStatuses: STOCK_STATUS_OPTIONS,
      priceRange: null,
      ratingCounts: [],
    };
  }

  const taxonomyCounts = collectionData.taxonomy_counts || [];
  const attributeCounts = collectionData.attribute_counts || [];
  const categoryLookup = new Map(categories.map((category) => [category.id, category]));
  const termLookup = new Map(sizeTerms.map((term) => [term.id, term]));

  return {
    categories: taxonomyCounts
      .filter((entry) => entry.count > 0 && categoryLookup.has(entry.term))
      .map((entry) => {
        const category = categoryLookup.get(entry.term)!;
        return {
          label: category.name,
          value: category.slug,
          count: entry.count,
        };
      })
      .sort((left, right) => left.label.localeCompare(right.label)),
    brands: brands
      .map((brand) => ({ label: brand.name, value: brand.slug }))
      .sort((left, right) => left.label.localeCompare(right.label)),
    sizes: attributeCounts
      .filter((entry) => entry.count > 0 && termLookup.has(entry.term))
      .map((entry) => {
        const term = termLookup.get(entry.term)!;
        return {
          label: term.name,
          value: term.slug,
          count: entry.count,
        };
      })
      .sort((left, right) => left.label.localeCompare(right.label)),
    tags: tags
      .map((tag) => ({ label: tag.name, value: tag.slug }))
      .sort((left, right) => left.label.localeCompare(right.label)),
    stockStatuses: STOCK_STATUS_OPTIONS,
    priceRange: collectionData.price_range
      ? {
          min: fromMinor(collectionData.price_range.min_price, collectionData.price_range.currency_minor_unit),
          max: fromMinor(collectionData.price_range.max_price, collectionData.price_range.currency_minor_unit),
          currencyCode: collectionData.price_range.currency_code,
          minorUnit: collectionData.price_range.currency_minor_unit,
        }
      : null,
    ratingCounts: collectionData.rating_counts || [],
  };
}

export function buildStoreApiProductQueryFromShopQuery(
  query: NormalizedShopQuery,
  context: ProductQueryContext = {},
): StoreApiProductQuery {
  const priceMinorUnit = context.priceMinorUnit ?? 2;
  const result: StoreApiProductQuery = {
    page: query.page,
    per_page: query.perPage,
    ...(query.search ? { search: query.search } : {}),
    ...(context.categoryId ? { category: String(context.categoryId) } : {}),
    ...(query.minPrice !== undefined ? { min_price: String(toMinor(query.minPrice, priceMinorUnit)) } : {}),
    ...(query.maxPrice !== undefined ? { max_price: String(toMinor(query.maxPrice, priceMinorUnit)) } : {}),
    ...(query.stockStatus ? { stock_status: query.stockStatus } : {}),
    ...(query.orderby ? { orderby: query.orderby } : {}),
    ...(query.order ? { order: query.order } : {}),
  };

  if (query.size && context.sizeAttribute?.taxonomy && context.sizeTermId) {
    result['attributes[0][attribute]'] = context.sizeAttribute.taxonomy;
    result['attributes[0][term_id]'] = String(context.sizeTermId);
  }

  return result;
}

export function buildAggregateQuery(
  query: NormalizedShopQuery,
  context: ProductQueryContext = {},
  excludeDimension: 'size' | 'stock' | 'price' | 'none' = 'none',
): StorefrontCollectionQuery {
  const priceMinorUnit = context.priceMinorUnit ?? 2;
  const result: StorefrontCollectionQuery = {
    ...(context.categoryId ? { category: String(context.categoryId) } : {}),
    ...(query.search ? { search: query.search } : {}),
    ...(excludeDimension !== 'price' && query.minPrice !== undefined
      ? { min_price: String(toMinor(query.minPrice, priceMinorUnit)) }
      : {}),
    ...(excludeDimension !== 'price' && query.maxPrice !== undefined
      ? { max_price: String(toMinor(query.maxPrice, priceMinorUnit)) }
      : {}),
    ...(excludeDimension !== 'stock' && query.stockStatus ? { stock_status: query.stockStatus } : {}),
    calculate_price_range: true,
    calculate_rating_counts: true,
    calculate_taxonomy_counts: 'product_cat',
    ...(context.sizeAttribute?.taxonomy
      ? {
          'calculate_attribute_counts[0][taxonomy]': context.sizeAttribute.taxonomy,
          'calculate_attribute_counts[0][query_type]': 'or' as const,
        }
      : {}),
  };

  if (
    excludeDimension !== 'size' &&
    query.size &&
    context.sizeAttribute?.taxonomy &&
    context.sizeTermId
  ) {
    result['attributes[0][attribute]'] = context.sizeAttribute.taxonomy;
    result['attributes[0][term_id]'] = String(context.sizeTermId);
  }

  return result;
}

export function normalizePaginatedCollectionResult<T>(
  items: T[],
  headers: StoreApiPaginationHeaders,
  input: { page: number; perPage: number },
): PaginatedStoreResult<T> {
  const parsedTotal = Number.parseInt(headers.total || '', 10);
  const parsedTotalPages = Number.parseInt(headers.totalPages || '', 10);
  const fallbackTotal = items.length + Math.max(0, input.page - 1) * input.perPage;
  const total = Number.isFinite(parsedTotal) ? parsedTotal : items.length;
  const totalPages = Number.isFinite(parsedTotalPages) ? parsedTotalPages : Math.max(input.page, items.length < input.perPage ? input.page : input.page);

  return {
    items,
    total: Number.isFinite(parsedTotal) ? parsedTotal : Math.max(items.length, fallbackTotal > 0 ? items.length : 0),
    totalPages,
    currentPage: input.page,
    perPage: input.perPage,
    hasPrevPage: input.page > 1,
    hasNextPage: input.page < totalPages && items.length > 0,
  };
}

export async function getStoreProducts(query: StoreApiProductQuery = {}) {
  try {
    const result = await storeApiRequest<WooStoreProduct[]>('/products', {
      query,
      next: { revalidate: 60, tags: ['woo-store-products'] },
    });

    return result.data.map(adaptStoreProduct);
  } catch (error) {
    if (isWooUnreachableError(error)) {
      console.warn('[fabtops] WooCommerce Store API unreachable (getStoreProducts). Returning copy fallback products.');
      return getFallbackProducts(query.per_page || 20, query.category);
    }
    throw error;
  }
}

export async function getPaginatedStoreProducts(query: StoreApiProductQuery = {}) {
  try {
    const result = await storeApiRequest<WooStoreProduct[]>('/products', {
      query,
      next: { revalidate: 60, tags: ['woo-store-products'] },
    });

    return normalizePaginatedCollectionResult(
      result.data.map(adaptStoreProduct),
      result.pagination,
      {
        page: query.page || 1,
        perPage: query.per_page || 24,
      },
    );
  } catch (error) {
    if (isWooUnreachableError(error)) {
      console.warn('[fabtops] WooCommerce Store API unreachable (getPaginatedStoreProducts). Returning copy fallback paginated store products.');
      return getFallbackPaginatedStoreProducts(query);
    }
    throw error;
  }
}

export async function getStoreProductCategories() {
  try {
    const result = await storeApiRequest<StoreApiProductCategory[]>('/products/categories', {
      next: { revalidate: 300, tags: ['woo-store-categories'] },
    });

    return result.data;
  } catch (error) {
    if (isWooUnreachableError(error)) {
      console.warn('[fabtops] WooCommerce Store API unreachable (getStoreProductCategories). Returning copy fallback store categories.');
      return FALLBACK_STORE_CATEGORIES;
    }
    throw error;
  }
}

export async function getStoreProductBrands() {
  try {
    const result = await storeApiRequest<StoreApiProductBrand[]>('/products/brands', {
      next: { revalidate: 300, tags: ['woo-store-brands'] },
    });

    return result.data;
  } catch (error) {
    if (isWooUnreachableError(error)) {
      return [{ id: 174, name: 'FabTops', slug: 'fabtops' }];
    }
    throw error;
  }
}

export async function getStoreProductTags() {
  try {
    const result = await storeApiRequest<StoreApiProductTag[]>('/products/tags', {
      next: { revalidate: 300, tags: ['woo-store-tags'] },
    });

    return result.data;
  } catch (error) {
    if (isWooUnreachableError(error)) {
      return [
        { id: 1, name: 'midi', slug: 'midi' },
        { id: 2, name: 'satin', slug: 'satin' },
        { id: 3, name: 'Fab Babe Circle', slug: 'fab-babe-circle' },
      ];
    }
    throw error;
  }
}

export async function getStoreProductAttributes() {
  try {
    const result = await storeApiRequest<StoreApiProductAttribute[]>('/products/attributes', {
      next: { revalidate: 300, tags: ['woo-store-attributes'] },
    });

    return result.data;
  } catch (error) {
    if (isWooUnreachableError(error)) {
      return [{ id: 2, name: 'Size', taxonomy: 'pa_size' }];
    }
    throw error;
  }
}

export async function getStoreProductAttributeTerms(attributeId: number) {
  try {
    const result = await storeApiRequest<StoreApiProductAttributeTerm[]>(`/products/attributes/${attributeId}/terms`, {
      next: { revalidate: 300, tags: [`woo-store-attribute-terms-${attributeId}`] },
    });

    return result.data;
  } catch (error) {
    if (isWooUnreachableError(error)) {
      return [
        { id: 10, name: 'XS', slug: 'xs' },
        { id: 11, name: 'S', slug: 's' },
        { id: 12, name: 'M', slug: 'm' },
        { id: 13, name: 'L', slug: 'l' },
        { id: 14, name: 'XL', slug: 'xl' },
      ];
    }
    throw error;
  }
}

export async function getStoreProductCollectionData(
  query: StorefrontCollectionQuery = {},
  cacheTag = 'woo-store-collection-data',
) {
  try {
    const result = await storeApiRequest<StoreApiCollectionData>('/products/collection-data', {
      query,
      next: { revalidate: 60, tags: [cacheTag] },
    });

    return result.data;
  } catch (error) {
    if (isWooUnreachableError(error)) {
      return {
        price_range: {
          min_price: '4500000',
          max_price: '21000000',
          currency_code: 'NGN',
          currency_minor_unit: 2,
        },
        attribute_counts: [
          { term: 10, count: 2 },
          { term: 11, count: 5 },
          { term: 12, count: 5 },
          { term: 13, count: 5 },
          { term: 14, count: 2 },
        ],
        rating_counts: [{ rating: 5, count: 12 }],
        taxonomy_counts: [
          { term: 94, count: 2 },
          { term: 95, count: 2 },
          { term: 96, count: 2 },
          { term: 97, count: 2 },
          { term: 98, count: 2 },
        ],
      };
    }
    throw error;
  }
}

export async function getStoreProductReviews(query: StoreApiReviewQuery = {}) {
  const reviewScope = query.product_id || query.category_id || 'all';
  try {
    const result = await storeApiRequest<StoreApiProductReview[]>('/products/reviews', {
      query,
      next: { revalidate: 60, tags: [`woo-product-reviews-${reviewScope}`] },
    });

    return result.data;
  } catch (error) {
    if (isWooUnreachableError(error)) {
      return [];
    }
    throw error;
  }
}

export async function getStoreCheckoutOrder(orderId: number | string, orderKey: string) {
  // Existing-order recovery only. Do not use this for current-cart checkout.
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

interface StoreCheckoutOrderInput {
  key: string;
  billing_email?: string;
  payment_method: string;
  payment_data: Array<{ key: string; value: string }>;
  billing_address: {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    state?: string;
    postcode?: string;
    country: string;
    email?: string;
    phone?: string;
  };
  shipping_address: {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    state?: string;
    postcode?: string;
    country: string;
    phone?: string;
  };
}

interface StoreCheckoutOrderResponse {
  order_id: number;
  status: string;
  order_key: string;
  payment_result: {
    payment_status: string;
    payment_details: Array<{ key: string; value: string }>;
    redirect_url: string;
  } | null;
}

export async function submitStoreCheckoutOrder(
  orderId: number | string,
  input: StoreCheckoutOrderInput,
  cartToken: string,
  bearerToken?: string | null,
): Promise<{ checkout: SafeCheckoutResult; cartToken: string | null }> {
  // Existing-order recovery only. Current-cart checkout belongs in lib/woocommerce/checkout.ts.
  const result = await storeApiRequest<StoreCheckoutOrderResponse>(`/checkout/${orderId}`, {
    method: 'POST',
    cartToken,
    bearerToken,
    body: JSON.stringify(input),
  });

  return {
    checkout: normalizeCheckoutResult(result.data),
    cartToken: result.cartToken,
  };
}

export async function getStorefrontFilters(query: StorefrontCollectionQuery = {}): Promise<StorefrontFilters> {
  try {
    const [categories, brands, tags, attributes] = await Promise.all([
      getStoreProductCategories(),
      getStoreProductBrands(),
      getStoreProductTags(),
      getStoreProductAttributes(),
    ]);

    const sizeAttribute = attributes.find(
      (attribute) => attribute.taxonomy === 'pa_size' || attribute.name.toLowerCase() === 'size',
    );

    const [collectionData, sizeTerms] = await Promise.all([
      getStoreProductCollectionData(query),
      sizeAttribute ? getStoreProductAttributeTerms(sizeAttribute.id) : Promise.resolve([]),
    ]);

    return buildStorefrontFilters({
      categories,
      brands,
      tags,
      sizeTerms,
      collectionData,
    });
  } catch (error) {
    if (isWooUnreachableError(error)) {
      console.warn('[fabtops] WooCommerce Store API unreachable (getStorefrontFilters). Returning copy fallback filters.');
      return getFallbackStorefrontFilters();
    }
    throw error;
  }
}
