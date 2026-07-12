'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useCurrency } from '@/lib/currency-context';
import { fromMinorUnits } from '@/lib/woocommerce/store-api';
import type { CartData, CartItem } from '@/stores/types';

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  totalAmount: number;
  currencyCode: string;
  discountCodes: CartData['discountCodes'];
  shippingRates?: CartData['shippingRates'];
  needsShipping?: boolean;
  isLoading?: boolean;
}

export function CheckoutOrderSummary({
  items,
  subtotal,
  totalAmount,
  currencyCode,
  discountCodes,
  shippingRates = [],
  needsShipping = false,
  isLoading = false,
}: CheckoutOrderSummaryProps) {
  const { formatPrice } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const selectedShipping = getSelectedShippingRate(shippingRates);
  const shippingAmount = selectedShipping
    ? Number(fromMinorUnits(selectedShipping.price, selectedShipping.currency_minor_unit))
    : null;
  const taxAmount = selectedShipping
    ? Number(fromMinorUnits(selectedShipping.taxes || '0', selectedShipping.currency_minor_unit))
    : 0;
  const totalSavings = discountCodes.reduce((sum, coupon) => sum + coupon.discountTotal, 0);

  return (
    <>
      <section className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between border border-brand-dark/10 bg-white/70 px-5 py-4 text-left"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-brand-dark/45">View order summary</p>
            <p className="mt-2 text-lg font-heading uppercase tracking-tight text-brand-dark">
              {formatPrice(totalAmount, currencyCode)}
            </p>
          </div>
          <ChevronDown
            size={18}
            className={`text-brand-dark/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {isOpen ? (
          <div className="border border-t-0 border-brand-dark/10 bg-white/75 p-5">
            <SummaryContent
              items={items}
              subtotal={subtotal}
              totalAmount={totalAmount}
              currencyCode={currencyCode}
              discountCodes={discountCodes}
              selectedShipping={selectedShipping}
              shippingAmount={shippingAmount}
              taxAmount={taxAmount}
              totalSavings={totalSavings}
              needsShipping={needsShipping}
              isLoading={isLoading}
              formatPrice={formatPrice}
            />
          </div>
        ) : null}
      </section>

      <aside className="hidden h-fit border border-brand-dark/10 bg-white/70 p-8 lg:sticky lg:top-32 lg:block">
        <SummaryContent
          items={items}
          subtotal={subtotal}
          totalAmount={totalAmount}
          currencyCode={currencyCode}
          discountCodes={discountCodes}
          selectedShipping={selectedShipping}
          shippingAmount={shippingAmount}
          taxAmount={taxAmount}
          totalSavings={totalSavings}
          needsShipping={needsShipping}
          isLoading={isLoading}
          formatPrice={formatPrice}
        />
      </aside>
    </>
  );
}

interface SummaryContentProps {
  items: CartItem[];
  subtotal: number;
  totalAmount: number;
  currencyCode: string;
  discountCodes: CartData['discountCodes'];
  selectedShipping: SelectedShippingRate | null;
  shippingAmount: number | null;
  taxAmount: number;
  totalSavings: number;
  needsShipping: boolean;
  isLoading: boolean;
  formatPrice: (amount: string | number, fromCurrency?: string) => string;
}

function SummaryContent({
  items,
  subtotal,
  totalAmount,
  currencyCode,
  discountCodes,
  selectedShipping,
  shippingAmount,
  taxAmount,
  totalSavings,
  needsShipping,
  isLoading,
  formatPrice,
}: SummaryContentProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 border-b border-brand-dark/10 pb-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-dark/50">Order summary</p>
          <p className="mt-3 text-sm leading-7 text-brand-dark/60">
            Review the items in this payment session, then return to the bag for quantity changes.
          </p>
        </div>
        <Link
          href="/cart"
          className="shrink-0 text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary"
        >
          Edit cart
        </Link>
      </div>

      {isLoading ? (
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/45">Refreshing order summary…</p>
      ) : items.length === 0 ? (
        <p className="text-sm leading-7 text-brand-dark/60">
          Your bag is currently empty. Return to the cart to choose the pieces you want to check out.
        </p>
      ) : (
        <div className="space-y-5">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-4 border-b border-brand-dark/8 pb-5">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-brand-light">
                <Image
                  src={item.image || '/logo/Fab and Luxe Combined.png'}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-dark">{item.title}</p>
                    {item.selectedOptions.length > 0 ? (
                      <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-brand-dark/45">
                        {formatOptions(item.selectedOptions)}
                      </p>
                    ) : null}
                    <p className="mt-3 text-[10px] font-black uppercase tracking-[0.24em] text-brand-dark/45">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-dark">
                    {formatPrice(Number(item.price) * item.quantity, currencyCode)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4 border-t border-brand-dark/10 pt-6">
        <SummaryRow label="Subtotal" value={formatPrice(subtotal, currencyCode)} />
        {discountCodes.length > 0 ? (
          <SummaryRow
            label={`Discount (${discountCodes.map((coupon) => coupon.code).join(', ')})`}
            value={`-${formatPrice(totalSavings, currencyCode)}`}
            valueClassName="text-brand-primary"
          />
        ) : null}
        <SummaryRow
          label="Shipping"
          value={resolveShippingLabel(needsShipping, selectedShipping?.name || null, shippingAmount, currencyCode, formatPrice)}
        />
        {taxAmount > 0 ? (
          <SummaryRow label="Taxes" value={formatPrice(taxAmount, currencyCode)} />
        ) : null}
        <SummaryRow
          label="Final total"
          value={formatPrice(totalAmount, currencyCode)}
          labelClassName="text-brand-dark"
          valueClassName="text-lg text-brand-dark"
        />
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  labelClassName = 'text-brand-dark/50',
  valueClassName = 'text-brand-dark',
}: {
  label: string;
  value: string;
  labelClassName?: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${labelClassName}`}>{label}</span>
      <span className={`text-[11px] font-black uppercase tracking-[0.18em] text-right ${valueClassName}`}>{value}</span>
    </div>
  );
}

function formatOptions(options: CartItem['selectedOptions']) {
  return options.map((option) => `${option.name}: ${option.value}`).join(' / ');
}

type SelectedShippingRate = NonNullable<CartData['shippingRates']>[number]['shipping_rates'][number];

function getSelectedShippingRate(shippingRates: NonNullable<CartData['shippingRates']> = []): SelectedShippingRate | null {
  for (const packageRates of shippingRates) {
    const selected = packageRates.shipping_rates.find((rate) => rate.selected) || packageRates.shipping_rates[0];
    if (selected) {
      return selected;
    }
  }

  return null;
}

function resolveShippingLabel(
  needsShipping: boolean,
  shippingName: string | null,
  shippingAmount: number | null,
  currencyCode: string,
  formatPrice: (amount: string | number, fromCurrency?: string) => string,
) {
  if (!needsShipping) {
    return 'Not required';
  }

  if (shippingAmount === null) {
    return 'Calculated at checkout';
  }

  const amountLabel = shippingAmount <= 0 ? 'Complimentary' : formatPrice(shippingAmount, currencyCode);
  return shippingName ? `${shippingName} · ${amountLabel}` : amountLabel;
}
