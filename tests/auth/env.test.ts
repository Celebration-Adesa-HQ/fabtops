import { describe, expect, it } from 'vitest';
import { parseAuthEnv } from '../../lib/auth/env';

const validEnv = {
  WOOCOMMERCE_STORE_URL: 'https://shop.example.com/',
  FABTOPS_AUTH_CLIENT_SECRET: '12345678901234567890123456789012',
};

describe('parseAuthEnv', () => {
  it('derives the plugin API base from the WooCommerce store URL', () => {
    expect(parseAuthEnv(validEnv)).toEqual({
      authBaseUrl: 'https://shop.example.com/wp-json/fabtops/v1',
      clientSecret: '12345678901234567890123456789012',
    });
  });

  it('rejects public auth secrets', () => {
    expect(() =>
      parseAuthEnv({
        ...validEnv,
        NEXT_PUBLIC_FABTOPS_AUTH_CLIENT_SECRET: 'nope',
      }),
    ).toThrow(/public/i);
  });
});
