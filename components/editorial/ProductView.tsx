'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Minus, Plus, Ruler, Share2, ShieldCheck, Star, Truck } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useCart } from '@/components/cart/CartProvider';
import { useCurrency } from '@/lib/currency-context';
import { FavoriteButton } from './FavoriteButton';
import { SizeGuide } from './SizeGuide';
import { fromMinorUnits } from '@/lib/woocommerce/store-api';
import type { StorefrontProduct, StorefrontVariation } from '@/lib/woocommerce/types';
import type { StoreApiProductReview } from '@/lib/woocommerce/storefront';
import type { WooRestProductReview } from '@/lib/woocommerce/reviews';
import type { SessionUser } from '@/stores/types';
import { cn } from '@/lib/utils';

interface ProductViewProps {
  product: StorefrontProduct;
  reviews?: StoreApiProductReview[];
  relatedProducts: StorefrontProduct[];
  currentUser?: SessionUser | null;
  ownedReview?: WooRestProductReview | null;
}

function displayAmount(amountMinor: string, minorUnit: number) {
  return fromMinorUnits(amountMinor, minorUnit);
}

export function ProductView({
  product,
  reviews = [],
  relatedProducts,
  currentUser = null,
  ownedReview = null,
}: ProductViewProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [selectedSize, setSelectedSize] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState('');
  const [quantity, setQuantity] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState('description');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = React.useState(false);
  const [customerReview, setCustomerReview] = React.useState<Pick<WooRestProductReview, 'id' | 'review' | 'rating'> | null>(
    ownedReview ? { id: ownedReview.id, review: ownedReview.review, rating: ownedReview.rating } : null,
  );
  const [draftRating, setDraftRating] = React.useState(ownedReview?.rating || 5);
  const [draftReview, setDraftReview] = React.useState(ownedReview?.review || '');
  const [reviewError, setReviewError] = React.useState('');
  const [reviewSuccess, setReviewSuccess] = React.useState('');
  const [isReviewPending, setIsReviewPending] = React.useState(false);

  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const images = product.gallery;
  const sizes = product.options.find((option) => option.name.toLowerCase() === 'size')?.values || [];
  const colors = product.options.find((option) => option.name.toLowerCase() === 'color')?.values || [];
  const variations = product.variations || [];

  React.useEffect(() => {
    if (!selectedSize && sizes.length) setSelectedSize(sizes[0]);
    if (!selectedColor && colors.length) setSelectedColor(colors[0]);
  }, [colors, selectedColor, selectedSize, sizes]);

  const currentVariant = React.useMemo<StorefrontVariation | undefined>(() => {
    if (!variations.length) return undefined;
    return variations.find((variation) => {
      const sizeMatch = !sizes.length || variation.selectedOptions.some((option) => option.name.toLowerCase() === 'size' && option.value === selectedSize);
      const colorMatch = !colors.length || variation.selectedOptions.some((option) => option.name.toLowerCase() === 'color' && option.value === selectedColor);
      return sizeMatch && colorMatch;
    }) || variations.find((variation) => variation.availability.purchasable);
  }, [colors.length, selectedColor, selectedSize, sizes.length, variations]);

  const activeAvailability = currentVariant?.availability || product.availability;
  const activePrice = currentVariant?.price || product.price;
  const activeRegularPrice = currentVariant?.regularPrice || product.regularPrice;
  const activeImage = currentVariant?.image;

  React.useEffect(() => {
    if (!activeImage) return;
    const imageIndex = images.findIndex((image) => image.url === activeImage.url);
    if (imageIndex >= 0) setSelectedImage(imageIndex);
  }, [activeImage, images]);

  React.useEffect(() => {
    setCustomerReview(ownedReview ? { id: ownedReview.id, review: ownedReview.review, rating: ownedReview.rating } : null);
    setDraftRating(ownedReview?.rating || 5);
    setDraftReview(ownedReview?.review || '');
  }, [ownedReview]);

  const isSizeAvailable = (size: string) => {
    if (!variations.length) return product.availability.inStock;
    return variations.some((variation) =>
      variation.availability.purchasable &&
      variation.selectedOptions.some((option) => option.name.toLowerCase() === 'size' && option.value === size),
    );
  };

  const isColorAvailable = (color: string) => {
    if (!variations.length) return product.availability.inStock;
    return variations.some((variation) =>
      variation.availability.purchasable &&
      variation.selectedOptions.some((option) => option.name.toLowerCase() === 'color' && option.value === color),
    );
  };

  const handleAddToCart = async () => {
    const cartTargetId = currentVariant?.id || product.id;
    if (!activeAvailability.purchasable) return;
    await addToCart(cartTargetId, quantity);
  };

  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : product.averageRating;
  const currentPriceLabel = formatPrice(displayAmount(activePrice.amountMinor, activePrice.minorUnit), activePrice.currencyCode);
  const currentRegularPriceLabel = activeRegularPrice
    ? formatPrice(displayAmount(activeRegularPrice.amountMinor, activeRegularPrice.minorUnit), activeRegularPrice.currencyCode)
    : null;
  const productData = {
    id: product.id,
    variantId: currentVariant?.id || product.id,
    title: product.title,
    handle: product.handle,
    price: displayAmount(activePrice.amountMinor, activePrice.minorUnit),
    currencyCode: activePrice.currencyCode,
    imageUrl: images[0]?.url || '',
    imageAlt: product.title,
  };

  const canManageReview = Boolean(currentUser?.email);

  async function submitReview(method: 'POST' | 'PUT') {
    setIsReviewPending(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const response = await fetch('/api/products/reviews', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productHandle: product.handle,
          rating: draftRating,
          review: draftReview,
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Unable to save review');
      }

      const nextReview = result.data as { id: number; review: string; rating: number };
      setCustomerReview({
        id: nextReview.id,
        review: nextReview.review,
        rating: nextReview.rating,
      });
      setReviewSuccess(method === 'POST' ? 'Review submitted successfully.' : 'Review updated successfully.');
      router.refresh();
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Unable to save review');
    } finally {
      setIsReviewPending(false);
    }
  }

  async function handleDeleteReview() {
    setIsReviewPending(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const response = await fetch('/api/products/reviews', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productHandle: product.handle,
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Unable to delete review');
      }

      setCustomerReview(null);
      setDraftRating(5);
      setDraftReview('');
      setReviewSuccess('Review deleted successfully.');
      router.refresh();
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Unable to delete review');
    } finally {
      setIsReviewPending(false);
    }
  }

  async function handleReviewSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draftReview.trim()) {
      setReviewError('Please enter your review before submitting.');
      return;
    }

    await submitReview(customerReview ? 'PUT' : 'POST');
  }

  return (
    <div className="min-h-screen bg-brand-light pt-32 pb-20">
      <SizeGuide isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />

      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <nav className="mb-12 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40">
          <a href="/shop" className="transition-colors hover:text-brand-primary">Shop</a>
          <ChevronRight size={10} />
          <span className="text-brand-dark">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">
          <div className="lg:col-span-7">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="hidden w-24 shrink-0 flex-col gap-4 md:flex">
                {images.map((image, index) => (
                  <button
                    key={image.url}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'relative aspect-[3/4] overflow-hidden border transition-all duration-500',
                      selectedImage === index ? 'border-brand-dark' : 'border-transparent opacity-60 hover:opacity-100',
                    )}
                  >
                    <Image src={image.url} alt={image.altText || product.title} fill className="object-cover" />
                  </button>
                ))}
              </div>

              <div className="group relative flex-1 overflow-hidden bg-white aspect-editorial">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="relative h-full w-full"
                  >
                    <Image
                      src={images[selectedImage]?.url || '/logo/Fab and Luxe Combined.png'}
                      alt={images[selectedImage]?.altText || product.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="space-y-12 lg:col-span-5 lg:sticky lg:top-40 h-fit">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-px w-8 bg-brand-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary">Digital Flagship</span>
                </div>
                <div className="flex gap-4">
                  <FavoriteButton product={productData} size="md" />
                  <button className="text-brand-dark/40 transition-colors hover:text-brand-dark">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-start justify-between">
                <h1 className="flex-1 font-heading text-5xl uppercase tracking-tighter text-brand-dark leading-[0.85] md:text-6xl lg:text-7xl">
                  {product.title}
                </h1>
                {!activeAvailability.inStock && (
                  <span className="mt-2 bg-brand-dark px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-white">
                    Sold Out
                  </span>
                )}
              </div>

              {product.shortDescription && (
                <p className="max-w-xl text-sm leading-relaxed text-brand-dark/65">
                  {product.shortDescription}
                </p>
              )}

              <div className="flex items-baseline gap-4">
                <p className={cn(
                  'text-3xl font-medium tracking-tight',
                  activeAvailability.inStock ? 'text-brand-dark' : 'text-brand-dark/20 line-through',
                )}>
                  {currentPriceLabel}
                </p>
                {currentRegularPriceLabel && currentRegularPriceLabel !== currentPriceLabel && (
                  <span className="text-sm text-brand-dark/25 line-through">{currentRegularPriceLabel}</span>
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Inclusive of VAT</span>
              </div>
            </div>

            <div className="h-px w-full bg-brand-dark/5" />

            <div className="space-y-10">
              {colors.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-end justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-brand-dark/40">Colorway</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark">{selectedColor || 'Select Color'}</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {colors.map((color) => {
                      const available = isColorAvailable(color);
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            'relative overflow-hidden border px-8 py-4 text-[11px] font-black uppercase tracking-widest transition-all duration-500',
                            selectedColor === color ? 'border-brand-dark bg-brand-dark text-white' : 'border-brand-dark/10 text-brand-dark/60 hover:border-brand-dark/40',
                            !available && 'cursor-not-allowed opacity-40 grayscale',
                          )}
                        >
                          <span className={cn(!available && 'line-through')}>{color}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-end justify-between">
                    <div className="flex items-center gap-6">
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-brand-dark/40">Silhouette Size</h3>
                      <button
                        onClick={() => setIsSizeGuideOpen(true)}
                        className="flex items-center gap-2 border-b border-brand-primary/20 pb-1 text-[10px] font-black uppercase tracking-widest text-brand-primary transition-all hover:border-brand-primary"
                      >
                        <Ruler size={12} /> Size Guide
                      </button>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark">{selectedSize || 'Select Size'}</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {sizes.map((size) => {
                      const available = isSizeAvailable(size);
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            'relative flex h-16 w-16 items-center justify-center overflow-hidden border text-xs font-black transition-all duration-500',
                            selectedSize === size ? 'border-brand-dark bg-brand-dark text-white' : 'border-brand-dark/10 text-brand-dark/60 hover:border-brand-dark/40',
                            !available && 'cursor-not-allowed opacity-40',
                          )}
                        >
                          <span className={cn(!available && 'line-through opacity-40')}>{size}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-6 pt-6">
                <div className="flex gap-4">
                  <div className={cn(
                    'flex items-center border border-brand-dark/10 px-6 py-4',
                    !activeAvailability.purchasable && 'pointer-events-none opacity-20',
                  )}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 transition-colors hover:text-brand-primary">
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center text-sm font-black">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-2 transition-colors hover:text-brand-primary">
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={(!selectedSize && sizes.length > 0) || (!selectedColor && colors.length > 0) || !activeAvailability.purchasable}
                    className="relative flex-1 overflow-hidden bg-brand-dark px-10 py-6 text-[11px] font-black uppercase tracking-[0.4em] text-white shadow-2xl shadow-brand-dark/10 transition-all duration-700 hover:bg-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {!activeAvailability.purchasable
                      ? 'Sold Out'
                      : (selectedSize || !sizes.length) && (selectedColor || !colors.length)
                        ? 'Add to Bag'
                        : 'Select Silhouette'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6 border-t border-brand-dark/5 pt-6">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-brand-dark/40">
                    <Truck size={14} className="text-brand-primary" />
                    <span>Lagos & Global <br /> Shipping</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-brand-dark/40">
                    <ShieldCheck size={14} className="text-brand-primary" />
                    <span>Secure Heritage <br /> Authenticity</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-brand-dark/10 pt-10">
              <div className="space-y-8">
                {[
                  { id: 'description', label: 'Artisan Fit & Details', content: product.description },
                  { id: 'fabric', label: 'Material & Care', content: 'Our garments are crafted from ethically sourced, premium fibers. For this specific piece, we recommend dry cleaning to preserve the editorial silhouette and fabric integrity.' },
                  { id: 'delivery', label: 'Concierge Delivery', content: 'Hand-packed in Lagos. Domestic shipping within 2-5 business days. International express shipping within 7-10 business days. Includes signature FabTops floral packaging.' },
                ].map((item) => (
                  <div key={item.id} className="space-y-6">
                    <button onClick={() => setActiveTab(activeTab === item.id ? '' : item.id)} className="group flex w-full items-center justify-between">
                      <span className="text-[12px] font-black uppercase tracking-[0.2em] text-brand-dark transition-colors group-hover:text-brand-primary">
                        {item.label}
                      </span>
                      <Plus className={cn('h-4 w-4 text-brand-dark transition-transform duration-700', activeTab === item.id && 'rotate-45')} />
                    </button>
                    <AnimatePresence>
                      {activeTab === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="pb-8 text-sm font-medium leading-relaxed text-brand-dark/60">
                            {item.content}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            <div id="reviews" className="border-t border-brand-dark/10 pt-10">
              <div className="space-y-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Client Notes</p>
                    <h2 className="mt-3 font-heading text-3xl uppercase tracking-tight text-brand-dark">Product Reviews</h2>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 text-brand-dark">
                      <Star size={16} className="fill-brand-primary text-brand-primary" />
                      <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
                      <span className="text-sm text-brand-dark/50">/ 5</span>
                    </div>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/40">
                      {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-brand-dark/8 bg-white/70 p-6">
                  {!canManageReview ? (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-primary">Members Only</p>
                      <h3 className="text-lg font-semibold text-brand-dark">Sign in to write a review</h3>
                      <p className="text-sm leading-relaxed text-brand-dark/60">
                        Reviews are tied to your FabTops account so you can update or remove your note later.
                      </p>
                      <Link
                        href={`/login?redirect=/product/${product.handle}#reviews`}
                        className="inline-flex bg-brand-dark px-5 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-colors hover:bg-brand-primary hover:text-brand-dark"
                      >
                        Sign In
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-primary">
                            {customerReview ? 'Edit Your Review' : 'Write A Review'}
                          </p>
                          <p className="mt-2 text-sm text-brand-dark/60">
                            {customerReview
                              ? 'Update your product note or remove it entirely.'
                              : 'Share your thoughts on fit, feel, and finish.'}
                          </p>
                        </div>
                        {customerReview && (
                          <button
                            type="button"
                            onClick={handleDeleteReview}
                            disabled={isReviewPending}
                            className="border border-brand-dark/15 px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark transition-colors hover:border-brand-dark hover:text-brand-primary disabled:opacity-50"
                          >
                            Delete Review
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-brand-primary">
                        {Array.from({ length: 5 }).map((_, index) => {
                          const starValue = index + 1;
                          return (
                            <button
                              key={`draft-rating-${starValue}`}
                              type="button"
                              onClick={() => setDraftRating(starValue)}
                              className="transition-transform hover:scale-105"
                              aria-label={`Rate ${starValue} star${starValue === 1 ? '' : 's'}`}
                            >
                              <Star
                                size={18}
                                className={cn(starValue <= draftRating ? 'fill-brand-primary text-brand-primary' : 'text-brand-dark/20')}
                              />
                            </button>
                          );
                        })}
                      </div>

                      <textarea
                        value={draftReview}
                        onChange={(event) => setDraftReview(event.target.value)}
                        rows={5}
                        maxLength={5000}
                        placeholder="Tell us about the fit, finish, and feel."
                        className="w-full rounded-[1.5rem] border border-brand-dark/10 bg-brand-light/40 px-5 py-4 text-sm leading-relaxed text-brand-dark outline-none transition-colors focus:border-brand-dark"
                      />

                      {(reviewError || reviewSuccess) && (
                        <p className={cn(
                          'text-sm',
                          reviewError ? 'text-red-700' : 'text-green-700',
                        )}
                        >
                          {reviewError || reviewSuccess}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isReviewPending}
                        className="bg-brand-dark px-6 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-white transition-colors hover:bg-brand-primary hover:text-brand-dark disabled:opacity-50"
                      >
                        {isReviewPending
                          ? 'Saving...'
                          : customerReview
                            ? 'Update Review'
                            : 'Submit Review'}
                      </button>
                    </form>
                  )}
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-5">
                    {reviews.map((review) => (
                      <article key={review.id} className="rounded-[1.5rem] border border-brand-dark/8 bg-white/70 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-brand-dark">{review.reviewer}</p>
                            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/35">
                              {review.formatted_date_created}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-brand-primary">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={`${review.id}-${index}`}
                                size={14}
                                className={cn(index < Number(review.rating || 0) ? 'fill-brand-primary text-brand-primary' : 'text-brand-dark/15')}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 text-sm leading-relaxed text-brand-dark/65" dangerouslySetInnerHTML={{ __html: review.review }} />
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-brand-dark/10 bg-white/40 p-6 text-sm leading-relaxed text-brand-dark/55">
                    No reviews yet. Be the first to share how this piece fits and feels.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-40 border-t border-brand-dark/10 pt-32">
            <div className="space-y-16">
              <div className="space-y-4 text-center">
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-brand-primary">The Lookbook</span>
                <h2 className="font-heading text-5xl uppercase tracking-tighter text-brand-dark leading-none md:text-6xl">Complete The Vision</h2>
                <p className="text-[11px] font-black uppercase tracking-widest text-brand-dark/40">Editorial pairings curated by our stylists</p>
              </div>

              <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
