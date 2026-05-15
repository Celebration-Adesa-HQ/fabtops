import { NextResponse } from 'next/server';
import { createCustomer } from '@/lib/shopify/auth';
import { registerSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        error: validation.error.issues[0].message 
      }, { status: 400 });
    }

    const { firstName, lastName, email, password, acceptsMarketing } = validation.data;
    const data = await createCustomer({ firstName, lastName, email, password, acceptsMarketing });

    if (data.customerUserErrors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: data.customerUserErrors[0].message 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data.customer,
      message: 'Account created successfully' 
    });
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create account' 
    }, { status: 500 });
  }
}
