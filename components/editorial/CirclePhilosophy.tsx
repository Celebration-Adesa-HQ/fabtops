'use client';

import { ScrollReveal } from '@/components/animations/ScrollReveal';
import Image from 'next/image';
import { getEditorialImage } from '@/lib/content/editorial-images';

const circlePhilosophyImage = getEditorialImage('circle.philosophy');

export function CirclePhilosophy() {
  return (
    <section className="relative z-10 py-32 md:py-48 px-6 md:px-12 lg:px-24">
      <div className="max-w-[1440px] mx-auto">
        <ScrollReveal>
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <div className="flex-1 space-y-12 text-left">
              <div className="w-px h-24 bg-brand-dark/20" />
              <h3 className="text-xs uppercase tracking-[0.5em] text-brand-dark opacity-80 font-black">Legacy Philosophy</h3>
              <div className="space-y-10">
                <div className="space-y-6">
                  <h4 className="text-3xl md:text-5xl font-heading text-brand-dark leading-[0.9] uppercase tracking-tighter">Private <br /><span className="italic opacity-95">Vaults</span></h4>
                  <p className="text-[11px] text-brand-dark/85 font-black uppercase tracking-widest leading-relaxed max-w-md">Members gain exclusive access to the 'Hidden Vault'—a collection of limited prototypes and one-off pieces that never grace the public digital flagship.</p>
                </div>
                <div className="space-y-6">
                  <h4 className="text-3xl md:text-5xl font-heading text-brand-dark leading-[0.9] uppercase tracking-tighter">Digital <br /><span className="italic opacity-95">Stylist</span></h4>
                  <p className="text-[11px] text-brand-dark/85 font-black uppercase tracking-widest leading-relaxed max-w-md">Dedicated 24/7 concierge support for bespoke sizing queries, event styling, and priority fabric selection via private channels.</p>
                </div>
              </div>
            </div>
            <div className="flex-1 relative aspect-square w-full rounded-[4rem] overflow-hidden shadow-2xl shadow-brand-dark/20 animate-pulse hover:animate-none">
              <Image 
                src={circlePhilosophyImage.src}
                alt={circlePhilosophyImage.alt}
                fill
                className="object-cover"
                style={{ objectPosition: circlePhilosophyImage.objectPosition }}
              />
              <div className="absolute inset-0 bg-brand-dark/10 backdrop-blur-[1px]" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
