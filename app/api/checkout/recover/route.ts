import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAccessToken } from '@/lib/auth/session';
import { checkoutAddressSchema } from '@/lib/schemas';
import { getStoreCheckoutOrder, getStoreOrder, submitStoreCheckoutOrder } from '@/lib/woocommerce/storefront';

const recoveryQuerySchema = z.object({
  orderId: z.string().min(1),
  key: z.string().min(1),
  billingEmail: z.string().email().optional(),
});

const recoveryCheckoutSchema = z.object({
  orderId: z.string().min(1),
  key: z.string().min(1),
  billingEmail: z.string().email().optional(),
  paymentMethod: z.string().min(1).max(100),
  paymentData: z.array(z.object({
    key: z.string().min(1).max(100),
    value: z.string().max(500),
  })).default([]),
  billingAddress: checkoutAddressSchema.extend({
    email: z.string().email().optional(),
    phone: z.string().trim().max(30).optional(),
  }),
  shippingAddress: checkoutAddressSchema,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = recoveryQuerySchema.safeParse({
    orderId: searchParams.get('orderId') || '',
    key: searchParams.get('key') || '',
    billingEmail: searchParams.get('billingEmail') || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid recovery request' }, { status: 400 });
  }

  try {
    const data = parsed.data.billingEmail
      ? await getStoreOrder(parsed.data.orderId, parsed.data.key, parsed.data.billingEmail)
      : await getStoreCheckoutOrder(parsed.data.orderId, parsed.data.key);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to recover order' },
      { status: 404 },
    );
  }
}

const CART_TOKEN_COOKIE = 'woocommerce_cart_token';

function cookieConfig(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export async function POST(request: NextRequest) {
  const parsed = recoveryCheckoutSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid recovery checkout payload' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const cartToken = cookieStore.get(CART_TOKEN_COOKIE)?.value;

  if (!cartToken) {
    return NextResponse.json({
      success: false,
      error: 'CART_NOT_INITIALIZED',
    }, { status: 409 });
  }

  try {
    const bearerToken = await getAccessToken();
    const result = await submitStoreCheckoutOrder(
      parsed.data.orderId,
      {
        key: parsed.data.key,
        ...(parsed.data.billingEmail ? { billing_email: parsed.data.billingEmail } : {}),
        payment_method: parsed.data.paymentMethod,
        payment_data: parsed.data.paymentData,
        billing_address: parsed.data.billingAddress,
        shipping_address: parsed.data.shippingAddress,
      },
      cartToken,
      bearerToken,
    );

    if (result.cartToken && result.cartToken !== cartToken) {
      cookieStore.set(CART_TOKEN_COOKIE, result.cartToken, cookieConfig(60 * 60 * 24 * 7));
    }

    return NextResponse.json({
      success: true,
      data: result.checkout,
      message: 'Payment recovery submitted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to retry payment';
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
