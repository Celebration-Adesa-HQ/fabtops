import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getServerAuthSession = vi.fn();
const wordpressAuthRequest = vi.fn();

vi.mock('@/lib/auth/session', () => ({
  getServerAuthSession,
}));

vi.mock('@/lib/auth/wordpress-client', () => ({
  wordpressAuthRequest,
}));

describe('wishlist route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds a product to the signed-in customer wishlist', async () => {
    getServerAuthSession.mockResolvedValue({
      accessToken: 'opaque-access-token',
      user: {
        id: '12',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      },
    });

    const existing = [
      {
        id: 'dress-1',
        variantId: '101',
        title: 'Silk Dress',
        handle: 'silk-dress',
        price: '1200.00',
        currencyCode: 'NGN',
        imageUrl: 'https://shop.example.com/dress.jpg',
        imageAlt: 'Silk Dress',
      },
    ];

    const added = {
      id: 'top-2',
      variantId: '202',
      title: 'Rose Top',
      handle: 'rose-top',
      price: '800.00',
      currencyCode: 'NGN',
      imageUrl: 'https://shop.example.com/top.jpg',
      imageAlt: 'Rose Top',
    };

    wordpressAuthRequest
      .mockResolvedValueOnce({ success: true, data: existing })
      .mockResolvedValueOnce({ success: true, data: [...existing, added] });

    const { POST } = await import('../../app/api/wishlist/route');
    const request = new NextRequest('https://fabtops.test/api/wishlist', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'add', product: added }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(wordpressAuthRequest).toHaveBeenNthCalledWith(1, '/me/wishlist', {
      bearerToken: 'opaque-access-token',
    });
    expect(wordpressAuthRequest).toHaveBeenNthCalledWith(2, '/me/wishlist', {
      method: 'PUT',
      bearerToken: 'opaque-access-token',
      body: {
        wishlist: [...existing, added],
      },
    });
  });

  it('returns 401 when the customer is not signed in', async () => {
    getServerAuthSession.mockResolvedValue(null);

    const { GET } = await import('../../app/api/wishlist/route');
    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      success: false,
    });
  });
});
