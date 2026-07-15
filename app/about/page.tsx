'use client';

import Image from 'next/image';
import { getEditorialImage } from '@/lib/content/editorial-images';

const aboutHeroImage = getEditorialImage('about.hero');

export default function AboutPage() {
  return (
    <div className="pt-40">
      <section className="luxury-padding max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <span className="text-[11px] uppercase tracking-[0.5em] font-bold text-brand-dark/40">Our Story</span>
          <h1 className="font-heading text-5xl md:text-7xl uppercase tracking-tighter text-brand-dark">
            Rooted in <br /> Femininity
          </h1>
          <p className="text-brand-dark/60 text-lg leading-relaxed max-w-md">
            FabTops is more than a brand; it's a movement. Founded on the belief that fashion should be a powerful form of self-expression, we create pieces that celebrate the multifaceted nature of the modern woman.
          </p>
        </div>
        <div className="aspect-editorial relative bg-neutral-100 overflow-hidden">
          <Image 
            src={aboutHeroImage.src}
            alt={aboutHeroImage.alt}
            fill
            className="object-cover"
            style={{ objectPosition: aboutHeroImage.objectPosition }}
          />
        </div>
      </section>

      <section className="bg-brand-light py-32 mt-20">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <h2 className="font-heading text-4xl uppercase tracking-tight">The Digital Flagship</h2>
          <p className="text-brand-dark/60 leading-loose">
            Every collection is a curated narrative. We prioritize quality over quantity, fit over trends, and confidence over everything. Welcome to the flagship.
          </p>
        </div>
      </section>
    </div>
  );
}
