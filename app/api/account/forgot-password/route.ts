import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { forgotPasswordSchema } from '@/lib/schemas';
import { requestCustomerPasswordReset } from '@/lib/auth/account-service';
import { getAuthRouteError } from '@/lib/auth/route-error';

export async function POST(request: NextRequest) {
  const parsed = forgotPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 });
  }

  try {
    const result = await requestCustomerPasswordReset({
      email: parsed.data.email,
      headers: request.headers,
    });
    return NextResponse.json({
      success: true,
      data: null,
      message: result.body.message,
    }, { status: result.status });
  } catch (error) {
    const authError = getAuthRouteError(error, 'Unable to send reset email');
    return NextResponse.json({ success: false, error: authError.message }, { status: authError.status });
  }
}
