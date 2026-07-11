'use client';

import type { ReactNode } from 'react';
import { currencies, useCurrencyStore, type Currency } from '@/stores/use-currency-store';

interface CurrencyContextType {
  current: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (amount: string | number, fromCurrency?: string) => string;
  formatPrice: (amount: string | number, fromCurrency?: string) => string;
}

export { currencies };
export type { Currency };

export function CurrencyProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useCurrency(): CurrencyContextType {
  const current = useCurrencyStore((state) => state.current);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);
  const convertPrice = useCurrencyStore((state) => state.convertPrice);
  const formatPrice = useCurrencyStore((state) => state.formatPrice);

  return {
    current,
    setCurrency,
    convertPrice,
    formatPrice,
  };
}
