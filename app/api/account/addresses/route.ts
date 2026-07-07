import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { accountAddressesSchema } from '@/lib/schemas';
import { getServerAuthSession } from '@/lib/auth/session';
import { getCustomer, updateCustomer } from '@/lib/woocommerce/customers';

function mapAddresses(customer: Awaited<ReturnType<typeof getCustomer>>) {
  return {
    billing: {
      firstName: customer.billing?.first_name || '',
      lastName: customer.billing?.last_name || '',
      company: customer.billing?.company || '',
      address1: customer.billing?.address_1 || '',
      address2: customer.billing?.address_2 || '',
      city: customer.billing?.city || '',
      state: customer.billing?.state || '',
      postcode: customer.billing?.postcode || '',
      country: customer.billing?.country || '',
      email: customer.billing?.email || customer.email,
      phone: customer.billing?.phone || '',
    },
    shipping: {
      firstName: customer.shipping?.first_name || '',
      lastName: customer.shipping?.last_name || '',
      company: customer.shipping?.company || '',
      address1: customer.shipping?.address_1 || '',
      address2: customer.shipping?.address_2 || '',
      city: customer.shipping?.city || '',
      state: customer.shipping?.state || '',
      postcode: customer.shipping?.postcode || '',
      country: customer.shipping?.country || '',
    },
  };
}

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  const customer = await getCustomer(session.user.id);
  return NextResponse.json({ success: true, data: mapAddresses(customer) });
}

export async function PUT(request: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  const parsed = accountAddressesSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid address payload' }, { status: 400 });
  }

  const updated = await updateCustomer(session.user.id, {
    billing: {
      first_name: parsed.data.billing.firstName,
      last_name: parsed.data.billing.lastName,
      company: parsed.data.billing.company,
      address_1: parsed.data.billing.address1,
      address_2: parsed.data.billing.address2,
      city: parsed.data.billing.city,
      state: parsed.data.billing.state,
      postcode: parsed.data.billing.postcode,
      country: parsed.data.billing.country,
      email: parsed.data.billing.email,
      phone: parsed.data.billing.phone,
    },
    shipping: {
      first_name: parsed.data.shipping.firstName,
      last_name: parsed.data.shipping.lastName,
      company: parsed.data.shipping.company,
      address_1: parsed.data.shipping.address1,
      address_2: parsed.data.shipping.address2,
      city: parsed.data.shipping.city,
      state: parsed.data.shipping.state,
      postcode: parsed.data.shipping.postcode,
      country: parsed.data.shipping.country,
    },
  });

  return NextResponse.json({ success: true, data: mapAddresses(updated), message: 'Addresses updated' });
}
