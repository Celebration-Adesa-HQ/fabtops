'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { getEditorialImage } from '@/lib/content/editorial-images';

const primaryImage = getEditorialImage('home.new-collection.primary');
const detailImage = getEditorialImage('home.new-collection.detail');

export function NewCollectionShowcase() {
  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto luxury-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Visual Side */}
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl z-10"
            >
              <Image
                src={primaryImage.src}
                alt={primaryImage.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                style={{ objectPosition: primaryImage.objectPosition }}
              />
            </motion.div>
            
            {/* Floating Accents */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
              className="absolute -bottom-12 -left-12 w-2/3 aspect-[3/4] rounded-[2rem] overflow-hidden shadow-xl border-8 border-white z-20 hidden md:block"
            >
              <Image
                src={detailImage.src}
                alt={detailImage.alt}
                fill
                sizes="(max-width: 1024px) 66vw, 33vw"
                className="object-cover"
                style={{ objectPosition: detailImage.objectPosition }}
              />
            </motion.div>
            
            {/* Decorative Element */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] -z-10" />
          </div>

          {/* Content Side */}
          <div className="space-y-12">
            <div className="space-y-6">
              <span className="text-[11px] uppercase tracking-[0.5em] font-black text-brand-accent">
                Limited Release
              </span>
              <h2 className="font-heading text-6xl md:text-8xl uppercase tracking-tighter text-brand-dark leading-none">
                Serenity <br /> <span className="italic opacity-85">In Motion</span>
              </h2>
              <p className="text-brand-dark/85 text-lg md:text-xl leading-relaxed max-w-md font-medium">
                Inspired by the fluidity of water and the strength of stone. Our latest collection explores the balance of power and grace.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/shop">
                <Button size="xl" variant="primary">
                  View Collection
                </Button>
              </Link>
              <Link href="/about">
                <Button size="xl" variant="outline">
                  The Story
                </Button>
              </Link>
            </div>

            <div className="pt-12 grid grid-cols-2 gap-8 border-t border-brand-dark/5">
              <div className="space-y-2">
                <span className="text-2xl font-heading text-brand-dark">100%</span>
                <p className="text-[10px] uppercase tracking-widest font-bold text-brand-dark/75">Sustainably Sourced</p>
              </div>
              <div className="space-y-2">
                <span className="text-2xl font-heading text-brand-dark">Ltd.</span>
                <p className="text-[10px] uppercase tracking-widest font-bold text-brand-dark/75">Exclusive Quantities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
