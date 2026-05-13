import { Hero } from '@/components/editorial/Hero';
import { ProductCard } from '@/components/editorial/ProductCard';

export default function HomePage() {
  return (
    <div className="bg-brand-light">
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
          <p className="text-brand-dark/60 max-w-xs text-sm leading-relaxed">
            Discover our most coveted designs, blending traditional craft with contemporary silhouettes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          <ProductCard
            handle="silk-draped-set"
            title="Silk Draped Set"
            price="₦125,000"
            image="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop"
            secondaryImage="https://images.unsplash.com/photo-1539109132382-381bb3f1c2b3?q=80&w=1920&auto=format&fit=crop"
          />
          <ProductCard
            handle="velvet-midi-dress"
            title="Velvet Midi Dress"
            price="₦95,000"
            image="https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1920&auto=format&fit=crop"
            secondaryImage="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1920&auto=format&fit=crop"
          />
          <ProductCard
            handle="asymmetric-top"
            title="Asymmetric Top"
            price="₦45,000"
            image="https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=1920&auto=format&fit=crop"
            secondaryImage="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1920&auto=format&fit=crop"
          />
        </div>
      </section>

      <section className="bg-brand-dark text-brand-light py-32 px-6 text-center">
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
