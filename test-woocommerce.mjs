import WooCommerceRestApiModule from "@woocommerce/woocommerce-rest-api";

const WooCommerceRestApi = WooCommerceRestApiModule.default ?? WooCommerceRestApiModule;

const storeUrl = process.env.WOOCOMMERCE_STORE_URL?.replace(/\/$/, '');
const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const version = (process.env.WOOCOMMERCE_API_VERSION || 'wc/v3').replace(/^\/+|\/+$/g, '');

if (!storeUrl || !consumerKey || !consumerSecret) {
  console.error('Missing WooCommerce REST API environment variables.');
  process.exit(1);
}

if (!consumerKey.startsWith('ck_') || !consumerSecret.startsWith('cs_')) {
  console.error('WooCommerce Consumer Key or Consumer Secret has an invalid prefix.');
  process.exit(1);
}

const client = new WooCommerceRestApi({
  url: storeUrl,
  consumerKey,
  consumerSecret,
  version,
  timeout: 15000,
});

try {
  const response = await client.get('products', { per_page: 1, status: 'publish' });
  const products = response.data;
  if (!Array.isArray(products)) throw new Error('WooCommerce returned an unexpected response shape.');
  console.log(`WooCommerce connection successful. Products returned: ${products.length}.`);
} catch (error) {
  const message =
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    error.response
      ? `${error.response.status}: ${error.response.data?.message || error.response.statusText}`
      : error instanceof Error
        ? error.message
        : String(error);
  if (/consumer key is missing/i.test(message)) {
    console.error('Consumer Key is missing at WooCommerce. Check that the server forwards the Authorization header.');
  } else {
    console.error(`WooCommerce connection failed: ${message}`);
  }
  process.exit(1);
}
