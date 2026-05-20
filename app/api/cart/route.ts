import { NextResponse } from 'next/server';
import { cartActionSchema } from '@/lib/schemas';
import { validateCsrf } from '@/lib/security';
import { 
  shopifyFetch, 
  CREATE_CART_MUTATION, 
  GET_CART_QUERY, 
  ADD_CART_LINES_MUTATION, 
  UPDATE_CART_LINES_MUTATION, 
  REMOVE_CART_LINES_MUTATION,
} from '@/lib/shopify';

const UPDATE_CART_DISCOUNT_CODES_MUTATION = `
  mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function POST(req: Request) {
  // CSRF Protection Check
  if (!validateCsrf(req)) {
    return NextResponse.json({ 
      success: false, 
      error: 'Forbidden' 
    }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validation = cartActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid request payload', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { action, cartId, lines, lineIds, lineId, quantity, discountCodes } = validation.data;

    let result: any;

    switch (action) {
      case 'create':
        result = await shopifyFetch({
          query: CREATE_CART_MUTATION,
          variables: { input: { lines } },
        });
        return NextResponse.json({ 
          success: true, 
          data: result.cartCreate.cart,
          message: 'Cart created'
        });

      case 'get':
        result = await shopifyFetch({
          query: GET_CART_QUERY,
          variables: { cartId },
        });
        return NextResponse.json({ 
          success: true, 
          data: result.cart,
          message: 'Cart fetched'
        });

      case 'add':
        result = await shopifyFetch({
          query: ADD_CART_LINES_MUTATION,
          variables: { cartId, lines },
        });
        return NextResponse.json({ 
          success: true, 
          data: result.cartLinesAdd.cart,
          message: 'Items added'
        });

      case 'update':
        result = await shopifyFetch({
          query: UPDATE_CART_LINES_MUTATION,
          variables: { cartId, lines: [{ id: lineId, quantity }] },
        });
        return NextResponse.json({ 
          success: true, 
          data: result.cartLinesUpdate.cart,
          message: 'Cart updated'
        });

      case 'remove':
        result = await shopifyFetch({
          query: REMOVE_CART_LINES_MUTATION,
          variables: { cartId, lineIds },
        });
        return NextResponse.json({ 
          success: true, 
          data: result.cartLinesRemove.cart,
          message: 'Items removed'
        });

      case 'updateDiscount':
        result = await shopifyFetch({
          query: UPDATE_CART_DISCOUNT_CODES_MUTATION,
          variables: { cartId, discountCodes },
        });
        return NextResponse.json({ 
          success: true, 
          data: result.cartDiscountCodesUpdate.cart,
          errors: result.cartDiscountCodesUpdate.userErrors,
          message: 'Discount updated'
        });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Cart API Error:', error.message || error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Cart operation failed' 
    }, { status: 500 });
  }
}
