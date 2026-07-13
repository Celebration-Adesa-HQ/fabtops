import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('auth session store', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('refreshes cart and wishlist after session confirmation without calling guest merge', async () => {
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
            items: [],
            subtotal: 0,
            totalAmount: 0,
            discountCodes: [],
          },
        }),
      });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [
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
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/cart', expect.objectContaining({
      method: 'POST',
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/api/wishlist', expect.objectContaining({
      cache: 'no-store',
    }));
    expect(useAuthSessionStore.getState()).toMatchObject({
      authStatus: 'authenticated',
      mergeStatus: 'succeeded',
      sessionUser: {
        id: 'user_12',
        email: 'ada@example.com',
      },
    });
    expect(useCartStore.getState().items).toEqual([]);
    expect(useCartStore.getState().guestSnapshot.items).toHaveLength(1);
    expect(useWishlistStore.getState().favorites).toHaveLength(1);
    expect(useWishlistStore.getState().guestFavorites).toHaveLength(1);
  });

  it('preserves the guest cart snapshot when post-auth refresh fails', async () => {
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
        status: 502,
        json: async () => ({
          success: false,
          error: 'Cart request failed',
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

    expect(useAuthSessionStore.getState().mergeStatus).toBe('succeeded');
    expect(useCartStore.getState().guestSnapshot.items).toHaveLength(1);
  });

  it('loads guest cart state when no session exists instead of clearing it', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        json: async () => ({
          success: false,
          error: 'SESSION_EXPIRED',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
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
      isAnonymousSession: false,
      isLoading: false,
    });
    useAuthSessionStore.setState({
      authStatus: 'unknown',
      sessionUser: null,
      isHydrating: true,
      mergeStatus: 'idle',
    });

    const user = await useAuthSessionStore.getState().refreshSession();

    expect(user).toBeNull();
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/cart', expect.objectContaining({
      method: 'POST',
    }));
    expect(useAuthSessionStore.getState()).toMatchObject({
      authStatus: 'unauthenticated',
      sessionUser: null,
    });
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it('clears user-scoped state on logout without keeping account data in guest mode', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
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
            subtotal: 80,
            totalAmount: 80,
            discountCodes: [],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: [
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
      items: [
        expect.objectContaining({ id: 'line-1' }),
      ],
      subtotal: 80,
      totalAmount: 80,
    });
    expect(useWishlistStore.getState()).toMatchObject({
      favorites: [
        expect.objectContaining({ id: 'guest-favorite' }),
      ],
      guestFavorites: [
        expect.objectContaining({ id: 'guest-favorite' }),
      ],
      isAnonymousSession: true,
    });
  });
});
