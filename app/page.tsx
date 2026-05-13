import { Hero } from '@/components/editorial/Hero';
import { ProductCard } from '@/components/editorial/ProductCard';
import { getProducts } from '@/lib/shopify';

export default async function HomePage() {
  const products = await getProducts({ first: 3 });

  return (
    <div className="bg-brand-secondary">
      <Hero />
      
      <section className="luxury-padding max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-brand-dark/40">
              Curated Selection
            </span>
            <h2 className="font-heading text-4xl md:text-6xl uppercase tracking-tighter text-brand-dark">
              The Statement Pieces
            </h2>
          </div>
          <p className="text-brand-dark/60 max-w-xs text-sm leading-relaxed uppercase tracking-widest text-[11px]">
            Discover our most coveted designs, blending traditional craft with contemporary silhouettes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {products.map((product: any) => (
            <ProductCard
              key={product.id}
              id={product.id}
              handle={product.handle}
              title={product.title}
              price={`₦${parseFloat(product.priceRange.minVariantPrice.amount).toLocaleString()}`}
              image={product.images.edges[0]?.node.url}
              secondaryImage={product.images.edges[1]?.node.url}
              variantId={product.variants.edges[0]?.node.id}
              swatches={product.options.find((opt: any) => opt.name.toLowerCase() === 'color')?.values}
            />
          ))}
        </div>
      </section>

      <section className="bg-brand-dark text-brand-light py-40 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-12">
          <span className="text-[11px] uppercase tracking-[0.5em] font-bold opacity-40">The Philosophy</span>
          <h2 className="font-heading text-4xl md:text-6xl uppercase tracking-tight leading-tight">
            "Confidence is the ultimate accessory. We just provide the canvas."
          </h2>
          <div className="w-12 h-px bg-brand-light/20 mx-auto" />
        </div>
      </section>
    </div>
  );
}
