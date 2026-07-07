import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerAuthSession } from '@/lib/auth/session';
import { wishlistActionSchema } from '@/lib/schemas';
import { getCustomer, updateCustomer } from '@/lib/woocommerce/customers';

async function requireSession() {
  const session = await getServerAuthSession();
  if (!session) {
    return null;
  }
  return session;
}

function parseWishlist(customer: { meta_data?: Array<{ key: string; value: unknown }> }) {
  const wishlistMeta = customer.meta_data?.find((entry) => entry.key === 'fabtops_wishlist');
  if (!wishlistMeta) return [];

  if (Array.isArray(wishlistMeta.value)) {
    return wishlistMeta.value;
  }

  if (typeof wishlistMeta.value === 'string') {
    try {
      const parsed = JSON.parse(wishlistMeta.value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  const customer = await getCustomer(session.user.id);
  return NextResponse.json({ success: true, data: parseWishlist(customer) });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  const parsed = wishlistActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid wishlist payload' }, { status: 400 });
  }

  const customer = await getCustomer(session.user.id);
  const current = parseWishlist(customer);

  const nextWishlist =
    parsed.data.action === 'add'
      ? [...current.filter((item) => item.id !== parsed.data.product.id), parsed.data.product]
      : current.filter((item) => item.id !== parsed.data.product.id);

  const updated = await updateCustomer(session.user.id, {
    meta_data: [
      {
        key: 'fabtops_wishlist',
        value: JSON.stringify(nextWishlist),
      },
    ],
  });

  return NextResponse.json({
    success: true,
    data: parseWishlist(updated),
    message: 'Wishlist updated',
  });
}
