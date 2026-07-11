import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { loginSchema } from '@/lib/schemas';
import { loginCustomer } from '@/lib/auth/account-service';
import { getAuthRouteError } from '@/lib/auth/route-error';

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid login details' }, { status: 400 });
  }

  try {
    const result = await loginCustomer({
      ...parsed.data,
      headers: request.headers,
    });
    const response = NextResponse.json({
      success: true,
      data: result.body,
      message: 'Signed in',
    }, { status: result.status });
    const setCookie = result.headers.get('set-cookie');
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }
    return response;
  } catch (error) {
    const authError = getAuthRouteError(error, 'Login failed');
    return NextResponse.json(
      { success: false, error: authError.message },
      { status: authError.status },
    );
  }
}
