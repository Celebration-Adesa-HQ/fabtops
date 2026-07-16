'use client';

import * as React from 'react';
import { Minus, Plus, Ruler, Share2, ShieldCheck, Sparkles, Star, Truck } from 'lucide-react';
import { FavoriteButton } from '@/components/editorial/FavoriteButton';
import { cn } from '@/lib/utils';
import type { FavoriteProduct, SessionUser } from '@/stores/types';
import type { StorefrontOption, StorefrontProduct, StorefrontVariation } from '@/lib/woocommerce/types';

interface ProductPurchasePanelProps {
  product: StorefrontProduct;
  currentVariant?: StorefrontVariation;
  currentUser?: SessionUser | null;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
  currentPriceLabel: string;
  currentRegularPriceLabel: string | null;
  averageRating: number;
  colorOption?: StorefrontOption;
  sizeOption?: StorefrontOption;
  isColorAvailable: (value: string) => boolean;
  isSizeAvailable: (value: string) => boolean;
  onSelectColor: (value: string) => void;
  onSelectSize: (value: string) => void;
  onQuantityChange: (value: number) => void;
  onOpenSizeGuide: () => void;
  onAddToCart: () => Promise<void>;
  onBuyNow: () => Promise<void>;
  isAddingToCart: boolean;
  isBuyingNow: boolean;
  actionError?: string;
}

const colorMap: Record<string, string> = {
  black: '#111111',
  white: '#ffffff',
  ivory: '#f3ece3',
  cream: '#efe4d7',
  beige: '#dccab7',
  rose: '#f8acae',
  pink: '#ed99bb',
  mauve: '#bf88bd',
  lavender: '#937fbe',
  charcoal: '#3b3b44',
  red: '#9f2034',
  blue: '#355f8e',
  green: '#6a7b52',
  gold: '#b68c47',
};

function availabilityLabel(
  product: StorefrontProduct,
  currentVariant: StorefrontVariation | undefined,
  selectedSize: string,
  selectedColor: string,
) {
  const availability = currentVariant?.availability || product.availability;

  if ((selectedSize || selectedColor) && !availability.purchasable) {
    return 'Selected option unavailable';
  }

  if (availability.onBackorder) return 'Available on backorder';
  if (availability.inStock) return 'Ready to ship';
  return 'Currently unavailable';
}

export function ProductPurchasePanel({
  product,
  currentVariant,
  currentUser,
  selectedColor,
  selectedSize,
  quantity,
  currentPriceLabel,
  currentRegularPriceLabel,
  averageRating,
  colorOption,
  sizeOption,
  isColorAvailable,
  isSizeAvailable,
  onSelectColor,
  onSelectSize,
  onQuantityChange,
  onOpenSizeGuide,
  onAddToCart,
  onBuyNow,
  isAddingToCart,
  isBuyingNow,
  actionError = '',
}: ProductPurchasePanelProps) {
  const activeAvailability = currentVariant?.availability || product.availability;
  const canPurchase = activeAvailability.purchasable;
  const shareLabel = React.useMemo(() => `${product.title} | FabTops`, [product.title]);

  async function handleShare() {
    const url = `${window.location.origin}/product/${product.handle}`;

    if (navigator.share) {
      await navigator.share({
        title: shareLabel,
        text: product.shortDescription || product.title,
        url,
      }).catch(() => undefined);
      return;
    }

    await navigator.clipboard.writeText(url).catch(() => undefined);
  }

  const productData: FavoriteProduct = {
    id: product.id,
    variantId: currentVariant?.id || product.id,
    title: product.title,
    handle: product.handle,
    price: String(Number(product.price.amountMinor) / 10 ** product.price.minorUnit),
    currencyCode: product.price.currencyCode,
    imageUrl: product.gallery[0]?.url || '',
    imageAlt: product.title,
  };

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-brand-accent/20 bg-brand-accent/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-brand-accent">
            {product.brands[0] || 'FabTops Collection'}
          </span>
          <span
            className={cn(
              'rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em]',
              canPurchase
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-brand-dark text-brand-light',
            )}
          >
            {availabilityLabel(product, currentVariant, selectedSize, selectedColor)}
          </span>
          {product.reviewCount > 0 ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[11px] font-semibold text-brand-dark shadow-sm">
              <Star size={14} className="fill-brand-accent text-brand-accent" />
              <span>{averageRating.toFixed(1)}</span>
              <span className="text-brand-dark/80">{product.reviewCount} reviews</span>
            </div>
          ) : null}
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-dark/75">
              {product.categories[0]?.title || product.productType || 'FabTops'}
            </p>
            <h1 className="font-heading text-4xl uppercase leading-[0.88] tracking-[-0.04em] text-brand-dark md:text-5xl xl:text-6xl">
              {product.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <FavoriteButton product={productData} size="md" />
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full border border-brand-dark/10 p-3 text-brand-dark transition-colors hover:border-brand-accent hover:text-brand-accent"
              aria-label="Share product"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-end gap-3">
            <span className="text-3xl font-medium tracking-tight text-brand-dark md:text-4xl">
              {currentPriceLabel}
            </span>
            {currentRegularPriceLabel && currentRegularPriceLabel !== currentPriceLabel ? (
              <span className="pb-1 text-sm text-brand-dark/90 line-through">
                {currentRegularPriceLabel}
              </span>
            ) : null}
          </div>

        </div>

        {product.shortDescription ? (
          <p className="max-w-2xl text-sm leading-relaxed text-brand-dark/85">
            {product.shortDescription}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 rounded-[2rem] border border-brand-dark/8 bg-white/70 p-5 text-[11px] font-medium text-brand-dark/90 md:grid-cols-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-dark/75">SKU</p>
          <p className="mt-2 text-brand-dark">{product.sku || 'Made-to-order edit'}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-dark/75">Category</p>
          <p className="mt-2 text-brand-dark">{product.categories[0]?.title || product.productType || 'Apparel'}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-dark/75">Account</p>
          <p className="mt-2 text-brand-dark">{currentUser ? 'Signed in for faster checkout' : 'Guest bag, member Buy Now'}</p>
        </div>
      </div>

      <div className="space-y-7">
        {colorOption ? (
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-dark/75">Color</p>
                <p className="mt-2 text-sm text-brand-dark">{selectedColor || 'Select a shade'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {colorOption.values.map((value) => {
                const available = isColorAvailable(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => available && onSelectColor(value)}
                    disabled={!available}
                    className={cn(
                      'flex items-center gap-3 rounded-full border px-4 py-3 text-[11px] font-semibold transition-all',
                      selectedColor === value
                        ? 'border-brand-dark bg-brand-dark text-brand-light'
                        : 'border-brand-dark/12 bg-white text-brand-dark hover:border-brand-dark/35',
                      !available && 'cursor-not-allowed opacity-35',
                    )}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-brand-dark/10"
                      style={{ backgroundColor: colorMap[value.toLowerCase()] || '#e5e5e5' }}
                    />
                    <span>{value}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {sizeOption ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-dark/75">Size</p>
                <p className="mt-2 text-sm text-brand-dark">{selectedSize || 'Select your fit'}</p>
              </div>

              <button
                type="button"
                onClick={onOpenSizeGuide}
                className="inline-flex items-center gap-2 border-b border-brand-accent/30 pb-1 text-[10px] font-bold uppercase tracking-[0.24em] text-brand-accent transition-colors hover:border-brand-accent"
              >
                <Ruler size={13} />
                Size guide
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {sizeOption.values.map((value) => {
                const available = isSizeAvailable(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => available && onSelectSize(value)}
                    disabled={!available}
                    className={cn(
                      'flex h-12 min-w-12 items-center justify-center rounded-full border px-4 text-xs font-bold uppercase tracking-[0.18em] transition-all',
                      selectedSize === value
                        ? 'border-brand-dark bg-brand-dark text-brand-light'
                        : 'border-brand-dark/12 bg-white text-brand-dark hover:border-brand-dark/35',
                      !available && 'cursor-not-allowed opacity-35 line-through',
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>

      <div className="rounded-[2rem] border border-brand-dark/8 bg-white p-5 shadow-[0_30px_80px_-50px_rgba(59,59,68,0.4)] lg:sticky lg:top-28">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-dark/75">Quantity</p>
            </div>

            <div className="flex items-center rounded-full border border-brand-dark/10 bg-brand-light/40 px-2">
              <button
                type="button"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="p-3 text-brand-dark transition-colors hover:text-brand-accent"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="min-w-10 text-center text-sm font-bold text-brand-dark">{quantity}</span>
              <button
                type="button"
                onClick={() => onQuantityChange(quantity + 1)}
                className="p-3 text-brand-dark transition-colors hover:text-brand-dark"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => void onAddToCart()}
              disabled={!canPurchase || isAddingToCart}
              className="w-full rounded-full bg-brand-dark px-6 py-4 text-[11px] font-bold uppercase tracking-[0.34em] text-brand-light transition-colors hover:bg-brand-primary hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isAddingToCart ? 'Adding...' : canPurchase ? 'Add to Bag' : 'Unavailable'}
            </button>

            <button
              type="button"
              onClick={() => void onBuyNow()}
              disabled={!canPurchase || isBuyingNow}
              className="w-full rounded-full border border-brand-dark/12 bg-brand-light px-6 py-4 text-[11px] font-bold uppercase tracking-[0.34em] text-brand-dark transition-colors hover:border-brand-dark hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isBuyingNow ? 'Preparing...' : 'Buy Now'}
            </button>
          </div>

          {actionError ? (
            <p className="text-sm text-red-700">{actionError}</p>
          ) : null}

          <div className="grid gap-3 rounded-[1.5rem] bg-brand-light/70 p-4 text-sm text-brand-dark/90">
            <div className="flex items-center gap-3">
              <Truck size={16} className="text-brand-accent" />
              <span>Delivery estimates appear at checkout after shipping selection.</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles size={16} className="text-brand-accent" />
              <span>Need another size? Edit quantities and lines in the cart before payment.</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-brand-accent" />
              <span>Secure payment, careful packing, and clear return support.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
