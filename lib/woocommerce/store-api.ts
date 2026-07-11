import { getWooEnv } from './env';
import type { StorefrontMoney } from './types';

/** Typed error carrying the WooCommerce HTTP status so callers can distinguish
 *  user-facing 4xx errors (invalid coupon, out of stock, etc.) from real 5xx
 *  server failures without parsing error message strings. */
export class StoreApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'StoreApiError';
  }
}

type QueryValue = string | number | boolean | undefined;

export interface StoreApiPaginationHeaders {
  total?: string | null;
  totalPages?: string | null;
  link?: string | null;
}

export function buildStoreApiUrl(baseUrl: string, path: string, query?: Record<string, QueryValue>) {
  const url = new URL(`${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`);
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export function fromMinorUnits(value: string, minorUnit: number) {
  if (minorUnit === 0) return value;
  const numericValue = Number(value || 0) / (10 ** minorUnit);
  return numericValue.toFixed(minorUnit);
}

export function formatMoney(money: StorefrontMoney) {
  const majorAmount = fromMinorUnits(money.amountMinor, money.minorUnit);
  return `${money.prefix || money.symbol || ''}${majorAmount}${money.suffix || ''}`;
}

export interface StoreApiResult<T> {
  data: T;
  cartToken: string | null;
  pagination: StoreApiPaginationHeaders;
}

interface StoreApiRequestOptions extends RequestInit {
  query?: Record<string, QueryValue>;
  cartToken?: string | null;
  bearerToken?: string | null;
}

export async function storeApiRequest<T>(path: string, options: StoreApiRequestOptions = {}): Promise<StoreApiResult<T>> {
  const env = getWooEnv();
  const url = buildStoreApiUrl(env.storeApiBaseUrl, path, options.query);
  const { query: _query, cartToken, bearerToken, ...requestOptions } = options;
  const response = await fetch(url, {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      ...(requestOptions.body ? { 'Content-Type': 'application/json' } : {}),
      ...(cartToken ? { 'Cart-Token': cartToken } : {}),
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
      ...requestOptions.headers,
    },
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json() as { message?: string };
      detail = body.message || detail;
    } catch {
      // Keep the status text when WooCommerce does not return JSON.
    }
    throw new StoreApiError(response.status, `WooCommerce Store API error ${response.status}: ${detail}`);
  }

  return {
    data: await response.json() as T,
    cartToken: response.headers.get('Cart-Token'),
    pagination: {
      total: response.headers.get('X-WP-Total'),
      totalPages: response.headers.get('X-WP-TotalPages'),
      link: response.headers.get('Link'),
    },
  };
}
