'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Star } from 'lucide-react';
import { FavoriteButton } from '@/components/editorial/FavoriteButton';
import { useCart } from '@/components/cart/CartProvider';
import { useCurrency } from '@/lib/currency-context';
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

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [isAdding, setIsAdding] = React.useState(false);

  const primaryImage = product.gallery[0]?.url || '/logo/Fab and Luxe Combined.png';
  const secondaryImage = product.gallery[1]?.url;
  const colorSwatches = product.options.find((option) => option.name.toLowerCase() === 'color')?.values || [];
  const isOnSale = Boolean(
    product.salePrice &&
    Number(product.salePrice.amountMinor) > 0 &&
    Number(product.regularPrice?.amountMinor || '0') > Number(product.salePrice.amountMinor),
  );
  const canQuickAdd = !product.hasOptions && product.availability.purchasable && product.availability.inStock;

  const handleQuickAdd = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (!canQuickAdd) return;

    setIsAdding(true);
    try {
      await addToCart(product.id, 1);
    } finally {
      setIsAdding(false);
    }
  };

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

  const colorMap: Record<string, string> = {
    black: '#000000',
    white: '#FFFFFF',
    cream: '#F5F5DC',
    beige: '#F5F5DC',
    rose: '#F8ACAE',
    pink: '#ED99BB',
    mauve: '#BF88BD',
    lavender: '#937FBE',
    charcoal: '#3B3B44',
  };

  return (
    <div className={cn('group block w-full relative', className, !product.availability.inStock && 'opacity-85')}>
      <div className="relative aspect-editorial overflow-hidden bg-brand-light">
        <Link href={`/product/${product.handle}`} className="block w-full h-full">
          <Image
            src={primaryImage}
            alt={product.featuredImage?.altText || product.title}
            fill
            className={cn(
              'object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-105',
              !product.availability.inStock && 'grayscale-[0.45]',
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={`${product.title} alternative view`}
              fill
              className={cn(
                'object-cover opacity-0 transition-all duration-[0.8s] ease-in-out group-hover:opacity-100 group-hover:scale-105',
                !product.availability.inStock && 'grayscale-[0.45]',
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </Link>

        <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
          {!product.availability.inStock && (
            <span className="bg-brand-dark px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-xl">
              Sold Out
            </span>
          )}
          {isOnSale && (
            <span className="bg-brand-primary px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-brand-dark shadow-xl">
              On Sale
            </span>
          )}
        </div>

        <div className="absolute right-4 top-4 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <FavoriteButton product={productData} size="sm" />
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <motion.button
            onClick={handleQuickAdd}
            disabled={isAdding || !canQuickAdd}
            initial={{ y: 20 }}
            whileHover={canQuickAdd ? { scale: 1.02 } : {}}
            className={cn(
              'pointer-events-auto flex w-full items-center justify-center gap-3 border py-4 text-center text-[10px] font-bold uppercase tracking-[0.3em] shadow-2xl transition-all duration-500',
              canQuickAdd
                ? 'border-brand-dark/5 bg-brand-light/95 text-brand-dark backdrop-blur-md'
                : 'cursor-not-allowed border-transparent bg-brand-dark/50 text-white',
            )}
          >
            {isAdding ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border border-brand-dark/20 border-t-brand-dark" />
                Adding...
              </span>
            ) : canQuickAdd ? (
              <>
                <ShoppingBag size={14} />
                Quick Add
              </>
            ) : product.hasOptions ? (
              'Choose Options'
            ) : (
              'Unavailable'
            )}
          </motion.button>
        </div>
      </div>

      <Link href={`/product/${product.handle}`} className="mt-6 block space-y-3 text-center md:text-left">
        <div className="flex items-start justify-between gap-4">
          <h3 className={cn(
            'font-heading text-xl tracking-tight text-brand-dark transition-colors duration-300 group-hover:text-brand-primary md:text-2xl',
            !product.availability.inStock && 'text-brand-dark/50',
          )}>
            {product.title}
          </h3>
          {product.reviewCount > 0 && (
            <span className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/45">
              <Star size={12} className="fill-brand-primary text-brand-primary" />
              {product.averageRating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/60">
                {formatPrice(toDisplayAmount(product.price), product.price.currencyCode)}
              </p>
              {product.priceRange.min.amountMinor !== product.priceRange.max.amountMinor && (
                <span className="text-[10px] uppercase tracking-wider text-brand-dark/35">
                  to {formatPrice(toDisplayAmount(product.priceRange.max), product.priceRange.max.currencyCode)}
                </span>
              )}
            </div>

            {isOnSale && product.regularPrice && (
              <span className="text-[10px] uppercase tracking-widest text-brand-dark/25 line-through">
                {formatPrice(toDisplayAmount(product.regularPrice), product.regularPrice.currencyCode)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 translate-x-2">
            {product.hasOptions ? 'Details' : 'View'} <ArrowRight size={12} />
          </div>
        </div>

        {colorSwatches.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 md:justify-start">
            {colorSwatches.slice(0, 4).map((color) => (
              <div
                key={color}
                className="h-2.5 w-2.5 rounded-full border border-brand-dark/10"
                style={{ backgroundColor: colorMap[color.toLowerCase()] || '#E5E5E5' }}
                title={color}
              />
            ))}
            {colorSwatches.length > 4 && (
              <span className="text-[9px] text-brand-dark/40">+{colorSwatches.length - 4}</span>
            )}
          </div>
        )}
      </Link>
    </div>
  );
}
