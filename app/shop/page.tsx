import { ShopContent } from '@/components/editorial/ShopContent';
import { loadCatalogPageData } from '@/lib/woocommerce/catalog';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop All | FabTops Digital Flagship',
  description: 'Explore our curated silhouettes, designed for the contemporary woman. From ready-to-wear sets to heritage archive pieces.',
};

interface ShopPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await searchParams;

  try {
    const data = await loadCatalogPageData(resolvedSearchParams || {}, {
      basePath: '/shop',
      sizeAttributeTaxonomy: 'pa_size',
    });

    if (!data) {
      return <ShopContent query={{ page: 1, perPage: 24, search: '', orderby: 'date', order: 'desc' }} basePath="/shop" errorMessage="The shop catalogue is currently unavailable." />;
    }

    if (data.redirectPath && data.redirectPath !== '/shop') {
      redirect(data.redirectPath);
    }

    return (
      <ShopContent
        result={data.result}
        filters={data.filters}
        query={data.query}
        basePath="/shop"
      />
    );
  } catch (error) {
    return (
      <ShopContent
        query={{ page: 1, perPage: 24, search: '', orderby: 'date', order: 'desc' }}
        basePath="/shop"
        errorMessage={error instanceof Error ? error.message : 'Unable to load the shop catalogue.'}
      />
    );
  }
}
