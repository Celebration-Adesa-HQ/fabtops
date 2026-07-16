'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, ShoppingBag, X } from 'lucide-react';
import { FavoriteButton } from '@/components/editorial/FavoriteButton';
import { useCart } from '@/components/cart/CartProvider';
import { useCurrency } from '@/lib/currency-context';
import { fromMinorUnits } from '@/lib/woocommerce/store-api';
import type { FavoriteProduct } from '@/lib/favorites-context';
import type { StorefrontProduct } from '@/lib/woocommerce/types';
import { findMatchingVariation, isVariationOptionAvailable } from '@/components/editorial/product/pdp-model';
import { cn } from '@/lib/utils';

interface ProductQuickViewProps {
  product: StorefrontProduct;
  isOpen: boolean;
  onClose: () => void;
  presentation: 'dialog';
  initialColor?: string;
}

function toDisplayAmount(amountMinor: string, minorUnit: number) {
  return fromMinorUnits(amountMinor, minorUnit);
}

function getOption(product: StorefrontProduct, name: string) {
  return product.options.find((option) => option.name.toLowerCase() === name.toLowerCase());
}

export function ProductQuickView({
  product,
  isOpen,
  onClose,
  presentation,
  initialColor = '',
}: ProductQuickViewProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [selectedSize, setSelectedSize] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState(initialColor);
  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);
  const [actionError, setActionError] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const sizes = getOption(product, 'size')?.values || [];
  const colors = getOption(product, 'color')?.values || [];
  const currentVariant = React.useMemo(() => findMatchingVariation(product.variations, {
    Size: selectedSize,
    Color: selectedColor,
  }), [product.variations, selectedColor, selectedSize]);
  const activePrice = currentVariant?.price || product.price;
  const activeRegularPrice = currentVariant?.regularPrice || product.regularPrice;
  const activeAvailability = currentVariant?.availability || product.availability;
  const priceLabel = formatPrice(toDisplayAmount(activePrice.amountMinor, activePrice.minorUnit), activePrice.currencyCode);
  const regularPriceLabel = activeRegularPrice
    ? formatPrice(toDisplayAmount(activeRegularPrice.amountMinor, activeRegularPrice.minorUnit), activeRegularPrice.currencyCode)
    : null;

  React.useEffect(() => {
    if (isOpen) {
      setSelectedColor(initialColor);
      setSelectedSize('');
      setActionError('');
      setQuantity(1);
    }
  }, [initialColor, isOpen, product.id]);

  React.useEffect(() => {
    if (!isOpen) return;

    const focusables = containerRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusables?.[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  React.useEffect(() => {
    if (!currentVariant?.image) return;
    const imageIndex = product.gallery.findIndex((image) => image.url === currentVariant.image?.url);
    if (imageIndex >= 0) {
      setSelectedImage(imageIndex);
    }
  }, [currentVariant?.image, product.gallery]);

  const favoriteProduct: FavoriteProduct = {
    id: product.id,
    variantId: currentVariant?.id || product.id,
    title: product.title,
    handle: product.handle,
    price: toDisplayAmount(activePrice.amountMinor, activePrice.minorUnit),
    currencyCode: activePrice.currencyCode,
    imageUrl: product.gallery[0]?.url || '',
    imageAlt: product.title,
  };

  const canPurchase = activeAvailability.purchasable &&
    (!sizes.length || Boolean(selectedSize)) &&
    (!colors.length || Boolean(selectedColor));

  async function handleAddToCart() {
    if (!canPurchase) return;
    setIsAdding(true);
    setActionError('');
    try {
      await addToCart(currentVariant?.id || product.id, quantity);
      onClose();
    } catch (error) {
      if (error instanceof Error && error.message === 'SESSION_EXPIRED') {
        onClose();
        router.push(`/login?redirect=/product/${product.handle}`);
        return;
      }
      setActionError(error instanceof Error ? error.message : 'Unable to add to bag');
    } finally {
      setIsAdding(false);
    }
  }

  const content = (
    <div ref={containerRef} className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
      <div className="space-y-4">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-brand-light">
          <Image
            src={product.gallery[selectedImage]?.url || '/logo/Fab and Luxe Combined.png'}
            alt={product.gallery[selectedImage]?.altText || product.title}
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
          {product.gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setSelectedImage((selectedImage - 1 + product.gallery.length) % product.gallery.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-brand-dark shadow-sm"
                aria-label="Previous quick view image"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setSelectedImage((selectedImage + 1) % product.gallery.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-brand-dark shadow-sm"
                aria-label="Next quick view image"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {product.gallery.length > 1 && (
          <div className="flex gap-3 overflow-x-auto">
            {product.gallery.map((image, index) => (
              <button
                key={`${image.url}-${index}`}
                type="button"
                onClick={() => setSelectedImage(index)}
                className={cn(
                  'relative h-20 w-16 shrink-0 overflow-hidden rounded-[1rem] border',
                  selectedImage === index ? 'border-brand-dark' : 'border-brand-dark/10',
                )}
                aria-label={`View quick view image ${index + 1}`}
              >
                <Image src={image.url} alt={image.altText || product.title} fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between gap-7">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              {product.collectionLabel ? (
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-dark/75">
                  {product.collectionLabel}
                </p>
              ) : null}
              <h2 className="font-heading text-3xl uppercase leading-[0.92] tracking-[-0.04em] text-brand-dark">
                {product.title}
              </h2>
            </div>

            <FavoriteButton product={favoriteProduct} size="sm" />
          </div>

          <div className="flex items-end gap-3">
            <span className="text-2xl font-semibold tracking-tight text-brand-dark">{priceLabel}</span>
            {regularPriceLabel && regularPriceLabel !== priceLabel ? (
              <span className="text-sm text-brand-dark/70 line-through">{regularPriceLabel}</span>
            ) : null}
          </div>

          {product.shortDescription ? (
            <p className="line-clamp-4 text-sm leading-relaxed text-brand-dark/85">
              {product.shortDescription}
            </p>
          ) : null}

          {colors.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-dark/75">Color</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const available = isVariationOptionAvailable(product.variations, 'Color', color, { Size: selectedSize });
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => available && setSelectedColor(color)}
                      disabled={!available}
                      className={cn(
                        'rounded-full border px-4 py-2 text-[11px] font-semibold transition-colors',
                        selectedColor === color ? 'border-brand-dark bg-brand-dark text-brand-light' : 'border-brand-dark/10 bg-white text-brand-dark',
                        !available && 'cursor-not-allowed opacity-35',
                      )}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-dark/75">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const available = isVariationOptionAvailable(product.variations, 'Size', size, { Color: selectedColor });
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => available && setSelectedSize(size)}
                      disabled={!available}
                      className={cn(
                        'rounded-full border px-4 py-2 text-[11px] font-semibold transition-colors',
                        selectedSize === size ? 'border-brand-dark bg-brand-dark text-brand-light' : 'border-brand-dark/10 bg-white text-brand-dark',
                        !available && 'cursor-not-allowed opacity-35',
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-dark/75">Quantity</p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="rounded-full border border-brand-dark/10 p-2">
                -
              </button>
              <span className="min-w-8 text-center text-sm font-semibold text-brand-dark">{quantity}</span>
              <button type="button" onClick={() => setQuantity(quantity + 1)} className="rounded-full border border-brand-dark/10 p-2">
                +
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {actionError ? <p className="text-sm text-red-700">{actionError}</p> : null}
          <button
            type="button"
            onClick={() => void handleAddToCart()}
            disabled={!canPurchase || isAdding}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-brand-dark px-5 py-4 text-[10px] font-bold uppercase tracking-[0.28em] text-white disabled:opacity-45"
          >
            <ShoppingBag size={14} />
            {isAdding ? 'Adding...' : 'Add to Bag'}
          </button>
          <Link
            href={`/product/${product.handle}`}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-dark/12 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.28em] text-brand-dark"
          >
            <Heart size={14} />
            View Full Details
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-brand-dark/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[88vh] w-[min(94vw,1180px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[2rem] bg-brand-light shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view for ${product.title}`}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 z-10 rounded-full border border-brand-dark/10 bg-white/92 p-2 text-brand-dark shadow-sm"
              aria-label="Close quick view"
            >
              <X size={18} />
            </button>
            <div className="overflow-y-auto p-5 md:p-8">
              {content}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
