import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('auth session store', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('merges guest commerce state only after session confirmation and clears guest persistence on success', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            user: {
              id: 'user_12',
              email: 'ada@example.com',
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            merged: true,
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
            wishlist: [
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
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const { useCartStore } = await import('../../stores/use-cart-store');
    const { useWishlistStore } = await import('../../stores/use-wishlist-store');
    const { useAuthSessionStore } = await import('../../stores/use-auth-session-store');

    useCartStore.setState({
      items: [],
      guestSnapshot: {
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
        ],
      },
      isAnonymousSession: true,
      isLoading: false,
    });
    useWishlistStore.setState({
      favorites: [],
      guestFavorites: [
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
      isAnonymousSession: true,
      isLoading: false,
    });
    useAuthSessionStore.setState({
      authStatus: 'unauthenticated',
      sessionUser: null,
      isHydrating: false,
      mergeStatus: 'idle',
    });

    await useAuthSessionStore.getState().refreshSession();

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/account/session', expect.objectContaining({
      cache: 'no-store',
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/commerce/merge-guest-state', expect.objectContaining({
      method: 'POST',
    }));
    expect(useAuthSessionStore.getState()).toMatchObject({
      authStatus: 'authenticated',
      mergeStatus: 'succeeded',
      sessionUser: {
        id: 'user_12',
        email: 'ada@example.com',
      },
    });
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().guestSnapshot.items).toEqual([]);
    expect(useWishlistStore.getState().favorites).toHaveLength(1);
    expect(useWishlistStore.getState().guestFavorites).toEqual([]);
  });

  it('clears user-scoped state on logout without keeping account data in guest mode', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const { useCartStore } = await import('../../stores/use-cart-store');
    const { useWishlistStore } = await import('../../stores/use-wishlist-store');
    const { useAuthSessionStore } = await import('../../stores/use-auth-session-store');

    useCartStore.setState({
      items: [
        {
          id: 'line-1',
          variantId: '101',
          title: 'Rose Top',
          handle: 'rose-top',
          price: '80.00',
          quantity: 2,
          image: '/rose.jpg',
          selectedOptions: [],
        },
      ],
      guestSnapshot: {
        items: [
          {
            id: 'guest-1',
            variantId: '202',
            title: 'Silk Dress',
            handle: 'silk-dress',
            price: '120.00',
            quantity: 1,
            image: '/dress.jpg',
            selectedOptions: [],
          },
        ],
      },
      isAnonymousSession: false,
      isLoading: false,
      subtotal: 80,
      totalAmount: 80,
      discountCodes: [],
      couponError: null,
      checkoutUrl: '/checkout',
      isCartOpen: true,
      hasHydratedGuestState: true,
    });
    useWishlistStore.setState({
      favorites: [
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
      guestFavorites: [
        {
          id: 'guest-favorite',
          variantId: '202',
          title: 'Silk Dress',
          handle: 'silk-dress',
          price: '120.00',
          currencyCode: 'NGN',
          imageUrl: 'https://shop.example.com/dress.jpg',
          imageAlt: 'Silk Dress',
        },
      ],
      isAnonymousSession: false,
      isLoading: false,
    });
    useAuthSessionStore.setState({
      authStatus: 'authenticated',
      sessionUser: {
        id: 'user_12',
        email: 'ada@example.com',
      },
      isHydrating: false,
      mergeStatus: 'succeeded',
    });

    await useAuthSessionStore.getState().logout();

    expect(fetchMock).toHaveBeenCalledWith('/api/account/logout', { method: 'POST' });
    expect(useAuthSessionStore.getState()).toMatchObject({
      authStatus: 'unauthenticated',
      sessionUser: null,
      mergeStatus: 'idle',
    });
    expect(useCartStore.getState()).toMatchObject({
      items: [],
      subtotal: 0,
      totalAmount: 0,
      guestSnapshot: { items: [] },
      isAnonymousSession: true,
    });
    expect(useWishlistStore.getState()).toMatchObject({
      favorites: [],
      guestFavorites: [],
      isAnonymousSession: true,
    });
  });
});
