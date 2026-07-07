
/**
 * Validates request origin to protect against Cross-Site Request Forgery (CSRF).
 * For state-changing methods (POST, PUT, DELETE, PATCH), this verifies:
 * 1. The Origin header (if present) matches the Host header.
 * 2. The Sec-Fetch-Site header (if present) is same-origin or same-site.
 */
export function validateCsrf(request: Request): boolean {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        console.warn(`[Security Warning] CSRF Blocked: Origin host (${originHost}) does not match Host header (${host})`);
        return false;
      }
    } catch {
      return false;
    }
  }

  const secFetchSite = request.headers.get('sec-fetch-site');
  if (
    secFetchSite &&
    secFetchSite !== 'same-origin' &&
    secFetchSite !== 'same-site' &&
    secFetchSite !== 'none'
  ) {
    console.warn(`[Security Warning] CSRF Blocked: sec-fetch-site is ${secFetchSite}`);
    return false;
  }

  return true;
}
