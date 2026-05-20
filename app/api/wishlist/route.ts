import { NextResponse } from 'next/server';
import { validateCsrf, getAuthenticatedCustomer } from '@/lib/security';
import { wishlistActionSchema } from '@/lib/schemas';

// This API route handles wishlist operations securely.
// In a production environment, this would interact with a database (like Neon/PostgreSQL)
// using the authenticated customer.id.

export async function POST(req: Request) {
  // 1. CSRF Protection
  if (!validateCsrf(req)) {
    return NextResponse.json({ 
      success: false, 
      error: 'Forbidden' 
    }, { status: 403 });
  }

  // 2. Authentication Check
  const { authenticated, customer } = await getAuthenticatedCustomer();
  if (!authenticated || !customer) {
    return NextResponse.json({ 
      success: false, 
      error: 'Not authenticated' 
    }, { status: 401 });
  }

  try {
    // 3. Payload Validation
    const body = await req.json();
    const validation = wishlistActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        error: validation.error.issues[0].message 
      }, { status: 400 });
    }

    const { action, product } = validation.data;

    // Simulate server-side processing/logging securely using authenticated customer.id
    console.log(`[Wishlist API] Action: ${action} for Customer: ${customer.id}`, product.title);

    // In the future, we would save to a database here (e.g. Prisma connection using customer.id)
    
    return NextResponse.json({ 
      success: true, 
      data: { product, action },
      message: `Wishlist ${action} successful`
    });
  } catch (error: any) {
    console.error('Wishlist API Error:', error.message || error);
    return NextResponse.json({ 
      success: false, 
      error: 'Wishlist operation failed' 
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Authentication Check
  const { authenticated, customer } = await getAuthenticatedCustomer();
  if (!authenticated || !customer) {
    return NextResponse.json({ 
      success: false, 
      error: 'Not authenticated' 
    }, { status: 401 });
  }

  // Simulate fetching from a database securely using authenticated customer.id
  return NextResponse.json({ 
    success: true,
    data: {
      customerId: customer.id,
      favorites: [] // Return empty for now as it's primarily client-side/localStorage
    },
    message: 'Wishlist fetched successfully'
  });
}

