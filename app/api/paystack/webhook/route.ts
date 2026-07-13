import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getPaystackEnv } from '@/lib/paystack/env';
import { verifyPaystackPayment } from '@/lib/paystack/checkout';

interface PaystackWebhookEvent {
  event?: string;
  data?: {
    reference?: string;
  };
}

function hasValidSignature(rawBody: string, signature: string | null) {
  if (!signature) {
    return false;
  }

  const { webhookSecret } = getPaystackEnv();
  const expected = createHmac('sha512', webhookSecret).update(rawBody).digest('hex');

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature');

  if (!hasValidSignature(rawBody, signature)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid Paystack signature',
      },
      { status: 401 },
    );
  }

  const event = JSON.parse(rawBody) as PaystackWebhookEvent;

  if (event.event !== 'charge.success' || !event.data?.reference) {
    return NextResponse.json({ success: true, ignored: true }, { status: 200 });
  }

  try {
    const { result } = await verifyPaystackPayment(event.data.reference);
    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Webhook verification failed',
      },
      { status: 422 },
    );
  }
}
