import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getServerAuthSession } from '@/lib/auth/session';
import { ensureWooCustomerLink } from '@/lib/auth/woo-customer';
import { validateCsrf } from '@/lib/security';
import { getScopedCartToken, setScopedCartCookies } from '@/lib/woocommerce/cart-session';
import {
  mapWooCustomerToStoreApiBillingAddress,
  mapWooCustomerToStoreApiShippingAddress,
} from '@/lib/woocommerce/customer-mappers';
import { addCartItem, updateCartCustomer } from '@/lib/woocommerce/cart';

const buyNowSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99).default(1),
});

/**
 * POST /api/cart/buy-now
 *
 * Adds a single product to the WooCommerce Store API cart and returns the
 * checkout URL so the client can redirect the customer immediately.
 *
 * Security: CSRF-validated. Credentials never leave the server.
 * API used: WooCommerce Store API (POST /cart/add-item) with an authenticated FabTops session.
 */
export async function POST(request: NextRequest) {
  if (!validateCsrf(request)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const parsed = buyNowSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid buy-now request', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  try {
    const cookieStore = await cookies();
    const { cartToken: currentToken } = getScopedCartToken(cookieStore, session.user);
    const { productId, quantity } = parsed.data;
    const bearerToken = null;
    const linkedCustomer = await ensureWooCustomerLink(session.user);
    const billingAddress = mapWooCustomerToStoreApiBillingAddress(linkedCustomer.customer, session.user);
    const shippingAddress = mapWooCustomerToStoreApiShippingAddress(linkedCustomer.customer, session.user);

    const added = await addCartItem(currentToken, productId, quantity, bearerToken);
    const { cart, cartToken } = await updateCartCustomer(
      added.cartToken || currentToken,
      billingAddress,
      shippingAddress,
      bearerToken,
    );

    if (cartToken && cartToken !== currentToken) {
      setScopedCartCookies(cookieStore, cartToken, session.user);
    }

    return NextResponse.json({
      success: true,
      data: {
        cart,
        checkoutUrl: '/checkout',
      },
      message: 'Item added. Redirecting to checkout.',
    });
  } catch (error) {
    console.error('WooCommerce buy-now error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Buy-now operation failed',
      },
      { status: 502 },
    );
  }
}
