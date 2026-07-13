import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'NEWSLETTER_PROVIDER_UNAVAILABLE',
    message: 'Newsletter signup is temporarily unavailable.',
  }, { status: 503 });
}
