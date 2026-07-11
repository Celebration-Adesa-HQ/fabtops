import {
  APP_PAGE_SIZE,
  parseShopQuery,
  serializeShopQuery,
  type NormalizedShopQuery,
  type ShopQueryConstraints,
} from '../shop/shop-query';
import {
  buildAggregateQuery,
  buildStoreApiProductQueryFromShopQuery,
  getPaginatedStoreProducts,
  getStoreProductAttributeTerms,
  getStoreProductAttributes,
  getStoreProductCategories,
  getStorefrontFilters,
  type StoreApiProductAttribute,
  type StoreApiProductAttributeTerm,
} from './storefront';

export interface CatalogPageData {
  query: NormalizedShopQuery;
  canonicalPath: string;
  redirectPath: string | null;
  result: Awaited<ReturnType<typeof getPaginatedStoreProducts>>;
  filters: Awaited<ReturnType<typeof getStorefrontFilters>>;
  categoryHandle?: string;
}

function withUpdatedPage(basePath: string, query: NormalizedShopQuery, page: number) {
  const serialized = serializeShopQuery({ ...query, page });
  return serialized ? `${basePath}?${serialized}` : basePath;
}

function sizeAttribute(attributes: StoreApiProductAttribute[]) {
  return attributes.find((attribute) => attribute.taxonomy === 'pa_size' || attribute.name.toLowerCase() === 'size') || null;
}

function sizeTerm(terms: StoreApiProductAttributeTerm[], slug?: string) {
  if (!slug) return null;
  return terms.find((term) => term.slug === slug) || null;
}

export async function loadCatalogPageData(
  rawSearchParams: Record<string, string | string[] | undefined>,
  constraints: ShopQueryConstraints,
): Promise<CatalogPageData | null> {
  const [categories, attributes] = await Promise.all([
    getStoreProductCategories(),
    getStoreProductAttributes(),
  ]);

  const fixedCategory = constraints.fixedCategorySlug
    ? categories.find((category) => category.slug === constraints.fixedCategorySlug)
    : null;
  if (constraints.fixedCategorySlug && !fixedCategory) return null;

  const parsed = parseShopQuery(rawSearchParams, {
    ...constraints,
    allowedCategorySlugs: categories.map((category) => category.slug),
  });

  const resolvedCategory = parsed.query.category
    ? categories.find((category) => category.slug === parsed.query.category)
    : undefined;
  const resolvedSizeAttribute = sizeAttribute(attributes);
  const sizeTerms = resolvedSizeAttribute
    ? await getStoreProductAttributeTerms(resolvedSizeAttribute.id)
    : [];
  const resolvedSizeTerm = sizeTerm(sizeTerms, parsed.query.size);

  const query = resolvedSizeAttribute && parsed.query.size && !resolvedSizeTerm
    ? { ...parsed.query, size: undefined, page: 1 }
    : parsed.query;

  const productQuery = buildStoreApiProductQueryFromShopQuery(query, {
    categoryId: resolvedCategory?.id,
    sizeAttribute: resolvedSizeAttribute,
    sizeTermId: resolvedSizeTerm?.id,
  });
  const aggregateQuery = buildAggregateQuery(query, {
    categoryId: resolvedCategory?.id,
    sizeAttribute: resolvedSizeAttribute,
    sizeTermId: resolvedSizeTerm?.id,
  }, 'size');

  const [result, filters] = await Promise.all([
    getPaginatedStoreProducts(productQuery),
    getStorefrontFilters(aggregateQuery),
  ]);

  const canonicalPath = serializeShopQuery({
    ...query,
    category: constraints.fixedCategorySlug ? undefined : query.category,
  });
  const canonicalUrl = canonicalPath ? `${constraints.basePath}?${canonicalPath}` : constraints.basePath;

  let redirectPath: string | null = null;
  if (parsed.changed || query !== parsed.query) {
    redirectPath = canonicalUrl;
  } else if (result.totalPages > 0 && query.page > result.totalPages) {
    redirectPath = withUpdatedPage(constraints.basePath, query, result.totalPages);
  } else if (result.totalPages === 0 && query.page > 1) {
    redirectPath = withUpdatedPage(constraints.basePath, query, 1);
  }

  return {
    query,
    canonicalPath: canonicalUrl,
    redirectPath,
    result: result.totalPages > 0 && query.page > result.totalPages
      ? { ...result, currentPage: result.totalPages }
      : result,
    filters,
    categoryHandle: resolvedCategory?.slug || fixedCategory?.slug,
  };
}

export const DEFAULT_CATALOG_QUERY = {
  page: 1,
  perPage: APP_PAGE_SIZE,
  search: '',
  orderby: 'date',
  order: 'desc',
} as const;
