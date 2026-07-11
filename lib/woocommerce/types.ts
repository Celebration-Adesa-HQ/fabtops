export interface WooStoreImage {
  id: number;
  src: string;
  thumbnail: string;
  srcset: string;
  sizes: string;
  name: string;
  alt: string;
}

export interface WooStorePrices {
  price: string;
  regular_price: string;
  sale_price: string;
  price_range: { min_amount: string; max_amount: string } | null;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
}

export interface WooStoreProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  type: string;
  variation: string;
  parent: number;
  permalink: string;
  sku: string;
  prices: WooStorePrices;
  price_html: string;
  average_rating: string;
  review_count: number;
  images: WooStoreImage[];
  categories: Array<{ id: number; name: string; slug: string; link: string }>;
  tags: Array<{ id: number; name: string; slug: string; link?: string }>;
  brands: Array<{ id: number; name: string; slug: string }>;
  attributes: Array<{
    id: number;
    name: string;
    taxonomy?: string;
    has_variations?: boolean;
    terms?: Array<{ id: number; name: string; slug: string }>;
  }>;
  variations: Array<{ id: number; attributes?: Array<{ name: string; value: string }> }>;
  grouped_products: number[];
  has_options: boolean;
  is_purchasable: boolean;
  is_in_stock: boolean;
  is_on_backorder: boolean;
  low_stock_remaining: number | null;
  sold_individually: boolean;
  on_sale?: boolean;
  add_to_cart: { text: string; description: string; url: string; minimum: number; maximum: number; multiple_of: number };
  extensions: Record<string, unknown>;
}

export interface WooRestVariation {
  id: number;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  stock_status: string;
  backorders_allowed?: boolean;
  backordered?: boolean;
  attributes: Array<{ id: number; name: string; option: string }>;
  image: { id: number; src: string; name: string; alt: string } | null;
}

export interface WooRestProduct {
  id: number;
  name: string;
  slug: string;
  type: string;
  status: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  price_html: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: string;
  backorders: string;
  backorders_allowed: boolean;
  backordered: boolean;
  sold_individually: boolean;
  categories: Array<{ id: number; name: string; slug: string }>;
  tags: Array<{ id: number; name: string; slug: string }>;
  brands?: Array<{ id: number; name: string; slug: string }>;
  images: Array<{ id: number; src: string; name: string; alt: string }>;
  attributes: Array<{ id: number; name: string; position: number; visible: boolean; variation: boolean; options: string[] }>;
  default_attributes: Array<{ id: number; name: string; option: string }>;
  variations: number[];
  average_rating?: string;
  related_ids?: number[];
  upsell_ids?: number[];
  cross_sell_ids?: number[];
}

export interface StorefrontMoney {
  amountMinor: string;
  currencyCode: string;
  minorUnit: number;
  symbol?: string;
  prefix?: string;
  suffix?: string;
}

export interface StorefrontPriceRange {
  min: StorefrontMoney;
  max: StorefrontMoney;
}

export interface StorefrontAvailability {
  inStock: boolean;
  purchasable: boolean;
  onBackorder: boolean;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
}

export interface StorefrontImage {
  url: string;
  altText: string;
}

export interface StorefrontOption {
  id: string;
  name: string;
  values: string[];
}

export interface StorefrontVariation {
  id: string;
  title: string;
  availability: StorefrontAvailability;
  selectedOptions: Array<{ name: string; value: string }>;
  price: StorefrontMoney;
  regularPrice: StorefrontMoney | null;
  salePrice: StorefrontMoney | null;
  image: StorefrontImage | null;
}

export interface StorefrontProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  shortDescription: string;
  shortDescriptionHtml: string;
  sku: string;
  productType: string;
  tags: string[];
  brands: string[];
  averageRating: number;
  reviewCount: number;
  featuredImage: StorefrontImage | null;
  gallery: StorefrontImage[];
  price: StorefrontMoney;
  regularPrice: StorefrontMoney | null;
  salePrice: StorefrontMoney | null;
  priceRange: StorefrontPriceRange;
  hasOptions: boolean;
  availability: StorefrontAvailability;
  options: StorefrontOption[];
  categories: Array<{ id: string; handle: string; title: string }>;
  variationIds: string[];
  variations?: StorefrontVariation[];
  relatedProductIds: string[];
  upsellProductIds: string[];
  crossSellProductIds: string[];
}

export interface StorefrontCategory {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: { url: string; altText: string } | null;
}

export interface PaginatedStoreResult<T> {
  items: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type StoreApiProduct = WooStoreProduct;
export type RestProduct = WooRestProduct;
export type RestProductVariation = WooRestVariation;
export type StorefrontVariant = StorefrontVariation;
