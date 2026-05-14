'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-light">
      <div className="relative flex flex-col items-center">
        {/* Animated Logo or Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-heading uppercase tracking-tighter text-brand-dark">
            FAB<span className="italic opacity-50 text-brand-primary">TOPS</span>
          </h1>
        </motion.div>

        {/* Minimal Progress Line */}
        <div className="w-48 h-[1px] bg-brand-dark/10 relative overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-brand-primary w-1/2"
          />
        </div>

        {/* Text Loader */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-6 text-[10px] uppercase tracking-[0.4em] font-bold text-brand-dark/40"
        >
          Elevating your discovery
        </motion.p>
      </div>
    </div>
  );
}
