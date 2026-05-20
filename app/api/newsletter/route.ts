import { NextResponse } from 'next/server';
import { createCustomer } from '@/lib/shopify/auth';
import { newsletterSchema } from '@/lib/schemas';
import { validateCsrf } from '@/lib/security';

export async function POST(request: Request) {
  // 1. CSRF Protection
  if (!validateCsrf(request)) {
    return NextResponse.json({ 
      success: false, 
      error: 'Forbidden' 
    }, { status: 403 });
  }

  try {
    // 2. Validate input payload
    const body = await request.json();
    const validation = newsletterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        error: validation.error.issues[0].message 
      }, { status: 400 });
    }

    const { email } = validation.data;

    // 3. Connect to Shopify API to create customer/marketing profile
    const result = await createCustomer({
      email,
      acceptsMarketing: true,
    });

    if (result.customerUserErrors && result.customerUserErrors.length > 0) {
      const alreadyExists = result.customerUserErrors.some((err: any) => 
        err.message.toLowerCase().includes('taken') || err.message.toLowerCase().includes('exists')
      );
      
      if (alreadyExists) {
        return NextResponse.json({ 
          success: true, 
          message: "You're already in the circle!" 
        });
      }
      
      return NextResponse.json({ 
        success: false, 
        error: result.customerUserErrors[0].message 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome to the circle!'
    });
  } catch (error: any) {
    console.error('Newsletter API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred. Please try again later.' 
    }, { status: 500 });
  }
}
