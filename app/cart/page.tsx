import CartPageClient from './CartPageClient';

export const metadata = {
  title: 'Your Cart',
  description: 'Review your selected items before checkout.',
};

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  return <CartPageClient />;
}
