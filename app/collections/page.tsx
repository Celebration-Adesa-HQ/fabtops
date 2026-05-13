import { getCollections } from '@/lib/shopify';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Collections | FabTops Digital Flagship',
  description: 'Explore the curated collections of FabTops. From signature silhouettes to seasonal drops, discover pieces that define modern elegance.',
};

const collectionGrid = [
  {
    handle: 'tops',
    title: 'Signature Tops',
    description: 'Elevated silhouettes for the modern, evolving woman.',
    image: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?q=80&w=1200&auto=format&fit=crop',
    span: 'md:col-span-2'
  },
  {
    handle: 'sets',
    title: 'Coordinated Sets',
    description: 'Effortless elegance in every pairing.',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1200&auto=format&fit=crop',
    span: 'md:col-span-1'
  },
  {
    handle: 'dresses',
    title: 'Heritage Dresses',
    description: 'Timeless pieces for your most memorable moments.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop',
    span: 'md:col-span-1'
  },
  {
    handle: 'accessories',
    title: 'Luxe Accents',
    description: 'The finishing touches to your FabTops vision.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop',
    span: 'md:col-span-2'
  }
];

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <main className="bg-brand-secondary min-h-screen pt-32 pb-40">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <header className="mb-24 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-brand-primary" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-primary">The Showroom</span>
          </div>
          <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl uppercase tracking-tighter text-brand-dark leading-[0.85]">
            Our <span className="italic opacity-50">Vault</span>
          </h1>
          <p className="text-brand-dark/60 text-sm md:text-base max-w-xl leading-relaxed uppercase tracking-widest text-[11px] font-bold">
            Explore our meticulously curated collections, where every piece tells a story of confidence, craftsmanship, and contemporary heritage.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {collectionGrid.map((collection, idx) => (
            <Link 
              key={collection.handle}
              href={`/collections/${collection.handle}`}
              className={`group relative overflow-hidden bg-white ${collection.span} aspect-[16/10] md:aspect-auto md:min-h-[600px]`}
            >
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-110"
                priority={idx < 2}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
              
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end text-white">
                <div className="space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                  <h2 className="font-heading text-4xl md:text-6xl uppercase tracking-tighter leading-none">
                    {collection.title}
                  </h2>
                  <p className="text-white/70 text-xs md:text-sm max-w-xs uppercase tracking-widest leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                    {collection.description}
                  </p>
                  <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold text-brand-primary group-hover:gap-6 transition-all duration-500 pt-4">
                    Explore Collection <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Brand Statement Section */}
        <section className="mt-40 py-40 border-t border-brand-dark/5 text-center">
          <div className="max-w-4xl mx-auto space-y-12">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-brand-primary">The Vision</span>
            <h3 className="font-heading text-4xl md:text-6xl lg:text-7xl uppercase tracking-tight text-brand-dark leading-[1.1]">
              "Designed for the woman who lives <br /> 
              <span className="italic text-brand-primary/60 font-light lowercase">with intention and style."</span>
            </h3>
            <div className="w-12 h-px bg-brand-dark/10 mx-auto" />
            <Link 
              href="/shop" 
              className="inline-block px-12 py-5 bg-brand-dark text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-brand-primary transition-all duration-500 shadow-2xl shadow-brand-dark/10"
            >
              Shop All Silhouettes
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
