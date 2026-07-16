'use client';

import { motion } from 'framer-motion';
import { Heart, Lock } from 'lucide-react';
import Link from 'next/link';

export function UnauthenticatedWishlist() {
  return (
    <div className="min-h-screen bg-brand-light flex flex-col items-center justify-center px-6 text-center pt-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full"
      >
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white border border-brand-primary/10 flex items-center justify-center mx-auto mb-10 md:mb-12 relative shadow-sm">
          <Heart size={40} className="text-brand-accent/30" strokeWidth={1.5} />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 md:w-10 md:h-10 bg-brand-dark rounded-full flex items-center justify-center shadow-lg">
            <Lock size={14} className="text-white" />
          </div>
        </div>
        <span className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] md:tracking-[0.6em] font-black text-brand-accent mb-4 md:mb-6 block text-center">Secure Access</span>
        <h1 className="text-4xl md:text-5xl font-heading text-brand-dark mb-6 leading-[0.9] uppercase tracking-tighter text-center">
          Your Selection<br /><span className="italic opacity-85">Vault</span>
        </h1>
        <p className="text-brand-dark/85 font-light text-sm md:text-base leading-relaxed mb-10 md:mb-12 text-center">
          Please sign in to view your saved selection and proceed to a secure checkout experience.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login?redirect=/wishlist"
            className="inline-block px-10 md:px-12 py-4 md:py-5 bg-brand-dark text-brand-light text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-black hover:bg-brand-primary hover:text-brand-dark transition-all duration-500 shadow-xl shadow-brand-dark/5 rounded-xl"
          >
            Sign In to View
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
