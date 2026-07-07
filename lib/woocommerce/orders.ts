import { wooRequest } from './rest-client';

export interface WooOrderLineItem {
  id: number;
  name: string;
  quantity: number;
  total: string;
  image?: { src: string };
}

export interface WooOrder {
  id: number;
  number: string;
  status: string;
  currency: string;
  total: string;
  customer_id: number;
  date_created_gmt?: string;
  line_items: WooOrderLineItem[];
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
