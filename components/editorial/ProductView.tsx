'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart/CartProvider';
import { SizeGuide } from '@/components/editorial/SizeGuide';
import { ProductBreadcrumbs } from '@/components/editorial/product/ProductBreadcrumbs';
import { ProductEditorialSections } from '@/components/editorial/product/ProductEditorialSections';
import { ProductGallery } from '@/components/editorial/product/ProductGallery';
import { ProductPurchasePanel } from '@/components/editorial/product/ProductPurchasePanel';
import { ProductReviewsPanel } from '@/components/editorial/product/ProductReviewsPanel';
import { RecentlyViewedRail } from '@/components/editorial/product/RecentlyViewedRail';
import {
  buildProductBreadcrumbs,
  findMatchingVariation,
  isVariationOptionAvailable,
} from '@/components/editorial/product/pdp-model';
import { useCurrency } from '@/lib/currency-context';
import { fromMinorUnits } from '@/lib/woocommerce/store-api';
import type { StoreApiProductReview } from '@/lib/woocommerce/storefront';
import type { StorefrontProduct } from '@/lib/woocommerce/types';
import type { WooRestProductReview } from '@/lib/woocommerce/reviews';
import type { SessionUser } from '@/stores/types';

interface ProductViewProps {
  product: StorefrontProduct;
  reviews?: StoreApiProductReview[];
  recommendations: {
    completeTheLook: StorefrontProduct[];
    related: StorefrontProduct[];
  };
  currentUser?: SessionUser | null;
  ownedReview?: WooRestProductReview | null;
}

function formatMoney(amountMinor: string, minorUnit: number) {
  return fromMinorUnits(amountMinor, minorUnit);
}

function findOption(product: StorefrontProduct, name: string) {
  return product.options.find((option) => option.name.trim().toLowerCase() === name.trim().toLowerCase());
}

function getDefaultSelection(product: StorefrontProduct, optionName: string) {
  const option = findOption(product, optionName);
  return option?.values[0] || '';
}

export function ProductView({
  product,
  reviews = [],
  recommendations,
  currentUser = null,
  ownedReview = null,
}: ProductViewProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [selectedSize, setSelectedSize] = React.useState(() => getDefaultSelection(product, 'size'));
  const [selectedColor, setSelectedColor] = React.useState(() => getDefaultSelection(product, 'color'));
  const [quantity, setQuantity] = React.useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = React.useState(false);
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const [isBuyingNow, setIsBuyingNow] = React.useState(false);
  const [actionError, setActionError] = React.useState('');
  const [customerReview, setCustomerReview] = React.useState<Pick<WooRestProductReview, 'id' | 'review' | 'rating'> | null>(
    ownedReview ? { id: ownedReview.id, review: ownedReview.review, rating: ownedReview.rating } : null,
  );
  const [draftRating, setDraftRating] = React.useState(ownedReview?.rating || 5);
  const [draftReview, setDraftReview] = React.useState(ownedReview?.review || '');
  const [reviewError, setReviewError] = React.useState('');
  const [reviewSuccess, setReviewSuccess] = React.useState('');
  const [isReviewPending, setIsReviewPending] = React.useState(false);

  const colorOption = React.useMemo(() => findOption(product, 'color'), [product]);
  const sizeOption = React.useMemo(() => findOption(product, 'size'), [product]);
  const currentVariant = React.useMemo(() => findMatchingVariation(product.variations, {
    Size: selectedSize,
    Color: selectedColor,
  }), [product.variations, selectedColor, selectedSize]);

  const activePrice = currentVariant?.price || product.price;
  const activeRegularPrice = currentVariant?.regularPrice || product.regularPrice;
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : product.averageRating;

  React.useEffect(() => {
    if (currentVariant?.image) {
      const imageIndex = product.gallery.findIndex((image) => image.url === currentVariant.image?.url);
      if (imageIndex >= 0) {
        setSelectedImage(imageIndex);
      }
    }
  }, [currentVariant?.image, product.gallery]);

  React.useEffect(() => {
    setCustomerReview(ownedReview ? { id: ownedReview.id, review: ownedReview.review, rating: ownedReview.rating } : null);
    setDraftRating(ownedReview?.rating || 5);
    setDraftReview(ownedReview?.review || '');
  }, [ownedReview]);

  const currentPriceLabel = formatPrice(formatMoney(activePrice.amountMinor, activePrice.minorUnit), activePrice.currencyCode);
  const currentRegularPriceLabel = activeRegularPrice
    ? formatPrice(formatMoney(activeRegularPrice.amountMinor, activeRegularPrice.minorUnit), activeRegularPrice.currencyCode)
    : null;

  async function handleAddToCart() {
    const cartTargetId = currentVariant?.id || product.id;

    if (!(currentVariant?.availability.purchasable || product.availability.purchasable)) return;

    setIsAddingToCart(true);
    setActionError('');
    try {
      await addToCart(cartTargetId, quantity);
    } catch (error) {
      if (error instanceof Error && error.message === 'SESSION_EXPIRED') {
        router.push(`/login?redirect=/product/${product.handle}`);
        return;
      }
      setActionError(error instanceof Error ? error.message : 'Unable to add to bag');
    } finally {
      setIsAddingToCart(false);
    }
  }

  async function handleBuyNow() {
    const productId = Number(currentVariant?.id || product.id);

    setIsBuyingNow(true);
    setActionError('');
    try {
      const response = await fetch('/api/cart/buy-now', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      const result = await response.json().catch(() => null);

      if (response.status === 401 || result?.error === 'SESSION_EXPIRED') {
        router.push(`/login?redirect=/product/${product.handle}`);
        return;
      }

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Unable to start Buy Now');
      }

      router.push(result.data?.checkoutUrl || '/checkout');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to start Buy Now');
    } finally {
      setIsBuyingNow(false);
    }
  }

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

  const breadcrumbs = buildProductBreadcrumbs(product);

  return (
    <div className="bg-brand-light pt-24 pb-24 md:pt-28">
      <SizeGuide isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />

      <div className="mx-auto max-w-[1560px] px-4 md:px-8 lg:px-10 xl:px-12">
        <div className="space-y-10">
          <ProductBreadcrumbs items={breadcrumbs} />

          <section className="grid gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)] xl:gap-16">
            <ProductGallery
              title={product.title}
              images={product.gallery}
              selectedIndex={selectedImage}
              onSelect={setSelectedImage}
            />

            <ProductPurchasePanel
              product={product}
              currentVariant={currentVariant}
              currentUser={currentUser}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              quantity={quantity}
              currentPriceLabel={currentPriceLabel}
              currentRegularPriceLabel={currentRegularPriceLabel}
              averageRating={averageRating}
              colorOption={colorOption}
              sizeOption={sizeOption}
              isColorAvailable={(value) => isVariationOptionAvailable(product.variations, 'Color', value, { Size: selectedSize })}
              isSizeAvailable={(value) => isVariationOptionAvailable(product.variations, 'Size', value, { Color: selectedColor })}
              onSelectColor={setSelectedColor}
              onSelectSize={setSelectedSize}
              onQuantityChange={setQuantity}
              onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              isAddingToCart={isAddingToCart}
              isBuyingNow={isBuyingNow}
              actionError={actionError}
            />
          </section>

          <div className="space-y-24 pt-8 md:space-y-32 md:pt-12">
            <ProductEditorialSections
              product={product}
              completeTheLook={recommendations.completeTheLook}
              relatedProducts={recommendations.related}
            />

            <ProductReviewsPanel
              productHandle={product.handle}
              reviews={reviews}
              averageRating={averageRating}
              currentUser={currentUser}
              customerReview={customerReview}
              draftRating={draftRating}
              draftReview={draftReview}
              reviewError={reviewError}
              reviewSuccess={reviewSuccess}
              isReviewPending={isReviewPending}
              onDraftRatingChange={setDraftRating}
              onDraftReviewChange={setDraftReview}
              onSubmit={handleReviewSubmit}
              onDelete={handleDeleteReview}
            />

            <RecentlyViewedRail product={product} />
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-dark/10 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-brand-dark">{product.title}</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-dark/55">
              {currentPriceLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleAddToCart()}
            disabled={isAddingToCart || !(currentVariant?.availability.purchasable || product.availability.purchasable)}
            className="rounded-full bg-brand-dark px-5 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-white disabled:opacity-45"
          >
            {isAddingToCart ? 'Adding...' : 'Add to Bag'}
          </button>
        </div>
      </div>
    </div>
  );
}
