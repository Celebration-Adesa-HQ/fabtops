'use client';

import { motion } from 'framer-motion';

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-brand-light pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        {/* Header Skeleton */}
        <div className="mb-20 space-y-6">
          <div className="h-4 w-32 bg-brand-dark/5 rounded-full animate-pulse" />
          <div className="h-16 md:h-24 w-full md:w-2/3 bg-brand-dark/5 rounded-2xl animate-pulse" />
          <div className="h-10 w-full md:w-1/2 bg-brand-dark/5 rounded-xl animate-pulse" />
        </div>

        {/* Filter/Sort Skeleton */}
        <div className="flex justify-between items-center mb-12 py-6 border-y border-brand-dark/5">
          <div className="h-6 w-24 bg-brand-dark/5 rounded-full animate-pulse" />
          <div className="h-6 w-32 bg-brand-dark/5 rounded-full animate-pulse" />
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-6">
              <div className="aspect-editorial bg-brand-dark/5 rounded-3xl animate-pulse overflow-hidden relative">
                {/* Shimmer effect */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full"
                />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-3/4 bg-brand-dark/5 rounded-full animate-pulse" />
                <div className="h-4 w-1/4 bg-brand-dark/5 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
