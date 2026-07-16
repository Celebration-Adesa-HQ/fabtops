'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { getEditorialImage } from '@/lib/content/editorial-images';

const sustainabilityPreviewImage = getEditorialImage('home.sustainability-preview');

export function SustainabilityPreview() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto luxury-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1 space-y-12">
            <div className="space-y-6">
              <span className="text-[11px] uppercase tracking-[0.5em] font-black text-[#937FBE]">
                Our Impact
              </span>
              <h2 className="font-heading text-5xl md:text-7xl uppercase tracking-tighter text-brand-dark leading-none">
                Conscious <br /> <span className="italic opacity-85">Creation</span>
              </h2>
              <p className="text-brand-dark/85 text-lg md:text-xl leading-relaxed max-w-md font-medium">
                We believe in beauty that doesn't cost the earth. Every piece is crafted with purpose, using responsibly sourced materials and ethical production practices.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand-dark">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="font-bold uppercase tracking-widest text-sm text-brand-dark">Circular Design</h3>
                <p className="text-sm text-brand-dark/80 leading-relaxed">
                  Designing for longevity and recyclability. We aim to keep our garments in use for as long as possible.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand-dark">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3 className="font-bold uppercase tracking-widest text-sm text-brand-dark">Ethical Sourcing</h3>
                <p className="text-sm text-brand-dark/80 leading-relaxed">
                  Working only with certified partners who share our commitment to fair wages and safe working conditions.
                </p>
              </div>
            </div>

            <div className="pt-8">
              <Link 
                href="/sustainability"
                className="inline-flex items-center gap-6 text-[11px] uppercase tracking-[0.4em] font-black text-brand-dark hover:text-brand-dark transition-all group"
              >
                Our Full Commitment <div className="w-12 h-px bg-brand-dark group-hover:bg-brand-dark group-hover:w-16 transition-all" />
              </Link>
            </div>
          </div>


          <div className="order-1 lg:order-2 relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
            <Image
              src={sustainabilityPreviewImage.src}
              alt={sustainabilityPreviewImage.alt}
              fill
              className="object-cover"
              style={{ objectPosition: sustainabilityPreviewImage.objectPosition }}
            />
            <div className="absolute inset-0 bg-brand-dark/5 backdrop-blur-[1px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
