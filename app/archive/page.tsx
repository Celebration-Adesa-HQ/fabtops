'use client';

import Image from 'next/image';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';

export default function ArchivePage() {
  const archiveItems = [
    { title: "The Heritage Set", collection: "Roots 2024", image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?q=80&w=800" },
    { title: "Bespoke Lace Gown", collection: "Private Drop", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800" },
    { title: "Aso Oke Corset", collection: "Origins", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800" },
    { title: "Floral Silk Wrap", collection: "Resort 24", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800" },
    { title: "Crimson Silk Set", collection: "Luxe 2024", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800" },
    { title: "Midnight Velvet", collection: "Winter Drop", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800" },
  ];

  return (
    <div className="bg-brand-secondary min-h-screen">
      {/* Archive Header */}
      <section className="pt-40 pb-24 px-6 md:px-12 text-center">
        <ScrollReveal>
          <span className="text-[11px] uppercase tracking-[0.5em] text-brand-dark font-black mb-8 block opacity-40">The Vault</span>
          <h1 className="text-5xl md:text-8xl font-heading text-brand-dark mb-12 uppercase tracking-tighter">
            The <br /> <span className="italic opacity-80">Archive</span>
          </h1>
          <p className="text-sm text-brand-dark/60 font-medium max-w-2xl mx-auto leading-relaxed mb-16 uppercase tracking-widest text-[11px]">
            A curation of sold-out masterpieces. These pieces are currently unavailable for purchase, existing as a testament to our design legacy and your impeccable taste.
          </p>
          <div className="flex justify-center gap-12 text-[10px] uppercase tracking-[0.3em] font-black text-brand-dark">
            <span>Sold Out</span>
            <span className="opacity-20">|</span>
            <span>Historical Collection</span>
            <span className="opacity-20">|</span>
            <span>Desirable Legacy</span>
          </div>
        </ScrollReveal>
      </section>

      {/* Archive Grid */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {archiveItems.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.1}>
              <div className="group flex flex-col grayscale hover:grayscale-0 transition-all duration-1000">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[3rem] bg-brand-dark/5 border border-brand-dark/5 shadow-2xl shadow-brand-dark/5">
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    fill 
                    className="object-cover transition-transform duration-[2s] group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-brand-dark/20 group-hover:bg-transparent transition-colors" />
                  
                  {/* Sold Out Badge */}
                  <div className="absolute top-8 right-8">
                    <div className="px-6 py-3 bg-white/90 backdrop-blur-md rounded-full border border-brand-dark/5 flex items-center gap-3">
                      <Lock size={12} className="text-brand-dark" />
                      <span className="text-[10px] uppercase tracking-widest font-black text-brand-dark">Sold Out</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 text-center px-4">
                  <p className="text-[10px] uppercase text-brand-dark/40 tracking-[0.4em] mb-3 font-black">{item.collection}</p>
                  <h3 className="text-xl font-heading uppercase tracking-widest text-brand-dark mb-4">{item.title}</h3>
                  <div className="w-8 h-[2px] bg-brand-dark/10 mx-auto" />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Waitlist / Request CTA */}
      <section className="py-32 px-6 md:px-12 bg-brand-light text-center">
        <ScrollReveal>
          <h2 className="text-4xl md:text-5xl font-heading text-brand-dark mb-10 leading-tight">Missed a <span className="italic opacity-80">Masterpiece?</span></h2>
          <p className="text-sm text-brand-dark/60 font-medium max-w-2xl mx-auto mb-12 uppercase tracking-widest text-[11px]">
            While these pieces are sold out, we occasionally re-release iconic silhouettes in limited quantities. Join the notify list to be the first to know.
          </p>
          <Link href="/circle" className="inline-flex items-center gap-4 bg-brand-dark text-white px-12 py-6 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-brand-primary transition-all duration-500 shadow-2xl shadow-brand-dark/20 group">
            Join the Waitlist <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </ScrollReveal>
      </section>
    </div>
  );
}
