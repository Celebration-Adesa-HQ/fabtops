import { getWooEnv } from './env';

type QueryValue = string | number | boolean | undefined;

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

export interface StoreApiResult<T> {
  data: T;
  cartToken: string | null;
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
    cache: requestOptions.cache || 'no-store',
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
    throw new Error(`WooCommerce Store API error ${response.status}: ${detail}`);
  }

  return {
    data: await response.json() as T,
    cartToken: response.headers.get('Cart-Token'),
  };
}
