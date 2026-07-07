/**
 * WooCommerce product data layer — SERVER ONLY
 *
 * All reads go through the REST API (wooRequest).
 * The Store API is intentionally NOT used here so there is a single,
 * consistently-secured code path for product data.
 *
 * Cache strategy:
 *  - Catalogue listings: revalidate every 60 s, tagged `woo-products`
 *  - Category list:      revalidate every 5 min, tagged `woo-categories`
 *  - Single product:     revalidate every 60 s, tagged `woo-product-<id>`
 *  - Search:             no-store (live results)
 *  - Sitemap slugs:      revalidate every 5 min
 */
import { adaptRestProduct } from './adapters';
import { wooRequest } from './rest-client';
import type {
  RestProduct,
  RestProductVariation,
  StorefrontCategory,
  StorefrontProduct,
} from './types';

// ─── Internal types ───────────────────────────────────────────────────────────

interface RestCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: { src: string; alt?: string } | null;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<StorefrontCategory[]> {
  const categories = await wooRequest<RestCategory[]>('/products/categories', {
    query: { per_page: 100, hide_empty: true },
    next: { revalidate: 300, tags: ['woo-categories'] },
  });

  return categories.map((c) => ({
    id: String(c.id),
    handle: c.slug,
    title: c.name,
    description: c.description,
    image: c.image ? { url: c.image.src, altText: c.image.alt || c.name } : null,
  }));
}

// ─── Product listings ─────────────────────────────────────────────────────────

export async function getProducts(
  perPage = 20,
  categoryId?: number | string,
): Promise<StorefrontProduct[]> {
  const products = await wooRequest<RestProduct[]>('/products', {
    query: {
      per_page: Math.min(perPage, 100),
      status: 'publish',
      ...(categoryId ? { category: String(categoryId) } : {}),
    },
    next: { revalidate: 60, tags: ['woo-products'] },
  });

  return Promise.all(products.map(adaptDetailedProduct));
}

export async function getProductsByCategorySlug(
  slug: string,
  perPage = 50,
): Promise<StorefrontProduct[] | null> {
  const categories = await getCategories();
  const category = categories.find((c) => c.handle === slug);
  if (!category) return null;
  return getProducts(perPage, category.id);
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchProducts(
  search: string,
  perPage = 20,
): Promise<StorefrontProduct[]> {
  const query = search.trim();
  if (!query) return [];

  const products = await wooRequest<RestProduct[]>('/products', {
    query: { search: query, per_page: perPage, status: 'publish' },
    cache: 'no-store',
  });

  return Promise.all(products.map(adaptDetailedProduct));
}

// ─── Single product ───────────────────────────────────────────────────────────

export async function getProductVariations(
  productId: number | string,
): Promise<RestProductVariation[]> {
  return wooRequest<RestProductVariation[]>(`/products/${productId}/variations`, {
    query: { per_page: 100 },
    next: { revalidate: 60, tags: [`woo-product-${productId}`] },
  });
}

async function adaptDetailedProduct(product: RestProduct): Promise<StorefrontProduct> {
  const variations =
    product.type === 'variable' ? await getProductVariations(product.id) : [];
  return adaptRestProduct(product, variations);
}

export async function getProductBySlug(slug: string): Promise<StorefrontProduct | null> {
  const products = await wooRequest<RestProduct[]>('/products', {
    query: { slug, status: 'publish', per_page: 1 },
    next: { revalidate: 60, tags: [`woo-product-${slug}`] },
  });
  return products[0] ? adaptDetailedProduct(products[0]) : null;
}

export async function getProductById(
  id: number | string,
): Promise<StorefrontProduct | null> {
  try {
    const product = await wooRequest<RestProduct>(`/products/${id}`, {
      next: { revalidate: 60, tags: [`woo-product-${id}`] },
    });
    return adaptDetailedProduct(product);
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) return null;
    throw error;
  }
}

// ─── Sitemap helpers ──────────────────────────────────────────────────────────

export async function getProductSlugs(): Promise<string[]> {
  const products = await wooRequest<Array<{ slug: string }>>('/products', {
    query: { per_page: 100, status: 'publish', _fields: 'slug' },
    next: { revalidate: 300, tags: ['woo-products'] },
  });
  return products.map((p) => p.slug);
}
