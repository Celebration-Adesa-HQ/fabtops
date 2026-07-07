import { AccountUnavailable } from '@/components/account/AccountUnavailable';

export const metadata = {
  title: 'Your Wishlist',
  description: 'Wishlist access is temporarily unavailable while FabTops standardizes on WooCommerce APIs.',
};

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  return <AccountUnavailable />;
}
