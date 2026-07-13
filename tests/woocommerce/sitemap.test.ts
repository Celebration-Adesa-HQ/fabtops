import { describe, expect, it, vi } from 'vitest';

vi.mock('../../lib/woocommerce/products', () => ({
  getProductSlugs: vi.fn().mockResolvedValue(['silk-top']),
  getCategories: vi.fn().mockResolvedValue([{ handle: 'new-arrivals' }]),
}));

describe('sitemap canonical URL', () => {
  it('uses the production FabTops domain without relying on public env', async () => {
    const { default: sitemap } = await import('../../app/sitemap');
    const entries = await sitemap();

    expect(entries.some((entry) => entry.url === 'https://fabtops.com.ng')).toBe(true);
    expect(entries.some((entry) => entry.url === 'https://fabtops.com.ng/product/silk-top')).toBe(true);
    expect(entries.some((entry) => entry.url === 'https://fabtops.com.ng/collections/new-arrivals')).toBe(true);
  });
});
