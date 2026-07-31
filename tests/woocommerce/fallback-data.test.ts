import { describe, expect, it } from 'vitest';
import {
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
  getFallbackProductById,
  getFallbackProductBySlug,
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
    expect(productBySlug).not.toBeNull();
    expect(productBySlug?.title).toBe('Isla Satin Tie Midi Dress');

    const productById = getFallbackProductById('632');
    expect(productById).not.toBeNull();
    expect(productById?.handle).toBe('isla-satin-tie-midi-dress');

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
});
