'use client';

import * as React from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import type { StoreApiProductReview } from '@/lib/woocommerce/storefront';
import type { WooRestProductReview } from '@/lib/woocommerce/reviews';
import type { SessionUser } from '@/stores/types';
import { cn } from '@/lib/utils';
import { buildRatingDistribution } from './pdp-model';

interface ProductReviewsPanelProps {
  productHandle: string;
  reviews: StoreApiProductReview[];
  averageRating: number;
  currentUser?: SessionUser | null;
  customerReview: Pick<WooRestProductReview, 'id' | 'review' | 'rating'> | null;
  draftRating: number;
  draftReview: string;
  reviewError: string;
  reviewSuccess: string;
  isReviewPending: boolean;
  onDraftRatingChange: (value: number) => void;
  onDraftReviewChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function ProductReviewsPanel({
  productHandle,
  reviews,
  averageRating,
  currentUser = null,
  customerReview,
  draftRating,
  draftReview,
  reviewError,
  reviewSuccess,
  isReviewPending,
  onDraftRatingChange,
  onDraftReviewChange,
  onSubmit,
  onDelete,
}: ProductReviewsPanelProps) {
  const [sortOrder, setSortOrder] = React.useState<'newest' | 'highest' | 'lowest'>('newest');

  const sortedReviews = React.useMemo(() => {
    const next = [...reviews];

    if (sortOrder === 'highest') {
      return next.sort((left, right) => Number(right.rating || 0) - Number(left.rating || 0));
    }

    if (sortOrder === 'lowest') {
      return next.sort((left, right) => Number(left.rating || 0) - Number(right.rating || 0));
    }

    return next;
  }, [reviews, sortOrder]);

  const ratingDistribution = buildRatingDistribution(reviews);
  const canManageReview = Boolean(currentUser?.email);

  return (
    <section id="reviews" className="space-y-8">
      <div className="grid gap-8 rounded-[2rem] bg-white p-6 shadow-[0_30px_80px_-60px_rgba(59,59,68,0.4)] md:grid-cols-[0.7fr_1.3fr] md:p-8">
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-brand-accent">Customer reviews</p>
            <h2 className="mt-3 font-heading text-4xl uppercase leading-[0.92] tracking-[-0.04em] text-brand-dark">
              Real fit and feel notes.
            </h2>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-5xl font-semibold tracking-tight text-brand-dark">{averageRating.toFixed(1)}</span>
            <div className="pb-2">
              <div className="flex items-center gap-1 text-brand-accent">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={`summary-${index}`}
                    size={14}
                    className={cn(index < Math.round(averageRating) ? 'fill-brand-accent text-brand-accent' : 'text-brand-dark/80')}
                  />
                ))}
              </div>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.24em] text-brand-dark/75">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {ratingDistribution.map((entry) => {
              const percentage = reviews.length ? (entry.count / reviews.length) * 100 : 0;
              return (
                <div key={entry.rating} className="grid grid-cols-[28px_minmax(0,1fr)_24px] items-center gap-3 text-sm text-brand-dark/90">
                  <span>{entry.rating}</span>
                  <div className="h-2 rounded-full bg-brand-light">
                    <div
                      className="h-2 rounded-full bg-brand-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span>{entry.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {!canManageReview ? (
            <div className="rounded-[1.5rem] border border-brand-dark/8 bg-brand-light/45 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-brand-accent">Members only</p>
              <h3 className="mt-3 text-lg font-semibold text-brand-dark">Sign in to write a review</h3>
              <p className="mt-3 text-sm leading-relaxed text-brand-dark/85">
                Reviews are tied to your FabTops account so you can update them later.
              </p>
              <Link
                href={`/login?redirect=/product/${productHandle}#reviews`}
                className="mt-5 inline-flex rounded-full bg-brand-dark px-5 py-3 text-[10px] font-bold uppercase tracking-[0.28em] text-brand-light transition-colors hover:bg-brand-primary hover:text-brand-dark"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="rounded-[1.5rem] border border-brand-dark/8 bg-brand-light/35 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-brand-accent">
                    {customerReview ? 'Edit your review' : 'Write a review'}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-brand-dark/85">
                    Share your note on fit, finish, and how the piece wears in real life.
                  </p>
                </div>

                {customerReview ? (
                  <button
                    type="button"
                    onClick={() => void onDelete()}
                    disabled={isReviewPending}
                    className="rounded-full border border-brand-dark/12 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-brand-dark transition-colors hover:border-brand-dark disabled:opacity-45"
                  >
                    Delete
                  </button>
                ) : null}
              </div>

              <div className="mt-5 flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;

                  return (
                    <button
                      key={`draft-${value}`}
                      type="button"
                      onClick={() => onDraftRatingChange(value)}
                      className="transition-transform hover:scale-105"
                      aria-label={`Rate ${value} star${value === 1 ? '' : 's'}`}
                    >
                      <Star
                        size={18}
                        className={cn(value <= draftRating ? 'fill-brand-accent text-brand-accent' : 'text-brand-dark/85')}
                      />
                    </button>
                  );
                })}
              </div>

              <textarea
                value={draftReview}
                onChange={(event) => onDraftReviewChange(event.target.value)}
                rows={5}
                maxLength={5000}
                placeholder="Tell us how it fits, feels, and finishes."
                className="mt-5 w-full rounded-[1.25rem] border border-brand-dark/10 bg-white px-4 py-4 text-sm leading-relaxed text-brand-dark outline-none transition-colors focus:border-brand-dark"
              />

              {reviewError || reviewSuccess ? (
                <p className={cn('mt-4 text-sm', reviewError ? 'text-red-700' : 'text-emerald-700')}>
                  {reviewError || reviewSuccess}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isReviewPending}
                className="mt-5 rounded-full bg-brand-dark px-6 py-4 text-[10px] font-bold uppercase tracking-[0.28em] text-brand-light transition-colors hover:bg-brand-primary hover:text-brand-dark disabled:opacity-45"
              >
                {isReviewPending ? 'Saving...' : customerReview ? 'Update review' : 'Submit review'}
              </button>
            </form>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-dark/75">Sort reviews</p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'newest', label: 'Newest' },
                { id: 'highest', label: 'Highest' },
                { id: 'lowest', label: 'Lowest' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSortOrder(option.id as typeof sortOrder)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] transition-colors',
                    sortOrder === option.id
                      ? 'border-brand-dark bg-brand-dark text-brand-light'
                      : 'border-brand-dark/10 bg-white text-brand-dark hover:border-brand-dark/35',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {sortedReviews.length > 0 ? (
            <div className="space-y-4">
              {sortedReviews.map((review) => (
                <article key={review.id} className="rounded-[1.5rem] border border-brand-dark/8 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm font-semibold text-brand-dark">{review.reviewer}</p>
                        {review.verified ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                            Verified
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-dark/75">
                        {review.formatted_date_created}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-brand-accent">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={`${review.id}-${index}`}
                          size={14}
                          className={cn(index < Number(review.rating || 0) ? 'fill-brand-accent text-brand-accent' : 'text-brand-dark/80')}
                        />
                      ))}
                    </div>
                  </div>

                  <div
                    className="mt-4 text-sm leading-relaxed text-brand-dark/85"
                    dangerouslySetInnerHTML={{ __html: review.review }}
                  />
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-brand-dark/12 bg-white/40 p-6 text-sm leading-relaxed text-brand-dark/85">
              No reviews yet. The first thoughtful fit note can help the next customer decide with more confidence.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
