import type {
  StorefrontAvailability,
  StorefrontCardBadge,
  StorefrontImage,
  StorefrontMoney,
  StorefrontProduct,
  StorefrontVariation,
  WooRestProduct,
  WooRestVariation,
  WooStorePrices,
  WooStoreProduct,
} from './types';

const FALLBACK_IMAGE = '/logo/Fab and Luxe Combined.png';
const DEFAULT_MINOR_UNIT = 2;
const DEFAULT_CURRENCY = 'NGN';
const DEFAULT_SYMBOL = '₦';

function plainText(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function storefrontImage(image?: { src?: string; alt?: string; name?: string } | null, fallbackAlt?: string): StorefrontImage | null {
  if (!image?.src) return null;
  return {
    url: image.src,
    altText: image.alt || image.name || fallbackAlt || 'FabTops product image',
  };
}

function fallbackImage(fallbackAlt: string): StorefrontImage {
  return {
    url: FALLBACK_IMAGE,
    altText: fallbackAlt,
  };
}

function moneyFromMinor(
  amountMinor: string | undefined,
  prices: Pick<WooStorePrices, 'currency_code' | 'currency_minor_unit' | 'currency_symbol' | 'currency_prefix' | 'currency_suffix'>,
): StorefrontMoney {
  return {
    amountMinor: amountMinor || '0',
    currencyCode: prices.currency_code,
    minorUnit: prices.currency_minor_unit,
    symbol: prices.currency_symbol,
    prefix: prices.currency_prefix,
    suffix: prices.currency_suffix,
  };
}

function moneyFromMajor(
  amount: string | undefined,
  currencyCode = DEFAULT_CURRENCY,
  minorUnit = DEFAULT_MINOR_UNIT,
  symbol = DEFAULT_SYMBOL,
): StorefrontMoney {
  const parsed = Number.parseFloat(amount || '0');
  const normalized = Number.isFinite(parsed) ? Math.round(parsed * 10 ** minorUnit) : 0;

  return {
    amountMinor: String(normalized),
    currencyCode,
    minorUnit,
    symbol,
    prefix: symbol,
    suffix: '',
  };
}

function availability(inStock: boolean, purchasable: boolean, onBackorder: boolean): StorefrontAvailability {
  return {
    inStock,
    purchasable,
    onBackorder,
    stockStatus: onBackorder ? 'onbackorder' : inStock ? 'instock' : 'outofstock',
  };
}

function variantTitle(options: Array<{ name: string; value: string }>) {
  return options.length ? options.map((option) => option.value).join(' / ') : 'Default Title';
}

function cardBadge(input: {
  inStock: boolean;
  regularPrice: string | undefined;
  salePrice: string | undefined;
  tags: string[];
}): StorefrontCardBadge | undefined {
  if (!input.inStock) return { key: 'sold_out', label: 'Sold Out' };

  const regular = Number.parseFloat(input.regularPrice || '0');
  const sale = Number.parseFloat(input.salePrice || '0');
  if (sale > 0 && regular > sale) {
    return { key: 'sale', label: 'Sale' };
  }

  const normalizedTags = input.tags.map((tag) => tag.trim().toLowerCase());
  if (normalizedTags.includes('limited')) return { key: 'limited', label: 'Limited' };
  if (normalizedTags.includes('bestseller') || normalizedTags.includes('best-seller')) {
    return { key: 'bestseller', label: 'Bestseller' };
  }
  if (normalizedTags.includes('new') || normalizedTags.includes('new-arrivals') || normalizedTags.includes('new arrival')) {
    return { key: 'new', label: 'New' };
  }

  return undefined;
}

function swatchImages(
  variations: WooRestVariation[],
  fallbackAlt: string,
) {
  const entries = variations.flatMap((variation) => {
    const colorOption = variation.attributes.find((attribute) => attribute.name?.toLowerCase() === 'color' || attribute.slug === 'pa_color');
    if (!colorOption?.option || !variation.image?.src) return [];
    return [[colorOption.option, storefrontImage(variation.image, fallbackAlt)]] as const;
  });

  const mapped = Object.fromEntries(entries.filter((entry) => entry[1])) as Record<string, StorefrontImage>;
  return Object.keys(mapped).length ? mapped : undefined;
}

function normalizeAttributeLabel(value: string | undefined) {
  return (value || '').replace(/^pa_/, '').replace(/[-_]+/g, ' ').trim();
}

function startCase(value: string | undefined) {
  const normalized = normalizeAttributeLabel(value);
  if (!normalized) return '';

  return normalized
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function resolveVariationAttributeName(
  attribute: WooRestVariation['attributes'][number],
  parentAttributes: WooRestProduct['attributes'],
) {
  if (attribute.name?.trim()) {
    return attribute.name.trim();
  }

  const parentMatch = parentAttributes.find((parentAttribute) => (
    parentAttribute.id === attribute.id ||
    (!!attribute.slug && parentAttribute.slug === attribute.slug)
  ));

  if (parentMatch?.name?.trim()) {
    return parentMatch.name.trim();
  }

  if (attribute.slug) {
    return startCase(attribute.slug);
  }

  return attribute.id ? `Attribute ${attribute.id}` : 'Option';
}

function normalizeGallery(images: Array<{ src: string; alt?: string; name?: string }>, fallbackAlt: string) {
  const gallery = images
    .map((image) => storefrontImage(image, fallbackAlt))
    .filter(Boolean) as StorefrontImage[];

  return gallery.length ? gallery : [fallbackImage(fallbackAlt)];
}

function baseProduct(input: {
  id: number | string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  sku: string;
  productType: string;
  tags: string[];
  brands: string[];
  collectionLabel?: string;
  averageRating: number;
  reviewCount: number;
  reviewSummary?: { averageRating: number; reviewCount: number; verifiedReviewCount?: number };
  gallery: StorefrontImage[];
  price: StorefrontMoney;
  regularPrice: StorefrontMoney | null;
  salePrice: StorefrontMoney | null;
  priceRange: { min: StorefrontMoney; max: StorefrontMoney };
  hasOptions: boolean;
  availability: StorefrontAvailability;
  cardBadge?: StorefrontCardBadge;
  cardMedia?: { swatchImages?: Record<string, StorefrontImage> };
  options: Array<{ id: string; name: string; values: string[] }>;
  categories: Array<{ id: string; handle: string; title: string }>;
  variationIds: string[];
  variations?: StorefrontVariation[];
  relatedProductIds?: string[];
  upsellProductIds?: string[];
  crossSellProductIds?: string[];
}): StorefrontProduct {
  return {
    id: String(input.id),
    handle: input.slug,
    title: input.name,
    description: plainText(input.description),
    descriptionHtml: input.description,
    shortDescription: plainText(input.shortDescription),
    shortDescriptionHtml: input.shortDescription,
    sku: input.sku,
    productType: input.productType,
    tags: input.tags,
    brands: input.brands,
    collectionLabel: input.collectionLabel,
    averageRating: input.averageRating,
    reviewCount: input.reviewCount,
    reviewSummary: input.reviewSummary,
    featuredImage: input.gallery[0] || fallbackImage(input.name),
    gallery: input.gallery,
    price: input.price,
    regularPrice: input.regularPrice,
    salePrice: input.salePrice,
    priceRange: input.priceRange,
    hasOptions: input.hasOptions,
    availability: input.availability,
    cardBadge: input.cardBadge,
    cardMedia: input.cardMedia,
    options: input.options,
    categories: input.categories,
    variationIds: input.variationIds,
    variations: input.variations,
    relatedProductIds: input.relatedProductIds || [],
    upsellProductIds: input.upsellProductIds || [],
    crossSellProductIds: input.crossSellProductIds || [],
  };
}

export function adaptStoreProduct(product: WooStoreProduct): StorefrontProduct {
  const gallery = normalizeGallery(product.images, product.name);
  const minMoney = moneyFromMinor(product.prices.price_range?.min_amount || product.prices.price, product.prices);
  const maxMoney = moneyFromMinor(product.prices.price_range?.max_amount || product.prices.price, product.prices);
  const price = moneyFromMinor(product.prices.price, product.prices);
  const regularPrice = product.prices.regular_price ? moneyFromMinor(product.prices.regular_price, product.prices) : null;
  const salePrice = product.prices.sale_price ? moneyFromMinor(product.prices.sale_price, product.prices) : null;
  const productAvailability = availability(product.is_in_stock, product.is_purchasable, product.is_on_backorder);

  return baseProduct({
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    shortDescription: product.short_description,
    sku: product.sku,
    productType: product.categories[0]?.name || '',
    tags: product.tags.map((tag) => tag.name),
    brands: product.brands.map((brand) => brand.name),
    collectionLabel: product.categories[0]?.name || '',
    averageRating: Number(product.average_rating || 0),
    reviewCount: product.review_count || 0,
    reviewSummary: {
      averageRating: Number(product.average_rating || 0),
      reviewCount: product.review_count || 0,
    },
    gallery,
    price,
    regularPrice,
    salePrice,
    priceRange: { min: minMoney, max: maxMoney },
    hasOptions: product.has_options,
    availability: productAvailability,
    cardBadge: cardBadge({
      inStock: product.is_in_stock,
      regularPrice: product.prices.regular_price,
      salePrice: product.prices.sale_price,
      tags: product.tags.map((tag) => tag.name),
    }),
    options: product.attributes.map((attribute) => ({
      id: String(attribute.id),
      name: attribute.name,
      values: (attribute.terms || []).map((term) => term.name),
    })),
    categories: product.categories.map((category) => ({
      id: String(category.id),
      handle: category.slug,
      title: category.name,
    })),
    variationIds: product.variations.map((variation) => String(variation.id)),
    cardMedia: {
      swatchImages: undefined,
    },
  });
}

export function adaptRestProduct(product: WooRestProduct, variations: WooRestVariation[] = []): StorefrontProduct {
  const gallery = normalizeGallery(product.images, product.name);
  const defaultPrice = moneyFromMajor(product.price || product.regular_price || '0');
  const defaultRegularPrice = product.regular_price ? moneyFromMajor(product.regular_price) : null;
  const defaultSalePrice = product.sale_price ? moneyFromMajor(product.sale_price) : null;

  const storefrontVariations: StorefrontVariation[] | undefined = variations.length
    ? variations.map((variation) => {
        const selectedOptions = variation.attributes.map((attribute) => ({
          name: resolveVariationAttributeName(attribute, product.attributes),
          value: attribute.option,
        }));
        return {
          id: String(variation.id),
          title: variantTitle(selectedOptions),
          availability: availability(
            variation.stock_status !== 'outofstock',
            variation.purchasable,
            variation.stock_status === 'onbackorder',
          ),
          selectedOptions,
          price: moneyFromMajor(variation.price || variation.regular_price || product.price || '0'),
          regularPrice: variation.regular_price ? moneyFromMajor(variation.regular_price) : null,
          salePrice: variation.sale_price ? moneyFromMajor(variation.sale_price) : null,
          image: storefrontImage(variation.image, product.name),
        };
      })
    : undefined;

  const variationPrices = storefrontVariations?.map((variation) => Number(variation.price.amountMinor)) || [];
  const minVariationPrice = variationPrices.length ? String(Math.min(...variationPrices)) : defaultPrice.amountMinor;
  const maxVariationPrice = variationPrices.length ? String(Math.max(...variationPrices)) : defaultPrice.amountMinor;

  return baseProduct({
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    shortDescription: product.short_description,
    sku: product.sku,
    productType: product.categories[0]?.name || '',
    tags: product.tags.map((tag) => tag.name),
    brands: (product.brands || []).map((brand) => brand.name),
    collectionLabel: product.categories[0]?.name || '',
    averageRating: Number(product.average_rating || 0),
    reviewCount: 0,
    reviewSummary: {
      averageRating: Number(product.average_rating || 0),
      reviewCount: 0,
    },
    gallery,
    price: defaultPrice,
    regularPrice: defaultRegularPrice,
    salePrice: defaultSalePrice,
    priceRange: {
      min: { ...defaultPrice, amountMinor: minVariationPrice },
      max: { ...defaultPrice, amountMinor: maxVariationPrice },
    },
    hasOptions: product.type === 'variable' || product.attributes.some((attribute) => attribute.variation),
    availability: availability(
      product.stock_status !== 'outofstock',
      product.purchasable,
      product.stock_status === 'onbackorder',
    ),
    cardBadge: cardBadge({
      inStock: product.stock_status !== 'outofstock',
      regularPrice: product.regular_price,
      salePrice: product.sale_price,
      tags: product.tags.map((tag) => tag.name),
    }),
    cardMedia: {
      swatchImages: swatchImages(variations, product.name),
    },
    options: product.attributes
      .filter((attribute) => attribute.variation)
      .map((attribute) => ({
        id: String(attribute.id),
        name: attribute.name,
        values: attribute.options,
      })),
    categories: product.categories.map((category) => ({
      id: String(category.id),
      handle: category.slug,
      title: category.name,
    })),
    variationIds: product.variations.map(String),
    variations: storefrontVariations,
    relatedProductIds: (product.related_ids || []).map(String),
    upsellProductIds: (product.upsell_ids || []).map(String),
    crossSellProductIds: (product.cross_sell_ids || []).map(String),
  });
}
