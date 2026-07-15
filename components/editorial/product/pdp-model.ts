import type { StorefrontProduct, StorefrontVariation } from '@/lib/woocommerce/types';

export interface ProductBreadcrumbItem {
  label: string;
  href?: string;
}

function normalizeOptionName(value: string) {
  return value.trim().toLowerCase();
}

export function buildProductBreadcrumbs(product: StorefrontProduct): ProductBreadcrumbItem[] {
  const primaryCategory = product.categories[0];
  const crumbs: ProductBreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Women', href: '/shop' },
  ];

  if (primaryCategory && normalizeOptionName(primaryCategory.title) !== 'women') {
    crumbs.push({
      label: primaryCategory.title,
      href: `/shop/${primaryCategory.handle}`,
    });
  }

  crumbs.push({ label: product.title });
  return crumbs;
}

function selectedOptionMatches(
  variation: StorefrontVariation,
  selections: Record<string, string>,
) {
  return Object.entries(selections).every(([name, value]) => {
    if (!value) return true;
    return variation.selectedOptions.some((option) => (
      normalizeOptionName(option.name) === normalizeOptionName(name) &&
      normalizeOptionName(option.value) === normalizeOptionName(value)
    ));
  });
}

export function findMatchingVariation(
  variations: StorefrontVariation[] | undefined,
  selections: Record<string, string>,
) {
  if (!variations?.length) return undefined;

  return (
    variations.find((variation) => selectedOptionMatches(variation, selections)) ||
    variations.find((variation) => (
      variation.availability.purchasable &&
      selectedOptionMatches(variation, selections)
    )) ||
    variations.find((variation) => variation.availability.purchasable) ||
    variations[0]
  );
}

export function isVariationOptionAvailable(
  variations: StorefrontVariation[] | undefined,
  optionName: string,
  optionValue: string,
  selections: Record<string, string>,
) {
  if (!variations?.length) return true;

  const nextSelections = {
    ...selections,
    [optionName]: optionValue,
  };

  return variations.some((variation) => (
    variation.availability.purchasable &&
    selectedOptionMatches(variation, nextSelections)
  ));
}

export function buildRatingDistribution(
  reviews: Array<{ rating: number | string | null | undefined }>,
) {
  return [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => Number(review.rating || 0) === rating).length,
  }));
}
