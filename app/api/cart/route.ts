import { NextResponse } from 'next/server';
import { 
  shopifyFetch, 
  CREATE_CART_MUTATION, 
  GET_CART_QUERY, 
  ADD_CART_LINES_MUTATION, 
  UPDATE_CART_LINES_MUTATION, 
  REMOVE_CART_LINES_MUTATION 
} from '@/lib/shopify';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, cartId, lines, lineIds, quantity } = body;

    let result;

    switch (action) {
      case 'create':
        result = await shopifyFetch({
          query: CREATE_CART_MUTATION,
          variables: { input: { lines } },
        });
        return NextResponse.json(result.cartCreate.cart);

      case 'get':
        result = await shopifyFetch({
          query: GET_CART_QUERY,
          variables: { cartId },
        });
        return NextResponse.json(result.cart);

      case 'add':
        result = await shopifyFetch({
          query: ADD_CART_LINES_MUTATION,
          variables: { cartId, lines },
        });
        return NextResponse.json(result.cartLinesAdd.cart);

      case 'update':
        result = await shopifyFetch({
          query: UPDATE_CART_LINES_MUTATION,
          variables: { cartId, lines: [{ id: body.lineId, quantity }] },
        });
        return NextResponse.json(result.cartLinesUpdate.cart);

      case 'remove':
        result = await shopifyFetch({
          query: REMOVE_CART_LINES_MUTATION,
          variables: { cartId, lineIds },
        });
        return NextResponse.json(result.cartLinesRemove.cart);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Cart API Error:', error.message || error);
    return NextResponse.json({ error: error.message || 'Cart operation failed' }, { status: 500 });
  }
}
