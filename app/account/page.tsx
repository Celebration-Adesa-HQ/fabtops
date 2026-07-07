import { redirect } from 'next/navigation';
import { getServerAuthSession } from '@/lib/auth/session';
import { getCustomer } from '@/lib/woocommerce/customers';
import { getCustomerOrders } from '@/lib/woocommerce/orders';
import { AccountPageClient } from '@/components/account/AccountPageClient';

export default async function AccountPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/login?redirect=/account');
  }

  const [customer, orders] = await Promise.all([
    getCustomer(session.user.id),
    getCustomerOrders(session.user.id),
  ]);

  return (
    <AccountPageClient
      profile={{
        id: String(customer.id),
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.billing?.phone || '',
      }}
      orders={orders.map((order) => ({
        id: String(order.id),
        number: order.number,
        status: order.status,
        dateCreated: order.date_created_gmt || null,
        total: {
          amount: order.total,
          currencyCode: order.currency,
        },
      }))}
    />
  );
}
