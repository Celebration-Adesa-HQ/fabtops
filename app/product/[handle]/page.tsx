import { buildProductBreadcrumbs } from '@/components/editorial/product/pdp-model';
import { BreadcrumbStructuredData, ProductStructuredData } from '@/components/seo/StructuredData';
import { ProductView } from '@/components/editorial/ProductView';
import { absoluteUrl } from '@/lib/site';
import { getServerAuthSession } from '@/lib/auth/session';
import { getEditorialRecommendationsForProduct, getProductBySlug } from '@/lib/woocommerce/products';
import { getCustomerProductReview, listProductReviews } from '@/lib/woocommerce/reviews';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductBySlug(handle);

  if (!product) {
    return {
      title: 'Product Not Found | FabTops',
    };
  }

  return {
    title: `${product.title} | FabTops Digital Flagship`,
    description: product.shortDescription || product.description || `Shop ${product.title} at FabTops.`,
    alternates: {
      canonical: absoluteUrl(`/product/${product.handle}`),
    },
    openGraph: {
      type: 'website',
      url: absoluteUrl(`/product/${product.handle}`),
      title: `${product.title} | FabTops`,
      description: product.shortDescription || product.description,
      images: product.featuredImage?.url ? [{
        url: product.featuredImage.url,
        alt: product.featuredImage.altText || product.title,
      }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | FabTops`,
      description: product.shortDescription || product.description,
      images: product.featuredImage?.url ? [product.featuredImage.url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductBySlug(handle);

  if (!product) notFound();

  const session = await getServerAuthSession();

  const [recommendations, reviews, ownedReview] = await Promise.all([
    getEditorialRecommendationsForProduct(product),
    listProductReviews(product.id, {
      orderby: 'date',
      order: 'desc',
      per_page: 6,
    }),
    session?.user?.email ? getCustomerProductReview(product.id, session.user.email) : Promise.resolve(null),
  ]);

  return (
    <>
      <BreadcrumbStructuredData items={buildProductBreadcrumbs(product)} />
      <ProductStructuredData product={product} />
      <ProductView
        product={product}
        reviews={reviews}
        recommendations={recommendations}
        currentUser={session?.user || null}
        ownedReview={ownedReview}
      />
    </>
  );
}
