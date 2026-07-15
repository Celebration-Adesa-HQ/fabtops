import { NextResponse } from 'next/server';
import { getProductById, getProductBySlug, getProducts } from '@/lib/woocommerce/products';
import { z } from 'zod';

const productsQuerySchema = z.object({
  first: z.preprocess(
    (val) => (val ? parseInt(val as string, 10) : undefined),
    z.number().int().min(1).max(50).default(8)
  ),
  handle: z.string().trim().min(1).optional(),
  id: z.string().trim().min(1).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawFirst = searchParams.get('first');
  const rawHandle = searchParams.get('handle') || undefined;
  const rawId = searchParams.get('id') || undefined;

  const validation = productsQuerySchema.safeParse({ first: rawFirst, handle: rawHandle, id: rawId });
  if (!validation.success) {
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid query parameters' 
    }, { status: 400 });
  }

  const { first, handle, id } = validation.data;

  try {
    if (handle) {
      const product = await getProductBySlug(handle);
      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: product,
        message: 'Product fetched successfully',
      });
    }

    if (id) {
      const product = await getProductById(id);
      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: product,
        message: 'Product fetched successfully',
      });
    }

    const products = await getProducts(first);
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
