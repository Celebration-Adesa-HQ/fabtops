import { Hero } from '@/components/editorial/Hero';
import { ProductCard } from '@/components/editorial/ProductCard';
import { getProducts } from '@/lib/shopify';
import Image from 'next/image';
import Link from 'next/link';

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

      {/* Membership Teaser */}
      <section className="py-32 px-6 md:px-12 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto bg-brand-secondary/40 backdrop-blur-3xl rounded-[4rem] p-12 md:p-24 border border-brand-dark/5 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-dark text-white text-[9px] uppercase tracking-widest font-black rounded-full">
              Exclusive Community
            </div>
            <h2 className="text-5xl md:text-7xl font-heading text-brand-dark uppercase tracking-tighter leading-none">
              The <span className="italic opacity-60">Circle</span>
            </h2>
            <p className="text-brand-dark/60 text-sm md:text-base leading-relaxed uppercase tracking-widest font-bold max-w-md">
              Join the Fab Babe Circle for early access to drops, private styling vaults, and exclusive brand experiences.
            </p>
            <Link 
              href="/circle"
              className="inline-flex items-center gap-6 text-[11px] uppercase tracking-[0.4em] font-black text-brand-dark hover:text-brand-primary transition-all group"
            >
              Explore Benefits <div className="w-12 h-px bg-brand-dark group-hover:bg-brand-primary group-hover:w-16 transition-all" />
            </Link>
          </div>
          <div className="flex-1 relative aspect-[4/5] w-full rounded-[3rem] overflow-hidden shadow-2xl">
            <Image 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200"
              alt="Fab Babe Circle"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-brand-dark/10 backdrop-blur-[2px]" />
          </div>
        </div>
      </section>
    </div>
  );
}
