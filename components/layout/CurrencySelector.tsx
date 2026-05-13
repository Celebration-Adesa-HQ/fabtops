'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency, currencies, Currency } from '@/lib/currency-context';

interface CurrencySelectorProps {
  className?: string;
  variant?: 'header' | 'footer';
}

export function CurrencySelector({ className, variant = 'header' }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { current, setCurrency } = useCurrency();
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (currency: Currency) => {
    setCurrency(currency);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative z-50", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 group transition-all duration-300",
          variant === 'header' 
            ? "text-[10px] uppercase tracking-widest font-black hover:text-brand-primary"
            : "text-[10px] uppercase tracking-[0.2em] font-black text-brand-light hover:text-brand-primary"
        )}
      >
        <span className="opacity-60 group-hover:opacity-100 transition-opacity">
          {current.flag} {current.code}
        </span>
        <ChevronDown 
          size={12} 
          className={cn("transition-transform duration-500", isOpen && "rotate-180")} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: variant === 'header' ? 10 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: variant === 'header' ? 10 : -10 }}
            className={cn(
              "absolute w-48 py-4 bg-white shadow-2xl rounded-2xl border border-brand-dark/5 backdrop-blur-xl",
              variant === 'header' ? "top-full mt-4 right-0" : "bottom-full mb-4 left-0"
            )}
          >
            <div className="px-4 mb-4">
              <span className="text-[9px] uppercase tracking-[0.3em] font-black text-brand-dark/40">Select Region</span>
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleSelect(currency)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-all duration-300 hover:bg-brand-primary/10",
                    current.code === currency.code ? "text-brand-primary" : "text-brand-dark/60"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-base">{currency.flag}</span>
                    {currency.label}
                  </span>
                  <span className="opacity-40">{currency.code}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
