import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/shopify';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const first = parseInt(searchParams.get('first') || '8');

  try {
    const products = await getProducts({ first });
    console.log('products:', products);
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
