import { cookies } from 'next/headers';
import { getServerAuthSession } from '@/lib/auth/session';
import { ensureWooCustomerLink } from '@/lib/auth/woo-customer';
import {
  mapWooCustomerToStoreApiBillingAddress,
  mapWooCustomerToStoreApiShippingAddress,
} from '@/lib/woocommerce/customer-mappers';
import { getCart } from '@/lib/woocommerce/cart';
import CheckoutPageClient from './CheckoutPageClient';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const session = await getServerAuthSession();
  const cookieStore = await cookies();
  const cartToken = cookieStore.get('woocommerce_cart_token')?.value || null;
  const initialCart = cartToken
    ? await getCart(cartToken, null).then((result) => result.cart).catch(() => null)
    : null;
  const linkedCustomer = session
    ? await ensureWooCustomerLink(session.user)
    : null;

  return (
    <CheckoutPageClient
      initialCart={initialCart}
      initialValues={{
        billing_address: linkedCustomer && session
          ? mapWooCustomerToStoreApiBillingAddress(linkedCustomer.customer, session.user)
          : {
              first_name: '',
              last_name: '',
              address_1: '',
              city: '',
              state: '',
              postcode: '',
              country: 'NG',
              email: session?.user.email || '',
              phone: '',
            },
        shipping_address: linkedCustomer && session
          ? mapWooCustomerToStoreApiShippingAddress(linkedCustomer.customer, session.user)
          : {
              first_name: '',
              last_name: '',
              address_1: '',
              city: '',
              state: '',
              postcode: '',
              country: 'NG',
            },
        payment_method: 'paystack',
        selected_currency: 'NGN',
        payment_data: [],
        customer_note: '',
      }}
    />
  );
}
