import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth/session';
import { getCustomerOrders } from '@/lib/woocommerce/orders';

function mapOrder(order: Awaited<ReturnType<typeof getCustomerOrders>>[number]) {
  return {
    id: String(order.id),
    number: order.number,
    status: order.status,
    dateCreated: order.date_created_gmt || null,
    total: {
      amount: order.total,
      currencyCode: order.currency,
    },
    lineItems: order.line_items.map((item) => ({
      id: String(item.id),
      name: item.name,
      quantity: item.quantity,
      total: item.total,
      image: item.image?.src || null,
    })),
  };
}

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  const orders = await getCustomerOrders(session.user.id);
  return NextResponse.json({ success: true, data: orders.map(mapOrder) });
}
