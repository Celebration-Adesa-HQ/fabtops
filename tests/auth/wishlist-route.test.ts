import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getServerAuthSession = vi.fn();
const getCustomer = vi.fn();
const updateCustomer = vi.fn();

vi.mock('@/lib/auth/session', () => ({
  getServerAuthSession,
}));

vi.mock('@/lib/woocommerce/customers', () => ({
  getCustomer,
  updateCustomer,
}));

describe('wishlist route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds a product to the signed-in customer wishlist via customer meta_data', async () => {
    getServerAuthSession.mockResolvedValue({
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

    getCustomer.mockResolvedValue({
      id: 12,
      email: 'ada@example.com',
      first_name: 'Ada',
      last_name: 'Lovelace',
      billing: {},
      shipping: {},
      meta_data: [
        {
          id: 1,
          key: 'fabtops_wishlist',
          value: JSON.stringify(existing),
        },
      ],
    });
    updateCustomer.mockResolvedValue({
      id: 12,
      meta_data: [
        {
          key: 'fabtops_wishlist',
          value: JSON.stringify([...existing, added]),
        },
      ],
    });

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
    expect(getCustomer).toHaveBeenCalledWith('12');
    expect(updateCustomer).toHaveBeenCalledWith('12', {
      meta_data: [
        {
          key: 'fabtops_wishlist',
          value: JSON.stringify([...existing, added]),
        },
      ],
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
