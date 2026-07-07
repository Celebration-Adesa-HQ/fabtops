import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerAuthSession } from '@/lib/auth/session';
import { getCustomer, updateCustomer } from '@/lib/woocommerce/customers';
import { profileUpdateSchema } from '@/lib/schemas';

function mapProfile(customer: Awaited<ReturnType<typeof getCustomer>>) {
  return {
    id: String(customer.id),
    firstName: customer.first_name,
    lastName: customer.last_name,
    email: customer.email,
    phone: customer.billing?.phone || '',
  };
}

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  const customer = await getCustomer(session.user.id);
  return NextResponse.json({ success: true, data: mapProfile(customer) });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  const parsed = profileUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid profile update' }, { status: 400 });
  }

  const updated = await updateCustomer(session.user.id, {
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    billing: {
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      phone: parsed.data.phone || '',
    },
    shipping: {
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
    },
  });

  return NextResponse.json({ success: true, data: mapProfile(updated), message: 'Profile updated' });
}
