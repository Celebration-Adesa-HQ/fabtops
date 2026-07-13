import { describe, expect, it } from 'vitest';
import { parseWooEnv } from '../../lib/woocommerce/env';

const validEnv = {
  WOOCOMMERCE_STORE_URL: 'https://shop.example.com/',
  WOOCOMMERCE_CONSUMER_KEY: 'ck_example',
  WOOCOMMERCE_CONSUMER_SECRET: 'cs_example',
  WOOCOMMERCE_API_VERSION: 'wc/v3',
};

describe('parseWooEnv', () => {
  it('normalizes the store URL and derives the Store API base', () => {
    expect(parseWooEnv(validEnv)).toMatchObject({
      storeUrl: 'https://shop.example.com',
      restBaseUrl: 'https://shop.example.com/wp-json/wc/v3',
      storeApiBaseUrl: 'https://shop.example.com/wp-json/wc/store/v1',
    });
  });

  it('rejects invalid key prefixes', () => {
    expect(() => parseWooEnv({
      ...validEnv,
      WOOCOMMERCE_CONSUMER_KEY: 'bad-key',
    })).toThrow(/ck_/);
  });

  it('rejects WooCommerce secrets in public environment variables', () => {
    expect(() => parseWooEnv({
      ...validEnv,
      NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET: 'cs_leaked',
    })).toThrow(/public/i);
  });
});
