import { redirect } from 'next/navigation';
import { getServerAuthSession } from '@/lib/auth/session';
import CartPageClient from './CartPageClient';

export const metadata = {
  title: 'Your Cart',
  description: 'Review your selected items before checkout.',
};

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/login?redirect=/cart');
  }

  return <CartPageClient />;
}
