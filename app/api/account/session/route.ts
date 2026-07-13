import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCustomerSession } from '@/lib/auth/account-service';
import { getAuthRouteError } from '@/lib/auth/route-error';

export async function GET(request: NextRequest) {
  try {
    const result = await getCustomerSession({ headers: request.headers });
    if (result.status === 401 || !result.body) {
      return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
    }
    return NextResponse.json({ success: true, data: result.body }, { status: result.status });
  } catch (error) {
    const authError = getAuthRouteError(error, 'SESSION_EXPIRED');
    return NextResponse.json(
      { success: false, error: authError.message },
      { status: authError.status },
    );
  }
}
