import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cartActionSchema } from '@/lib/schemas';
import { validateCsrf } from '@/lib/security';
import {
  addCartItem,
  applyCartCoupon,
  getCart,
  removeCartCoupon,
  removeCartItem,
  selectShippingRate,
  updateCartCustomer,
  updateCartItem,
} from '@/lib/woocommerce/cart';
import { StoreApiError } from '@/lib/woocommerce/store-api';

const CART_TOKEN_COOKIE = 'woocommerce_cart_token';

export async function POST(request: NextRequest) {
  if (!validateCsrf(request)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const parsed = cartActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid cart request' }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get(CART_TOKEN_COOKIE)?.value || null;
    const bearerToken = null;
    const action = parsed.data;
    let cartToken = currentToken;
    let result;

    if (action.action !== 'create' && action.action !== 'get' && !cartToken) {
      const bootstrapCart = await getCart(null, bearerToken);
      cartToken = bootstrapCart.cartToken;
    }

    switch (action.action) {
      case 'create':
      case 'get':
        result = await getCart(cartToken, bearerToken);
        break;
      case 'add':
        result = await addCartItem(cartToken, action.productId, action.quantity, bearerToken);
        break;
      case 'update':
        result = await updateCartItem(cartToken, action.lineKey, action.quantity, bearerToken);
        break;
      case 'remove':
        result = await removeCartItem(cartToken, action.lineKey, bearerToken);
        break;
      case 'applyCoupon':
        result = await applyCartCoupon(cartToken, action.code, bearerToken);
        break;
      case 'removeCoupon':
        result = await removeCartCoupon(cartToken, action.code, bearerToken);
        break;
      case 'updateCustomer':
        result = await updateCartCustomer(cartToken, action.billing_address, action.shipping_address, bearerToken);
        break;
      case 'selectShipping':
        result = await selectShippingRate(cartToken, action.packageId, action.rateId, bearerToken);
        break;
    }

    const nextCartToken = result.cartToken || cartToken;

    if (nextCartToken && nextCartToken !== currentToken) {
      cookieStore.set(CART_TOKEN_COOKIE, nextCartToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json({
      success: true,
      data: result.cart,
      message: 'Cart updated successfully',
    });
  } catch (error) {
    // WooCommerce 4xx = user-facing validation error (invalid coupon,
    // out-of-stock, etc.). Forward the message and use 422 so the
    // client knows it's safe to display it to the user.
    if (error instanceof StoreApiError && error.status >= 400 && error.status < 500) {
      return NextResponse.json(
        { success: false, error: stripPrefix(error.message) },
        { status: 422 },
      );
    }
    // Genuine server / network failure.
    console.error('WooCommerce cart error:', error);
    return NextResponse.json({
      success: false,
      error: 'Something went wrong updating your cart. Please try again.',
    }, { status: 502 });
  }
}

/** Strip the "WooCommerce Store API error 4xx: " prefix from error messages
 *  before forwarding them to the client. */
function stripPrefix(message: string): string {
  return message.replace(/^WooCommerce Store API error \d+:\s*/i, '');
}
