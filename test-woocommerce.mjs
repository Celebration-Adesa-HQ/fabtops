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

const url = `${storeUrl}/wp-json/${version}/products?per_page=1&status=publish`;
const authorization = `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`;

try {
  const response = await fetch(url, {
    headers: { Authorization: authorization, Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('401: Check the key permissions and associated WordPress user.');
    }
    if (response.status === 404) {
      throw new Error('404: Check WOOCOMMERCE_STORE_URL, WordPress permalinks, and that the WooCommerce REST API is active.');
    }
    const body = await response.json().catch(() => ({}));
    throw new Error(`${response.status}: ${body.message || response.statusText}`);
  }

  const products = await response.json();
  if (!Array.isArray(products)) throw new Error('WooCommerce returned an unexpected response shape.');
  console.log(`WooCommerce connection successful. Products returned: ${products.length}.`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (/consumer key is missing/i.test(message)) {
    console.error('Consumer Key is missing at WooCommerce. Check that the server forwards the Authorization header.');
  } else {
    console.error(`WooCommerce connection failed: ${message}`);
  }
  process.exit(1);
}
