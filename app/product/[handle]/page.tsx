import { getProductBySlug, getProducts } from '@/lib/woocommerce/products';
import { getStoreProductReviews } from '@/lib/woocommerce/storefront';
import { ProductView } from '@/components/editorial/ProductView';
import { notFound } from 'next/navigation';
import { ProductStructuredData } from '@/components/seo/StructuredData';

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
    description: product.description,
    openGraph: {
      images: [product.images.edges[0]?.node.url],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  
  // Fetch product data and related products in parallel
  const [product, allProducts] = await Promise.all([
    getProductBySlug(handle),
    getProducts(10)
  ]);

  if (!product) {
    notFound();
  }

  // Filter out current product and take first 4 for recommendations
  const relatedProducts = allProducts
    .filter((p: any) => p.handle !== handle)
    .slice(0, 4);

  const reviews = await getStoreProductReviews({
    product_id: product.id,
    orderby: 'date',
    order: 'desc',
    per_page: 6,
  });

  return (
    <>
      <ProductStructuredData product={product} />
      <ProductView 
        product={product} 
        reviews={reviews}
        relatedProducts={relatedProducts} 
      />
    </>
  );
}
