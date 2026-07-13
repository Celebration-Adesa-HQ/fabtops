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

interface StoreApiCheckoutDraftResponse {
  order_id?: number;
  orderId?: number;
  id?: number;
  status: string;
  order_key?: string;
  orderKey?: string;
  customer_note?: string;
  payment_method?: string;
  billing_address?: {
    first_name?: string;
    last_name?: string;
    company?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    email?: string;
    phone?: string;
  };
  shipping_address?: {
    first_name?: string;
    last_name?: string;
    company?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    phone?: string;
  };
  payment_result?: StoreApiCheckoutResponse['payment_result'];
  additional_fields?: Record<string, string | boolean | number | null>;
  __experimentalCart?: unknown;
}

interface NormalizedStoreApiCheckoutDraftResponse extends Omit<StoreApiCheckoutDraftResponse, 'order_id' | 'order_key'> {
  order_id: number;
  order_key: string;
}

export interface SafeCheckoutResult {
  orderId: number;
  status: string;
  paymentStatus: string;
  redirectUrl: string;
}

export interface CheckoutUpdateInput {
  payment_method?: string;
  order_notes?: string;
  additional_fields?: Record<string, string | boolean | number | null>;
  calcTotals?: boolean;
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

function normalizeCheckoutDraftResponse(
  response: StoreApiCheckoutDraftResponse,
): NormalizedStoreApiCheckoutDraftResponse {
  const orderId = response.order_id ?? response.orderId ?? response.id;
  const orderKey = response.order_key ?? response.orderKey ?? '';

  if (!orderId || !Number.isFinite(orderId)) {
    throw new Error('CHECKOUT_DRAFT_ORDER_ID_MISSING');
  }

  return {
    ...response,
    order_id: orderId,
    order_key: orderKey,
  };
}

export async function getCheckoutDraft(cartToken: string, bearerToken?: string | null) {
  const result = await storeApiRequest<StoreApiCheckoutDraftResponse>('/checkout', {
    cartToken,
    bearerToken,
    cache: 'no-store',
  });

  return {
    checkout: normalizeCheckoutDraftResponse(result.data),
    cartToken: result.cartToken,
  };
}

export async function updateCheckout(
  cartToken: string,
  input: CheckoutUpdateInput,
  bearerToken?: string | null,
) {
  const { calcTotals = false, ...payload } = input;
  const result = await storeApiRequest<StoreApiCheckoutDraftResponse>('/checkout', {
    method: 'PUT',
    cartToken,
    bearerToken,
    query: calcTotals ? { __experimental_calc_totals: true } : undefined,
    body: JSON.stringify(payload),
  });

  return {
    checkout: normalizeCheckoutDraftResponse(result.data),
    cartToken: result.cartToken,
  };
}

export async function submitCheckout(cartToken: string, input: CheckoutSchema, bearerToken?: string | null) {
  const result = await storeApiRequest<StoreApiCheckoutResponse>('/checkout', {
    method: 'POST',
    cartToken,
    bearerToken,
    body: JSON.stringify({
      billing_address: input.billing_address,
      shipping_address: input.shipping_address,
      payment_method: input.payment_method,
      payment_data: input.payment_data,
      ...(input.customer_note ? { customer_note: input.customer_note } : {}),
    }),
  });
  return {
    checkout: normalizeCheckoutResult(result.data),
    cartToken: result.cartToken,
  };
}
