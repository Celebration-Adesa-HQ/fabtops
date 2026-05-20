import { cookies } from 'next/headers';
import { getCustomer } from './shopify/auth';

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

/**
 * Verifies that the customer is authenticated via their HTTP-only cookie
 * and returns their token and customer details.
 */
export async function getAuthenticatedCustomer() {
  const cookieStore = await cookies();
  const token = cookieStore.get('customerAccessToken')?.value;

  if (!token) {
    return { authenticated: false, token: null, customer: null };
  }

  try {
    const customer = await getCustomer(token);
    if (!customer || !customer.id) {
      return { authenticated: false, token: null, customer: null };
    }
    return { authenticated: true, token, customer };
  } catch (error) {
    console.error('Error fetching authenticated customer:', error);
    return { authenticated: false, token: null, customer: null };
  }
}
