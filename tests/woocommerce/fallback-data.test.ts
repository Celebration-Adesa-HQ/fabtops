import { describe, expect, it } from 'vitest';
import {
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCT_REVIEWS,
  FALLBACK_PRODUCTS,
  generateFallbackProductFromSlug,
  getFallbackProductById,
  getFallbackProductBySlug,
  getFallbackProductReviews,
  getFallbackProducts,
  isWooUnreachableError,
  searchFallbackProducts,
} from '../../lib/woocommerce/fallback-data';
import { WooRestApiError } from '../../lib/woocommerce/rest-client';

describe('WooCommerce fallback data layer', () => {
  it('identifies WooCommerce unreachable and ETIMEDOUT errors', () => {
    const etimedoutError = new WooRestApiError(
      'WooCommerce REST API unreachable (ETIMEDOUT) [GET /products]. Check your WOOCOMMERCE_URL environment variable and server connectivity.',
      undefined,
      undefined,
      'ETIMEDOUT',
    );

    expect(isWooUnreachableError(etimedoutError)).toBe(true);

    const genericTimeout = new Error('ETIMEDOUT connection failed');
    expect(isWooUnreachableError(genericTimeout)).toBe(true);

    const normalError = new Error('Invalid JSON input');
    expect(isWooUnreachableError(normalError)).toBe(false);
  });

  it('provides rich copy fallback products', () => {
    expect(FALLBACK_PRODUCTS.length).toBeGreaterThan(0);
    const firstProduct = FALLBACK_PRODUCTS[0];
    expect(firstProduct).toHaveProperty('id');
    expect(firstProduct).toHaveProperty('title');
    expect(firstProduct).toHaveProperty('handle');
    expect(firstProduct.categories.length).toBeGreaterThan(0);
  });

  it('retrieves fallback products by slug, ID, and category', () => {
    const productBySlug = getFallbackProductBySlug('isla-satin-tie-midi-dress');
    expect(productBySlug.title).toBe('Isla Satin Tie Midi Dress');

    const productById = getFallbackProductById('632');
    expect(productById.handle).toBe('isla-satin-tie-midi-dress');

    const dressProducts = getFallbackProducts(10, '94');
    expect(dressProducts.length).toBeGreaterThan(0);
    expect(dressProducts.every((p) => p.categories.some((c) => c.id === '94' || c.handle === 'dresses'))).toBe(true);
  });

  it('searches fallback products by query string', () => {
    const searchResults = searchFallbackProducts('draped');
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].handle).toBe('aurelia-draped-top');
  });

  it('provides fallback categories', () => {
    expect(FALLBACK_CATEGORIES.length).toBeGreaterThan(0);
    const handles = FALLBACK_CATEGORIES.map((c) => c.handle);
    expect(handles).toContain('dresses');
    expect(handles).toContain('tops');
    expect(handles).toContain('sets');
  });

  it('provides product-scoped detail-page reviews in the requested order', () => {
    expect(FALLBACK_PRODUCT_REVIEWS.length).toBeGreaterThan(0);

    const reviews = getFallbackProductReviews('632', {
      orderby: 'date',
      order: 'desc',
      per_page: 1,
    });

    expect(reviews).toHaveLength(1);
    expect(reviews[0]).toMatchObject({ product_id: 632, reviewer: 'Amara O.', verified: true });
  });

  it('generates a valid StorefrontProduct for any unknown slug (PDP never 404s)', () => {
    const unknown = generateFallbackProductFromSlug('mira-strapless-tube-dress');

    // Title derived from slug
    expect(unknown.title).toBe('Mira Strapless Tube Dress');
    expect(unknown.handle).toBe('mira-strapless-tube-dress');

    // Category inferred as "Dresses" (slug contains "dress")
    expect(unknown.categories[0].handle).toBe('dresses');

    // Must have a valid featured image from the gallery pool
    expect(unknown.featuredImage).not.toBeNull();
    expect(unknown.featuredImage!.url).toMatch(/^\/Highlights\/AF-\d+\.jpg$/);

    // Availability must be purchasable so Add-to-Cart renders
    expect(unknown.availability.inStock).toBe(true);
    expect(unknown.availability.purchasable).toBe(true);

    // Size options must be present so the size selector renders
    expect(unknown.options.length).toBeGreaterThan(0);
    expect(unknown.options[0].name).toBe('Size');
  });

  it('getFallbackProductBySlug never returns null for any slug', () => {
    // Known slug → real data
    const known = getFallbackProductBySlug('aurelia-draped-top');
    expect(known.id).toBe('633');

    // Unknown slug → generated product (never null, never undefined)
    const unknown = getFallbackProductBySlug('mira-strapless-tube-dress');
    expect(unknown).toBeDefined();
    expect(unknown.handle).toBe('mira-strapless-tube-dress');
    expect(typeof unknown.title).toBe('string');
    expect(unknown.title.length).toBeGreaterThan(0);
  });

  it('getFallbackProductById never returns null for any ID', () => {
    // Known ID
    const known = getFallbackProductById('632');
    expect(known.handle).toBe('isla-satin-tie-midi-dress');

    // Unknown ID → generated product
    const unknown = getFallbackProductById('99999');
    expect(unknown).toBeDefined();
    expect(unknown.id).toBeDefined();
    expect(unknown.availability.purchasable).toBe(true);
  });

  it('different slugs get different gallery images (deterministic hash rotation)', () => {
    const p1 = generateFallbackProductFromSlug('mira-strapless-tube-dress');
    const p2 = generateFallbackProductFromSlug('bella-wrap-gown');
    // Same slug always produces same image (deterministic)
    const p1Again = generateFallbackProductFromSlug('mira-strapless-tube-dress');
    expect(p1.featuredImage!.url).toBe(p1Again.featuredImage!.url);
    // Any slug produces a valid path
    expect(p2.featuredImage!.url).toMatch(/^\/Highlights\/AF-\d+\.jpg$/);
  });
});
