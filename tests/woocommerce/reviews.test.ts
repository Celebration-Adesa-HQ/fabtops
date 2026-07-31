import { beforeEach, describe, expect, it, vi } from 'vitest';

const { storeApiRequest } = vi.hoisted(() => ({
  storeApiRequest: vi.fn(),
}));

const { wooRequest } = vi.hoisted(() => ({
  wooRequest: vi.fn(),
}));

vi.mock('../../lib/woocommerce/store-api', () => ({
  storeApiRequest,
}));

vi.mock('../../lib/woocommerce/rest-client', () => ({
  wooRequest,
}));

describe('WooCommerce review helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads public product reviews from the Store API', async () => {
    storeApiRequest.mockResolvedValue({
      data: [],
      cartToken: null,
      pagination: {},
    });

    const { listProductReviews } = await import('../../lib/woocommerce/reviews');
    await listProductReviews('42', {
      orderby: 'rating',
      order: 'desc',
      per_page: 5,
    });

    expect(storeApiRequest).toHaveBeenCalledWith('/products/reviews', {
      query: {
        product_id: '42',
        orderby: 'rating',
        order: 'desc',
        per_page: 5,
      },
      cache: 'no-store',
    });
  });

  it('returns product detail fallback reviews when the Store API is unreachable', async () => {
    storeApiRequest.mockRejectedValue(new Error('WooCommerce Store API unreachable (ETIMEDOUT)'));

    const { listProductReviews } = await import('../../lib/woocommerce/reviews');

    await expect(listProductReviews('632', {
      orderby: 'date',
      order: 'desc',
      per_page: 6,
    })).resolves.toEqual(expect.arrayContaining([
      expect.objectContaining({ product_id: 632, reviewer: 'Amara O.' }),
    ]));
  });

  it('looks up the signed-in customer review through the Woo REST API', async () => {
    wooRequest.mockResolvedValue([]);

    const { getCustomerProductReview } = await import('../../lib/woocommerce/reviews');
    await getCustomerProductReview('42', 'ada@example.com');

    expect(wooRequest).toHaveBeenCalledWith('/products/reviews', {
      query: {
        product: '42',
        reviewer_email: 'ada@example.com',
        per_page: 1,
        status: 'all',
      },
      cache: 'no-store',
    });
  });

  it('returns no owned review when Woo REST is unreachable', async () => {
    wooRequest.mockRejectedValue(new Error('WooCommerce REST API unreachable (ETIMEDOUT)'));

    const { getCustomerProductReview } = await import('../../lib/woocommerce/reviews');

    await expect(getCustomerProductReview('632', 'ada@example.com')).resolves.toBeNull();
  });

  it('creates a review with session-derived identity fields', async () => {
    wooRequest.mockResolvedValue({ id: 88 });

    const { createProductReview } = await import('../../lib/woocommerce/reviews');
    await createProductReview({
      productId: '42',
      reviewer: 'Ada Okafor',
      reviewerEmail: 'ada@example.com',
      review: 'Beautiful fit and fabric.',
      rating: 5,
    });

    expect(wooRequest).toHaveBeenCalledWith('/products/reviews', {
      method: 'POST',
      data: {
        product_id: 42,
        reviewer: 'Ada Okafor',
        reviewer_email: 'ada@example.com',
        review: 'Beautiful fit and fabric.',
        rating: 5,
      },
      cache: 'no-store',
    });
  });

  it('updates only mutable review fields', async () => {
    wooRequest.mockResolvedValue({ id: 88 });

    const { updateProductReview } = await import('../../lib/woocommerce/reviews');
    await updateProductReview(88, {
      review: 'Updated review copy.',
      rating: 4,
    });

    expect(wooRequest).toHaveBeenCalledWith('/products/reviews/88', {
      method: 'PUT',
      data: {
        review: 'Updated review copy.',
        rating: 4,
      },
      cache: 'no-store',
    });
  });

  it('deletes reviews forcefully through Woo REST', async () => {
    wooRequest.mockResolvedValue({ deleted: true });

    const { deleteProductReview } = await import('../../lib/woocommerce/reviews');
    await deleteProductReview(88);

    expect(wooRequest).toHaveBeenCalledWith('/products/reviews/88', {
      method: 'DELETE',
      query: {
        force: true,
      },
      cache: 'no-store',
    });
  });
});
