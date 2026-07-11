export const APP_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;
export const APP_MAX_PAGE_SIZE = 24;

export type ShopSortField = 'date' | 'price' | 'popularity' | 'rating' | 'title' | 'menu_order';
export type ShopSortOrder = 'asc' | 'desc';
export type StockStatus = 'instock' | 'outofstock' | 'onbackorder';

export interface NormalizedShopQuery {
  page: number;
  perPage: number;
  category?: string;
  size?: string;
  search: string;
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: StockStatus;
  orderby: ShopSortField;
  order: ShopSortOrder;
}

export interface ShopQueryConstraints {
  basePath: string;
  allowedCategorySlugs?: string[];
  fixedCategorySlug?: string;
  sizeAttributeTaxonomy: string;
}

export interface ParsedShopQueryResult {
  query: NormalizedShopQuery;
  canonicalPath: string;
  changed: boolean;
}

type RawSearchParams = Record<string, string | string[] | undefined>;

const SORT_FIELDS = new Set<ShopSortField>(['date', 'price', 'popularity', 'rating', 'title', 'menu_order']);
const SORT_ORDERS = new Set<ShopSortOrder>(['asc', 'desc']);
const STOCK_VALUES = new Set<StockStatus>(['instock', 'outofstock', 'onbackorder']);

function firstValue(input: string | string[] | undefined) {
  if (Array.isArray(input)) return input[0];
  return input;
}

function normalizedString(input: string | undefined) {
  return input?.trim().replace(/\s+/g, ' ') || '';
}

function positiveInt(input: string | undefined) {
  if (!input) return undefined;
  const parsed = Number.parseInt(input, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function nonNegativeInt(input: string | undefined) {
  if (!input) return undefined;
  const parsed = Number.parseInt(input, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function allowedCategory(input: string | undefined, allowed?: string[]) {
  if (!input) return undefined;
  if (!allowed?.length) return input;
  return allowed.includes(input) ? input : undefined;
}

export function serializeShopQuery(query: NormalizedShopQuery) {
  const params = new URLSearchParams();

  if (query.page > 1) params.set('page', String(query.page));
  if (query.perPage !== APP_PAGE_SIZE) params.set('per_page', String(query.perPage));
  if (query.category) params.set('category', query.category);
  if (query.size) params.set('size', query.size);
  if (query.search) params.set('search', query.search);
  if (query.minPrice !== undefined) params.set('min_price', String(query.minPrice));
  if (query.maxPrice !== undefined) params.set('max_price', String(query.maxPrice));
  if (query.stockStatus) params.set('stock_status', query.stockStatus);
  if (query.orderby !== 'date') params.set('orderby', query.orderby);
  if (query.order !== 'desc') params.set('order', query.order);

  return params.toString();
}

export function parseShopQuery(
  rawSearchParams: RawSearchParams,
  constraints: ShopQueryConstraints,
): ParsedShopQueryResult {
  const rawPage = firstValue(rawSearchParams.page);
  const rawPerPage = firstValue(rawSearchParams.per_page);
  const rawCategory = firstValue(rawSearchParams.category);
  const rawSize = firstValue(rawSearchParams.size);
  const rawSearch = firstValue(rawSearchParams.search);
  const rawMinPrice = firstValue(rawSearchParams.min_price);
  const rawMaxPrice = firstValue(rawSearchParams.max_price);
  const rawStockStatus = firstValue(rawSearchParams.stock_status);
  const rawOrderBy = firstValue(rawSearchParams.orderby);
  const rawOrder = firstValue(rawSearchParams.order);

  const page = positiveInt(rawPage) ?? 1;
  const perPage = Math.min(Math.max(positiveInt(rawPerPage) ?? APP_PAGE_SIZE, 1), APP_MAX_PAGE_SIZE, MAX_PAGE_SIZE);
  const search = normalizedString(rawSearch);
  const fixedCategory = constraints.fixedCategorySlug;
  const category = fixedCategory
    ? fixedCategory
    : allowedCategory(normalizedString(rawCategory) || undefined, constraints.allowedCategorySlugs);
  const size = normalizedString(rawSize) || undefined;
  const minPrice = nonNegativeInt(rawMinPrice);
  const maxPrice = nonNegativeInt(rawMaxPrice);
  const stockStatus = STOCK_VALUES.has(rawStockStatus as StockStatus)
    ? (rawStockStatus as StockStatus)
    : undefined;
  const orderby = SORT_FIELDS.has(rawOrderBy as ShopSortField)
    ? (rawOrderBy as ShopSortField)
    : 'date';
  const order = SORT_ORDERS.has(rawOrder as ShopSortOrder)
    ? (rawOrder as ShopSortOrder)
    : 'desc';

  const query: NormalizedShopQuery = {
    page,
    perPage,
    category,
    size,
    search,
    minPrice,
    maxPrice,
    stockStatus,
    orderby,
    order,
  };

  if (
    query.minPrice !== undefined &&
    query.maxPrice !== undefined &&
    query.minPrice >= query.maxPrice
  ) {
    delete query.minPrice;
    delete query.maxPrice;
  }

  const serialized = serializeShopQuery({
    ...query,
    category: constraints.fixedCategorySlug ? undefined : query.category,
  });
  const canonicalPath = serialized ? `${constraints.basePath}?${serialized}` : constraints.basePath;
  const changed = canonicalizeRawPath(rawSearchParams) !== serialized;

  return {
    query,
    canonicalPath,
    changed,
  };
}

function canonicalizeRawPath(rawSearchParams: RawSearchParams) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(rawSearchParams)) {
    const resolved = firstValue(value);
    if (resolved !== undefined) params.set(key, resolved);
  }
  return params.toString();
}

export function buildNextShopQuery(
  currentQuery: NormalizedShopQuery,
  patch: Partial<NormalizedShopQuery>,
): NormalizedShopQuery {
  const nextQuery: NormalizedShopQuery = {
    ...currentQuery,
    ...patch,
  };

  const resetKeys: Array<keyof NormalizedShopQuery> = [
    'search',
    'orderby',
    'order',
    'category',
    'size',
    'minPrice',
    'maxPrice',
    'stockStatus',
  ];

  const shouldResetPage = resetKeys.some((key) => key in patch && currentQuery[key] !== nextQuery[key]);
  if (shouldResetPage) nextQuery.page = 1;

  nextQuery.perPage = Math.min(Math.max(nextQuery.perPage, 1), APP_MAX_PAGE_SIZE, MAX_PAGE_SIZE);

  if (
    nextQuery.minPrice !== undefined &&
    nextQuery.maxPrice !== undefined &&
    nextQuery.minPrice >= nextQuery.maxPrice
  ) {
    delete nextQuery.minPrice;
    delete nextQuery.maxPrice;
  }

  return nextQuery;
}
