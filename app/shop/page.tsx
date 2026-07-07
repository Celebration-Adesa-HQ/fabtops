import { getProducts } from '@/lib/woocommerce/products';
import { ShopContent } from '@/components/editorial/ShopContent';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop All | FabTops Digital Flagship',
  description: 'Explore our curated silhouettes, designed for the contemporary woman. From ready-to-wear sets to heritage archive pieces.',
};

export default async function ShopPage() {
  const products = await getProducts(50);

  return <ShopContent products={products} />;
}
