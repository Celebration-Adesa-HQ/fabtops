import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateCsrf } from '@/lib/security';

export async function POST(request: Request) {
  // CSRF Protection Check
  if (!validateCsrf(request)) {
    return NextResponse.json({ 
      success: false, 
      error: 'Forbidden' 
    }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.delete('customerAccessToken');
  return NextResponse.json({ success: true });
}

