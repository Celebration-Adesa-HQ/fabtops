import { buildProductBreadcrumbs } from '@/components/editorial/product/pdp-model';
import { BreadcrumbStructuredData, ProductStructuredData } from '@/components/seo/StructuredData';
import { ProductView } from '@/components/editorial/ProductView';
import { absoluteUrl } from '@/lib/site';
import { getServerAuthSession } from '@/lib/auth/session';
import { generateFallbackProductFromSlug, isWooUnreachableError } from '@/lib/woocommerce/fallback-data';
import { getEditorialRecommendationsForProduct, getProductBySlug } from '@/lib/woocommerce/products';
import { getCustomerProductReview, listProductReviews } from '@/lib/woocommerce/reviews';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{
    handle: string;
  }>;
}

/**
 * Resolve a product by slug — if the WooCommerce API is unreachable, return a
 * generated fallback product so the PDP renders instead of 404-ing.
 * Returns { product, isFallback } so callers can surface an offline notice.
 */
async function resolveProduct(handle: string) {
  try {
    const product = await getProductBySlug(handle);
    // getProductBySlug already returns fallback data on unreachable errors,
    // but in case a future refactor makes it throw, we also catch here.
    return { product, isFallback: false };
  } catch (error) {
    if (isWooUnreachableError(error)) {
      console.warn(
        `[fabtops] WooCommerce unreachable resolving PDP (${handle}). Serving generated fallback product.`,
        error instanceof Error ? error.message : error,
      );
      return { product: generateFallbackProductFromSlug(handle), isFallback: true };
    }
    throw error;
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { handle } = await params;
  const { product } = await resolveProduct(handle);

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
  const { product, isFallback } = await resolveProduct(handle);

  // Only hard-404 on genuine nulls (e.g. WooCommerce returned an empty result,
  // not a network failure). Connectivity errors surface fallback content instead.
  if (!product) notFound();

  const session = await getServerAuthSession();

  const [recommendations, reviews, ownedReview] = await Promise.all([
    getEditorialRecommendationsForProduct(product),
    listProductReviews(product.id, {
      orderby: 'date',
      order: 'desc',
      per_page: 6,
    }),
    session?.user?.email
      ? getCustomerProductReview(product.id, session.user.email)
      : Promise.resolve(null),
  ]);

  return (
    <>
      <BreadcrumbStructuredData items={buildProductBreadcrumbs(product)} />
      <ProductStructuredData product={product} />
      {isFallback && (
        <div
          role="status"
          aria-live="polite"
          style={{
            background: '#F9EBE8',
            borderBottom: '1px solid #F8ACAE',
            color: '#3B3B44',
            fontSize: '0.825rem',
            fontFamily: 'inherit',
            letterSpacing: '0.04em',
            padding: '10px 20px',
            textAlign: 'center',
          }}
        >
          ✦ Our store is temporarily offline — product details shown are representative. Prices and
          availability will update once we&apos;re back.
        </div>
      )}
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
