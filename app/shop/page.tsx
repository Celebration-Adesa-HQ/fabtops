import { getProducts } from '@/lib/woocommerce/products';
import { getStorefrontFilters } from '@/lib/woocommerce/storefront';
import { ShopContent } from '@/components/editorial/ShopContent';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop All | FabTops Digital Flagship',
  description: 'Explore our curated silhouettes, designed for the contemporary woman. From ready-to-wear sets to heritage archive pieces.',
};

export default async function ShopPage() {
  const [products, filters] = await Promise.all([
    getProducts(50),
    getStorefrontFilters(),
  ]);

  return <ShopContent products={products} filters={filters} />;
}
