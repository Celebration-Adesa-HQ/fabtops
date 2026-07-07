import type { CheckoutSchema } from '@/lib/schemas';
import { storeApiRequest } from './store-api';

interface StoreApiCheckoutResponse {
  order_id: number;
  status: string;
  order_key: string;
  payment_result: {
    payment_status: string;
    payment_details: Array<{ key: string; value: string }>;
    redirect_url: string;
  } | null;
}

export interface SafeCheckoutResult {
  orderId: number;
  status: string;
  paymentStatus: string;
  redirectUrl: string;
}

export function assertPaymentMethodAvailable(paymentMethods: string[], requiredMethod = 'paystack') {
  if (!paymentMethods.includes(requiredMethod)) {
    throw new Error('PAYMENT_GATEWAY_UNAVAILABLE');
  }
}

export function normalizeCheckoutResult(response: StoreApiCheckoutResponse): SafeCheckoutResult {
  return {
    orderId: response.order_id,
    status: response.status,
    paymentStatus: response.payment_result?.payment_status || response.status,
    redirectUrl: response.payment_result?.redirect_url || '',
  };
}

export async function submitCheckout(cartToken: string, input: CheckoutSchema, bearerToken?: string | null) {
  const result = await storeApiRequest<StoreApiCheckoutResponse>('/checkout', {
    method: 'POST',
    cartToken,
    bearerToken,
    body: JSON.stringify(input),
  });
  return {
    checkout: normalizeCheckoutResult(result.data),
    cartToken: result.cartToken,
  };
}
