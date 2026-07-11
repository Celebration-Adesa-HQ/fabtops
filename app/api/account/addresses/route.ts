import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { accountAddressesSchema } from '@/lib/schemas';
import { getServerAuthSession } from '@/lib/auth/session';
import { getCustomer, updateCustomer } from '@/lib/woocommerce/customers';

function mapFromWooAddress(addr: any) {
  return {
    firstName: addr?.first_name || '',
    lastName: addr?.last_name || '',
    company: addr?.company || '',
    address1: addr?.address_1 || '',
    address2: addr?.address_2 || '',
    city: addr?.city || '',
    state: addr?.state || '',
    postcode: addr?.postcode || '',
    country: addr?.country || '',
    email: addr?.email || '',
    phone: addr?.phone || '',
  };
}

function mapToWooAddress(addr: any) {
  return {
    first_name: addr.firstName,
    last_name: addr.lastName,
    company: addr.company,
    address_1: addr.address1,
    address_2: addr.address2,
    city: addr.city,
    state: addr.state,
    postcode: addr.postcode,
    country: addr.country,
    email: addr.email,
    phone: addr.phone,
  };
}

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  try {
    if (!session.user.wooCustomerId) {
      return NextResponse.json({ success: false, error: 'ACCOUNT_NOT_SYNCED' }, { status: 409 });
    }

    const customer = await getCustomer(session.user.wooCustomerId);
    const data = {
      billing: mapFromWooAddress(customer.billing),
      shipping: mapFromWooAddress(customer.shipping),
    };
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'SESSION_EXPIRED' },
      { status: 401 },
    );
  }
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

  try {
    if (!session.user.wooCustomerId) {
      return NextResponse.json({ success: false, error: 'ACCOUNT_NOT_SYNCED' }, { status: 409 });
    }

    const customer = await updateCustomer(session.user.wooCustomerId, {
      billing: mapToWooAddress(parsed.data.billing),
      shipping: mapToWooAddress(parsed.data.shipping),
    });

    const data = {
      billing: mapFromWooAddress(customer.billing),
      shipping: mapFromWooAddress(customer.shipping),
    };

    return NextResponse.json({ success: true, data, message: 'Addresses updated' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to update addresses' },
      { status: 400 },
    );
  }
}
