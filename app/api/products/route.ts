import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/shopify';
import { z } from 'zod';

const productsQuerySchema = z.object({
  first: z.preprocess(
    (val) => (val ? parseInt(val as string, 10) : undefined),
    z.number().int().min(1).max(50).default(8)
  ),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawFirst = searchParams.get('first');

  const validation = productsQuerySchema.safeParse({ first: rawFirst });
  if (!validation.success) {
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid query parameters' 
    }, { status: 400 });
  }

  const { first } = validation.data;

  try {
    const products = await getProducts({ first });
    return NextResponse.json({
      success: true,
      data: products,
      message: 'Products fetched successfully'
    });
  } catch (error: any) {
    console.error('Products GET API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch products' 
    }, { status: 500 });
  }
}

