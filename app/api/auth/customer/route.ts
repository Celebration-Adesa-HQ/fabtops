import { NextResponse } from 'next/server';
import { getCustomer, updateCustomer } from '@/lib/shopify/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('customerAccessToken')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const customer = await getCustomer(token);
    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('customerAccessToken')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = await updateCustomer(token, body);
    
    if (result.customerUserErrors && result.customerUserErrors.length > 0) {
      return NextResponse.json({ error: result.customerUserErrors[0].message }, { status: 400 });
    }

    return NextResponse.json(result.customer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
