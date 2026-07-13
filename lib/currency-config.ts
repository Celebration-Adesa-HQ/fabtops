export interface SupportedCurrency {
  code: string;
  symbol: string;
  label: string;
  flag: string;
  rate: number;
  paystackSupported: boolean;
  minorUnit: number;
}

export const supportedCurrencies: SupportedCurrency[] = [
  { code: 'NGN', symbol: '₦', label: 'Nigeria', flag: '🇳🇬', rate: 1, paystackSupported: true, minorUnit: 2 },
  { code: 'USD', symbol: '$', label: 'United States', flag: '🇺🇸', rate: 0.00063, paystackSupported: true, minorUnit: 2 },
  { code: 'GBP', symbol: '£', label: 'United Kingdom', flag: '🇬🇧', rate: 0.00050, paystackSupported: true, minorUnit: 2 },
  { code: 'EUR', symbol: '€', label: 'Europe', flag: '🇪🇺', rate: 0.00059, paystackSupported: false, minorUnit: 2 },
  { code: 'CAD', symbol: 'C$', label: 'Canada', flag: '🇨🇦', rate: 0.00085, paystackSupported: false, minorUnit: 2 },
  { code: 'AUD', symbol: 'A$', label: 'Australia', flag: '🇦🇺', rate: 0.00095, paystackSupported: false, minorUnit: 2 },
  { code: 'AED', symbol: 'د.إ', label: 'UAE', flag: '🇦🇪', rate: 0.0023, paystackSupported: false, minorUnit: 2 },
  { code: 'ZAR', symbol: 'R', label: 'South Africa', flag: '🇿🇦', rate: 0.012, paystackSupported: true, minorUnit: 2 },
  { code: 'GHS', symbol: 'GH₵', label: 'Ghana', flag: '🇬🇭', rate: 0.0088, paystackSupported: true, minorUnit: 2 },
];

export function getSupportedCurrency(code: string) {
  return supportedCurrencies.find((currency) => currency.code === code) || null;
}

export function convertFromNgn(amountNgn: number, targetCurrencyCode: string) {
  const currency = getSupportedCurrency(targetCurrencyCode);
  if (!currency) {
    throw new Error(`Unsupported currency: ${targetCurrencyCode}`);
  }

  return Number((amountNgn * currency.rate).toFixed(currency.code === 'NGN' ? 0 : 2));
}

export function toMinorUnits(amountMajor: number, currencyCode: string) {
  const currency = getSupportedCurrency(currencyCode);
  if (!currency) {
    throw new Error(`Unsupported currency: ${currencyCode}`);
  }

  return Math.round(amountMajor * (10 ** currency.minorUnit));
}
