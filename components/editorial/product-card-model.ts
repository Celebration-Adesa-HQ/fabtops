import type {
  StorefrontCardBadge,
  StorefrontImage,
  StorefrontProduct,
} from '@/lib/woocommerce/types';

export function getQuickViewPresentation(width: number): 'none' | 'dialog' {
  if (width < 1024) return 'none';
  return 'dialog';
}

export function getCardBadge(product: StorefrontProduct): StorefrontCardBadge | undefined {
  if (product.cardBadge) return product.cardBadge;
  if (!product.availability.inStock || !product.availability.purchasable) {
    return { key: 'sold_out', label: 'Sold Out' };
  }

  const regular = Number(product.regularPrice?.amountMinor || '0');
  const sale = Number(product.salePrice?.amountMinor || '0');
  if (sale > 0 && regular > sale) {
    return { key: 'sale', label: 'Sale' };
  }

  const normalizedTags = product.tags.map((tag) => tag.trim().toLowerCase());
  if (normalizedTags.includes('limited')) return { key: 'limited', label: 'Limited' };
  if (normalizedTags.includes('bestseller') || normalizedTags.includes('best-seller')) {
    return { key: 'bestseller', label: 'Bestseller' };
  }
  if (normalizedTags.includes('new') || normalizedTags.includes('new-arrivals') || normalizedTags.includes('new arrival')) {
    return { key: 'new', label: 'New' };
  }

  return undefined;
}

export function canShowCardRating(product: StorefrontProduct) {
  const summary = product.reviewSummary;
  if (!summary) return false;
  return Number(summary.verifiedReviewCount || 0) >= 3 && Number(summary.reviewCount || 0) >= 3;
}

export function getSwatchImageMap(product: StorefrontProduct): Record<string, StorefrontImage> {
  if (product.cardMedia?.swatchImages) return product.cardMedia.swatchImages;

  if (!product.variations?.length) return {};

  return Object.fromEntries(
    product.variations.flatMap((variation) => {
      const colorOption = variation.selectedOptions.find((option) => option.name.toLowerCase() === 'color');
      if (!colorOption?.value || !variation.image) return [];
      return [[colorOption.value, variation.image]] as const;
    }),
  );
}

export function getDiscountPercentage(product: StorefrontProduct) {
  const regular = Number(product.regularPrice?.amountMinor || '0');
  const sale = Number(product.salePrice?.amountMinor || '0');
  if (!regular || !sale || sale >= regular) return null;
  return Math.round(((regular - sale) / regular) * 100);
}
