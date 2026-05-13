import { NextResponse } from 'next/server';
import { createCustomerAccessToken } from '@/lib/shopify/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    const data = await createCustomerAccessToken({ email, password });

    if (data.customerUserErrors.length > 0) {
      return NextResponse.json({ error: data.customerUserErrors[0].message }, { status: 401 });
    }

    const { accessToken, expiresAt } = data.customerAccessToken;

    // Store token in an HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('customerAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(expiresAt),
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
