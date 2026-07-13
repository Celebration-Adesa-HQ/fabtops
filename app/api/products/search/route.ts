import { NextResponse } from 'next/server';
import { searchProducts } from '@/lib/woocommerce/products';
import { z } from 'zod';

const searchQuerySchema = z.string().min(1).max(100);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('q') || '';

  const validation = searchQuerySchema.safeParse(rawQuery);
  if (!validation.success) {
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid or missing search query parameter' 
    }, { status: 400 });
  }

  const query = validation.data;

  try {
    const products = await searchProducts(query);
    return NextResponse.json({
      success: true,
      data: products,
      message: 'Products searched successfully'
    });
  } catch (error: any) {
    console.error('Products search API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to search products' 
    }, { status: 500 });
  }
}
