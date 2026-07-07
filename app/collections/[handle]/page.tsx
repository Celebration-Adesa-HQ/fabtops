import { getProductsByCategorySlug } from '@/lib/woocommerce/products';
import { getStorefrontFilters } from '@/lib/woocommerce/storefront';
import { ShopContent } from '@/components/editorial/ShopContent';
import { notFound } from 'next/navigation';

// Collection metadata & hero images
const collectionMeta: Record<string, { subtitle: string; heroImage?: string }> = {
  tops: {
    subtitle: 'Signature Silhouettes',
    heroImage: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?q=80&w=2000&auto=format&fit=crop',
  },
  sets: {
    subtitle: 'Coordinated Elegance',
    heroImage: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=2000&auto=format&fit=crop',
  },
  dresses: {
    subtitle: 'Statement Pieces',
    heroImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2000&auto=format&fit=crop',
  },
  accessories: {
    subtitle: 'Luxe Finishing Touches',
    heroImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=2000&auto=format&fit=crop',
  },
  archive: {
    subtitle: 'Heritage Vault',
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop',
  },
  'new-arrivals': {
    subtitle: 'Just Dropped',
    heroImage: 'https://images.unsplash.com/photo-1590736962031-6ec32a39a2d8?q=80&w=2000&auto=format&fit=crop',
  },
};

interface CollectionPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { handle } = await params;
  const collectionName = handle
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return {
    title: `${collectionName} Collection | FabTops Digital Flagship`,
    description: `Explore the ${collectionName} collection at FabTops. Curated silhouettes designed for the contemporary woman who lives with intention.`,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { handle } = await params;
  
  // Build collection title
  const collectionName = handle
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const [products, filters] = await Promise.all([
    getProductsByCategorySlug(handle, 50),
    getStorefrontFilters(handle),
  ]);
  if (!products) notFound();

  // Get collection-specific metadata
  const meta = collectionMeta[handle] || { subtitle: 'Curated Collection' };

  return (
    <main className="bg-brand-secondary min-h-screen">
      <ShopContent 
        products={products} 
        filters={filters}
        title={collectionName}
        subtitle={meta.subtitle}
        heroImage={meta.heroImage}
        isCollection={true}
      />
    </main>
  );
}
