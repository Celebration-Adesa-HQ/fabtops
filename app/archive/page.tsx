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
    <div className="bg-white min-h-screen">
      {/* Archive Header */}
      <section className="pt-40 pb-24 px-6 md:px-12 text-center">
        <ScrollReveal>
          <span className="text-xs uppercase tracking-[0.5em] text-pink-600 font-bold mb-8 block">The Vault</span>
          <h1 className="text-5xl md:text-8xl font-serif-logo text-black mb-12 uppercase tracking-tighter">
            The <br /> <span className="italic text-pink-600">Archive</span>
          </h1>
          <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto leading-relaxed mb-16">
            A curation of sold-out masterpieces. These pieces are currently unavailable for purchase, existing as a testament to our design legacy and your impeccable taste.
          </p>
          <div className="flex justify-center gap-12 text-[10px] uppercase tracking-[0.3em] font-black text-pink-600">
            <span>Sold Out</span>
            <span className="text-gray-300">|</span>
            <span>Historical Collection</span>
            <span className="text-gray-300">|</span>
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
                <div className="relative aspect-[3/4] overflow-hidden rounded-[2.5rem] bg-gray-50 border border-gray-100">
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    fill 
                    className="object-cover transition-transform duration-[2s] group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  
                  {/* Sold Out Badge */}
                  <div className="absolute top-8 right-8">
                    <div className="px-6 py-2 bg-white/90 backdrop-blur-md rounded-full border border-pink-100 flex items-center gap-3">
                      <Lock size={12} className="text-pink-600" />
                      <span className="text-[10px] uppercase tracking-widest font-black text-black">Sold Out</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 text-center px-4">
                  <p className="text-[10px] uppercase text-pink-400 tracking-[0.4em] mb-3 font-black">{item.collection}</p>
                  <h3 className="text-xl font-serif-logo uppercase tracking-widest text-black mb-4">{item.title}</h3>
                  <div className="w-8 h-[2px] bg-pink-100 mx-auto" />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Waitlist / Request CTA */}
      <section className="py-32 px-6 md:px-12 bg-pink-50/50 text-center">
        <ScrollReveal>
          <h2 className="text-4xl md:text-5xl font-serif-logo text-black mb-10 leading-tight">Missed a <span className="italic text-pink-600">Masterpiece?</span></h2>
          <p className="text-lg text-gray-500 font-light max-w-2xl mx-auto mb-12">
            While these pieces are sold out, we occasionally re-release iconic silhouettes in limited quantities. Join the notify list to be the first to know.
          </p>
          <Link href="/circle" className="inline-flex items-center gap-4 bg-pink-600 text-white px-12 py-6 rounded-full text-xs uppercase tracking-[0.3em] font-black hover:bg-black transition-all duration-500 shadow-xl shadow-pink-200 group">
            Join the Waitlist <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </ScrollReveal>
      </section>
    </div>
  );
}
