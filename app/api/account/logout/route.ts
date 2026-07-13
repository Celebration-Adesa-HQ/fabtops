import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logoutCustomer } from '@/lib/auth/account-service';
import { getAuthRouteError } from '@/lib/auth/route-error';

export async function POST(request: NextRequest) {
  try {
    const result = await logoutCustomer({ headers: request.headers });
    const response = NextResponse.json({ success: true, data: null, message: 'Signed out' }, { status: result.status });
    const setCookie = result.headers.get('set-cookie');
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }
    return response;
  } catch (error) {
    const authError = getAuthRouteError(error, 'Unable to sign out');
    return NextResponse.json({ success: false, error: authError.message }, { status: authError.status });
  }
}
