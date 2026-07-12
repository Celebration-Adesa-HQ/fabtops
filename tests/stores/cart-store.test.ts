import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('cart store coupon UX', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps the typed code available to the caller on failed apply and stores error feedback', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: 'Coupon is not valid.',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { useCartStore } = await import('../../stores/use-cart-store');
    useCartStore.setState({ isLoading: false });

    const result = await useCartStore.getState().applyDiscountCode('badcode');

    expect(result).toBe('Coupon is not valid.');
    expect(useCartStore.getState().couponFeedback).toMatchObject({
      action: 'apply',
      code: 'BADCODE',
      message: 'Coupon is not valid.',
      status: 'error',
    });
  });

  it('stores success feedback and coupon savings after a successful apply', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          items: [],
          subtotal: 2500,
          totalAmount: 2375,
          currencyCode: 'NGN',
          discountCodes: [{
            code: 'WELCOME10',
            applicable: true,
            discountTotal: 125,
            currencyCode: 'NGN',
          }],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { useCartStore } = await import('../../stores/use-cart-store');
    useCartStore.setState({ isLoading: false });

    const result = await useCartStore.getState().applyDiscountCode('welcome10');

    expect(result).toBeNull();
    expect(useCartStore.getState()).toMatchObject({
      subtotal: 2500,
      totalAmount: 2375,
      currencyCode: 'NGN',
      discountCodes: [{
        code: 'WELCOME10',
        discountTotal: 125,
      }],
      couponFeedback: {
        action: 'apply',
        code: 'WELCOME10',
        message: 'Coupon WELCOME10 applied.',
        status: 'success',
      },
    });
  });

  it('resets previous coupon feedback between attempts', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Coupon is not valid.',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            items: [],
            subtotal: 3000,
            totalAmount: 2800,
            currencyCode: 'NGN',
            discountCodes: [{
              code: 'SAVE20',
              applicable: true,
              discountTotal: 200,
              currencyCode: 'NGN',
            }],
          },
        }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const { useCartStore } = await import('../../stores/use-cart-store');
    useCartStore.setState({ isLoading: false });

    await useCartStore.getState().applyDiscountCode('badcode');
    expect(useCartStore.getState().couponFeedback.status).toBe('error');

    await useCartStore.getState().applyDiscountCode('save20');
    expect(useCartStore.getState().couponFeedback).toMatchObject({
      code: 'SAVE20',
      status: 'success',
    });
  });
});
