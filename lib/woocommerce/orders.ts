import { wooRequest } from './rest-client';

export class WooOrderError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly responseBody?: unknown,
  ) {
    super(message);
    this.name = 'WooOrderError';
  }
}

export interface WooOrderMetaData {
  id?: number;
  key: string;
  value: unknown;
}

export interface WooOrderAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state?: string;
  postcode?: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface WooOrderLineItem {
  id: number;
  product_id?: number;
  variation_id?: number;
  name: string;
  quantity: number;
  total: string;
  subtotal?: string;
  image?: { src: string };
}

export interface WooOrder {
  id: number;
  number: string;
  status: string;
  currency: string;
  total: string;
  customer_id: number;
  payment_method?: string;
  payment_method_title?: string;
  transaction_id?: string;
  order_key?: string;
  customer_note?: string;
  date_created_gmt?: string;
  billing?: WooOrderAddress;
  shipping?: WooOrderAddress;
  shipping_lines?: Array<{
    method_id?: string;
    method_title?: string;
    total?: string;
  }>;
  line_items: WooOrderLineItem[];
  meta_data?: WooOrderMetaData[];
}

export interface WooPendingOrderInput {
  status: 'pending';
  set_paid: false;
  payment_method: string;
  payment_method_title: string;
  customer_id?: number;
  currency: string;
  customer_note?: string;
  billing: {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    state?: string;
    postcode?: string;
    country: string;
    email?: string;
    phone?: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    state?: string;
    postcode?: string;
    country: string;
    phone?: string;
  };
  line_items: Array<{
    product_id: number;
    variation_id?: number;
    quantity: number;
    total?: string;
    subtotal?: string;
  }>;
  shipping_lines?: Array<{
    method_id: string;
    method_title: string;
    total: string;
  }>;
  coupon_lines?: Array<{
    code: string;
  }>;
  meta_data?: WooOrderMetaData[];
}

export interface WooOrderUpdateInput {
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_method?: string;
  payment_method_title?: string;
  transaction_id?: string;
  set_paid?: boolean;
  customer_note?: string;
  billing?: WooOrderAddress;
  shipping?: WooOrderAddress;
  meta_data?: WooOrderMetaData[];
}

export function getCustomerOrders(customerId: number | string) {
  return wooRequest<WooOrder[]>('/orders', {
    query: {
      customer: customerId,
      per_page: 50,
      orderby: 'date',
      order: 'desc',
    },
  });
}

export function getCustomerOrder(orderId: number | string) {
  return wooRequest<WooOrder>(`/orders/${orderId}`);
}

export function getOrderById(orderId: number | string) {
  return wooRequest<WooOrder>(`/orders/${orderId}`);
}

export function createPendingOrder(input: WooPendingOrderInput) {
  return wooRequest<WooOrder>('/orders', {
    method: 'POST',
    data: input,
    cache: 'no-store',
  });
}

export function updateOrder(orderId: number | string, input: WooOrderUpdateInput) {
  return wooRequest<WooOrder>(`/orders/${orderId}`, {
    method: 'PUT',
    data: input,
    cache: 'no-store',
  });
}

export function paymentCompleteOrder(
  orderId: number | string,
  input: Pick<WooOrderUpdateInput, 'transaction_id' | 'meta_data'>,
) {
  return wooRequest<WooOrder>(`/orders/${orderId}`, {
    method: 'PUT',
    data: {
      set_paid: true,
      status: 'processing',
      transaction_id: input.transaction_id,
      meta_data: input.meta_data,
    },
    cache: 'no-store',
  });
}

export function mergeOrderMetaData(
  existing: WooOrderMetaData[] = [],
  updates: Array<{ key: string; value: unknown }>,
) {
  const byKey = new Map(existing.map((item) => [item.key, item]));

  for (const update of updates) {
    const current = byKey.get(update.key);
    byKey.set(update.key, current ? { ...current, value: update.value } : { key: update.key, value: update.value });
  }

  return [...byKey.values()];
}

export function getOrderMetaValue(
  metaData: WooOrderMetaData[] | undefined,
  key: string,
) {
  return metaData?.find((item) => item.key === key)?.value;
}
