import { ShopContent } from '@/components/editorial/ShopContent';
import { getEditorialImage, type EditorialPlacementId } from '@/lib/content/editorial-images';
import { loadCatalogPageData } from '@/lib/woocommerce/catalog';
import { notFound, redirect } from 'next/navigation';

const collectionMeta: Record<string, { subtitle: string; heroPlacementId?: EditorialPlacementId }> = {
  tops: {
    subtitle: 'Signature Silhouettes',
    heroPlacementId: 'collections.hero.tops',
  },
  sets: {
    subtitle: 'Coordinated Elegance',
    heroPlacementId: 'collections.hero.sets',
  },
  dresses: {
    subtitle: 'Statement Pieces',
    heroPlacementId: 'collections.hero.dresses',
  },
  accessories: {
    subtitle: 'Luxe Finishing Touches',
    heroPlacementId: 'collections.hero.accessories',
  },
  archive: {
    subtitle: 'Heritage Vault',
    heroPlacementId: 'collections.hero.archive',
  },
  'new-arrivals': {
    subtitle: 'Just Dropped',
    heroPlacementId: 'collections.hero.new-arrivals',
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
    const heroImage = meta.heroPlacementId ? getEditorialImage(meta.heroPlacementId) : null;

    return (
      <main className="min-h-screen bg-brand-secondary">
        <ShopContent
          result={data.result}
          filters={data.filters}
          query={data.query}
          basePath={`/collections/${handle}`}
          title={collectionName}
          subtitle={meta.subtitle}
          heroImage={heroImage?.src}
          heroImageAlt={heroImage?.alt}
          heroImageObjectPosition={heroImage?.objectPosition}
          isCollection
        />
      </main>
    );
  } catch (error) {
    const heroImage = collectionMeta[handle]?.heroPlacementId
      ? getEditorialImage(collectionMeta[handle].heroPlacementId as EditorialPlacementId)
      : null;

    return (
      <main className="min-h-screen bg-brand-secondary">
        <ShopContent
          query={{ page: 1, perPage: 24, search: '', orderby: 'date', order: 'desc', category: handle }}
          basePath={`/collections/${handle}`}
          title={collectionName}
          subtitle={collectionMeta[handle]?.subtitle || 'Curated Collection'}
          heroImage={heroImage?.src}
          heroImageAlt={heroImage?.alt}
          heroImageObjectPosition={heroImage?.objectPosition}
          isCollection
          errorMessage={error instanceof Error ? error.message : 'Unable to load this collection right now.'}
        />
      </main>
    );
  }
}
