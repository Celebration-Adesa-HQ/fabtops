import type { SessionUser } from '@/lib/auth/session';
import type { CartActionSchema, CheckoutSchema, ProfileUpdateSchema } from '@/lib/schemas';
import type { WooCustomer, WooCustomerAddress } from './customers';

type AccountAddress = {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
};

type AccountAddresses = {
  billing: AccountAddress;
  shipping: Omit<AccountAddress, 'email' | 'phone'>;
};

type CartUpdateCustomerAction = Extract<CartActionSchema, { action: 'updateCustomer' }>;
type CartUpdateBillingAddress = CartUpdateCustomerAction['billing_address'];
type CartUpdateShippingAddress = CartUpdateCustomerAction['shipping_address'];
type CheckoutBillingAddress = CheckoutSchema['billing_address'];
type CheckoutShippingAddress = CheckoutSchema['shipping_address'];

function value(input: string | null | undefined) {
  return typeof input === 'string' ? input : '';
}

function withCountry(country: string | null | undefined) {
  const next = value(country).trim().toUpperCase();
  return next.slice(0, 2);
}

function deriveName(user: Pick<SessionUser, 'firstName' | 'lastName' | 'name'>) {
  const firstName = value(user.firstName).trim();
  const lastName = value(user.lastName).trim();

  if (firstName || lastName) {
    return { firstName, lastName };
  }

  const [fallbackFirst = '', ...rest] = value(user.name).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: fallbackFirst,
    lastName: rest.join(' '),
  };
}

export function mapWooAddressToAccountAddress(address: WooCustomerAddress | null | undefined): AccountAddress {
  return {
    firstName: value(address?.first_name),
    lastName: value(address?.last_name),
    company: value(address?.company),
    address1: value(address?.address_1),
    address2: value(address?.address_2),
    city: value(address?.city),
    state: value(address?.state),
    postcode: value(address?.postcode),
    country: withCountry(address?.country),
    email: value(address?.email),
    phone: value(address?.phone),
  };
}

export function mapWooCustomerToAccountAddresses(customer: WooCustomer): AccountAddresses {
  const billing = mapWooAddressToAccountAddress(customer.billing);
  const shippingAddress = mapWooAddressToAccountAddress(customer.shipping);

  return {
    billing,
    shipping: {
      firstName: shippingAddress.firstName,
      lastName: shippingAddress.lastName,
      company: shippingAddress.company,
      address1: shippingAddress.address1,
      address2: shippingAddress.address2,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postcode: shippingAddress.postcode,
      country: shippingAddress.country,
    },
  };
}

export function mapAccountAddressToWooAddress(address: AccountAddress): WooCustomerAddress {
  return {
    first_name: value(address.firstName),
    last_name: value(address.lastName),
    company: value(address.company),
    address_1: value(address.address1),
    address_2: value(address.address2),
    city: value(address.city),
    state: value(address.state),
    postcode: value(address.postcode),
    country: withCountry(address.country),
    email: value(address.email),
    phone: value(address.phone),
  };
}

export function mapCheckoutAddressesToWooCustomerUpdate(
  billing: CartUpdateBillingAddress | CheckoutBillingAddress,
  shipping: CartUpdateShippingAddress | CheckoutShippingAddress,
) {
  return {
    billing: {
      first_name: value(billing.first_name),
      last_name: value(billing.last_name),
      company: value(billing.company),
      address_1: value(billing.address_1),
      address_2: value(billing.address_2),
      city: value(billing.city),
      state: value(billing.state),
      postcode: value(billing.postcode),
      country: withCountry(billing.country),
      email: value(billing.email),
      phone: value(billing.phone),
    },
    shipping: {
      first_name: value(shipping.first_name),
      last_name: value(shipping.last_name),
      company: value(shipping.company),
      address_1: value(shipping.address_1),
      address_2: value(shipping.address_2),
      city: value(shipping.city),
      state: value(shipping.state),
      postcode: value(shipping.postcode),
      country: withCountry(shipping.country),
    },
  };
}

export function mapWooCustomerToStoreApiBillingAddress(
  customer: WooCustomer,
  sessionUser: Pick<SessionUser, 'email' | 'firstName' | 'lastName' | 'name' | 'phone'>,
): CheckoutBillingAddress {
  const names = deriveName(sessionUser);
  const billing = customer.billing || {};

  return {
    first_name: value(billing.first_name) || names.firstName,
    last_name: value(billing.last_name) || names.lastName,
    company: value(billing.company),
    address_1: value(billing.address_1),
    address_2: value(billing.address_2),
    city: value(billing.city),
    state: value(billing.state),
    postcode: value(billing.postcode),
    country: withCountry(billing.country),
    email: value(billing.email) || value(sessionUser.email),
    phone: value(billing.phone) || value(sessionUser.phone),
  };
}

export function mapWooCustomerToStoreApiShippingAddress(
  customer: WooCustomer,
  sessionUser: Pick<SessionUser, 'firstName' | 'lastName' | 'name'>,
): CheckoutShippingAddress {
  const names = deriveName(sessionUser);
  const shipping = customer.shipping || {};

  return {
    first_name: value(shipping.first_name) || names.firstName,
    last_name: value(shipping.last_name) || names.lastName,
    company: value(shipping.company),
    address_1: value(shipping.address_1),
    address_2: value(shipping.address_2),
    city: value(shipping.city),
    state: value(shipping.state),
    postcode: value(shipping.postcode),
    country: withCountry(shipping.country),
  };
}

export function mapProfileUpdateToWooCustomerInput(
  input: ProfileUpdateSchema,
  customer: WooCustomer,
  email: string,
) {
  return {
    first_name: input.firstName,
    last_name: input.lastName,
    billing: {
      ...customer.billing,
      first_name: input.firstName,
      last_name: input.lastName,
      email,
      phone: input.phone || '',
    },
    shipping: {
      ...customer.shipping,
      first_name: input.firstName,
      last_name: input.lastName,
    },
  };
}
