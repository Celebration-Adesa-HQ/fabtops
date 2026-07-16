'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 bg-brand-light">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-2xl"
      >
        <div className="w-24 h-24 bg-brand-primary/10 border border-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary mb-12 mx-auto">
          <ShoppingBag size={40} strokeWidth={1} />
        </div>
        
        <h1 className="text-6xl md:text-8xl font-heading uppercase tracking-tighter text-brand-dark mb-6">
          Lost in <span className="italic opacity-50">Style</span>
        </h1>
        
        <p className="text-brand-dark/85 mb-12 text-sm uppercase tracking-widest leading-relaxed font-bold max-w-md mx-auto">
          The silhouette you're looking for seems to have escaped our current collection. Let's find you something even better.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-brand-dark text-brand-light px-10 py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-brand-primary hover:text-brand-dark transition-all duration-500 group shadow-2xl shadow-brand-dark/10"
          >
            Shop Collection
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-4 border border-brand-dark/10 text-brand-dark px-10 py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-brand-dark hover:text-white transition-all duration-500"
          >
            Back Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
