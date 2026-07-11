import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resetPasswordSchema } from '@/lib/schemas';
import { resetCustomerPassword } from '@/lib/auth/account-service';
import { getAuthRouteError } from '@/lib/auth/route-error';

export async function POST(request: NextRequest) {
  const parsed = resetPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid password reset request' }, { status: 400 });
  }

  try {
    const result = await resetCustomerPassword({
      token: parsed.data.token,
      password: parsed.data.password,
      headers: request.headers,
    });
    return NextResponse.json({
      success: true,
      data: null,
      message: result.body.message,
    }, { status: result.status });
  } catch (error) {
    const authError = getAuthRouteError(error, 'Unable to reset password');
    return NextResponse.json({ success: false, error: authError.message }, { status: authError.status });
  }
}
