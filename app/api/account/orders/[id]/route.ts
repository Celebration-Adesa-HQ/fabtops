import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ensureWooCustomerLink } from '@/lib/auth/woo-customer';
import { getServerAuthSession } from '@/lib/auth/session';
import { getCustomerOrder } from '@/lib/woocommerce/orders';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  try {
    const linkedCustomer = await ensureWooCustomerLink(session.user);
    const { id } = await params;
    const order = await getCustomerOrder(id);

    if (!order || order.customer_id !== Number(linkedCustomer.wooCustomerId)) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const items = order.line_items.map((item) => ({
      id: String(item.id),
      name: item.name,
      quantity: item.quantity,
      total: item.total,
      image: item.image?.src || null,
    }));

    const trackingUrl = (order as any).meta_data?.find((meta: any) => meta.key === '_tracking_link')?.value || '';

    const mapped = {
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

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Order not found' },
      { status: 404 },
    );
  }
}
