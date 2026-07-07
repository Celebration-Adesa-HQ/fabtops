import { wooRequest } from './rest-client';

export interface WooCustomerAddress {
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
}

export interface WooCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  billing: WooCustomerAddress;
  shipping: WooCustomerAddress;
  meta_data?: Array<{ id?: number; key: string; value: unknown }>;
}

interface CustomerCreateInput {
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  password: string;
}

interface CustomerUpdateInput {
  first_name?: string;
  last_name?: string;
  billing?: WooCustomerAddress;
  shipping?: WooCustomerAddress;
  meta_data?: Array<{ id?: number; key: string; value: unknown }>;
}

export function createCustomer(input: CustomerCreateInput) {
  return wooRequest<WooCustomer>('/customers', {
    method: 'POST',
    data: input,
  });
}

export function getCustomer(customerId: number | string) {
  return wooRequest<WooCustomer>(`/customers/${customerId}`);
}

export async function getCustomerByEmail(email: string) {
  const customers = await wooRequest<WooCustomer[]>('/customers', {
    query: {
      email,
      per_page: 1,
    },
  });

  return customers[0] || null;
}

export function updateCustomer(customerId: number | string, input: CustomerUpdateInput) {
  return wooRequest<WooCustomer>(`/customers/${customerId}`, {
    method: 'PUT',
    data: input,
  });
}
