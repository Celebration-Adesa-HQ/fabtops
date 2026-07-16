import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerAuthSession } from '@/lib/auth/session';
import { ensureWooCustomerLink } from '@/lib/auth/woo-customer';
import { getScopedCartToken } from '@/lib/woocommerce/cart-session';
import {
  mapWooCustomerToStoreApiBillingAddress,
  mapWooCustomerToStoreApiShippingAddress,
} from '@/lib/woocommerce/customer-mappers';
import { getCart } from '@/lib/woocommerce/cart';
import CheckoutPageClient from './CheckoutPageClient';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect('/login?redirect=/checkout');
  }
  const cookieStore = await cookies();
  const { cartToken } = getScopedCartToken(cookieStore, session.user);
  const initialCart = cartToken
    ? await getCart(cartToken, null).then((result) => result.cart).catch(() => null)
    : null;
  const linkedCustomer = await ensureWooCustomerLink(session.user);

  return (
    <CheckoutPageClient
      initialCart={initialCart}
      initialValues={{
        billing_address: mapWooCustomerToStoreApiBillingAddress(linkedCustomer.customer, session.user),
        shipping_address: mapWooCustomerToStoreApiShippingAddress(linkedCustomer.customer, session.user),
        payment_method: 'paystack',
        selected_currency: 'NGN',
        payment_data: [],
        customer_note: '',
      }}
    />
  );
}
