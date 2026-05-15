import { NextResponse } from 'next/server';
import { createCustomerAccessToken } from '@/lib/shopify/auth';
import { cookies } from 'next/headers';
import { loginSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        error: validation.error.issues[0].message 
      }, { status: 400 });
    }

    const { email, password } = validation.data;
    const data = await createCustomerAccessToken({ email, password });

    if (data.customerUserErrors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: data.customerUserErrors[0].message 
      }, { status: 401 });
    }

    const { accessToken, expiresAt } = data.customerAccessToken;

    // Store token in an HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('customerAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(expiresAt),
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Login successful' 
    });
  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred' 
    }, { status: 500 });
  }
}
