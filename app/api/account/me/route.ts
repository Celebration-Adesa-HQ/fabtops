import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerAuthSession } from '@/lib/auth/session';
import { profileUpdateSchema } from '@/lib/schemas';
import { prisma } from '@/lib/db/prisma';
import { getCustomer, updateCustomer } from '@/lib/woocommerce/customers';

function getWooCustomerId(session: Awaited<ReturnType<typeof getServerAuthSession>>) {
  const wooCustomerId = session?.user.wooCustomerId || null;
  if (!wooCustomerId) {
    return null;
  }

  return wooCustomerId;
}

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  try {
    const wooCustomerId = getWooCustomerId(session);
    if (!wooCustomerId) {
      return NextResponse.json({ success: false, error: 'ACCOUNT_NOT_SYNCED' }, { status: 409 });
    }

    const customer = await getCustomer(wooCustomerId);
    const user = {
      id: session.user.id,
      firstName: session.user.firstName || customer.first_name,
      lastName: session.user.lastName || customer.last_name,
      email: session.user.email,
      phone: session.user.phone || customer.billing?.phone || '',
    };

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'SESSION_EXPIRED' },
      { status: 401 },
    );
  }
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

  try {
    const wooCustomerId = getWooCustomerId(session);
    if (!wooCustomerId) {
      return NextResponse.json({ success: false, error: 'ACCOUNT_NOT_SYNCED' }, { status: 409 });
    }

    const { firstName, lastName, phone } = parsed.data;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        phone: phone || '',
      },
    });

    const customer = await updateCustomer(wooCustomerId, {
      first_name: firstName,
      last_name: lastName,
      billing: {
        phone,
      },
    });

    const user = {
      id: session.user.id,
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: session.user.email,
      phone: customer.billing?.phone || '',
    };

    return NextResponse.json({ success: true, data: user, message: 'Profile updated' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to update profile' },
      { status: 400 },
    );
  }
}
