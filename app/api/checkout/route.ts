import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkoutSchema } from '@/lib/schemas';
import { validateCsrf } from '@/lib/security';
import { getCart } from '@/lib/woocommerce/cart';
import { assertPaymentMethodAvailable, submitCheckout } from '@/lib/woocommerce/checkout';

const CART_TOKEN_COOKIE = 'woocommerce_cart_token';

export async function POST(request: NextRequest) {
  if (!validateCsrf(request)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid checkout details' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const cartToken = cookieStore.get(CART_TOKEN_COOKIE)?.value;
  if (!cartToken) {
    return NextResponse.json({ success: false, error: 'CART_NOT_INITIALIZED' }, { status: 409 });
  }

  try {
    const bearerToken = null;
    const { cart } = await getCart(cartToken, bearerToken);
    assertPaymentMethodAvailable(cart.paymentMethods, parsed.data.payment_method);
    const result = await submitCheckout(cartToken, parsed.data, bearerToken);

    if (result.cartToken && result.cartToken !== cartToken) {
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
      data: result.checkout,
      message: 'Checkout submitted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    const gatewayUnavailable = message.includes('PAYMENT_GATEWAY_UNAVAILABLE');
    console.error('WooCommerce checkout error:', error);
    return NextResponse.json({
      success: false,
      error: gatewayUnavailable ? 'PAYMENT_GATEWAY_UNAVAILABLE' : message,
    }, { status: gatewayUnavailable ? 503 : 502 });
  }
}
