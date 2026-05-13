'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-brand-secondary">
      {/* Background Image/Video Placeholder */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          alt="Fabtops Heritage Hero"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-brand-dark/10" />
      </div>

      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[11px] uppercase tracking-[0.5em] font-bold text-brand-dark mb-6"
        >
          New Collection 2024
        </motion.span>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-heading text-6xl md:text-8xl lg:text-9xl uppercase tracking-tighter text-brand-dark mb-12"
        >
          Elegance <br /> Redefined
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link href="/shop">
            <Button size="xl" variant="primary">
              Shop New Collection
            </Button>
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-brand-dark/40">Scroll to Explore</span>
        <div className="w-px h-12 bg-gradient-to-b from-brand-dark/40 to-transparent" />
      </motion.div>
    </section>
  );
}
