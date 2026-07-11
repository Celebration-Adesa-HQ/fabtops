'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getBrowserStorage } from './storage';

export interface Currency {
  code: string;
  symbol: string;
  label: string;
  flag: string;
  rate: number;
}

export const currencies: Currency[] = [
  { code: 'NGN', symbol: '₦', label: 'Nigeria', flag: '🇳🇬', rate: 1 },
  { code: 'USD', symbol: '$', label: 'United States', flag: '🇺🇸', rate: 0.00063 },
  { code: 'GBP', symbol: '£', label: 'United Kingdom', flag: '🇬🇧', rate: 0.00050 },
  { code: 'EUR', symbol: '€', label: 'Europe', flag: '🇪🇺', rate: 0.00059 },
  { code: 'CAD', symbol: 'C$', label: 'Canada', flag: '🇨🇦', rate: 0.00085 },
  { code: 'AUD', symbol: 'A$', label: 'Australia', flag: '🇦🇺', rate: 0.00095 },
  { code: 'AED', symbol: 'د.إ', label: 'UAE', flag: '🇦🇪', rate: 0.0023 },
  { code: 'ZAR', symbol: 'R', label: 'South Africa', flag: '🇿🇦', rate: 0.012 },
  { code: 'GHS', symbol: 'GH₵', label: 'Ghana', flag: '🇬🇭', rate: 0.0088 },
];

interface CurrencyState {
  current: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (amount: string | number, fromCurrency?: string) => string;
  formatPrice: (amount: string | number, fromCurrency?: string) => string;
}

function convertAmount(current: Currency, amount: string | number, fromCurrency = 'NGN') {
  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount)) {
    return '0';
  }

  const sourceCurrency = currencies.find((currency) => currency.code === fromCurrency) || currencies[0];
  const inNgn = numericAmount / sourceCurrency.rate;
  return (inNgn * current.rate).toFixed(2);
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      current: currencies[0],
      setCurrency(currency) {
        set({ current: currency });
      },
      convertPrice(amount, fromCurrency = 'NGN') {
        return convertAmount(get().current, amount, fromCurrency);
      },
      formatPrice(amount, fromCurrency = 'NGN') {
        const converted = convertAmount(get().current, amount, fromCurrency);
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: get().current.code,
          minimumFractionDigits: get().current.code === 'NGN' ? 0 : 2,
          maximumFractionDigits: get().current.code === 'NGN' ? 0 : 2,
        }).format(Number(converted));
      },
    }),
    {
      name: 'fabtops-currency',
      storage: createJSONStorage(getBrowserStorage),
      partialize: (state) => ({
        current: state.current,
      }),
    },
  ),
);
