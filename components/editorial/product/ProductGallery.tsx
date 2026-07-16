'use client';

import * as React from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import type { StorefrontImage } from '@/lib/woocommerce/types';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  title: string;
  images: StorefrontImage[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function ProductGallery({
  title,
  images,
  selectedIndex,
  onSelect,
}: ProductGalleryProps) {
  const [isZoomOpen, setIsZoomOpen] = React.useState(false);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') {
        onSelect((selectedIndex + 1) % images.length);
      }

      if (event.key === 'ArrowLeft') {
        onSelect((selectedIndex - 1 + images.length) % images.length);
      }

      if (event.key === 'Escape') {
        setIsZoomOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onSelect, selectedIndex]);

  const currentImage = images[selectedIndex] || images[0];

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[96px_minmax(0,1fr)] xl:grid-cols-[112px_minmax(0,1fr)]">
        <div className="order-2 flex gap-3 overflow-x-auto pb-1 lg:order-1 lg:max-h-[780px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              className={cn(
                'relative h-24 w-20 shrink-0 overflow-hidden rounded-[1.5rem] border bg-white transition-all duration-300 lg:h-28 lg:w-full',
                selectedIndex === index
                  ? 'border-brand-dark shadow-[0_24px_60px_-32px_rgba(59,59,68,0.45)]'
                  : 'border-brand-dark/10 opacity-70 hover:opacity-100',
              )}
            >
              <Image
                src={image.url}
                alt={image.altText || title}
                fill
                sizes="112px"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        <div className="order-1">
          <div className="relative overflow-hidden rounded-[2rem] bg-white lg:rounded-[2.5rem]">
            <div className="pointer-events-none absolute left-5 top-5 z-10 rounded-full bg-white/90 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-brand-dark shadow-sm backdrop-blur">
              {String(selectedIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </div>

            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="absolute right-5 top-5 z-10 rounded-full bg-white/90 p-3 text-brand-dark shadow-sm backdrop-blur transition-colors hover:text-brand-dark"
              aria-label="Open zoomed gallery image"
            >
              <Expand size={16} />
            </button>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => onSelect((selectedIndex - 1 + images.length) % images.length)}
                  className="absolute left-5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 text-brand-dark shadow-sm backdrop-blur transition-colors hover:text-brand-dark"
                  aria-label="Previous product image"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => onSelect((selectedIndex + 1) % images.length)}
                  className="absolute right-5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 text-brand-dark shadow-sm backdrop-blur transition-colors hover:text-brand-dark"
                  aria-label="Next product image"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            ) : null}

            <div className="group relative aspect-[4/5] min-h-[420px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage.url}
                  initial={{ opacity: 0.2, scale: 1.01 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.2, scale: 0.995 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={currentImage.url}
                    alt={currentImage.altText || title}
                    fill
                    priority={selectedIndex === 0}
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.08]"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isZoomOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-brand-dark/90 p-4 backdrop-blur-md"
          >
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute right-6 top-6 rounded-full border border-white/15 bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              aria-label="Close zoomed gallery image"
            >
              <X size={18} />
            </button>

            <div className="relative mx-auto flex h-full max-w-6xl items-center justify-center">
              <Image
                src={currentImage.url}
                alt={currentImage.altText || title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
