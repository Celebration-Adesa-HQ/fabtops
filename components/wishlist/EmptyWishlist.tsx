'use client';

import { motion } from 'framer-motion';
import { Heart, Sparkles, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function EmptyWishlist() {
  return (
    <div className="min-h-screen bg-brand-light pt-32 md:pt-40 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-brand-dark/30 mb-12 md:mb-16">
          <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
          <ChevronRight size={10} />
          <span className="text-brand-dark">Wishlist</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center pt-8 md:pt-16"
        >
          <div className="relative w-32 h-32 md:w-40 md:h-40 mb-12 md:mb-16">
            <div className="absolute inset-0 bg-white rounded-full shadow-sm animate-pulse" />
            <div className="absolute inset-4 bg-brand-light/50 rounded-full flex items-center justify-center backdrop-blur-md">
              <Heart size={48} className="text-brand-primary/20" strokeWidth={1} />
            </div>
            <motion.div
              animate={{ y: [-4, 4, -4], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute top-[20%] right-[-5%]"
            >
              <Sparkles size={12} className="text-brand-primary/40" />
            </motion.div>
          </div>

          <span className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] md:tracking-[0.6em] font-black text-brand-primary mb-4 md:mb-6 block">Selection is Empty</span>
          <h2 className="text-4xl md:text-7xl font-heading text-brand-dark mb-6 md:mb-8 uppercase tracking-tighter leading-[0.85]">
            Begin Your<br /><span className="italic opacity-50 text-brand-dark">Heritage Story</span>
          </h2>
          <Link
            href="/shop"
            className="inline-flex items-center gap-4 md:gap-6 group"
          >
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] font-black text-brand-dark group-hover:text-brand-primary transition-colors">
              Explore The Silhouettes
            </span>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-brand-dark/10 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary transition-all duration-500 shadow-lg shadow-brand-primary/5">
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
