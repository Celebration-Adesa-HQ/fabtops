import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { getWooEnv } from './env';

/** Throw at module evaluation time if accidentally imported on the client. */
if (typeof window !== 'undefined') {
  throw new Error('lib/woocommerce/rest-client must only be imported server-side.');
}

type QueryValue = string | number | boolean | undefined;

function appendQuery(url: URL, query?: Record<string, QueryValue>) {
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
}

export function buildWooRestUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, QueryValue>,
) {
  const url = new URL(`${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`);
  appendQuery(url, query);
  return url.toString();
}

type WooMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD';

interface WooRequestOptions {
  method?: WooMethod;
  query?: Record<string, QueryValue>;
  data?: unknown;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}

function normalizeMethod(method?: string): Lowercase<WooMethod> {
  const normalized = (method || 'GET').toUpperCase();
  switch (normalized) {
    case 'GET':
    case 'POST':
    case 'PUT':
    case 'DELETE':
    case 'OPTIONS':
    case 'HEAD':
      return normalized.toLowerCase() as Lowercase<WooMethod>;
    default:
      throw new Error(`Unsupported WooCommerce REST method: ${method}`);
  }
}

function createWooRestClient() {
  const env = getWooEnv();
  return new WooCommerceRestApi({
    url: env.storeUrl,
    consumerKey: env.consumerKey,
    consumerSecret: env.consumerSecret,
    version: env.apiVersion as 'wc/v3',
    queryStringAuth: false,
    axiosConfig: {
      // Hostinger shared hosting can be slow — allow up to 30 s before
      // treating the connection as dead. The getProductVariations caller
      // handles ECONNABORTED gracefully and falls back to [].
      timeout: 30_000,
    },
  });
}

export async function wooRequest<T>(
  path: string,
  options: WooRequestOptions = {},
): Promise<T> {
  const client = createWooRestClient();
  const endpoint = path.replace(/^\/+/, '');
  const method = normalizeMethod(options.method);
  const query = Object.fromEntries(
    Object.entries(options.query || {}).filter(([, value]) => value !== undefined).map(([key, value]) => [key, String(value)]),
  );

  try {
    const response = method === 'post' || method === 'put'
      ? await client[method](endpoint, options.data ?? {}, query)
      : await client[method](endpoint, query);
    return response.data as T;
  } catch (error) {
    // --- Network / timeout errors (no HTTP response) ---
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code?: string }).code === 'string'
    ) {
      const code = (error as { code: string }).code;
      const networkCodes = ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'ENOTFOUND', 'ECONNABORTED'];
      if (networkCodes.includes(code)) {
        throw new Error(
          `WooCommerce REST API unreachable (${code}) [${method.toUpperCase()} ${path}]. ` +
          `Check your WOOCOMMERCE_URL environment variable and server connectivity.`,
        );
      }
    }

    // --- HTTP error responses (Axios sets error.response) ---
    const detail =
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: { data?: { message?: string }; status?: number; statusText?: string } }).response?.status === 'number'
        ? (error as { response: { data?: { message?: string }; status: number; statusText?: string } }).response
        : null;

    if (detail) {
      throw new Error(`WooCommerce REST ${detail.status}: ${detail.data?.message || detail.statusText || 'Request failed'} [${method.toUpperCase()} ${path}]`);
    }

    throw error;
  }
}
