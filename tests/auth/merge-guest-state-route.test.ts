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
const updateCartCustomer = vi.fn();
const ensureWooCustomerLink = vi.fn();
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
  updateCartCustomer,
}));

vi.mock('@/lib/auth/woo-customer', () => ({
  ensureWooCustomerLink,
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
    ensureWooCustomerLink.mockResolvedValue({
      wooCustomerId: '18',
      customer: {
        id: 18,
        email: 'ada@example.com',
        first_name: 'Ada',
        last_name: 'Okafor',
        billing: {
          first_name: 'Ada',
          last_name: 'Okafor',
          address_1: '1 Marina Road',
          city: 'Lagos',
          country: 'NG',
          email: 'ada@example.com',
          phone: '+2348000000000',
        },
        shipping: {
          first_name: 'Ada',
          last_name: 'Okafor',
          address_1: '1 Marina Road',
          city: 'Lagos',
          country: 'NG',
        },
      },
    });
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

  it('temporarily disables guest cart merge and clears merge cookies for debugging', async () => {
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

    addCartItem.mockResolvedValue({
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
    updateCartItem.mockResolvedValue({
      cart: {
        items: [
          {
            id: 'line-1',
            variantId: '101',
            title: 'Rose Top',
            handle: 'rose-top',
            price: '80.00',
            quantity: 6,
            image: '/rose.jpg',
            selectedOptions: [{ name: 'Size', value: 'M' }],
          },
        ],
        subtotal: 480,
        totalAmount: 480,
        discountCodes: [],
      },
      cartToken: 'cart-token-2',
    });
    updateCartCustomer.mockResolvedValue({
      cart: {
        items: [
          {
            id: 'line-1',
            variantId: '101',
            title: 'Rose Top',
            handle: 'rose-top',
            price: '80.00',
            quantity: 6,
            image: '/rose.jpg',
            selectedOptions: [{ name: 'Size', value: 'M' }],
          },
        ],
        subtotal: 480,
        totalAmount: 480,
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
    expect(getCart).not.toHaveBeenCalled();
    expect(addCartItem).not.toHaveBeenCalled();
    expect(updateCartItem).not.toHaveBeenCalled();
    expect(updateCartCustomer).not.toHaveBeenCalled();
    expect(prismaWishlistUpsert).not.toHaveBeenCalled();
    expect(cookieStore.set).toHaveBeenCalledWith(
      'woocommerce_cart_token',
      '',
      expect.objectContaining({ httpOnly: true, maxAge: 0 }),
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      'fabtops_guest_merge_key',
      '',
      expect.objectContaining({ httpOnly: true, maxAge: 0 }),
    );
    expect(body).toMatchObject({
      success: true,
      data: {
        merged: false,
        wishlistMerged: false,
        cart: {
          items: [],
        },
        wishlist: [
          expect.objectContaining({ id: 'top-1' }),
          expect.objectContaining({ id: 'dress-2' }),
        ],
      },
    });

    expect(body.message).toContain('temporarily disabled');
  });

  it('returns a clean empty cart even when guest merge payload includes items', async () => {
    getServerAuthSession.mockResolvedValue({
      user: {
        id: 'user_12',
        email: 'ada@example.com',
      },
    });

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
        merged: false,
        wishlistMerged: false,
        cart: {
          items: [],
        },
        wishlist: [
          expect.objectContaining({ id: 'top-1' }),
          expect.objectContaining({ id: 'dress-2' }),
        ],
      },
    });
    expect(addCartItem).not.toHaveBeenCalled();
    expect(updateCartCustomer).not.toHaveBeenCalled();
  });
});
