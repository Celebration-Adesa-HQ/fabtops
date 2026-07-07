import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { validateCsrf } from '@/lib/security';
import { addCartItem } from '@/lib/woocommerce/cart';
import { getAccessToken } from '@/lib/auth/session';

const CART_TOKEN_COOKIE = 'woocommerce_cart_token';

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
 * API used: WooCommerce Store API (POST /cart/add-item) — session-scoped via Bearer token
 *           when available, plus Cart-Token header/cookie for guest carts.
 */
export async function POST(request: NextRequest) {
  if (!validateCsrf(request)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const bearerToken = await getAccessToken();

  const parsed = buyNowSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid buy-now request', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get(CART_TOKEN_COOKIE)?.value || null;
    const { productId, quantity } = parsed.data;

    const { cart, cartToken } = await addCartItem(currentToken, productId, quantity, bearerToken);

    if (cartToken && cartToken !== currentToken) {
      cookieStore.set(CART_TOKEN_COOKIE, cartToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
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
