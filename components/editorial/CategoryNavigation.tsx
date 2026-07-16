'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getEditorialImage, type EditorialPlacementId } from '@/lib/content/editorial-images';

const categories = [
  {
    name: 'Tops',
    href: '/shop/tops',
    placementId: 'home.category.tops',
  },
  {
    name: 'Sets',
    href: '/shop/sets',
    placementId: 'home.category.sets',
  },
  {
    name: 'Dresses',
    href: '/shop/dresses',
    placementId: 'home.category.dresses',
  },
  {
    name: 'Accessories',
    href: '/shop/accessories',
    placementId: 'home.category.accessories',
  },
  {
    name: 'Archive',
    href: '/archive',
    placementId: 'home.category.archive',
  },
] as const satisfies Array<{ name: string; href: string; placementId: EditorialPlacementId }>;

export function CategoryNavigation() {
  return (
    <section className="py-24 luxury-padding bg-brand-light">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col mb-16 space-y-4">
          <span className="text-[11px] uppercase tracking-[0.4em] font-bold text-brand-dark/75">
            Browse Categories
          </span>
          <h2 className="font-heading text-4xl md:text-6xl uppercase tracking-tighter text-brand-dark">
            Shop by Identity
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
          {categories.map((category, index) => {
            const image = getEditorialImage(category.placementId);
            return (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={category.href} className="group block space-y-4 text-center">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl md:rounded-3xl shadow-sm group-hover:shadow-xl transition-all duration-700">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    style={{ objectPosition: image.objectPosition }}
                  />
                  <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/20 transition-colors duration-500" />
                  
                  {/* Glass Card on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
                      <span className="text-[10px] uppercase tracking-widest text-white font-bold">Explore</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-sm md:text-base font-bold uppercase tracking-widest text-brand-dark group-hover:text-brand-dark transition-colors">
                  {category.name}
                </h3>
              </Link>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
