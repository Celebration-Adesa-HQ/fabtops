import { afterEach, describe, expect, it, vi } from 'vitest';

describe('wordpressAuthRequest', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('signs requests against the plugin endpoint derived from the store URL', async () => {
    vi.stubEnv('WOOCOMMERCE_STORE_URL', 'https://shop.example.com/');
    vi.stubEnv('FABTOPS_AUTH_CLIENT_SECRET', '12345678901234567890123456789012');

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { ok: true } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const { wordpressAuthRequest } = await import('../../lib/auth/wordpress-client');
    const response = await wordpressAuthRequest('/auth/login', {
      method: 'POST',
      body: { email: 'hello@example.com', password: 'password123' },
    });

    expect(response).toEqual({ success: true, data: { ok: true } });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers as HeadersInit);

    expect(url).toBe('https://shop.example.com/wp-json/fabtops/v1/auth/login');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('X-Fabtops-Timestamp')).toMatch(/^\d+$/);
    expect(headers.get('X-Fabtops-Nonce')).toBeTruthy();
    expect(headers.get('X-Fabtops-Signature')).toBeTruthy();
  });

  it('forwards a bearer token when a customer session is present', async () => {
    vi.stubEnv('WOOCOMMERCE_STORE_URL', 'https://shop.example.com/');
    vi.stubEnv('FABTOPS_AUTH_CLIENT_SECRET', '12345678901234567890123456789012');

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: {} }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const { wordpressAuthRequest } = await import('../../lib/auth/wordpress-client');
    await wordpressAuthRequest('/me', {
      bearerToken: 'opaque-access-token',
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers as HeadersInit);
    expect(headers.get('Authorization')).toBe('Bearer opaque-access-token');
  });
});
