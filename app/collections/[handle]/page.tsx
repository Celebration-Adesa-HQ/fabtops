import { ShopContent } from '@/components/editorial/ShopContent';
import { loadCatalogPageData } from '@/lib/woocommerce/catalog';
import { notFound, redirect } from 'next/navigation';

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
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { handle } = await params;
  const collectionName = handle
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${collectionName} Collection | FabTops Digital Flagship`,
    description: `Explore the ${collectionName} collection at FabTops. Curated silhouettes designed for the contemporary woman who lives with intention.`,
  };
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { handle } = await params;
  const resolvedSearchParams = await searchParams;
  const collectionName = handle
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  try {
    const data = await loadCatalogPageData(resolvedSearchParams || {}, {
      basePath: `/collections/${handle}`,
      fixedCategorySlug: handle,
      sizeAttributeTaxonomy: 'pa_size',
    });

    if (!data) notFound();
    if (data.redirectPath && data.redirectPath !== `/collections/${handle}`) {
      redirect(data.redirectPath);
    }

    const meta = collectionMeta[handle] || { subtitle: 'Curated Collection' };

    return (
      <main className="min-h-screen bg-brand-secondary">
        <ShopContent
          result={data.result}
          filters={data.filters}
          query={data.query}
          basePath={`/collections/${handle}`}
          title={collectionName}
          subtitle={meta.subtitle}
          heroImage={meta.heroImage}
          isCollection
        />
      </main>
    );
  } catch (error) {
    return (
      <main className="min-h-screen bg-brand-secondary">
        <ShopContent
          query={{ page: 1, perPage: 24, search: '', orderby: 'date', order: 'desc', category: handle }}
          basePath={`/collections/${handle}`}
          title={collectionName}
          subtitle={collectionMeta[handle]?.subtitle || 'Curated Collection'}
          heroImage={collectionMeta[handle]?.heroImage}
          isCollection
          errorMessage={error instanceof Error ? error.message : 'Unable to load this collection right now.'}
        />
      </main>
    );
  }
}
