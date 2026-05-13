import { NextResponse } from 'next/server';
import { createCustomer } from '@/lib/shopify/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const { firstName, lastName, email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    const data = await createCustomer({ firstName, lastName, email, password, acceptsMarketing: true });

    if (data.customerUserErrors.length > 0) {
      return NextResponse.json({ error: data.customerUserErrors[0].message }, { status: 400 });
    }

    return NextResponse.json({ success: true, customer: data.customer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
