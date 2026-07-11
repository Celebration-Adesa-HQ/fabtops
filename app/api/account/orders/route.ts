import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth/session';
import { getCustomerOrders } from '@/lib/woocommerce/orders';

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  try {
    if (!session.user.wooCustomerId) {
      return NextResponse.json({ success: false, error: 'ACCOUNT_NOT_SYNCED' }, { status: 409 });
    }

    const orders = await getCustomerOrders(session.user.wooCustomerId);

    const mapped = orders.map((order) => {
      const items = order.line_items.map((item) => ({
        id: String(item.id),
        name: item.name,
        quantity: item.quantity,
        total: item.total,
        image: item.image?.src || null,
      }));

      const trackingUrl = (order as any).meta_data?.find((meta: any) => meta.key === '_tracking_link')?.value || '';

      return {
        id: String(order.id),
        number: order.number,
        status: order.status,
        key: (order as any).order_key || '',
        dateCreated: order.date_created_gmt ? new Date(order.date_created_gmt + 'Z').toISOString() : null,
        total: {
          amount: order.total,
          currencyCode: order.currency,
        },
        lineItems: items,
        trackingUrl,
      };
    });

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to fetch orders' },
      { status: 500 },
    );
  }
}
