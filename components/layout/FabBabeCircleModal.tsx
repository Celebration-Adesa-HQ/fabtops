'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  getFabBabeModalSnapshot,
  markFabBabeModalDismissed,
  markFabBabeModalSeen,
  shouldShowFabBabeModal,
} from '@/lib/circle/modal-state';
import { FabBabeSubscribeForm } from './FabBabeSubscribeForm';

const BENEFITS = [
  'New arrivals before everyone else',
  'Exclusive member-only discounts',
  'Styling tips and fashion inspiration',
  'Birthday surprises',
  'Early access to sales',
  'Monthly Fab Babe picks',
];

interface FabBabeCircleModalProps {
  blocked?: boolean;
}

export function FabBabeCircleModal({ blocked = false }: FabBabeCircleModalProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (blocked) {
      setIsOpen(false);
      return;
    }

    const timer = window.setTimeout(() => {
      const snapshot = getFabBabeModalSnapshot(pathname);
      if (!shouldShowFabBabeModal(snapshot)) {
        return;
      }

      markFabBabeModalSeen();
      setIsOpen(true);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [blocked, pathname]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const closeModal = React.useCallback(() => {
    markFabBabeModalDismissed();
    setIsOpen(false);
  }, []);

  const handleSuccess = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[75] bg-brand-dark/45 backdrop-blur-sm"
            onClick={closeModal}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed inset-x-4 top-1/2 z-[80] mx-auto w-full max-w-2xl -translate-y-1/2 overflow-hidden rounded-[2rem] border border-brand-dark/10 bg-brand-light shadow-2xl shadow-brand-dark/20 md:inset-x-0"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fab-babe-circle-title"
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-5 top-5 z-10 rounded-full border border-brand-dark/10 bg-white/90 p-2 text-brand-dark transition hover:border-brand-accent hover:text-brand-dark"
              aria-label="Close Fab Babe Circle welcome modal"
            >
              <X size={18} />
            </button>

            <div className="grid gap-0 md:grid-cols-[1.15fr,0.85fr]">
              <div className="bg-brand-dark px-6 py-8 text-brand-light md:px-10 md:py-12">
                <p className="text-[10px] font-black uppercase tracking-[0.45em] text-brand-accent">Fab Babe Circle</p>
                <h2
                  id="fab-babe-circle-title"
                  className="mt-4 text-4xl font-heading uppercase tracking-tight md:text-5xl"
                >
                  Join the Circle
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-light/95">
                  Be first inside the FabTops community for early access, inspiration, and rewards curated for our closest circle.
                </p>

                <ul className="mt-8 space-y-3">
                  {BENEFITS.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3 text-sm text-brand-light/95">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-primary" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-6 py-8 md:px-8 md:py-12">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-dark/75">Welcome Offer</p>
                  <h3 className="text-2xl font-heading uppercase tracking-tight text-brand-dark">Your front-row pass starts here.</h3>
                </div>

                <div className="mt-8">
                  <FabBabeSubscribeForm
                    source="fab-babe-modal"
                    variant="modal"
                    onSuccess={handleSuccess}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
