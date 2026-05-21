'use client';

import { motion } from 'framer-motion';
import { Zap, Heart, Sparkles, Star } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

const benefits = [
  { icon: Zap, title: "Priority Drops", desc: "First-tier access to all new silhouettes 48 hours before public launch." },
  { icon: Heart, title: "Bespoke Vault", desc: "Unlock the 'Hidden Archive'—one-off heritage pieces and prototypes." },
  { icon: Sparkles, title: "Luxe Gifting", desc: "Handcrafted accessories and limited edition tokens gifted seasonally." },
  { icon: Star, title: "White Glove", desc: "Dedicated WhatsApp styling concierge and expedited global shipping." },
];

export function CircleBenefits() {
  return (
    <section className="relative z-10 py-32 md:py-48 px-6 md:px-12 lg:px-24">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, i) => (
            <ScrollReveal key={benefit.title} delay={i * 0.1}>
              <div className="bg-white/10 backdrop-blur-2xl p-12 rounded-[3rem] border border-brand-dark/5 hover:border-brand-primary transition-all duration-700 group shadow-2xl shadow-brand-dark/5 h-full flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-brand-dark/5 rounded-2xl flex items-center justify-center text-brand-dark mb-10 group-hover:bg-brand-dark group-hover:text-white transition-all duration-700 shadow-sm active:scale-95">
                  <benefit.icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-heading uppercase tracking-tighter text-brand-dark mb-6">{benefit.title}</h3>
                <p className="text-[11px] text-brand-dark/60 font-black uppercase tracking-widest leading-relaxed">{benefit.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
