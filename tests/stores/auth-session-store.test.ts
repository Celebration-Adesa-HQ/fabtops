import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('auth session store', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('merges guest wishlist only after session confirmation and keeps cart user-scoped', async () => {
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
              items: [],
              subtotal: 0,
              totalAmount: 0,
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
      isLoading: false,
      guestSnapshot: {
        items: [
          {
            id: 'guest-line-1',
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
    const mergePayload = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(mergePayload.guestCart.items).toHaveLength(1);
    expect(useAuthSessionStore.getState()).toMatchObject({
      authStatus: 'authenticated',
      mergeStatus: 'succeeded',
      sessionUser: {
        id: 'user_12',
        email: 'ada@example.com',
      },
    });
    expect(useCartStore.getState().items).toEqual([]);
    expect(useCartStore.getState().guestSnapshot.items).toEqual([]);
    expect(useWishlistStore.getState().favorites).toHaveLength(1);
    expect(useWishlistStore.getState().guestFavorites).toEqual([]);
  });

  it('keeps the guest cart snapshot when post-auth merge fails', async () => {
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
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'Unable to merge guest commerce state',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            items: [],
            subtotal: 0,
            totalAmount: 0,
            discountCodes: [],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: [],
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const { useCartStore } = await import('../../stores/use-cart-store');
    const { useWishlistStore } = await import('../../stores/use-wishlist-store');
    const { useAuthSessionStore } = await import('../../stores/use-auth-session-store');

    useCartStore.setState({
      items: [],
      isLoading: false,
      guestSnapshot: {
        items: [
          {
            id: 'guest-line-1',
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
    });
    useWishlistStore.setState({
      favorites: [],
      guestFavorites: [],
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

    expect(useAuthSessionStore.getState().mergeStatus).toBe('failed');
    expect(useCartStore.getState().guestSnapshot.items).toHaveLength(1);
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
      isLoading: false,
      subtotal: 80,
      totalAmount: 80,
      discountCodes: [],
      couponFeedback: {
        action: null,
        code: null,
        message: null,
        status: 'idle',
      },
      checkoutUrl: '/checkout',
      isCartOpen: true,
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
    });
    expect(useWishlistStore.getState()).toMatchObject({
      favorites: [],
      guestFavorites: [],
      isAnonymousSession: true,
    });
  });
});
