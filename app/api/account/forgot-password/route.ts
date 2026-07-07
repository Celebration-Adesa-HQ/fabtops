import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Password reset is unavailable until a dedicated storefront auth endpoint is installed on WordPress.',
    },
    { status: 501 },
  );
}
