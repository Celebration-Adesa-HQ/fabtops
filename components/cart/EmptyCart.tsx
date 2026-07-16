'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function EmptyCart() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-brand-light">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-lg"
      >
        <div className="w-24 h-24 bg-white/40 backdrop-blur-md border border-brand-dark/5 rounded-full flex items-center justify-center text-brand-dark mb-10 mx-auto">
          <ShoppingBag size={40} strokeWidth={1} />
        </div>
        <h1 className="text-4xl md:text-5xl font-heading uppercase tracking-tighter text-brand-dark mb-6">Your Bag is Empty</h1>
        <p className="text-brand-dark/85 mb-12 text-sm uppercase tracking-widest leading-relaxed font-bold">
          Meticulously crafted silhouettes are waiting to be discovered.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-4 bg-brand-dark text-brand-light px-10 py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-brand-primary hover:text-brand-dark transition-all duration-500 group shadow-2xl shadow-brand-dark/10 rounded-xl"
        >
          Explore Collections
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}
