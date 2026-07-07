/**
 * WooCommerce REST API Client — SERVER ONLY
 *
 * Security contract:
 *  - Consumer key/secret NEVER leave this module.
 *  - Only GET and HEAD are permitted (read-only).
 *  - Credentials are transmitted over HTTPS only (validated via env.ts).
 *  - All responses are cached at the Next.js Data Cache layer with explicit
 *    revalidation tags; callers control cache lifetime via `next` options.
 */
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

/** Basic-auth header — never returned to callers, used only inside fetch. */
function buildWooAuthHeader(key: string, secret: string) {
  return `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`;
}

type ReadOnlyMethod = 'GET' | 'HEAD';

export function assertReadOnlyMethod(method: string): ReadOnlyMethod {
  const normalized = method.toUpperCase();
  if (normalized !== 'GET' && normalized !== 'HEAD') {
    throw new Error('WooCommerce REST API client is read-only — write methods are forbidden.');
  }
  return normalized;
}

interface WooRequestOptions extends Omit<RequestInit, 'method'> {
  method?: ReadOnlyMethod;
  query?: Record<string, QueryValue>;
  /** Next.js cache options — callers should always provide `tags` for ISR. */
  next?: NextFetchRequestConfig;
}

export async function wooRequest<T>(
  path: string,
  options: WooRequestOptions = {},
): Promise<T> {
  const env = getWooEnv();
  const method = assertReadOnlyMethod(options.method || 'GET');
  const url = buildWooRestUrl(env.restBaseUrl, path, options.query);
  const { query: _q, next, ...rest } = options;

  const response = await fetch(url, {
    ...rest,
    method,
    next,
    headers: {
      Authorization: buildWooAuthHeader(env.consumerKey, env.consumerSecret),
      Accept: 'application/json',
      ...rest.headers,
    },
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = (await response.json()) as { message?: string };
      detail = body.message || detail;
    } catch {
      // WooCommerce sometimes returns non-JSON on error — use statusText.
    }
    throw new Error(`WooCommerce REST ${response.status}: ${detail} [${method} ${path}]`);
  }

  return response.json() as Promise<T>;
}
