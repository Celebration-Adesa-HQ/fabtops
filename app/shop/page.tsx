import { getProducts } from '@/lib/shopify';
import { ShopContent } from '@/components/editorial/ShopContent';

export const metadata = {
  title: 'Shop All | FabTops Digital Flagship',
  description: 'Explore our curated silhouettes, designed for the contemporary woman. From ready-to-wear sets to heritage archive pieces.',
};

export default async function ShopPage() {
  const products = await getProducts({ first: 50 });

  return <ShopContent products={products} />;
}
