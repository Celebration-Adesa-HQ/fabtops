'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative h-[100vh] w-full overflow-hidden bg-brand-light">
      {/* Background Image/Video */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          alt="Fabtops Heritage Hero"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Soft gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/20 via-transparent to-brand-dark/40" />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <span className="text-[12px] uppercase tracking-[0.6em] font-black text-white drop-shadow-md">
              Collection No. 04 / 2024
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="font-heading text-7xl md:text-9xl lg:text-[10rem] uppercase tracking-tighter text-white leading-[0.85] mb-16 drop-shadow-2xl"
          >
            Divine <br /> <span className="italic opacity-90 font-serif lowercase tracking-normal">Form</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/shop">
              <Button size="xl" variant="secondary" className="shadow-2xl hover:shadow-brand-primary/20">
                Shop New Collection
              </Button>
            </Link>
            <Link href="/about">
              <Button size="xl" variant="outline" className="text-white border-white hover:bg-white hover:text-brand-dark">
                The Heritage
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Decorative side text */}
      <div className="absolute left-12 bottom-12 hidden lg:block z-20">
        <p className="text-white/40 text-[10px] uppercase tracking-[0.5em] [writing-mode:vertical-lr] rotate-180">
          Crafted in Lagos, Nigeria
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-12 right-12 flex flex-col items-end gap-4 z-20"
      >
        <div className="flex gap-4">
           <div className="w-2 h-2 rounded-full bg-white" />
           <div className="w-2 h-2 rounded-full bg-white/20" />
           <div className="w-2 h-2 rounded-full bg-white/20" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-bold">Scroll</span>
      </motion.div>
    </section>
  );
}
