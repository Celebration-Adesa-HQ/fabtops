/**
 * @file lib/woocommerce/index.ts
 *
 * Barrel export for the WooCommerce integration layer.
 *
 * Import flow per data type:
 * ─────────────────────────────────────────────────────────
 * Products / Categories  → WooCommerce REST API exclusively (server-only,
 *                          authenticated with Consumer Key + Secret).
 *                          Adapter normalises REST shape to StorefrontProduct.
 *
 * Cart                   → WooCommerce Store API (POST, Cart-Token session)
 *                          Never touches the REST API.
 *
 * Checkout               → WooCommerce Store API (POST /checkout)
 *                          Never touches the REST API.
 *
 * REST API (server-only) → Used for all product/category reads.
 *                          Consumer Key + Secret only available server-side;
 *                          buildWooAuthHeader is intentionally NOT exported
 *                          (private implementation detail of rest-client).
 * ─────────────────────────────────────────────────────────
 *
 * Security rule: Never import `wooRequest`, `getWooEnv`, or anything from
 * rest-client / env from a 'use client' component or any module that ends
 * up in the browser bundle.
 */

// Environment validation
export { getWooEnv, parseWooEnv } from './env';
export type { WooEnvironment } from './env';

// Server-only REST client (Consumer Key + Secret — never expose to browser)
export { buildWooRestUrl, wooRequest } from './rest-client';

// Public Store API client (no credentials)
export { buildStoreApiUrl, formatMoney, fromMinorUnits, storeApiRequest } from './store-api';
export type { StoreApiPaginationHeaders, StoreApiResult } from './store-api';
export {
  createProductReview,
  deleteProductReview,
  getCustomerProductReview,
  listProductReviews,
  updateProductReview,
} from './reviews';
export type { WooRestProductReview } from './reviews';

export {
  buildAggregateQuery,
  buildStoreApiProductQueryFromShopQuery,
  buildStorefrontFilters,
  getStoreCheckoutOrder,
  getStoreOrder,
  getPaginatedStoreProducts,
  getStoreProductAttributeTerms,
  getStoreProductAttributes,
  getStoreProductBrands,
  getStoreProductCategories,
  getStoreProductCollectionData,
  getStoreProductReviews,
  getStoreProductTags,
  getStoreProducts,
  getStorefrontFilters,
  normalizePaginatedCollectionResult,
} from './storefront';
export type {
  StoreApiCollectionData,
  StoreApiOrder,
  StoreApiProductAttribute,
  StoreApiProductAttributeTerm,
  StoreApiProductBrand,
  StoreApiProductCategory,
  StoreApiProductReview,
  StoreApiProductTag,
  StorefrontFilters,
} from './storefront';

// Product helpers
export {
  getCategories,
  getProductById,
  getProductBySlug,
  getProducts,
  getProductsByCategorySlug,
  getProductSlugs,
  getProductVariations,
  getProductsByIds,
  getRelatedProductsForProduct,
  searchProducts,
} from './products';

export { createCustomer, getCustomer, updateCustomer } from './customers';
export type { WooCustomer, WooCustomerAddress } from './customers';

export { getCustomerOrder, getCustomerOrders } from './orders';
export type { WooOrder, WooOrderLineItem } from './orders';

// Cart helpers (Store API session-scoped)
export {
  addCartItem,
  applyCartCoupon,
  getCart,
  mapStoreCart,
  removeCartCoupon,
  removeCartItem,
  selectShippingRate,
  updateCartCustomer,
  updateCartItem,
} from './cart';
export type { CartResult, StorefrontCart } from './cart';

// Checkout helpers (Store API)
export {
  assertPaymentMethodAvailable,
  normalizeCheckoutResult,
  submitCheckout,
} from './checkout';
export type { SafeCheckoutResult } from './checkout';

// Shape adapters (WooCommerce → StorefrontProduct / StorefrontCategory)
export { adaptRestProduct, adaptStoreProduct } from './adapters';

// Shared types
export type {
  RestProduct,
  RestProductVariation,
  StoreApiProduct,
  StorefrontCategory,
  StorefrontImage,
  StorefrontMoney,
  StorefrontProduct,
  StorefrontVariation,
  StorefrontVariant,
  WooRestProduct,
  WooRestVariation,
  WooStorePrices,
  WooStoreProduct,
} from './types';
