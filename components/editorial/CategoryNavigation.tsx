'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const categories = [
  {
    name: 'Tops',
    href: '/shop/tops',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800',
  },
  {
    name: 'Sets',
    href: '/shop/sets',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=800',
  },
  {
    name: 'Dresses',
    href: '/shop/dresses',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800',
  },
  {
    name: 'Accessories',
    href: '/shop/accessories',
    image: 'https://images.unsplash.com/photo-1512633017083-67231aba710d?q=80&w=800',
  },
  {
    name: 'Archive',
    href: '/archive',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800',
  },
];

export function CategoryNavigation() {
  return (
    <section className="py-24 luxury-padding bg-brand-light">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col mb-16 space-y-4">
          <span className="text-[11px] uppercase tracking-[0.4em] font-bold text-brand-dark/40">
            Browse Categories
          </span>
          <h2 className="font-heading text-4xl md:text-6xl uppercase tracking-tighter text-brand-dark">
            Shop by Identity
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
          {categories.map((category, index) => (
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
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/20 transition-colors duration-500" />
                  
                  {/* Glass Card on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
                      <span className="text-[10px] uppercase tracking-widest text-white font-bold">Explore</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-sm md:text-base font-bold uppercase tracking-widest text-brand-dark group-hover:text-brand-primary transition-colors">
                  {category.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
