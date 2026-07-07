import WishlistPageClient from './WishlistPageClient';

export const metadata = {
  title: 'Your Wishlist',
  description: 'Your saved FabTops pieces, synced to your customer session.',
};

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  return <WishlistPageClient />;
}
