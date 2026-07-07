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
import { getAccessToken } from '@/lib/auth/session';

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
    const bearerToken = await getAccessToken();
    const action = parsed.data;
    let result;

    switch (action.action) {
      case 'create':
      case 'get':
        result = await getCart(currentToken, bearerToken);
        break;
      case 'add':
        result = await addCartItem(currentToken, action.productId, action.quantity, bearerToken);
        break;
      case 'update':
        result = await updateCartItem(currentToken, action.lineKey, action.quantity, bearerToken);
        break;
      case 'remove':
        result = await removeCartItem(currentToken, action.lineKey, bearerToken);
        break;
      case 'applyCoupon':
        result = await applyCartCoupon(currentToken, action.code, bearerToken);
        break;
      case 'removeCoupon':
        result = await removeCartCoupon(currentToken, action.code, bearerToken);
        break;
      case 'updateCustomer':
        result = await updateCartCustomer(currentToken, action.billing_address, action.shipping_address, bearerToken);
        break;
      case 'selectShipping':
        result = await selectShippingRate(currentToken, action.packageId, action.rateId, bearerToken);
        break;
    }

    if (result.cartToken && result.cartToken !== currentToken) {
      cookieStore.set(CART_TOKEN_COOKIE, result.cartToken, {
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
    console.error('WooCommerce cart error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Cart operation failed',
    }, { status: 502 });
  }
}
