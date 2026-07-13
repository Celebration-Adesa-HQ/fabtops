import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getServerAuthSession = vi.fn();
const prismaWishlistFindMany = vi.fn();
const prismaWishlistUpsert = vi.fn();
const prismaWishlistDeleteMany = vi.fn();

vi.mock('@/lib/auth/session', () => ({
  getServerAuthSession,
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    wishlistItem: {
      findMany: prismaWishlistFindMany,
      upsert: prismaWishlistUpsert,
      deleteMany: prismaWishlistDeleteMany,
    },
  },
}));

describe('wishlist route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds a product to the signed-in user wishlist in Prisma', async () => {
    getServerAuthSession.mockResolvedValue({
      user: {
        id: 'user_12',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      },
    });

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

    prismaWishlistUpsert.mockResolvedValue({
      id: 'wish_1',
      userId: 'user_12',
      productId: 'top-2',
      variantId: '202',
      title: 'Rose Top',
      handle: 'rose-top',
      price: '800.00',
      currencyCode: 'NGN',
      imageUrl: 'https://shop.example.com/top.jpg',
      imageAlt: 'Rose Top',
    });
    prismaWishlistFindMany.mockResolvedValue([
      {
        id: 'wish_1',
        userId: 'user_12',
        productId: 'top-2',
        variantId: '202',
        title: 'Rose Top',
        handle: 'rose-top',
        price: '800.00',
        currencyCode: 'NGN',
        imageUrl: 'https://shop.example.com/top.jpg',
        imageAlt: 'Rose Top',
      },
    ]);

    const { POST } = await import('../../app/api/wishlist/route');
    const request = new NextRequest('https://fabtops.test/api/wishlist', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'add', product: added }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      message: 'Wishlist updated',
      data: [added],
    });
    expect(prismaWishlistUpsert).toHaveBeenCalledWith({
      where: {
        userId_productId: {
          userId: 'user_12',
          productId: 'top-2',
        },
      },
      create: {
        userId: 'user_12',
        productId: 'top-2',
        variantId: '202',
        title: 'Rose Top',
        handle: 'rose-top',
        price: '800.00',
        currencyCode: 'NGN',
        imageUrl: 'https://shop.example.com/top.jpg',
        imageAlt: 'Rose Top',
      },
      update: {
        variantId: '202',
        title: 'Rose Top',
        handle: 'rose-top',
        price: '800.00',
        currencyCode: 'NGN',
        imageUrl: 'https://shop.example.com/top.jpg',
        imageAlt: 'Rose Top',
      },
    });
    expect(prismaWishlistFindMany).toHaveBeenCalledWith({
      where: { userId: 'user_12' },
      orderBy: { updatedAt: 'desc' },
    });
  });

  it('loads only the signed-in user wishlist from Prisma', async () => {
    getServerAuthSession.mockResolvedValue({
      user: {
        id: 'user_12',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      },
    });
    prismaWishlistFindMany.mockResolvedValue([
      {
        id: 'wish_1',
        userId: 'user_12',
        productId: 'dress-1',
        variantId: '101',
        title: 'Silk Dress',
        handle: 'silk-dress',
        price: '1200.00',
        currencyCode: 'NGN',
        imageUrl: 'https://shop.example.com/dress.jpg',
        imageAlt: 'Silk Dress',
      },
    ]);

    const { GET } = await import('../../app/api/wishlist/route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      data: [
        {
          id: 'dress-1',
          variantId: '101',
          title: 'Silk Dress',
        },
      ],
    });
    expect(prismaWishlistFindMany).toHaveBeenCalledWith({
      where: { userId: 'user_12' },
      orderBy: { updatedAt: 'desc' },
    });
  });

  it('removes only the signed-in user matching wishlist item', async () => {
    getServerAuthSession.mockResolvedValue({
      user: {
        id: 'user_12',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      },
    });
    prismaWishlistDeleteMany.mockResolvedValue({ count: 1 });
    prismaWishlistFindMany.mockResolvedValue([]);

    const removed = {
      id: 'top-2',
      variantId: '202',
      title: 'Rose Top',
      handle: 'rose-top',
      price: '800.00',
      currencyCode: 'NGN',
      imageUrl: 'https://shop.example.com/top.jpg',
      imageAlt: 'Rose Top',
    };

    const { POST } = await import('../../app/api/wishlist/route');
    const request = new NextRequest('https://fabtops.test/api/wishlist', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'remove', product: removed }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      message: 'Wishlist updated',
      data: [],
    });
    expect(prismaWishlistDeleteMany).toHaveBeenCalledWith({
      where: {
        userId: 'user_12',
        productId: 'top-2',
      },
    });
    expect(prismaWishlistFindMany).toHaveBeenCalledWith({
      where: { userId: 'user_12' },
      orderBy: { updatedAt: 'desc' },
    });
  });

  it('returns 401 when the customer is not signed in', async () => {
    getServerAuthSession.mockResolvedValue(null);

    const { GET } = await import('../../app/api/wishlist/route');
    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      success: false,
      error: 'SESSION_EXPIRED',
    });
  });
});
