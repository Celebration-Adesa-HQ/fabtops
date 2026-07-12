import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getServerAuthSession } from "@/lib/auth/session";
import { ensureWooCustomerLink } from "@/lib/auth/woo-customer";
import { checkoutSchema } from "@/lib/schemas";
import { validateCsrf } from "@/lib/security";
import { getCart } from "@/lib/woocommerce/cart";
import { submitCheckout } from "@/lib/woocommerce/checkout";
import { StoreApiError } from "@/lib/woocommerce/store-api";

const CART_TOKEN_COOKIE = "woocommerce_cart_token";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

type CheckoutStage =
  "request-validation" | "authentication" | "cart-fetch" | "checkout-submit";

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
    {
      status,
    },
  );

  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Request-Id", requestId);

  if (cartToken) {
    response.cookies.set(CART_TOKEN_COOKIE, cartToken, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return response;
}

function getRequestCartToken(request: NextRequest) {
  const cookieToken =
    request.cookies.get(CART_TOKEN_COOKIE)?.value?.trim() || null;

  const headerToken = request.headers.get("Cart-Token")?.trim() || null;

  /*
   * The HTTP-only cookie is the server-controlled source of truth.
   * The header is only a fallback for clients that do not yet have the cookie.
   */
  return {
    cartToken: cookieToken || headerToken,
    tokenMismatch:
      Boolean(cookieToken) &&
      Boolean(headerToken) &&
      cookieToken !== headerToken,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Checkout failed";
}

function getErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }

  const code = (error as { code?: unknown }).code;

  return typeof code === "string" ? code : null;
}

function cleanStoreApiMessage(message: string) {
  return message.replace(/^WooCommerce Store API error \d+:\s*/i, "");
}

function readPaymentMethods(cart: unknown): string[] {
  if (typeof cart !== "object" || cart === null) {
    return [];
  }

  const candidate = cart as {
    paymentMethods?: unknown;
    payment_methods?: unknown;
  };

  const methods = Array.isArray(candidate.paymentMethods)
    ? candidate.paymentMethods
    : Array.isArray(candidate.payment_methods)
      ? candidate.payment_methods
      : [];

  return methods.filter(
    (method): method is string => typeof method === "string",
  );
}

function readItemCount(cart: unknown): number | null {
  if (typeof cart !== "object" || cart === null) {
    return null;
  }

  const candidate = cart as {
    items?: unknown;
    itemsCount?: unknown;
    items_count?: unknown;
  };

  if (Array.isArray(candidate.items)) {
    return candidate.items.length;
  }

  if (typeof candidate.itemsCount === "number") {
    return candidate.itemsCount;
  }

  if (typeof candidate.items_count === "number") {
    return candidate.items_count;
  }

  return null;
}

function readPaymentResult(checkout: unknown) {
  if (typeof checkout !== "object" || checkout === null) {
    return {
      paymentStatus: null,
      redirectUrl: null,
    };
  }

  const candidate = checkout as {
    payment_result?: unknown;
    paymentResult?: unknown;
  };

  const rawPaymentResult = candidate.payment_result ?? candidate.paymentResult;

  if (typeof rawPaymentResult !== "object" || rawPaymentResult === null) {
    return {
      paymentStatus: null,
      redirectUrl: null,
    };
  }

  const paymentResult = rawPaymentResult as {
    payment_status?: unknown;
    paymentStatus?: unknown;
    redirect_url?: unknown;
    redirectUrl?: unknown;
  };

  const rawStatus = paymentResult.payment_status ?? paymentResult.paymentStatus;

  const rawRedirect = paymentResult.redirect_url ?? paymentResult.redirectUrl;

  return {
    paymentStatus: typeof rawStatus === "string" ? rawStatus : null,
    redirectUrl:
      typeof rawRedirect === "string" && rawRedirect.trim()
        ? rawRedirect
        : null,
  };
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  let stage: CheckoutStage = "request-validation";

  /*
   * If Woo rotates the Cart-Token before a later error occurs,
   * preserve the newest token in the error response.
   */
  let responseCartToken: string | null = null;

  if (!validateCsrf(request)) {
    console.warn("Checkout CSRF validation failed", {
      requestId,
      stage,
    });

    return createJsonResponse(
      {
        success: false,
        error: "Forbidden",
        code: "CSRF_VALIDATION_FAILED",
      },
      403,
      requestId,
    );
  }

  const requestBody = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(requestBody);

  if (!parsed.success) {
    console.warn("Checkout schema validation failed", {
      requestId,
      stage,
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        code: issue.code,
      })),
    });

    return createJsonResponse(
      {
        success: false,
        error: "Invalid checkout details",
        code: "INVALID_CHECKOUT_DETAILS",
        details: IS_PRODUCTION ? undefined : parsed.error.flatten(),
      },
      400,
      requestId,
    );
  }

  const { cartToken, tokenMismatch } = getRequestCartToken(request);

  if (tokenMismatch) {
    console.warn("Checkout received different cookie and header cart tokens", {
      requestId,
      stage,
    });
  }

  if (!cartToken) {
    return createJsonResponse(
      {
        success: false,
        error: "CART_NOT_INITIALIZED",
        code: "CART_NOT_INITIALIZED",
      },
      409,
      requestId,
    );
  }

  try {
    stage = "authentication";

    const session = await getServerAuthSession();

    if (session?.user) {
      await ensureWooCustomerLink(session.user);
    }

    /*
     * This remains null unless you have implemented a real WooCommerce
     * customer authentication bridge.
     *
     * A local Next.js session does not automatically authenticate the
     * WooCommerce Store API request.
     */
    const bearerToken: string | null = null;

    stage = "cart-fetch";

    const cartResult = await getCart(cartToken, bearerToken);
    const activeCartToken = cartResult.cartToken || cartToken;

    if (activeCartToken !== cartToken) {
      responseCartToken = activeCartToken;
    }

    const { cart } = cartResult;
    const paymentMethods = readPaymentMethods(cart);
    const itemCount = readItemCount(cart);

    console.info("WooCommerce cart loaded for checkout", {
      requestId,
      stage,
      itemCount,
      availablePaymentMethods: paymentMethods,
      selectedPaymentMethod: parsed.data.payment_method,
      cartTokenRotated: activeCartToken !== cartToken,
      authenticatedUser: Boolean(session?.user),
    });

    if (itemCount === 0) {
      return createJsonResponse(
        {
          success: false,
          error: "Your cart is empty.",
          code: "CART_EMPTY",
        },
        409,
        requestId,
        responseCartToken,
      );
    }

    /*
     * Do not reject the payment method here yet.
     *
     * The available methods can be stale if the cart customer address,
     * shipping method, or currency has not been synchronized with the
     * submitted checkout data.
     *
     * Let WooCommerce perform the authoritative validation inside
     * submitCheckout().
     */
    if (
      paymentMethods.length > 0 &&
      !paymentMethods.includes(parsed.data.payment_method)
    ) {
      console.warn("Selected gateway is not listed on the current cart", {
        requestId,
        selectedPaymentMethod: parsed.data.payment_method,
        availablePaymentMethods: paymentMethods,
      });
    }

    stage = "checkout-submit";

    const result = await submitCheckout(
      activeCartToken,
      parsed.data,
      bearerToken,
    );

    const finalCartToken = result.cartToken || activeCartToken;

    if (finalCartToken !== cartToken) {
      responseCartToken = finalCartToken;
    }

    const { paymentStatus, redirectUrl } = readPaymentResult(result.checkout);

    console.info("WooCommerce checkout response received", {
      requestId,
      stage,
      paymentStatus,
      hasRedirectUrl: Boolean(redirectUrl),
      cartTokenRotated: finalCartToken !== cartToken,
    });

    return createJsonResponse(
      {
        success: true,
        data: result.checkout,
        paymentStatus,
        redirectUrl,
        message: "Checkout submitted successfully",
      },
      200,
      requestId,
      responseCartToken,
    );
  } catch (error) {
    const message = getErrorMessage(error);
    const cleanedMessage = cleanStoreApiMessage(message);
    const errorCode = getErrorCode(error);
    const isStoreApiError = error instanceof StoreApiError;

    const gatewayUnavailable =
      errorCode === "PAYMENT_GATEWAY_UNAVAILABLE" ||
      message.includes("PAYMENT_GATEWAY_UNAVAILABLE");

    console.error("WooCommerce checkout failed", {
      requestId,
      stage,
      errorName: error instanceof Error ? error.name : typeof error,
      errorCode,
      message,
      upstreamStatus: isStoreApiError ? error.status : null,
    });

    /*
     * This check must come before the generic Store API 4xx handler.
     */
    if (gatewayUnavailable) {
      return createJsonResponse(
        {
          success: false,
          error: "PAYMENT_GATEWAY_UNAVAILABLE",
          code: "PAYMENT_GATEWAY_UNAVAILABLE",
        },
        503,
        requestId,
        responseCartToken,
      );
    }

    /*
     * A WooCommerce 409 is a cart conflict.
     * It does not always mean an unavailable item.
     */
    if (isStoreApiError && error.status === 409) {
      return createJsonResponse(
        {
          success: false,
          error: cleanedMessage,
          code: "CART_CONFLICT",
          upstreamCode: errorCode,
        },
        409,
        requestId,
        responseCartToken,
      );
    }

    if (isStoreApiError && error.status >= 400 && error.status < 500) {
      const responseStatus = error.status === 400 ? 422 : error.status;

      return createJsonResponse(
        {
          success: false,
          error: cleanedMessage,
          code: errorCode || "CHECKOUT_VALIDATION_FAILED",
        },
        responseStatus,
        requestId,
        responseCartToken,
      );
    }

    /*
     * Authentication and customer-link failures are internal errors.
     * Woo cart and checkout failures are upstream errors.
     */
    const responseStatus = stage === "authentication" ? 500 : 502;

    return createJsonResponse(
      {
        success: false,
        error:
          "Something went wrong processing your checkout. Please try again.",
        code: "CHECKOUT_PROCESSING_FAILED",
        stage: IS_PRODUCTION ? undefined : stage,
      },
      responseStatus,
      requestId,
      responseCartToken,
    );
  }
}
