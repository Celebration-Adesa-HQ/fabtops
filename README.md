# FabTops WooCommerce Storefront

FabTops is a customer-facing Next.js storefront backed exclusively by WooCommerce. WordPress is the only administrative dashboard and source of truth for products, images, prices, stock, inventory, orders, coupons, shipping, taxes, payment gateways, and store settings.

This repository intentionally contains no admin dashboard, product editor, inventory manager, order manager, coupon manager, customer manager, CMS, or parallel commerce database.

## API Responsibilities

- `@woocommerce/woocommerce-rest-api` is the only `wc/v3` integration path in this repo. It powers server-side product, category, variation, customer, order, sitemap, and diagnostics access.
- WooCommerce Store API (`/wp-json/wc/store/v1`) is the shopper-facing layer for cart, checkout, catalog filter metadata, taxonomies, pay-for-order reads, and product reviews.
- WooCommerce Consumer Key and Consumer Secret are never sent to the browser.
- Guest cart and guest checkout remain first-class WooCommerce flows powered by WooCommerce Store API.
- Server-side catalog and Woo resource access use WooCommerce REST API credentials only.
- Customer login, register, reset-password, session lookup, and wishlist are backed by a separate storefront auth bridge.
- Newsletter signup is unavailable until a dedicated mailing provider is configured.

## WooCommerce Setup

1. Sign in to WordPress admin.
2. Open `WooCommerce > Settings > Advanced > REST API`.
3. Select `Add key`.
4. Choose the WordPress user that owns the integration.
5. Select `Read` permission for this storefront.
6. Use `Read/Write` if this storefront will create or update WooCommerce customers through `wc/v3`.
7. Generate the key and copy the Consumer Key and Consumer Secret immediately. The secret is shown only once.
8. Ensure WordPress pretty permalinks are enabled.
9. Ensure guest checkout is enabled.
10. Ensure the installed Paystack extension supports WooCommerce Blocks and Store API checkout.
11. If you are using the bundled FabTops auth plugin, define the matching shared secret in WordPress and this storefront.

## Environment

Create `.env` from `.env.example` and provide the real WordPress/WooCommerce origin. The origin may differ from the public Next.js storefront URL.

```env
WOOCOMMERCE_STORE_URL=https://your-wordpress-domain.com
WOOCOMMERCE_CONSUMER_KEY=ck_replace_me
WOOCOMMERCE_CONSUMER_SECRET=cs_replace_me
WOOCOMMERCE_API_VERSION=wc/v3
FABTOPS_AUTH_CLIENT_SECRET=replace_with_shared_256_bit_secret
# Optional override. Defaults to https://your-wordpress-domain.com/wp-json/wc/store/v1
# WOOCOMMERCE_STORE_API_BASE=https://your-wordpress-domain.com/wp-json/wc/store/v1
# Optional override. Defaults to https://your-wordpress-domain.com/wp-json/fabtops/v1
# FABTOPS_AUTH_BASE_URL=https://your-wordpress-domain.com/wp-json/fabtops/v1
```

Never prefix WooCommerce credentials with `NEXT_PUBLIC_`, `VITE_`, or `REACT_APP_`. Restart the development server after changing environment values.

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm test
npm run lint
npm run build
npm run test:woocommerce
```

The connection test uses the package-backed `wc/v3` client to request `products?per_page=1&status=publish`. A successful result contains either one product or an empty array.

- `401`: verify key permissions and the associated WordPress user.
- `Consumer Key is missing`: verify that the web server forwards the `Authorization` header.
- `404`: verify `WOOCOMMERCE_STORE_URL`, pretty permalinks, and that WooCommerce REST API is active.

All product, order, inventory, coupon, shipping, tax, payment, customer, and store-setting changes remain grounded in WooCommerce in WordPress. This storefront may read them through `wc/v3`, and it may create or update customer records only through the explicitly configured server-side integration.
