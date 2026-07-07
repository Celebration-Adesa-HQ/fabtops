import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { registerSchema } from '@/lib/schemas';
import { applyAuthCookies } from '@/lib/auth/session';
import { createCustomer } from '@/lib/woocommerce/customers';

export async function POST(request: NextRequest) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid registration details' }, { status: 400 });
  }

  try {
    const customer = await createCustomer({
      email: parsed.data.email,
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      username: parsed.data.email.split('@')[0],
      password: parsed.data.password,
    });
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
    const response = NextResponse.json({ success: true, data: session, message: 'Account created' });
    return applyAuthCookies(response, session);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 400 },
    );
  }
}
