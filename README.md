# FabTops WooCommerce Storefront

FabTops is a customer-facing Next.js storefront backed exclusively by WooCommerce. WordPress is the only administrative dashboard and source of truth for products, images, prices, stock, inventory, orders, coupons, shipping, taxes, payment gateways, and store settings.

This repository intentionally contains no admin dashboard, product editor, inventory manager, order manager, coupon manager, customer manager, CMS, or parallel commerce database.

## API Responsibilities

- WooCommerce Store API (`/wp-json/wc/store/v1`) powers public product listings, guest cart, coupons, customer addresses, shipping rates, taxes, checkout, and payment handoff.
- WooCommerce REST API (`/wp-json/wc/v3`) is server-only and read-only. It powers detailed product/category/variation reads, sitemap data, and diagnostics.
- WooCommerce Consumer Key and Consumer Secret are never sent to the browser.
- Guest cart and guest checkout remain first-class WooCommerce flows powered by WooCommerce Store API.
- Server-side catalog and commerce reads use WooCommerce REST API credentials only.
- Customer account and wishlist features are currently unavailable in this storefront.
- Newsletter signup is unavailable until a dedicated mailing provider is configured.

## WooCommerce Setup

1. Sign in to WordPress admin.
2. Open `WooCommerce > Settings > Advanced > REST API`.
3. Select `Add key`.
4. Choose the WordPress user that owns the integration.
5. Select `Read` permission for this storefront.
6. Use `Read/Write` only for a future server integration that must administratively update WooCommerce. This storefront does not require it.
7. Generate the key and copy the Consumer Key and Consumer Secret immediately. The secret is shown only once.
8. Ensure WordPress pretty permalinks are enabled.
9. Ensure guest checkout is enabled.
10. Ensure the installed Paystack extension supports WooCommerce Blocks and Store API checkout.

## Environment

Create `.env` from `.env.example` and provide the real WordPress/WooCommerce origin. The origin may differ from the public Next.js storefront URL.

```env
WOOCOMMERCE_STORE_URL=https://your-wordpress-domain.com
WOOCOMMERCE_CONSUMER_KEY=ck_replace_me
WOOCOMMERCE_CONSUMER_SECRET=cs_replace_me
WOOCOMMERCE_API_VERSION=wc/v3
WOOCOMMERCE_STORE_API_BASE=https://your-wordpress-domain.com/wp-json/wc/store/v1
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

The connection test requests `/wp-json/wc/v3/products?per_page=1&status=publish`. A successful result contains either one product or an empty array.

- `401`: verify key permissions and the associated WordPress user.
- `Consumer Key is missing`: verify that the web server forwards the `Authorization` header.
- `404`: verify `WOOCOMMERCE_STORE_URL`, pretty permalinks, and that WooCommerce REST API is active.

All product, order, inventory, coupon, shipping, tax, payment, customer, and store-setting changes must be made in the WooCommerce dashboard in WordPress.
