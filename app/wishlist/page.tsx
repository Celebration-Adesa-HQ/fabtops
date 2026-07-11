import WishlistPageClient from './WishlistPageClient';

export const metadata = {
  title: 'Your Wishlist',
  description: 'Your saved FabTops pieces, secured inside your private account.',
};

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  return <WishlistPageClient />;
}
