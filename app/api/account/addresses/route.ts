import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { accountAddressesSchema } from '@/lib/schemas';
import { getServerAuthSession } from '@/lib/auth/session';
import { ensureWooCustomerLink } from '@/lib/auth/woo-customer';
import { getScopedCartToken } from '@/lib/woocommerce/cart-session';
import {
  mapAccountAddressToWooAddress,
  mapWooCustomerToAccountAddresses,
  mapWooCustomerToStoreApiBillingAddress,
  mapWooCustomerToStoreApiShippingAddress,
} from '@/lib/woocommerce/customer-mappers';
import { updateCartCustomer } from '@/lib/woocommerce/cart';
import { updateCustomer } from '@/lib/woocommerce/customers';

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  try {
    const linkedCustomer = await ensureWooCustomerLink(session.user);
    const data = mapWooCustomerToAccountAddresses(linkedCustomer.customer);
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
    const linkedCustomer = await ensureWooCustomerLink(session.user);
    const customer = await updateCustomer(linkedCustomer.wooCustomerId, {
      billing: mapAccountAddressToWooAddress(parsed.data.billing),
      shipping: mapAccountAddressToWooAddress(parsed.data.shipping),
    });
    const cookieStore = await cookies();
    const { cartToken } = getScopedCartToken(cookieStore, session.user);

    if (cartToken) {
      const billingAddress = mapWooCustomerToStoreApiBillingAddress(customer, session.user);
      const shippingAddress = mapWooCustomerToStoreApiShippingAddress(customer, session.user);
      await updateCartCustomer(cartToken, billingAddress, shippingAddress, null).catch(() => null);
    }

    const data = mapWooCustomerToAccountAddresses(customer);

    return NextResponse.json({ success: true, data, message: 'Addresses updated' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to update addresses' },
      { status: 400 },
    );
  }
}
