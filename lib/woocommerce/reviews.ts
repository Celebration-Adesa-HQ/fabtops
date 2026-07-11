import { storeApiRequest } from './store-api';
import { wooRequest } from './rest-client';
import type { StoreApiProductReview } from './storefront';

interface StoreApiReviewQuery extends Record<string, string | number | boolean | undefined> {
  page?: number;
  per_page?: number;
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'date_gmt' | 'id' | 'rating' | 'product';
}

export interface WooRestProductReview {
  id: number;
  product_id: number;
  status: string;
  reviewer: string;
  reviewer_email: string;
  review: string;
  rating: number;
  verified: boolean;
  date_created: string;
  date_created_gmt: string;
}

interface CreateProductReviewInput {
  productId: string | number;
  reviewer: string;
  reviewerEmail: string;
  review: string;
  rating: number;
}

interface UpdateProductReviewInput {
  review: string;
  rating: number;
}

export async function listProductReviews(
  productId: string | number,
  query: StoreApiReviewQuery = {},
): Promise<StoreApiProductReview[]> {
  const result = await storeApiRequest<StoreApiProductReview[]>('/products/reviews', {
    query: {
      product_id: String(productId),
      ...query,
    },
    cache: 'no-store',
  });

  return result.data;
}

export async function getCustomerProductReview(
  productId: string | number,
  reviewerEmail: string,
): Promise<WooRestProductReview | null> {
  const reviews = await wooRequest<WooRestProductReview[]>('/products/reviews', {
    query: {
      product: String(productId),
      reviewer_email: reviewerEmail,
      per_page: 1,
      status: 'all',
    },
    cache: 'no-store',
  });

  return reviews[0] || null;
}

export async function createProductReview(input: CreateProductReviewInput) {
  return wooRequest<WooRestProductReview>('/products/reviews', {
    method: 'POST',
    data: {
      product_id: Number(input.productId),
      reviewer: input.reviewer,
      reviewer_email: input.reviewerEmail,
      review: input.review,
      rating: input.rating,
    },
    cache: 'no-store',
  });
}

export async function updateProductReview(reviewId: number, input: UpdateProductReviewInput) {
  return wooRequest<WooRestProductReview>(`/products/reviews/${reviewId}`, {
    method: 'PUT',
    data: {
      review: input.review,
      rating: input.rating,
    },
    cache: 'no-store',
  });
}

export async function deleteProductReview(reviewId: number) {
  return wooRequest<{ deleted: boolean }>(`/products/reviews/${reviewId}`, {
    method: 'DELETE',
    query: {
      force: true,
    },
    cache: 'no-store',
  });
}
