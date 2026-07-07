export interface StoreApiImage {
  id: number;
  src: string;
  thumbnail: string;
  srcset: string;
  sizes: string;
  name: string;
  alt: string;
}

export interface StoreApiPrices {
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

export interface StoreApiProduct {
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
  prices: StoreApiPrices;
  price_html: string;
  average_rating: string;
  review_count: number;
  images: StoreApiImage[];
  categories: Array<{ id: number; name: string; slug: string; link: string }>;
  tags: Array<{ id: number; name: string; slug: string; link?: string }>;
  brands: unknown[];
  attributes: Array<{ id: number; name: string; taxonomy?: string; has_variations?: boolean; terms?: Array<{ id: number; name: string; slug: string }> }>;
  variations: Array<{ id: number; attributes?: Array<{ name: string; value: string }> }>;
  grouped_products: number[];
  has_options: boolean;
  is_purchasable: boolean;
  is_in_stock: boolean;
  is_on_backorder: boolean;
  low_stock_remaining: number | null;
  sold_individually: boolean;
  add_to_cart: { text: string; description: string; url: string; minimum: number; maximum: number; multiple_of: number };
  extensions: Record<string, unknown>;
}

export interface RestProductVariation {
  id: number;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  stock_status: string;
  attributes: Array<{ id: number; name: string; option: string }>;
  image: { id: number; src: string; name: string; alt: string } | null;
}

export interface RestProduct {
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
  images: Array<{ id: number; src: string; name: string; alt: string }>;
  attributes: Array<{ id: number; name: string; position: number; visible: boolean; variation: boolean; options: string[] }>;
  default_attributes: Array<{ id: number; name: string; option: string }>;
  variations: number[];
}

export interface StorefrontMoney {
  amount: string;
  currencyCode: string;
}

export interface StorefrontVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
  price: StorefrontMoney;
}

export interface StorefrontProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  productType: string;
  tags: string[];
  featuredImage: { url: string; altText: string } | null;
  images: { edges: Array<{ node: { url: string; altText: string } }> };
  priceRange: { minVariantPrice: StorefrontMoney; maxVariantPrice: StorefrontMoney };
  options: Array<{ id: string; name: string; values: string[] }>;
  variants: { edges: Array<{ node: StorefrontVariant }> };
  categories: Array<{ id: string; handle: string; title: string }>;
}

export interface StorefrontCategory {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: { url: string; altText: string } | null;
}
