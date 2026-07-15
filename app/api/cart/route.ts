import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerAuthSession } from '@/lib/auth/session';
import { ensureWooCustomerLink } from '@/lib/auth/woo-customer';
import { cartActionSchema } from '@/lib/schemas';
import { validateCsrf } from '@/lib/security';
import {
  clearScopedCartCookies,
  getScopedCartToken,
  setScopedCartCookies,
} from '@/lib/woocommerce/cart-session';
import { mapCheckoutAddressesToWooCustomerUpdate } from '@/lib/woocommerce/customer-mappers';
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
import { updateCustomer as updateWooCustomer } from '@/lib/woocommerce/customers';
import { StoreApiError } from '@/lib/woocommerce/store-api';

function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}

export async function POST(request: NextRequest) {
  if (!validateCsrf(request)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const parsed = cartActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid cart request' }, { status: 400 });
  }

  const session = await getServerAuthSession();
  if (!session) {
    const response = NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
    clearScopedCartCookies(response.cookies);
    return response;
  }

  try {
    const cookieStore = await cookies();
    const { cartToken: currentToken } = getScopedCartToken(cookieStore, session.user);
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
        result = await applyCartCoupon(cartToken, normalizeCouponCode(action.code), bearerToken);
        break;
      case 'removeCoupon':
        result = await removeCartCoupon(cartToken, normalizeCouponCode(action.code), bearerToken);
        break;
      case 'updateCustomer': {
        const linkedCustomer = await ensureWooCustomerLink(session.user);
        const nextCustomerState = mapCheckoutAddressesToWooCustomerUpdate(action.billing_address, action.shipping_address);
        await updateWooCustomer(linkedCustomer.wooCustomerId, nextCustomerState);
        result = await updateCartCustomer(cartToken, action.billing_address, action.shipping_address, bearerToken);
        break;
      }
      case 'selectShipping':
        result = await selectShippingRate(cartToken, action.packageId, action.rateId, bearerToken);
        break;
    }

    const nextCartToken = result.cartToken || cartToken;

    if (nextCartToken && nextCartToken !== currentToken) {
      setScopedCartCookies(cookieStore, nextCartToken, session.user);
    }

    const response = NextResponse.json({
      success: true,
      data: result.cart,
      cartToken: nextCartToken,
      message: 'Cart updated successfully',
    });

    if (nextCartToken) {
      response.headers.set('Cart-Token', nextCartToken);
    }

    return response;
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
