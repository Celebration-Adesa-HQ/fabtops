import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { registerSchema } from '@/lib/schemas';
import { registerCustomer } from '@/lib/auth/account-service';
import { getAuthRouteError } from '@/lib/auth/route-error';

export async function POST(request: NextRequest) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid registration details' }, { status: 400 });
  }

  try {
    const result = await registerCustomer({
      ...parsed.data,
      acceptsMarketing: parsed.data.acceptsMarketing ?? false,
      headers: request.headers,
    });
    const response = NextResponse.json({
      success: true,
      data: result.body,
      message: 'Account created',
    }, { status: result.status });
    const setCookie = result.headers.get('set-cookie');
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }
    return response;
  } catch (error) {
    const authError = getAuthRouteError(error, 'Registration failed');
    return NextResponse.json(
      { success: false, error: authError.message },
      { status: authError.status },
    );
  }
}
