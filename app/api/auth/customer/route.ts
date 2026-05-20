import { NextResponse } from 'next/server';
import { getCustomer, updateCustomer } from '@/lib/shopify/auth';
import { cookies } from 'next/headers';
import { validateCsrf } from '@/lib/security';
import { profileUpdateSchema } from '@/lib/schemas';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('customerAccessToken')?.value;

  if (!token) {
    return NextResponse.json({ 
      success: false, 
      error: 'Not authenticated' 
    }, { status: 401 });
  }

  try {
    const customer = await getCustomer(token);
    if (!customer) {
      return NextResponse.json({ 
        success: false, 
        error: 'Customer not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: customer,
      message: 'Fetched successfully'
    });
  } catch (error: any) {
    console.error('Customer GET API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred' 
    }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  // CSRF Protection
  if (!validateCsrf(req)) {
    return NextResponse.json({ 
      success: false, 
      error: 'Forbidden' 
    }, { status: 403 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('customerAccessToken')?.value;

  if (!token) {
    return NextResponse.json({ 
      success: false, 
      error: 'Not authenticated' 
    }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = profileUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        error: validation.error.issues[0].message 
      }, { status: 400 });
    }

    const { firstName, lastName, phone } = validation.data;
    const result = await updateCustomer(token, { firstName, lastName, phone });
    
    if (result.customerUserErrors && result.customerUserErrors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: result.customerUserErrors[0].message 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.customer,
      message: 'Updated successfully'
    });
  } catch (error: any) {
    console.error('Customer PATCH API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred' 
    }, { status: 500 });
  }
}

