'use client';

import { useEffect, useState, type ReactNode } from 'react';
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
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const fallbackCurrency = currencies[0];
  const activeCurrency = isHydrated ? current : fallbackCurrency;

  return {
    current: activeCurrency,
    setCurrency,
    convertPrice(amount, fromCurrency = 'NGN') {
      if (isHydrated) {
        return convertPrice(amount, fromCurrency);
      }

      return fromCurrency === fallbackCurrency.code ? String(Number(amount)) : convertAmountForCurrency(fallbackCurrency, amount, fromCurrency);
    },
    formatPrice(amount, fromCurrency = 'NGN') {
      if (isHydrated) {
        return formatPrice(amount, fromCurrency);
      }

      return formatCurrencyAmount(fallbackCurrency, amount, fromCurrency);
    },
  };
}

function convertAmountForCurrency(current: Currency, amount: string | number, fromCurrency = 'NGN') {
  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount)) {
    return '0';
  }

  const sourceCurrency = currencies.find((currency) => currency.code === fromCurrency) || currencies[0];
  const inNgn = numericAmount / sourceCurrency.rate;
  return (inNgn * current.rate).toFixed(2);
}

function formatCurrencyAmount(current: Currency, amount: string | number, fromCurrency = 'NGN') {
  const converted = convertAmountForCurrency(current, amount, fromCurrency);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: current.code,
    minimumFractionDigits: current.code === 'NGN' ? 0 : 2,
    maximumFractionDigits: current.code === 'NGN' ? 0 : 2,
  }).format(Number(converted));
}
