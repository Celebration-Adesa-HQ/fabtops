import { getProductByHandle, getProducts } from '@/lib/shopify';
import { ProductView } from '@/components/product/ProductView';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

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
    getProductByHandle(handle),
    getProducts({ first: 10 })
  ]);

  if (!product) {
    notFound();
  }

  // Filter out current product and take first 4 for recommendations
  const relatedProducts = allProducts
    .filter((p: any) => p.handle !== handle)
    .slice(0, 4);

  return (
    <ProductView 
      product={product} 
      relatedProducts={relatedProducts} 
    />
  );
}
