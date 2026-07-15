import { NextResponse } from 'next/server';
import { newsletterRequestSchema } from '@/lib/schemas';
import { subscribeToEasySubscribe } from '@/lib/newsletter/easy-subscribe';

export async function POST(request: Request) {
  const parsed = newsletterRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid email address' },
      { status: 400 },
    );
  }

  try {
    const result = await subscribeToEasySubscribe(parsed.data);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'NEWSLETTER_PROVIDER_ERROR', message: result.message },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        source: parsed.data.source,
      },
    });
  } catch (error) {
    console.error('Newsletter subscription failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'NEWSLETTER_PROVIDER_ERROR',
        message: 'Unable to join the Circle right now. Please try again shortly.',
      },
      { status: 502 },
    );
  }
}
