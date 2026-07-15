'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCurrency } from '@/lib/currency-context';
import { fromMinorUnits } from '@/lib/woocommerce/store-api';
import type { StorefrontProduct } from '@/lib/woocommerce/types';

interface RecentlyViewedItem {
  id: string;
  handle: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  amountMinor: string;
  currencyCode: string;
  minorUnit: number;
}

const STORAGE_KEY = 'fabtops_recently_viewed';

export function RecentlyViewedRail({ product }: { product: StorefrontProduct }) {
  const { formatPrice } = useCurrency();
  const [items, setItems] = React.useState<RecentlyViewedItem[]>([]);

  React.useEffect(() => {
    const nextItem: RecentlyViewedItem = {
      id: product.id,
      handle: product.handle,
      title: product.title,
      imageUrl: product.gallery[0]?.url || '/logo/Fab and Luxe Combined.png',
      imageAlt: product.gallery[0]?.altText || product.title,
      amountMinor: product.price.amountMinor,
      currencyCode: product.price.currencyCode,
      minorUnit: product.price.minorUnit,
    };

    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') as RecentlyViewedItem[];
    const next = [nextItem, ...parsed.filter((item) => item.id !== nextItem.id)].slice(0, 8);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setItems(next.filter((item) => item.id !== nextItem.id).slice(0, 4));
  }, [product]);

  if (!items.length) return null;

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-brand-primary">Recently viewed</p>
        <h2 className="font-heading text-4xl uppercase leading-[0.9] tracking-[-0.04em] text-brand-dark md:text-5xl">
          Return to pieces you considered earlier.
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.handle}`}
            className="group overflow-hidden rounded-[1.5rem] border border-brand-dark/8 bg-white"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={item.imageUrl}
                alt={item.imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="space-y-3 p-4">
              <h3 className="font-heading text-2xl tracking-tight text-brand-dark">{item.title}</h3>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-dark/55">
                {formatPrice(fromMinorUnits(item.amountMinor, item.minorUnit), item.currencyCode)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
