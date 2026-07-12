import { redirect } from 'next/navigation';
import { getServerAuthSession } from '@/lib/auth/session';
import { ensureWooCustomerLink } from '@/lib/auth/woo-customer';
import {
  mapWooCustomerToStoreApiBillingAddress,
  mapWooCustomerToStoreApiShippingAddress,
} from '@/lib/woocommerce/customer-mappers';
import CheckoutPageClient from './CheckoutPageClient';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/login?redirect=/checkout');
  }

  const linkedCustomer = await ensureWooCustomerLink(session.user);

  return (
    <CheckoutPageClient
      initialValues={{
        billing_address: mapWooCustomerToStoreApiBillingAddress(linkedCustomer.customer, session.user),
        shipping_address: mapWooCustomerToStoreApiShippingAddress(linkedCustomer.customer, session.user),
        payment_method: 'paystack',
        payment_data: [],
        customer_note: '',
      }}
    />
  );
}
