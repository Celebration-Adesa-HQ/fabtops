import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerAuthSession } from '@/lib/auth/session';
import { getCustomerOrder } from '@/lib/woocommerce/orders';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  const { id } = await params;
  const order = await getCustomerOrder(id);
  if (String(order.customer_id) !== String(session.user.id)) {
    return NextResponse.json({ success: false, error: 'ORDER_NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
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
    },
  });
}
