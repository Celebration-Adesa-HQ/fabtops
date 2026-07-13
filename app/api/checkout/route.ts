import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkoutSchema } from '@/lib/schemas';
import { validateCsrf } from '@/lib/security';
import {
  CART_TOKEN_COOKIE,
  preparePaystackCheckout,
} from '@/lib/paystack/checkout';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function createJsonResponse(
  body: Record<string, unknown>,
  status: number,
  requestId: string,
  cartToken?: string | null,
) {
  const response = NextResponse.json(
    {
      ...body,
      requestId,
    },
    { status },
  );

  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-Request-Id', requestId);

  if (cartToken) {
    response.cookies.set(CART_TOKEN_COOKIE, cartToken, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    response.headers.set('Cart-Token', cartToken);
  }

  return response;
}

function getRequestCartToken(request: NextRequest) {
  const headerToken = request.headers.get('Cart-Token')?.trim() || null;
  const cookieToken =
    request.cookies.get(CART_TOKEN_COOKIE)?.value?.trim() || null;

  return {
    cartToken: headerToken || cookieToken,
    tokenMismatch:
      Boolean(cookieToken) &&
      Boolean(headerToken) &&
      cookieToken !== headerToken,
  };
}

function mapPrepareErrorToStatus(message: string) {
  switch (message) {
    case 'CART_NOT_INITIALIZED':
    case 'CART_EMPTY':
    case 'SHIPPING_METHOD_REQUIRED':
    case 'SHIPPING_RATE_MISMATCH':
    case 'COUPON_STATE_MISMATCH':
      return 409;
    case 'UNSUPPORTED_CURRENCY':
    case 'PAYSTACK_UNSUPPORTED_CURRENCY':
    case 'ORDER_BASE_CURRENCY_UNSUPPORTED':
    case 'CART_TOTAL_INVALID':
    case 'PAYMENT_METHOD_UNSUPPORTED':
      return 422;
    default:
      return 502;
  }
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  if (!validateCsrf(request)) {
    return createJsonResponse(
      {
        success: false,
        error: 'Forbidden',
        code: 'CSRF_VALIDATION_FAILED',
      },
      403,
      requestId,
    );
  }

  const requestBody = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(requestBody);

  if (!parsed.success) {
    return createJsonResponse(
      {
        success: false,
        error: 'Invalid checkout details',
        code: 'INVALID_CHECKOUT_DETAILS',
        details: IS_PRODUCTION ? undefined : parsed.error.flatten(),
      },
      400,
      requestId,
    );
  }

  const { cartToken, tokenMismatch } = getRequestCartToken(request);

  if (tokenMismatch) {
    console.warn('Checkout received different cookie and header cart tokens', {
      requestId,
    });
  }

  if (!cartToken) {
    return createJsonResponse(
      {
        success: false,
        error: 'CART_NOT_INITIALIZED',
        code: 'CART_NOT_INITIALIZED',
      },
      409,
      requestId,
    );
  }

  try {
    const result = await preparePaystackCheckout(cartToken, parsed.data, null);

    return createJsonResponse(
      {
        success: true,
        orderId: result.checkout.orderId,
        reference: result.checkout.reference,
        authorizationUrl: result.checkout.authorizationUrl,
        message: 'Paystack checkout prepared successfully',
      },
      200,
      requestId,
      result.cartToken,
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : 'CHECKOUT_PROCESSING_FAILED';
    const stage =
      typeof error === 'object' &&
      error !== null &&
      'stage' in error &&
      typeof (error as { stage?: unknown }).stage === 'string'
        ? (error as { stage: string }).stage
        : 'unknown';
    const status =
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof (error as { status?: unknown }).status === 'number'
        ? (error as { status: number }).status
        : undefined;
    const responseBody =
      typeof error === 'object' &&
      error !== null &&
      'responseBody' in error
        ? (error as { responseBody?: unknown }).responseBody
        : undefined;

    console.error('Direct Paystack checkout preparation failed', {
      requestId,
      stage,
      message,
      errorName: error instanceof Error ? error.name : typeof error,
      status,
      responseBody,
    });

    return createJsonResponse(
      {
        success: false,
        error:
          message === 'CHECKOUT_PROCESSING_FAILED'
            ? 'Something went wrong preparing your payment. Please try again.'
            : message,
        code: message,
      },
      mapPrepareErrorToStatus(message),
      requestId,
    );
  }
}
