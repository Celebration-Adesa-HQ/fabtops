'use client';

import { motion } from 'framer-motion';
import { Star, Globe, Clock } from 'lucide-react';
import Image from 'next/image';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export function CircleHero() {
  return (
    <section className="relative h-[95vh] flex items-center justify-center overflow-hidden z-10">
      <div className="absolute inset-0">
        <Image 
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000"
          alt="Fab Babe Circle"
          fill
          className="object-cover opacity-80 scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-secondary/10 via-transparent to-brand-secondary" />
        <div className="absolute inset-0 bg-brand-secondary/20 backdrop-blur-[1px]" />
      </div>
      
      <div className="relative z-10 text-center px-6">
        <ScrollReveal>
          <div className="inline-flex items-center gap-3 px-8 py-3 bg-brand-dark rounded-full text-white text-[10px] font-black uppercase tracking-[0.4em] mb-10 shadow-2xl shadow-brand-dark/20">
            <Star size={14} fill="currentColor" /> Exclusive Membership
          </div>
          <h1 className="text-7xl md:text-9xl font-heading leading-[0.8] mb-10 text-brand-dark tracking-tighter uppercase">
            Fab Babe <br /> <span className="italic opacity-80">Circle</span>
          </h1>
          <p className="text-sm md:text-xl font-medium text-brand-dark/60 max-w-2xl mx-auto mb-16 leading-relaxed tracking-widest uppercase text-[11px]">
            An elite sanctuary for the intentional woman. Early access, heritage-grade drops, and a curated fashion legacy.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 opacity-60">
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-brand-dark" />
              <span className="text-[9px] uppercase tracking-[0.3em] font-black text-brand-dark">Global Community</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-brand-dark/20" />
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-brand-dark" />
              <span className="text-[9px] uppercase tracking-[0.3em] font-black text-brand-dark">24/7 Concierge</span>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Decorative divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-dark/10 to-transparent" />
    </section>
  );
}
