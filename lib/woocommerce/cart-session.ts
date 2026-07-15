import type { SessionUser } from '@/stores/types';

export const CART_TOKEN_COOKIE = 'woocommerce_cart_token';
export const CART_OWNER_COOKIE = 'fabtops_cart_owner';

interface CookieReader {
  get: (name: string) => { value: string } | undefined;
}

interface CookieWriter {
  set: (name: string, value: string, options: ReturnType<typeof cookieConfig>) => void;
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function cookieConfig(maxAge: number) {
  return {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export function getCartOwnerKey(user: Pick<SessionUser, 'id' | 'wooCustomerId'>) {
  return user.wooCustomerId || user.id;
}

export function getScopedCartToken(
  cookieStore: CookieReader,
  user: Pick<SessionUser, 'id' | 'wooCustomerId'>,
) {
  const ownerKey = getCartOwnerKey(user);
  const storedOwner = cookieStore.get(CART_OWNER_COOKIE)?.value || null;
  const cartToken = cookieStore.get(CART_TOKEN_COOKIE)?.value || null;

  return {
    ownerKey,
    cartToken: storedOwner === ownerKey ? cartToken : null,
    ownerMismatch: Boolean(storedOwner) && storedOwner !== ownerKey,
  };
}

export function setScopedCartCookies(
  cookieStore: CookieWriter,
  cartToken: string,
  user: Pick<SessionUser, 'id' | 'wooCustomerId'>,
) {
  cookieStore.set(CART_TOKEN_COOKIE, cartToken, cookieConfig(60 * 60 * 24 * 7));
  cookieStore.set(CART_OWNER_COOKIE, getCartOwnerKey(user), cookieConfig(60 * 60 * 24 * 7));
}

export function clearScopedCartCookies(cookieStore: CookieWriter) {
  cookieStore.set(CART_TOKEN_COOKIE, '', cookieConfig(0));
  cookieStore.set(CART_OWNER_COOKIE, '', cookieConfig(0));
}
