'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { ShieldCheck, Truck, Undo2, Headphones } from 'lucide-react';
import { ProductCard } from '@/components/editorial/ProductCard';
import type { StorefrontProduct } from '@/lib/woocommerce/types';
import { cn } from '@/lib/utils';

interface ProductEditorialSectionsProps {
  product: StorefrontProduct;
  completeTheLook: StorefrontProduct[];
  relatedProducts: StorefrontProduct[];
}

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: 'Secure payment', copy: 'Protected checkout flows and verified payment handling.' },
  { icon: Truck, title: 'Fast dispatch', copy: 'Processing begins quickly once your order is confirmed.' },
  { icon: Undo2, title: 'Easy returns', copy: 'Clear support for eligible returns and exchanges.' },
  { icon: Headphones, title: 'Client support', copy: 'Assistance for sizing, delivery, and order updates.' },
];

function productNarrative(product: StorefrontProduct) {
  const category = product.categories[0]?.title || product.productType || 'FabTops';
  const brand = product.brands[0] || 'FabTops';

  return {
    designStory: `${brand} builds this ${category.toLowerCase()} piece around clean structure, ease of wear, and a polished silhouette that can shift from day to evening without losing presence.`,
    stylingNotes: `Style it with tonal layers, sculptural earrings, or a sharper outer layer when you want the look to feel more directional. The proportions are designed to hold their own in a minimal wardrobe.`,
    craftsmanship: 'Finish, fit, and fabric care matter more than excess detail here. Each piece is presented with a restrained luxury approach so the material and shape stay in focus.',
  };
}

const ACCORDION_SECTIONS = [
  { id: 'description', label: 'Description' },
  { id: 'fabric', label: 'Fabric & Materials' },
  { id: 'care', label: 'Care Instructions' },
  { id: 'size', label: 'Size & Fit' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'returns', label: 'Returns' },
] as const;

export function ProductEditorialSections({
  product,
  completeTheLook,
  relatedProducts,
}: ProductEditorialSectionsProps) {
  const [activeSection, setActiveSection] = React.useState<string>('description');
  const narrative = productNarrative(product);

  const accordionContent: Record<string, string> = {
    description: product.description || product.shortDescription || 'A refined FabTops piece designed with a clean, premium finish.',
    fabric: 'Fabric details vary by style. Use the care label inside the garment as the final source of truth for composition and handling.',
    care: 'Handle with care, store with room to breathe, and follow the garment label for the safest wash or dry-clean guidance.',
    size: 'Choose the size that best matches your usual fit. If you are between sizes, use the size guide and product reviews for added context.',
    shipping: 'Delivery timing is confirmed at checkout based on your destination and selected shipping service.',
    returns: 'Return policies and eligibility are shown during checkout and in your order confirmation support flow.',
  };

  return (
    <div className="space-y-24 md:space-y-32">
      <section className="overflow-hidden rounded-[2rem] bg-white shadow-[0_40px_120px_-80px_rgba(59,59,68,0.45)]">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[420px]">
            <Image
              src={product.gallery[1]?.url || product.gallery[0]?.url || '/logo/Fab and Luxe Combined.png'}
              alt={product.gallery[1]?.altText || product.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center gap-8 px-6 py-10 md:px-10 lg:px-14">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-brand-primary">Editorial story</p>
              <h2 className="font-heading text-4xl uppercase leading-[0.9] tracking-[-0.04em] text-brand-dark md:text-5xl">
                Quiet luxury, directed through silhouette.
              </h2>
            </div>

            <div className="grid gap-6 text-sm leading-relaxed text-brand-dark/85">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-dark">Brand story</h3>
                <p className="mt-3">{narrative.designStory}</p>
              </div>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-dark">Styling notes</h3>
                <p className="mt-3">{narrative.stylingNotes}</p>
              </div>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-dark">Fabric craftsmanship</h3>
                <p className="mt-3">{narrative.craftsmanship}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-brand-primary">Product details</p>
          <h2 className="font-heading text-4xl uppercase leading-[0.9] tracking-[-0.04em] text-brand-dark md:text-5xl">
            Everything worth checking before you commit.
          </h2>
        </div>

        <div className="space-y-5">
          {ACCORDION_SECTIONS.map((section) => (
            <div key={section.id} className="rounded-[1.5rem] border border-brand-dark/8 bg-white/70 px-5 py-4">
              <button
                type="button"
                onClick={() => setActiveSection(activeSection === section.id ? '' : section.id)}
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-dark">
                  {section.label}
                </span>
                <span className="text-xl leading-none text-brand-dark/80">
                  {activeSection === section.id ? '−' : '+'}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {activeSection === section.id ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="pt-4 text-sm leading-relaxed text-brand-dark/85">
                      {accordionContent[section.id]}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {completeTheLook.length > 0 ? (
        <section className="space-y-8">
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-brand-primary">Complete the look</p>
            <h2 className="font-heading text-4xl uppercase leading-[0.9] tracking-[-0.04em] text-brand-dark md:text-5xl">
              Styled companions with the same point of view.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {completeTheLook.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      {relatedProducts.length > 0 ? (
        <section className="space-y-8">
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-brand-primary">You may also like</p>
            <h2 className="font-heading text-4xl uppercase leading-[0.9] tracking-[-0.04em] text-brand-dark md:text-5xl">
              More from the same wardrobe language.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[2rem] bg-brand-dark px-6 py-10 text-white md:px-10 lg:px-14">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-brand-primary">Confidence layer</p>
            <h2 className="font-heading text-4xl uppercase leading-[0.9] tracking-[-0.04em] md:text-5xl">
              Shopping support that stays clear and quiet.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {TRUST_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <Icon size={18} className="text-brand-primary" />
                  <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.18em]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/95">{item.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-brand-primary">FAQ</p>
          <h2 className="font-heading text-4xl uppercase leading-[0.9] tracking-[-0.04em] text-brand-dark md:text-5xl">
            Common questions before checkout.
          </h2>
        </div>

        {[
          {
            q: 'Does it fit true to size?',
            a: 'Start with your usual size, then cross-check the size guide and review notes if you prefer a closer or looser silhouette.',
          },
          {
            q: 'How should I wash it?',
            a: 'Use the care label inside the garment as the final instruction. Premium pieces tend to last longer with gentler handling.',
          },
          {
            q: 'Can I return it?',
            a: 'Return and exchange conditions are confirmed during checkout and in order support communication.',
          },
          {
            q: 'How long does shipping take?',
            a: 'Delivery timing depends on destination and shipping method. The final estimate appears once your delivery details are entered.',
          },
        ].map((item) => (
          <div key={item.q} className="rounded-[1.5rem] border border-brand-dark/8 bg-white/70 px-5 py-4">
            <h3 className="text-sm font-semibold text-brand-dark">{item.q}</h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-dark/85">{item.a}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
