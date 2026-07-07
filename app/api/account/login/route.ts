import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { loginSchema } from '@/lib/schemas';
import { applyAuthCookies } from '@/lib/auth/session';
import { getCustomerByEmail } from '@/lib/woocommerce/customers';

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid login details' }, { status: 400 });
  }

  try {
    const customer = await getCustomerByEmail(parsed.data.email);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'No customer found for that email address.' }, { status: 401 });
    }

    const session = {
      user: {
        id: String(customer.id),
        email: customer.email,
        name: `${customer.first_name} ${customer.last_name}`.trim(),
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.billing?.phone || '',
      },
    };
    const response = NextResponse.json({ success: true, data: session, message: 'Signed in' });
    return applyAuthCookies(response, session);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Login failed' },
      { status: 500 },
    );
  }
}
