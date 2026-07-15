/**
 * WooCommerce REST product data layer — SERVER ONLY
 *
 * Single-product detail and full variation data stay on wc/v3.
 */
import { adaptRestProduct } from './adapters';
import { wooRequest } from './rest-client';
import type {
  StorefrontCategory,
  StorefrontProduct,
  WooRestProduct,
  WooRestVariation,
} from './types';

interface RestCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: { src: string; alt?: string } | null;
}

export async function getCategories(): Promise<StorefrontCategory[]> {
  const categories = await wooRequest<RestCategory[]>('/products/categories', {
    query: { per_page: 100, hide_empty: true },
    next: { revalidate: 300, tags: ['woo-categories'] },
  });

  return categories.map((category) => ({
    id: String(category.id),
    handle: category.slug,
    title: category.name,
    description: category.description,
    image: category.image ? { url: category.image.src, altText: category.image.alt || category.name } : null,
  }));
}

export async function getProducts(
  perPage = 20,
  categoryId?: number | string,
): Promise<StorefrontProduct[]> {
  const products = await wooRequest<WooRestProduct[]>('/products', {
    query: {
      per_page: Math.min(perPage, 100),
      status: 'publish',
      ...(categoryId ? { category: String(categoryId) } : {}),
    },
    next: { revalidate: 60, tags: ['woo-products'] },
  });

  return products.map((product) => adaptRestProduct(product));
}

export async function getProductsByCategorySlug(
  slug: string,
  perPage = 50,
): Promise<StorefrontProduct[] | null> {
  const categories = await getCategories();
  const category = categories.find((item) => item.handle === slug);
  if (!category) return null;
  return getProducts(perPage, category.id);
}

export async function searchProducts(
  search: string,
  perPage = 20,
): Promise<StorefrontProduct[]> {
  const query = search.trim();
  if (!query) return [];

  const products = await wooRequest<WooRestProduct[]>('/products', {
    query: { search: query, per_page: perPage, status: 'publish' },
    cache: 'no-store',
  });

  return products.map((product) => adaptRestProduct(product));
}

export async function getProductVariations(
  productId: number | string,
): Promise<WooRestVariation[]> {
  try {
    return await wooRequest<WooRestVariation[]>(`/products/${productId}/variations`, {
      query: { per_page: 100 },
      next: { revalidate: 60, tags: [`woo-product-${productId}`] },
    });
  } catch (error) {
    console.warn(
      `[fabtops] Could not load variations for product ${productId}:`,
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

async function adaptDetailedProduct(product: WooRestProduct): Promise<StorefrontProduct> {
  const variations =
    product.type === 'variable' ? await getProductVariations(product.id) : [];
  return adaptRestProduct(product, variations);
}

export async function getProductBySlug(slug: string): Promise<StorefrontProduct | null> {
  const products = await wooRequest<WooRestProduct[]>('/products', {
    query: { slug, status: 'publish', per_page: 1 },
    next: { revalidate: 60, tags: [`woo-product-${slug}`] },
  });
  return products[0] ? adaptDetailedProduct(products[0]) : null;
}

export async function getProductById(
  id: number | string,
): Promise<StorefrontProduct | null> {
  try {
    const product = await wooRequest<WooRestProduct>(`/products/${id}`, {
      next: { revalidate: 60, tags: [`woo-product-${id}`] },
    });
    return adaptDetailedProduct(product);
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) return null;
    throw error;
  }
}

export async function getProductsByIds(ids: Array<string | number>): Promise<StorefrontProduct[]> {
  if (!ids.length) return [];

  const products = await wooRequest<WooRestProduct[]>('/products', {
    query: {
      include: ids.join(','),
      status: 'publish',
      per_page: Math.min(ids.length, 100),
    },
    next: { revalidate: 60, tags: ['woo-products'] },
  });

  return products.map((product) => adaptRestProduct(product));
}

function dedupeProducts(products: StorefrontProduct[]) {
  return products.filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index);
}

export async function getEditorialRecommendationsForProduct(product: StorefrontProduct, perGroup = 4) {
  const completeTheLookIds = Array.from(
    new Set(
      [...product.crossSellProductIds, ...product.upsellProductIds].filter((id) => id !== product.id),
    ),
  );

  const completeTheLook = dedupeProducts(await getProductsByIds(completeTheLookIds))
    .filter((item) => item.id !== product.id)
    .slice(0, perGroup);

  const blockedIds = new Set([product.id, ...completeTheLook.map((item) => item.id)]);
  const relatedIds = Array.from(
    new Set(product.relatedProductIds.filter((id) => !blockedIds.has(id))),
  );

  const preferredRelated = dedupeProducts(await getProductsByIds(relatedIds))
    .filter((item) => !blockedIds.has(item.id));

  if (preferredRelated.length >= perGroup) {
    return {
      completeTheLook,
      related: preferredRelated.slice(0, perGroup),
    };
  }

  const fallbackCategoryId = product.categories[0]?.id;
  const fallbackProducts = fallbackCategoryId
    ? await getProducts(perGroup + 4, fallbackCategoryId)
    : [];

  const related = dedupeProducts([...preferredRelated, ...fallbackProducts]).filter((item) => (
    !blockedIds.has(item.id)
  ));

  return {
    completeTheLook,
    related: related.slice(0, perGroup),
  };
}

export async function getRelatedProductsForProduct(product: StorefrontProduct, fallbackLimit = 4) {
  const recommendations = await getEditorialRecommendationsForProduct(product, fallbackLimit);
  return [...recommendations.completeTheLook, ...recommendations.related].slice(0, fallbackLimit);
}

export async function getProductSlugs(): Promise<string[]> {
  const products = await wooRequest<Array<{ slug: string }>>('/products', {
    query: { per_page: 100, status: 'publish', _fields: 'slug' },
    next: { revalidate: 300, tags: ['woo-products'] },
  });
  return products.map((product) => product.slug);
}
