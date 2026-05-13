'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
}

export function Drawer({ isOpen, onClose, title, children, side = 'right' }: DrawerProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const variants = {
    closed: { x: side === 'right' ? '100%' : '-100%' },
    open: { x: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-brand-dark/20 backdrop-blur-sm"
          />
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed top-0 bottom-0 z-50 w-full max-w-md bg-brand-light p-6 shadow-xl',
              side === 'right' ? 'right-0' : 'left-0'
            )}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-2xl uppercase tracking-tight text-brand-dark">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-brand-dark/5 transition-colors"
              >
                <X className="h-6 w-6 text-brand-dark" />
              </button>
            </div>
            <div className="h-full overflow-y-auto pb-20">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
