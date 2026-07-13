import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getServerAuthSession = vi.fn();
const getCustomerProductReview = vi.fn();
const createProductReview = vi.fn();
const updateProductReview = vi.fn();
const deleteProductReview = vi.fn();
const revalidatePath = vi.fn();
const revalidateTag = vi.fn();

vi.mock('@/lib/auth/session', () => ({
  getServerAuthSession,
}));

vi.mock('@/lib/woocommerce/reviews', () => ({
  getCustomerProductReview,
  createProductReview,
  updateProductReview,
  deleteProductReview,
}));

vi.mock('next/cache', () => ({
  revalidatePath,
  revalidateTag,
}));

describe('product review mutation route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated review creation', async () => {
    getServerAuthSession.mockResolvedValue(null);

    const { POST } = await import('../../app/api/products/reviews/route');
    const response = await POST(new NextRequest('https://fabtops.test/api/products/reviews', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        productId: '42',
        rating: 5,
        review: 'Beautiful fit.',
      }),
    }));

    expect(response.status).toBe(401);
  });

  it('creates a review from session identity only when no owned review exists', async () => {
    getServerAuthSession.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Okafor',
        name: 'Ignored Client Value',
      },
    });
    getCustomerProductReview.mockResolvedValue(null);
    createProductReview.mockResolvedValue({
      id: 88,
      product_id: 42,
      reviewer: 'Ada Okafor',
      reviewer_email: 'ada@example.com',
      review: 'Beautiful fit.',
      rating: 5,
    });

    const { POST } = await import('../../app/api/products/reviews/route');
    const response = await POST(new NextRequest('https://fabtops.test/api/products/reviews', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        productId: '42',
        rating: 5,
        review: 'Beautiful fit.',
        reviewer: 'Injected Name',
        reviewerEmail: 'mallory@example.com',
        productHandle: 'rose-top',
      }),
    }));
    const body = await response.json();

    expect(getCustomerProductReview).toHaveBeenCalledWith('42', 'ada@example.com');
    expect(createProductReview).toHaveBeenCalledWith({
      productId: '42',
      reviewer: 'Ada Okafor',
      reviewerEmail: 'ada@example.com',
      review: 'Beautiful fit.',
      rating: 5,
    });
    expect(revalidatePath).toHaveBeenCalledWith('/product/rose-top');
    expect(revalidateTag).toHaveBeenCalledWith('woo-product-reviews-42', 'max');
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('blocks duplicate review creation for the same signed-in user and product', async () => {
    getServerAuthSession.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada Okafor',
      },
    });
    getCustomerProductReview.mockResolvedValue({ id: 88 });

    const { POST } = await import('../../app/api/products/reviews/route');
    const response = await POST(new NextRequest('https://fabtops.test/api/products/reviews', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        productId: '42',
        rating: 5,
        review: 'Beautiful fit.',
      }),
    }));

    expect(response.status).toBe(409);
    expect(createProductReview).not.toHaveBeenCalled();
  });

  it('updates only the owned review for the signed-in user', async () => {
    getServerAuthSession.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada Okafor',
      },
    });
    getCustomerProductReview.mockResolvedValue({ id: 88 });
    updateProductReview.mockResolvedValue({ id: 88, rating: 4 });

    const { PUT } = await import('../../app/api/products/reviews/route');
    const response = await PUT(new NextRequest('https://fabtops.test/api/products/reviews', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        productId: '42',
        rating: 4,
        review: 'Updated review.',
        reviewId: 999,
        productHandle: 'rose-top',
      }),
    }));

    expect(getCustomerProductReview).toHaveBeenCalledWith('42', 'ada@example.com');
    expect(updateProductReview).toHaveBeenCalledWith(88, {
      review: 'Updated review.',
      rating: 4,
    });
    expect(response.status).toBe(200);
  });

  it('deletes only the owned review for the signed-in user', async () => {
    getServerAuthSession.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada Okafor',
      },
    });
    getCustomerProductReview.mockResolvedValue({ id: 88 });
    deleteProductReview.mockResolvedValue({ deleted: true });

    const { DELETE } = await import('../../app/api/products/reviews/route');
    const response = await DELETE(new NextRequest('https://fabtops.test/api/products/reviews', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        productId: '42',
        productHandle: 'rose-top',
      }),
    }));

    expect(deleteProductReview).toHaveBeenCalledWith(88);
    expect(revalidatePath).toHaveBeenCalledWith('/product/rose-top');
    expect(revalidateTag).toHaveBeenCalledWith('woo-product-reviews-42', 'max');
    expect(response.status).toBe(200);
  });
});
