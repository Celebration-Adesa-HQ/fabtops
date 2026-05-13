'use client';

import Image from 'next/image';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Leaf, ShieldCheck, Zap, Heart } from 'lucide-react';

export default function SustainabilityPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Editorial Header */}
      <section className="pt-40 pb-24 px-6 md:px-12 text-center">
        <ScrollReveal>
          <span className="text-xs uppercase tracking-[0.5em] text-pink-600 font-bold mb-8 block">Our Responsibility</span>
          <h1 className="text-5xl md:text-8xl font-serif-logo text-black mb-12">
            Fashion with <br /> <span className="italic text-pink-600">Intention</span>
          </h1>
          <p className="text-xl text-gray-500 font-light max-w-3xl mx-auto leading-relaxed">
            Sustainability at FabTops is not a trend; it is a long-term commitment to our craft, our community, and the planet. We design with the future in mind.
          </p>
        </ScrollReveal>
      </section>

      {/* Hero Image */}
      <section className="px-6 md:px-12 mb-32">
        <div className="max-w-7xl mx-auto h-[60vh] relative overflow-hidden rounded-[3rem] shadow-2xl shadow-pink-100/50">
          <Image 
            src="https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=2000" 
            alt="Sustainable Craftsmanship" 
            fill 
            className="object-cover" 
          />
          <div className="absolute inset-0 bg-pink-950/10" />
        </div>
      </section>

      {/* Core Principles Grid */}
      <section className="py-24 px-6 md:px-12 bg-pink-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: Leaf, title: "Packaging", desc: "100% FSC-certified materials and recycled components." },
              { icon: ShieldCheck, title: "Ethical", desc: "Fair wages and safe working environments for all creators." },
              { icon: Zap, title: "Anti-Mass", desc: "Small-batch production to eliminate unsold inventory waste." },
              { icon: Heart, title: "Longevity", desc: "High-quality materials designed to last for generations." },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.1}>
                <div className="space-y-6">
                  <div className="w-14 h-14 bg-white border border-pink-100 flex items-center justify-center text-pink-600 rounded-2xl">
                    <item.icon size={24} />
                  </div>
                  <h3 className="text-sm uppercase tracking-widest font-black text-black">{item.title}</h3>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Story Section */}
      <section className="py-32 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 gap-32">
            {[
              {
                title: "Conscious Packaging",
                desc: "We have moved away from single-use plastics. Every FabTops order arrives in FSC-certified boxes and biodegradable mailers, ensuring that your premium experience doesn't come at a cost to the Earth.",
                image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1200"
              },
              {
                title: "Ethical Sourcing",
                desc: "Our vision extends beyond fashion to women empowerment. We partner exclusively with women-led ateliers that prioritize ethical considerations, providing sustainable livelihoods for master artisans.",
                image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1200"
              }
            ].map((section, i) => (
              <ScrollReveal key={section.title} delay={i * 0.2}>
                <div className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-20 items-center`}>
                  <div className="w-full md:w-1/2">
                    <h2 className="text-3xl md:text-5xl font-serif-logo text-black mb-8 leading-tight">{section.title}</h2>
                    <p className="text-lg text-gray-500 font-light leading-relaxed">{section.desc}</p>
                  </div>
                  <div className="w-full md:w-1/2 aspect-square relative rounded-[3rem] overflow-hidden">
                    <Image src={section.image} alt={section.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-pink-900/10" />
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Long-term Vision CTA */}
      <section className="py-32 px-6 md:px-12 bg-black text-white text-center">
        <ScrollReveal>
          <h2 className="text-4xl md:text-6xl font-serif-logo mb-10 leading-tight">Our Journey to <br /> <span className="italic text-pink-400">Zero Impact</span></h2>
          <p className="text-pink-200/70 max-w-2xl mx-auto font-light text-lg mb-12">
            This is just the beginning. We are constantly evolving our processes to ensure that FabTops remains a brand you can wear with pride and purpose.
          </p>
          <div className="w-px h-24 bg-pink-500/30 mx-auto" />
        </ScrollReveal>
      </section>
    </div>
  );
}
