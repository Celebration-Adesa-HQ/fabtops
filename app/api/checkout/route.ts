import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getServerAuthSession } from "@/lib/auth/session";
import { ensureWooCustomerLink } from "@/lib/auth/woo-customer";
import { checkoutSchema } from "@/lib/schemas";
import { validateCsrf } from "@/lib/security";
import { getCart } from "@/lib/woocommerce/cart";
import {
  assertPaymentMethodAvailable,
  submitCheckout,
} from "@/lib/woocommerce/checkout";
import { StoreApiError } from "@/lib/woocommerce/store-api";

const CART_TOKEN_COOKIE = "woocommerce_cart_token";

function getRequestCartToken(request: NextRequest, cookieCartToken: string | null) {
  const headerCartToken = request.headers.get("Cart-Token")?.trim();
  return headerCartToken || cookieCartToken;
}

export async function POST(request: NextRequest) {
  if (!validateCsrf(request)) {
    return NextResponse.json(
      {
        success: false,
        error: "Forbidden",
      },
      {
        status: 403,
      },
    );
  }

  const requestBody = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(requestBody);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid checkout details",
      },
      {
        status: 400,
      },
    );
  }

  const cookieStore = await cookies();
  const cookieCartToken = cookieStore.get(CART_TOKEN_COOKIE)?.value || null;
  const cartToken = getRequestCartToken(request, cookieCartToken);

  if (!cartToken) {
    return NextResponse.json(
      {
        success: false,
        error: "CART_NOT_INITIALIZED",
      },
      {
        status: 409,
      },
    );
  }

  try {
    const session = await getServerAuthSession();

    if (session?.user) {
      await ensureWooCustomerLink(session.user);
    }

    const bearerToken = null;

    const cartResult = await getCart(cartToken, bearerToken);
    const activeCartToken = cartResult.cartToken || cartToken;

    if (activeCartToken !== cartToken) {
      cookieStore.set(CART_TOKEN_COOKIE, activeCartToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    const { cart } = cartResult;

    assertPaymentMethodAvailable(
      cart.paymentMethods,
      parsed.data.payment_method,
    );

    const result = await submitCheckout(
      activeCartToken,
      parsed.data,
      bearerToken,
    );

    if (result.cartToken && result.cartToken !== activeCartToken) {
      cookieStore.set(CART_TOKEN_COOKIE, result.cartToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json({
      success: true,
      data: result.checkout,
      message: "Checkout submitted successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";

    const isStoreApiError = error instanceof StoreApiError;
    const gatewayUnavailable = message.includes("PAYMENT_GATEWAY_UNAVAILABLE");

    console.error("WooCommerce checkout error:", error);

    // WooCommerce 409 means a cart item became unavailable.
    // The client should refresh the cart.
    if (isStoreApiError && error.status === 409) {
      return NextResponse.json(
        {
          success: false,
          error: message.replace(/^WooCommerce Store API error \d+:\s*/i, ""),
          code: "CART_ITEM_UNAVAILABLE",
        },
        {
          status: 409,
        },
      );
    }

    // Other WooCommerce 4xx errors are user-facing validation errors.
    if (isStoreApiError && error.status >= 400 && error.status < 500) {
      return NextResponse.json(
        {
          success: false,
          error: message.replace(/^WooCommerce Store API error \d+:\s*/i, ""),
        },
        {
          status: 422,
        },
      );
    }

    if (gatewayUnavailable) {
      return NextResponse.json(
        {
          success: false,
          error: "PAYMENT_GATEWAY_UNAVAILABLE",
        },
        {
          status: 503,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong processing your checkout. Please try again.",
      },
      {
        status: 502,
      },
    );
  }
}
