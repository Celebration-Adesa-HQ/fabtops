import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const cookieStore = {
  values: new Map<string, string>(),
  get: vi.fn((name: string) => {
    const value = cookieStore.values.get(name);
    return value ? { value } : undefined;
  }),
  set: vi.fn((name: string, value: string) => {
    cookieStore.values.set(name, value);
  }),
};

const getServerAuthSession = vi.fn();
const validateCsrf = vi.fn(() => true);
const getAccessToken = vi.fn();
const getCart = vi.fn();
const addCartItem = vi.fn();
const updateCartItem = vi.fn();
const getProductById = vi.fn();
const prismaWishlistFindMany = vi.fn();
const prismaWishlistUpsert = vi.fn();
const prismaTransaction = vi.fn();

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => cookieStore),
}));

vi.mock('@/lib/auth/session', () => ({
  getServerAuthSession,
  getAccessToken,
}));

vi.mock('@/lib/security', () => ({
  validateCsrf,
}));

vi.mock('@/lib/woocommerce/cart', () => ({
  getCart,
  addCartItem,
  updateCartItem,
}));

vi.mock('@/lib/woocommerce/products', () => ({
  getProductById,
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    wishlistItem: {
      findMany: prismaWishlistFindMany,
      upsert: prismaWishlistUpsert,
    },
    $transaction: prismaTransaction,
  },
}));

describe('guest commerce merge route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieStore.values = new Map([
      ['woocommerce_cart_token', 'cart-token-1'],
    ]);
    getAccessToken.mockResolvedValue(null);
    prismaTransaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) => callback({
      wishlistItem: {
        upsert: prismaWishlistUpsert,
      },
    }));
  });

  it('rejects unauthenticated requests', async () => {
    getServerAuthSession.mockResolvedValue(null);

    const { POST } = await import('../../app/api/commerce/merge-guest-state/route');
    const request = new NextRequest('https://fabtops.test/api/commerce/merge-guest-state', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://fabtops.test',
      },
      body: JSON.stringify({
        mergeKey: 'merge-1',
        guestCart: { items: [] },
        guestWishlist: [],
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      success: false,
      error: 'SESSION_EXPIRED',
    });
  });

  it('merges guest cart and wishlist into canonical authenticated state and becomes idempotent', async () => {
    getServerAuthSession.mockResolvedValue({
      user: {
        id: 'user_12',
        email: 'ada@example.com',
      },
    });

    getCart.mockResolvedValue({
      cart: {
        items: [
          {
            id: 'line-1',
            variantId: '101',
            title: 'Rose Top',
            handle: 'rose-top',
            price: '80.00',
            quantity: 1,
            image: '/rose.jpg',
            selectedOptions: [{ name: 'Size', value: 'M' }],
          },
        ],
        subtotal: 80,
        totalAmount: 80,
        discountCodes: [],
      },
      cartToken: 'cart-token-1',
    });

    getProductById.mockResolvedValue({
      id: '101',
      availableForSale: true,
      stockQuantity: 2,
      variants: {
        edges: [
          {
            node: {
              id: '101',
              availableForSale: true,
              stockQuantity: 2,
            },
          },
        ],
      },
    });

    updateCartItem.mockResolvedValue({
      cart: {
        items: [
          {
            id: 'line-1',
            variantId: '101',
            title: 'Rose Top',
            handle: 'rose-top',
            price: '80.00',
            quantity: 2,
            image: '/rose.jpg',
            selectedOptions: [{ name: 'Size', value: 'M' }],
          },
        ],
        subtotal: 160,
        totalAmount: 160,
        discountCodes: [],
      },
      cartToken: 'cart-token-2',
    });

    prismaWishlistFindMany.mockResolvedValue([
      {
        productId: 'top-1',
        variantId: '101',
        title: 'Rose Top',
        handle: 'rose-top',
        price: '80.00',
        currencyCode: 'NGN',
        imageUrl: 'https://shop.example.com/rose.jpg',
        imageAlt: 'Rose Top',
      },
      {
        productId: 'dress-2',
        variantId: '202',
        title: 'Silk Dress',
        handle: 'silk-dress',
        price: '120.00',
        currencyCode: 'NGN',
        imageUrl: 'https://shop.example.com/dress.jpg',
        imageAlt: 'Silk Dress',
      },
    ]);

    const { POST } = await import('../../app/api/commerce/merge-guest-state/route');
    const payload = {
      mergeKey: 'merge-2',
      guestCart: {
        items: [
          {
            id: 'guest-1',
            variantId: '101',
            title: 'Rose Top',
            handle: 'rose-top',
            price: '80.00',
            quantity: 1,
            image: '/rose.jpg',
            selectedOptions: [{ name: 'Size', value: 'M' }],
          },
          {
            id: 'guest-2',
            variantId: '101',
            title: 'Rose Top',
            handle: 'rose-top',
            price: '80.00',
            quantity: 4,
            image: '/rose.jpg',
            selectedOptions: [{ name: 'Size', value: 'M' }],
          },
        ],
      },
      guestWishlist: [
        {
          id: 'top-1',
          variantId: '101',
          title: 'Rose Top',
          handle: 'rose-top',
          price: '80.00',
          currencyCode: 'NGN',
          imageUrl: 'https://shop.example.com/rose.jpg',
          imageAlt: 'Rose Top',
        },
        {
          id: 'dress-2',
          variantId: '202',
          title: 'Silk Dress',
          handle: 'silk-dress',
          price: '120.00',
          currencyCode: 'NGN',
          imageUrl: 'https://shop.example.com/dress.jpg',
          imageAlt: 'Silk Dress',
        },
        {
          id: 'dress-2',
          variantId: '202',
          title: 'Silk Dress',
          handle: 'silk-dress',
          price: '120.00',
          currencyCode: 'NGN',
          imageUrl: 'https://shop.example.com/dress.jpg',
          imageAlt: 'Silk Dress',
        },
      ],
    };

    const request = new NextRequest('https://fabtops.test/api/commerce/merge-guest-state', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://fabtops.test',
      },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(updateCartItem).toHaveBeenCalledWith('cart-token-1', 'line-1', 2, null);
    expect(addCartItem).not.toHaveBeenCalled();
    expect(prismaWishlistUpsert).toHaveBeenCalledTimes(2);
    expect(prismaWishlistUpsert).toHaveBeenNthCalledWith(1, expect.objectContaining({
      where: {
        userId_productId: {
          userId: 'user_12',
          productId: 'top-1',
        },
      },
    }));
    expect(prismaWishlistUpsert).toHaveBeenNthCalledWith(2, expect.objectContaining({
      where: {
        userId_productId: {
          userId: 'user_12',
          productId: 'dress-2',
        },
      },
    }));
    expect(cookieStore.set).toHaveBeenCalledWith(
      'woocommerce_cart_token',
      'cart-token-2',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      'fabtops_guest_merge_key',
      'merge-2',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(body).toMatchObject({
      success: true,
      data: {
        merged: true,
        cart: {
          items: [
            expect.objectContaining({
              variantId: '101',
              quantity: 2,
            }),
          ],
        },
        wishlist: [
          expect.objectContaining({ id: 'top-1' }),
          expect.objectContaining({ id: 'dress-2' }),
        ],
      },
    });

    getCart.mockResolvedValueOnce({
      cart: body.data.cart,
      cartToken: 'cart-token-2',
    });

    const secondRequest = new NextRequest('https://fabtops.test/api/commerce/merge-guest-state', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://fabtops.test',
      },
      body: JSON.stringify(payload),
    });

    const secondResponse = await POST(secondRequest);
    const secondBody = await secondResponse.json();

    expect(secondResponse.status).toBe(200);
    expect(secondBody.data.merged).toBe(false);
    expect(updateCartItem).toHaveBeenCalledTimes(1);
    expect(prismaWishlistUpsert).toHaveBeenCalledTimes(2);
  });

  it('keeps cart merge successful when wishlist persistence is temporarily unavailable', async () => {
    getServerAuthSession.mockResolvedValue({
      user: {
        id: 'user_12',
        email: 'ada@example.com',
      },
    });

    getCart.mockResolvedValue({
      cart: {
        items: [],
        subtotal: 0,
        totalAmount: 0,
        discountCodes: [],
      },
      cartToken: 'cart-token-1',
    });

    addCartItem.mockResolvedValue({
      cart: {
        items: [
          {
            id: 'line-1',
            variantId: '101',
            title: 'Rose Top',
            handle: 'rose-top',
            price: '80.00',
            quantity: 1,
            image: '/rose.jpg',
            selectedOptions: [],
          },
        ],
        subtotal: 80,
        totalAmount: 80,
        discountCodes: [],
      },
      cartToken: 'cart-token-2',
    });

    prismaTransaction.mockRejectedValue(
      Object.assign(new Error("Invalid `prisma.wishlistItem.upsert()` invocation:\n\nCan't reach database server at pooled.db.prisma.io"), {
        code: 'P1001',
      }),
    );

    const { POST } = await import('../../app/api/commerce/merge-guest-state/route');
    const request = new NextRequest('https://fabtops.test/api/commerce/merge-guest-state', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://fabtops.test',
      },
      body: JSON.stringify({
        mergeKey: 'merge-p1001',
        guestCart: {
          items: [
            {
              id: 'guest-1',
              variantId: '101',
              title: 'Rose Top',
              handle: 'rose-top',
              price: '80.00',
              quantity: 1,
              image: '/rose.jpg',
              selectedOptions: [],
            },
          ],
        },
        guestWishlist: [
          {
            id: 'top-1',
            variantId: '101',
            title: 'Rose Top',
            handle: 'rose-top',
            price: '80.00',
            currencyCode: 'NGN',
            imageUrl: 'https://shop.example.com/rose.jpg',
            imageAlt: 'Rose Top',
          },
        ],
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      data: {
        merged: true,
        wishlistMerged: false,
        cart: {
          items: [expect.objectContaining({ variantId: '101' })],
        },
        wishlist: [
          expect.objectContaining({ id: 'top-1' }),
        ],
      },
    });
  });
});
