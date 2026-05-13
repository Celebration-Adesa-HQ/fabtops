'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  label: string;
  flag: string;
  rate: number; // Conversion rate relative to NGN (base currency)
}

export const currencies: Currency[] = [
  { code: 'NGN', symbol: '₦', label: 'Nigeria', flag: '🇳🇬', rate: 1 },
  { code: 'USD', symbol: '$', label: 'United States', flag: '🇺🇸', rate: 0.00063 },
  { code: 'GBP', symbol: '£', label: 'United Kingdom', flag: '🇬🇧', rate: 0.00050 },
  { code: 'EUR', symbol: '€', label: 'Europe', flag: '🇪🇺', rate: 0.00059 },
];

interface CurrencyContextType {
  current: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (amount: string | number, fromCurrency?: string) => string;
  formatPrice: (amount: string | number, fromCurrency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'fabtops_currency';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrentState] = useState<Currency>(currencies[0]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const found = currencies.find(c => c.code === parsed.code);
        if (found) setCurrentState(found);
      }
    } catch {}
    setIsHydrated(true);
  }, []);

  const setCurrency = useCallback((currency: Currency) => {
    setCurrentState(currency);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ code: currency.code }));
    } catch {}
  }, []);

  const convertPrice = useCallback((amount: string | number, fromCurrency: string = 'NGN') => {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) return '0';

    // Find source currency rate
    const sourceCurrency = currencies.find(c => c.code === fromCurrency) || currencies[0];
    
    // Convert to NGN first (base), then to target
    const inNGN = numericAmount / sourceCurrency.rate;
    const converted = inNGN * current.rate;
    
    return converted.toFixed(2);
  }, [current]);

  const formatPrice = useCallback((amount: string | number, fromCurrency: string = 'NGN') => {
    const converted = convertPrice(amount, fromCurrency);
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: current.code,
      minimumFractionDigits: current.code === 'NGN' ? 0 : 2,
      maximumFractionDigits: current.code === 'NGN' ? 0 : 2,
    }).format(Number(converted));
  }, [current, convertPrice]);

  return (
    <CurrencyContext.Provider value={{ current, setCurrency, convertPrice, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
