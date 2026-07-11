import { ProductStructuredData } from '@/components/seo/StructuredData';
import { ProductView } from '@/components/editorial/ProductView';
import { getServerAuthSession } from '@/lib/auth/session';
import { getProductBySlug, getRelatedProductsForProduct } from '@/lib/woocommerce/products';
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
    description: product.shortDescription || product.description,
    openGraph: {
      images: [product.featuredImage?.url],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductBySlug(handle);

  if (!product) notFound();

  const session = await getServerAuthSession();

  const [relatedProducts, reviews, ownedReview] = await Promise.all([
    getRelatedProductsForProduct(product),
    listProductReviews(product.id, {
      orderby: 'date',
      order: 'desc',
      per_page: 6,
    }),
    session?.user?.email ? getCustomerProductReview(product.id, session.user.email) : Promise.resolve(null),
  ]);

  return (
    <>
      <ProductStructuredData product={product} />
      <ProductView
        product={product}
        reviews={reviews}
        relatedProducts={relatedProducts}
        currentUser={session?.user || null}
        ownedReview={ownedReview}
      />
    </>
  );
}
