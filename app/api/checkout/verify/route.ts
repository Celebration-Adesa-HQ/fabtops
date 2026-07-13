import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  CART_TOKEN_COOKIE,
  clearCheckoutCart,
  verifyPaystackPayment,
} from '@/lib/paystack/checkout';
import { checkoutVerificationSchema } from '@/lib/schemas';
import { validateCsrf } from '@/lib/security';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function mapVerificationErrorToStatus(message: string) {
  switch (message) {
    case 'PAYSTACK_WOO_ORDER_MISSING':
    case 'PAYMENT_REFERENCE_MISMATCH':
    case 'PAYMENT_CURRENCY_MISMATCH':
    case 'PAYMENT_AMOUNT_MISMATCH':
    case 'PAYMENT_NOT_SUCCESSFUL':
      return 422;
    default:
      return 502;
  }
}

function createResponse(body: Record<string, unknown>, status: number) {
  const response = NextResponse.json(body, { status });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

function expireCartCookie(response: NextResponse) {
  response.cookies.set(CART_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  response.headers.set('Cart-Token', '');
}

export async function POST(request: NextRequest) {
  if (!validateCsrf(request)) {
    return createResponse(
      {
        success: false,
        error: 'Forbidden',
        code: 'CSRF_VALIDATION_FAILED',
      },
      403,
    );
  }

  const parsed = checkoutVerificationSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    return createResponse(
      {
        success: false,
        error: 'Invalid payment verification payload',
        code: 'INVALID_PAYMENT_VERIFICATION',
      },
      400,
    );
  }

  try {
    const cartToken =
      request.headers.get('Cart-Token')?.trim() ||
      request.cookies.get(CART_TOKEN_COOKIE)?.value?.trim() ||
      null;

    const { result } = await verifyPaystackPayment(parsed.data.reference);
    await clearCheckoutCart(cartToken, null).catch(() => null);

    const response = createResponse(
      {
        success: true,
        data: result,
        message: 'Payment verified successfully',
      },
      200,
    );

    expireCartCookie(response);
    return response;
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : 'PAYMENT_VERIFICATION_FAILED';

    return createResponse(
      {
        success: false,
        error:
          message === 'PAYMENT_VERIFICATION_FAILED'
            ? 'Unable to verify payment.'
            : message,
        code: message,
      },
      mapVerificationErrorToStatus(message),
    );
  }
}
