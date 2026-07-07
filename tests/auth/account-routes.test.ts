import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const wordpressAuthRequest = vi.fn();

vi.mock('@/lib/auth/wordpress-client', () => ({
  wordpressAuthRequest,
}));

describe('account routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates auth cookies when login succeeds', async () => {
    wordpressAuthRequest.mockResolvedValue({
      success: true,
      data: {
        accessToken: 'session.access',
        refreshToken: 'session.refresh',
        accessExpiresAt: Date.now() + 15 * 60 * 1000,
        refreshExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        user: {
          id: '12',
          name: 'Ada Lovelace',
          email: 'ada@example.com',
        },
      },
    });

    const { POST } = await import('../../app/api/account/login/route');
    const request = new NextRequest('https://fabtops.test/api/account/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'ada@example.com', password: 'password123' }),
    });

    const response = await POST(request);
    const setCookie = response.headers.get('set-cookie') || '';
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      data: {
        user: {
          id: '12',
          email: 'ada@example.com',
        },
      },
    });
    expect(setCookie).toContain('fabtops_access_token=');
    expect(setCookie).toContain('fabtops_refresh_token=');
  });

  it('rejects malformed login payloads before calling the plugin', async () => {
    const { POST } = await import('../../app/api/account/login/route');
    const request = new NextRequest('https://fabtops.test/api/account/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'short' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(wordpressAuthRequest).not.toHaveBeenCalled();
  });
});
