'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "The fit is absolutely incredible. It feels like it was tailored just for me.",
    author: "Amara O.",
    handle: "@amara_fits",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400",
  },
  {
    quote: "Finally, a brand that understands the balance between comfort and high-fashion.",
    author: "Zainab S.",
    handle: "@z_style_diaries",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400",
  },
  {
    quote: "FabTops is my go-to for every occasion. The quality is unmatched.",
    author: "Blessing E.",
    handle: "@bless_ed",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400",
  }
];

export function CommunitySocialProof() {
  return (
    <section className="py-32 bg-brand-light relative overflow-hidden">
      <div className="max-w-7xl mx-auto luxury-padding">
        <div className="text-center mb-24 space-y-4">
          <span className="text-[11px] uppercase tracking-[0.5em] font-black text-brand-dark/40">
            The Community
          </span>
          <h2 className="font-heading text-4xl md:text-7xl uppercase tracking-tighter text-brand-dark">
            Seen on You
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-12 rounded-[3rem] shadow-sm hover:shadow-xl transition-all duration-500 group border border-brand-dark/5"
            >
              <div className="space-y-8">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                  <Image
                    src={item.image}
                    alt={item.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-brand-dark/80 italic text-xl leading-relaxed font-serif">
                  "{item.quote}"
                </p>
                <div className="pt-8 border-t border-brand-dark/5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-brand-dark uppercase tracking-widest text-xs">{item.author}</p>
                    <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest">{item.handle}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
