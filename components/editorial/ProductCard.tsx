'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, ShoppingBag, Star } from 'lucide-react';
import { FavoriteButton } from '@/components/editorial/FavoriteButton';
import { ProductQuickView } from '@/components/editorial/ProductQuickView';
import { useCart } from '@/components/cart/CartProvider';
import { useCurrency } from '@/lib/currency-context';
import {
  canShowCardRating,
  getCardBadge,
  getDiscountPercentage,
  getQuickViewPresentation,
  getSwatchImageMap,
} from '@/components/editorial/product-card-model';
import { fromMinorUnits } from '@/lib/woocommerce/store-api';
import type { StorefrontMoney, StorefrontProduct } from '@/lib/woocommerce/types';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: StorefrontProduct;
  className?: string;
}

function toDisplayAmount(money: StorefrontMoney) {
  return fromMinorUnits(money.amountMinor, money.minorUnit);
}

const colorMap: Record<string, string> = {
  black: '#111111',
  white: '#ffffff',
  cream: '#efe4d7',
  beige: '#dccab7',
  rose: '#f8acae',
  pink: '#ed99bb',
  mauve: '#bf88bd',
  lavender: '#937fbe',
  charcoal: '#3b3b44',
  gold: '#b68c47',
  blue: '#355f8e',
  ivory: '#f3ece3',
};

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [isAdding, setIsAdding] = React.useState(false);
  const [selectedSwatch, setSelectedSwatch] = React.useState('');
  const [isQuickViewOpen, setIsQuickViewOpen] = React.useState(false);
  const [quickViewProduct, setQuickViewProduct] = React.useState<StorefrontProduct | null>(null);
  const [isQuickViewLoading, setIsQuickViewLoading] = React.useState(false);
  const [quickViewError, setQuickViewError] = React.useState('');
  const [viewportWidth, setViewportWidth] = React.useState(1280);

  const swatchImageMap = React.useMemo(() => getSwatchImageMap(product), [product]);
  const primaryImage = swatchImageMap[selectedSwatch]?.url || product.gallery[0]?.url || '/logo/Fab and Luxe Combined.png';
  const secondaryImage = product.gallery.find((image) => image.url !== primaryImage)?.url || product.gallery[1]?.url;
  const colorSwatches = product.options.find((option) => option.name.toLowerCase() === 'color')?.values || [];
  const canQuickAdd = !product.hasOptions && product.availability.purchasable && product.availability.inStock;
  const productHref = `/product/${product.handle}`;
  const badge = getCardBadge(product);
  const showRating = canShowCardRating(product);
  const quickViewPresentation = getQuickViewPresentation(viewportWidth);
  const discountPercent = getDiscountPercentage(product);
  const hasActualDiscount = Boolean(product.salePrice && product.regularPrice && discountPercent);

  React.useEffect(() => {
    function updateViewport() {
      setViewportWidth(window.innerWidth);
    }

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const productData = {
    id: product.id,
    variantId: product.id,
    title: product.title,
    handle: product.handle,
    price: toDisplayAmount(product.price),
    currencyCode: product.price.currencyCode,
    imageUrl: primaryImage,
    imageAlt: product.title,
  };

  async function handleQuickAdd(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!canQuickAdd) return;

    setIsAdding(true);
    try {
      await addToCart(product.id, 1);
    } finally {
      setIsAdding(false);
    }
  }

  async function prefetchQuickView() {
    if (quickViewProduct || isQuickViewLoading || product.hasOptions === false) return;

    setIsQuickViewLoading(true);
    setQuickViewError('');
    try {
      const response = await fetch(`/api/products?handle=${encodeURIComponent(product.handle)}`, { cache: 'force-cache' });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Unable to load product details');
      }
      setQuickViewProduct(result.data as StorefrontProduct);
    } catch (error) {
      setQuickViewError(error instanceof Error ? error.message : 'Unable to load product details');
    } finally {
      setIsQuickViewLoading(false);
    }
  }

  function openQuickView(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (quickViewPresentation === 'none') return;
    void prefetchQuickView();
    setIsQuickViewOpen(true);
  }

  return (
    <>
      <div className={cn('group relative w-full', className)}>
        <div className="relative aspect-[4/5] overflow-hidden bg-brand-light">
          <Link href={productHref} className="absolute inset-0 z-0" aria-label={`View ${product.title}`} />

          <Image
            src={primaryImage}
            alt={product.featuredImage?.altText || product.title}
            fill
            sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1535px) 25vw, 20vw"
            className={cn(
              'object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]',
              !product.availability.inStock && 'grayscale-[0.2]',
            )}
          />

          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={`${product.title} alternate view`}
              fill
              sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1535px) 25vw, 20vw"
              className="pointer-events-none hidden object-cover opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 lg:block"
            />
          )}

          {badge ? (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-white/92 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.24em] text-brand-dark shadow-sm backdrop-blur">
              {badge.key === 'sale' && discountPercent ? `-${discountPercent}%` : badge.label}
            </span>
          ) : null}

          <div className="absolute right-3 top-3 z-10">
            <FavoriteButton product={productData} size="sm" className="shadow-sm" />
          </div>

          {canQuickAdd ? (
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`Quick add ${product.title}`}
              className="absolute bottom-3 right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/92 text-brand-dark shadow-lg backdrop-blur transition-transform hover:scale-105 lg:hidden"
            >
              {isAdding ? <span className="h-4 w-4 animate-spin rounded-full border border-brand-dark/25 border-t-brand-dark" /> : <Plus size={18} />}
            </button>
          ) : null}

          <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 hidden lg:block lg:translate-y-2 lg:opacity-0 lg:transition-all lg:duration-300 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
            <div
              className={cn(
                'grid gap-2.5',
                quickViewPresentation !== 'none' && canQuickAdd ? 'grid-cols-2' : 'grid-cols-1',
              )}
            >
              {quickViewPresentation !== 'none' ? (
                <button
                  type="button"
                  onMouseEnter={() => void prefetchQuickView()}
                  onFocus={() => void prefetchQuickView()}
                  onClick={openQuickView}
                  className="pointer-events-auto min-h-[46px] rounded-full bg-white/94 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.24em] text-brand-dark shadow-lg backdrop-blur"
                >
                  Quick View
                </button>
              ) : null}

              {canQuickAdd ? (
                <motion.button
                  type="button"
                  onClick={handleQuickAdd}
                  disabled={isAdding}
                  whileHover={{ scale: 1.04 }}
                  className="pointer-events-auto inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-brand-dark px-4 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-white shadow-lg"
                >
                  <ShoppingBag size={14} />
                  {isAdding ? 'Adding...' : 'Quick Add'}
                </motion.button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-left">
          {product.collectionLabel ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-dark/42">
              {product.collectionLabel}
            </p>
          ) : null}

          <div className="flex items-start justify-between gap-3">
            <Link href={productHref} className="min-w-0 flex-1">
              <h3 className="line-clamp-2 font-heading text-[1.05rem] leading-[1.1] tracking-[-0.02em] text-brand-dark transition-colors duration-300 group-hover:text-brand-primary md:text-[1.15rem]">
                {product.title}
              </h3>
            </Link>

            {showRating ? (
              <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-dark/45">
                <Star size={12} className="fill-brand-primary text-brand-primary" />
                {product.reviewSummary?.averageRating.toFixed(1)} ({product.reviewSummary?.reviewCount})
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[12px] font-bold tracking-[0.01em] text-brand-dark">
              {formatPrice(toDisplayAmount(product.salePrice || product.price), (product.salePrice || product.price).currencyCode)}
            </p>

            {hasActualDiscount ? (
              <span className="text-[11px] text-brand-dark/32 line-through">
                {formatPrice(toDisplayAmount(product.regularPrice), product.regularPrice.currencyCode)}
              </span>
            ) : null}
          </div>

          {colorSwatches.length > 0 ? (
            <div className="flex items-center gap-1.5 pt-1">
              {colorSwatches.slice(0, 5).map((color) => (
                <button
                  key={color}
                  type="button"
                  onMouseEnter={() => setSelectedSwatch(color)}
                  onFocus={() => setSelectedSwatch(color)}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setSelectedSwatch(color);
                  }}
                  className={cn(
                    'h-3 w-3 rounded-full border border-brand-dark/10 transition-transform',
                    selectedSwatch === color && 'scale-110 ring-1 ring-brand-dark/15 ring-offset-1',
                  )}
                  style={{ backgroundColor: colorMap[color.toLowerCase()] || '#e5e5e5' }}
                  aria-label={`Preview ${color}`}
                />
              ))}
              {colorSwatches.length > 5 ? (
                <span className="pl-1 text-[9px] font-medium text-brand-dark/42">+{colorSwatches.length - 5}</span>
              ) : null}
            </div>
          ) : null}

          {quickViewError ? (
            <p className="text-[10px] text-red-700 lg:hidden">{quickViewError}</p>
          ) : null}
        </div>
      </div>

      {quickViewPresentation !== 'none' ? (
        <ProductQuickView
          product={quickViewProduct || product}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          presentation={quickViewPresentation}
          initialColor={selectedSwatch}
        />
      ) : null}
    </>
  );
}
