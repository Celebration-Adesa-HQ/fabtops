'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';
import {
  buildNextShopQuery,
  serializeShopQuery,
  type NormalizedShopQuery,
} from '@/lib/shop/shop-query';
import { fromMinorUnits } from '@/lib/woocommerce/store-api';
import type { PaginatedStoreResult, StorefrontProduct } from '@/lib/woocommerce/types';
import type { StorefrontFilterOption, StorefrontFilters } from '@/lib/woocommerce/storefront';

const SORT_OPTIONS = [
  { label: 'Newest', orderby: 'date', order: 'desc' },
  { label: 'Price: Low to High', orderby: 'price', order: 'asc' },
  { label: 'Price: High to Low', orderby: 'price', order: 'desc' },
  { label: 'Top Rated', orderby: 'rating', order: 'desc' },
] as const;

interface ShopContentProps {
  result?: PaginatedStoreResult<StorefrontProduct>;
  filters?: StorefrontFilters;
  query: NormalizedShopQuery;
  basePath: string;
  title?: string;
  subtitle?: string;
  heroImage?: string;
  isCollection?: boolean;
  errorMessage?: string | null;
}

function filterIsActive(currentValue: string | undefined, optionValue: string) {
  return currentValue === optionValue;
}

function normalizePath(basePath: string, query: NormalizedShopQuery) {
  const serialized = serializeShopQuery(query);
  return serialized ? `${basePath}?${serialized}` : basePath;
}

function formatPriceInput(value?: number) {
  return value === undefined ? '' : String(value);
}

export function ShopContent({
  result,
  filters,
  query,
  basePath,
  title = 'All Silhouettes',
  subtitle = 'Meticulously crafted silhouettes for the modern, evolving woman.',
  heroImage,
  isCollection = false,
  errorMessage,
}: ShopContentProps) {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [draftSearch, setDraftSearch] = React.useState(query.search);
  const [draftMinPrice, setDraftMinPrice] = React.useState(formatPriceInput(query.minPrice));
  const [draftMaxPrice, setDraftMaxPrice] = React.useState(formatPriceInput(query.maxPrice));
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setDraftSearch(query.search);
    setDraftMinPrice(formatPriceInput(query.minPrice));
    setDraftMaxPrice(formatPriceInput(query.maxPrice));
  }, [query.search, query.minPrice, query.maxPrice]);

  const navigate = React.useCallback((patch: Partial<NormalizedShopQuery>) => {
    startTransition(() => {
      const nextQuery = buildNextShopQuery(query, patch);
      router.push(normalizePath(basePath, nextQuery), { scroll: false });
    });
  }, [basePath, query, router]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (draftSearch === query.search) return;
      navigate({ search: draftSearch.trim() });
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [draftSearch, navigate, query.search]);

  const products = result?.items || [];
  const totalResults = result?.total || 0;
  const activeChips = [
    !isCollection && query.category ? { label: 'Category', value: query.category, clear: () => navigate({ category: undefined }) } : null,
    query.size ? { label: 'Size', value: query.size, clear: () => navigate({ size: undefined }) } : null,
    query.stockStatus ? { label: 'Stock', value: query.stockStatus, clear: () => navigate({ stockStatus: undefined }) } : null,
    query.minPrice !== undefined || query.maxPrice !== undefined
      ? {
          label: 'Price',
          value: `${query.minPrice ?? 0} - ${query.maxPrice ?? 'Any'}`,
          clear: () => navigate({ minPrice: undefined, maxPrice: undefined }),
        }
      : null,
    query.search ? { label: 'Search', value: query.search, clear: () => navigate({ search: '' }) } : null,
  ].filter(Boolean) as Array<{ label: string; value: string; clear: () => void }>;

  const selectedSort = SORT_OPTIONS.find((option) => option.orderby === query.orderby && option.order === query.order) || SORT_OPTIONS[0];

  const applyDraftPrice = () => {
    navigate({
      minPrice: draftMinPrice ? Number(draftMinPrice) : undefined,
      maxPrice: draftMaxPrice ? Number(draftMaxPrice) : undefined,
    });
  };

  const renderFilterButton = (
    group: string,
    option: StorefrontFilterOption,
    active: boolean,
    onClick: () => void,
  ) => (
    <button
      key={`${group}-${option.value}`}
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-4 py-1 text-left text-xs tracking-wide transition-all duration-300',
        active ? 'translate-x-2 font-black text-brand-dark' : 'text-brand-dark/40 hover:translate-x-1 hover:text-brand-dark',
      )}
    >
      <div
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-lg border bg-white shadow-sm transition-all duration-500',
          active
            ? 'border-brand-primary bg-brand-primary text-white shadow-brand-primary/20'
            : 'border-brand-dark/10 group-hover:border-brand-dark/30',
        )}
      >
        {active && <Check className="h-3 w-3 stroke-[3]" />}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">
        {option.label}
        {typeof option.count === 'number' ? ` (${option.count})` : ''}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-brand-light px-6 pb-20 pt-32 md:px-12">
      <div className="mx-auto max-w-[1400px]">
        {heroImage && (
          <div className="relative mb-20 h-[40vh] w-full overflow-hidden">
            <Image src={heroImage} alt={title} fill className="object-cover" />
            <div className="absolute inset-0 bg-brand-dark/20" />
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <div className="space-y-4">
                <h1 className="font-heading text-5xl uppercase tracking-tighter text-brand-light leading-none md:text-8xl">
                  {title}
                </h1>
                <p className="mx-auto max-w-xl text-sm uppercase tracking-widest text-brand-light/80 md:text-base">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>
        )}

        <header className={cn('mb-12 space-y-6', heroImage && 'hidden md:block')}>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            {!heroImage && (
              <div className="space-y-2">
                <h1 className="font-heading text-5xl uppercase tracking-tighter text-brand-dark leading-none md:text-7xl">
                  {title}
                </h1>
                <p className="max-w-md text-sm uppercase tracking-wide text-brand-dark/60">
                  {subtitle}
                </p>
              </div>
            )}

            <div className="flex flex-1 flex-col gap-4 md:max-w-xl">
              <label className="flex items-center gap-3 border border-brand-dark/10 bg-white/50 px-4 py-3 text-[11px] uppercase tracking-widest text-brand-dark/45">
                <Search className="h-4 w-4" />
                <input
                  value={draftSearch}
                  onChange={(event) => setDraftSearch(event.target.value)}
                  placeholder="Search silhouettes"
                  className="w-full bg-transparent text-[11px] font-bold uppercase tracking-widest text-brand-dark placeholder:text-brand-dark/30 focus:outline-none"
                />
              </label>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="flex items-center gap-2 border border-brand-dark/10 px-6 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors hover:border-brand-dark md:hidden"
                >
                  <SlidersHorizontal className="h-3 w-3" />
                  Filter {activeChips.length > 0 && `(${activeChips.length})`}
                </button>

                <div className="relative group">
                  <select
                    value={`${selectedSort.orderby}:${selectedSort.order}`}
                    onChange={(event) => {
                      const [orderby, order] = event.target.value.split(':') as [NormalizedShopQuery['orderby'], NormalizedShopQuery['order']];
                      navigate({ orderby, order });
                    }}
                    className="cursor-pointer appearance-none border border-brand-dark/10 bg-transparent py-3 pl-6 pr-10 text-[11px] font-bold uppercase tracking-widest transition-colors hover:border-brand-dark focus:outline-none"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={`${option.orderby}:${option.order}`} value={`${option.orderby}:${option.order}`}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-brand-dark/10 pt-8">
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/40">
              {totalResults} {totalResults === 1 ? 'Piece' : 'Pieces'} Found
            </span>
            {activeChips.length > 0 && (
              <button
                onClick={() => navigate({ category: undefined, size: undefined, stockStatus: undefined, minPrice: undefined, maxPrice: undefined, search: '' })}
                className="text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>

          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {activeChips.map((chip) => (
                <button
                  key={`${chip.label}:${chip.value}`}
                  onClick={chip.clear}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-dark/10 bg-white/60 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-brand-dark"
                >
                  <span>{chip.label}: {chip.value}</span>
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}

          {!isCollection && !!filters?.categories.length && (
            <div className="no-scrollbar -mx-6 flex items-center gap-4 overflow-x-auto px-6 pb-4 pt-4 md:mx-0 md:px-0">
              {filters.categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => navigate({ category: filterIsActive(query.category, category.value) ? undefined : category.value })}
                  className={cn(
                    'whitespace-nowrap rounded-full border px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-500',
                    filterIsActive(query.category, category.value)
                      ? 'border-brand-dark bg-brand-dark text-white shadow-xl shadow-brand-dark/20'
                      : 'border-brand-dark/5 bg-white/40 text-brand-dark/40 hover:border-brand-dark/20 hover:text-brand-dark',
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </header>

        <div className="flex flex-col gap-12 lg:flex-row lg:gap-20">
          <aside className="sticky top-40 hidden h-fit w-72 shrink-0 space-y-12 lg:block">
            <div className="space-y-4">
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-brand-primary md:text-[10px] md:tracking-[0.6em]">
                Refine Your Selection
              </span>
              <div className="h-px w-full bg-brand-dark/5" />
            </div>

            {!isCollection && !!filters?.categories.length && (
              <div className="space-y-8">
                <h3 className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark">
                  Category
                  {query.category && <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />}
                </h3>
                <ul className="space-y-4">
                  {filters.categories.map((option) => (
                    <li key={option.value}>
                      {renderFilterButton('category', option, filterIsActive(query.category, option.value), () =>
                        navigate({ category: filterIsActive(query.category, option.value) ? undefined : option.value }))}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!!filters?.sizes.length && (
              <div className="space-y-8">
                <h3 className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark">
                  Size
                  {query.size && <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />}
                </h3>
                <ul className="space-y-4">
                  {filters.sizes.map((option) => (
                    <li key={option.value}>
                      {renderFilterButton('size', option, filterIsActive(query.size, option.value), () =>
                        navigate({ size: filterIsActive(query.size, option.value) ? undefined : option.value }))}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-8">
              <h3 className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark">
                Stock
                {query.stockStatus && <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />}
              </h3>
              <ul className="space-y-4">
                {filters?.stockStatuses.map((option) => (
                  <li key={option.value}>
                    {renderFilterButton('stock', option, filterIsActive(query.stockStatus, option.value), () =>
                      navigate({ stockStatus: filterIsActive(query.stockStatus, option.value) ? undefined : option.value as NormalizedShopQuery['stockStatus'] }))}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5 rounded-[2rem] border border-brand-dark/5 bg-brand-dark/5 p-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark">Price Range</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={draftMinPrice}
                  onChange={(event) => setDraftMinPrice(event.target.value)}
                  placeholder="Min"
                  className="border border-brand-dark/10 bg-white/70 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-brand-dark placeholder:text-brand-dark/25 focus:outline-none"
                />
                <input
                  value={draftMaxPrice}
                  onChange={(event) => setDraftMaxPrice(event.target.value)}
                  placeholder="Max"
                  className="border border-brand-dark/10 bg-white/70 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-brand-dark placeholder:text-brand-dark/25 focus:outline-none"
                />
              </div>
              {filters?.priceRange && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">
                  Range {fromMinorUnits(String(Math.round(filters.priceRange.min * 100)), filters.priceRange.minorUnit)} to {fromMinorUnits(String(Math.round(filters.priceRange.max * 100)), filters.priceRange.minorUnit)} {filters.priceRange.currencyCode}
                </p>
              )}
              <button
                onClick={applyDraftPrice}
                className="w-full bg-brand-dark px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-colors hover:bg-brand-primary"
              >
                Apply Price
              </button>
            </div>
          </aside>

          <div className="flex-1">
            {errorMessage ? (
              <div className="space-y-4 py-32 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">
                  We couldn&apos;t load the catalogue right now.
                </p>
                <p className="mx-auto max-w-xl text-sm text-brand-dark/55">{errorMessage}</p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={cn('grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3', isPending && 'opacity-70')}>
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (index % 3) * 0.08 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>

                {result && result.totalPages > 1 && (
                  <div className="mt-16 flex flex-col items-center gap-5 border-t border-brand-dark/10 pt-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-dark/35">
                      Page {result.currentPage} of {result.totalPages}
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate({ page: Math.max(1, result.currentPage - 1) })}
                        disabled={!result.hasPrevPage}
                        className="border border-brand-dark/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark transition-colors hover:border-brand-dark disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => navigate({ page: result.currentPage + 1 })}
                        disabled={!result.hasNextPage}
                        className="border border-brand-dark/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark transition-colors hover:border-brand-dark disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4 py-40 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">
                  No pieces match your current selection
                </p>
                <button
                  onClick={() => navigate({ category: undefined, size: undefined, stockStatus: undefined, minPrice: undefined, maxPrice: undefined, search: '' })}
                  className="bg-brand-dark px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-light transition-colors hover:bg-brand-primary"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Pieces">
        <div className="space-y-10 pb-24">
          {!isCollection && !!filters?.categories.length && (
            <div className="space-y-6">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-dark/40">Category</h3>
              <div className="flex flex-wrap gap-2">
                {filters.categories.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => navigate({ category: filterIsActive(query.category, option.value) ? undefined : option.value })}
                    className={cn(
                      'border px-4 py-2 text-sm transition-all',
                      filterIsActive(query.category, option.value)
                        ? 'border-brand-primary bg-brand-primary text-white'
                        : 'border-brand-dark/10 text-brand-dark/60',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!!filters?.sizes.length && (
            <div className="space-y-6">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-dark/40">Size</h3>
              <div className="flex flex-wrap gap-2">
                {filters.sizes.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => navigate({ size: filterIsActive(query.size, option.value) ? undefined : option.value })}
                    className={cn(
                      'border px-4 py-2 text-sm transition-all',
                      filterIsActive(query.size, option.value)
                        ? 'border-brand-primary bg-brand-primary text-white'
                        : 'border-brand-dark/10 text-brand-dark/60',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-dark/40">Stock</h3>
            <div className="flex flex-wrap gap-2">
              {filters?.stockStatuses.map((option) => (
                <button
                  key={option.value}
                  onClick={() => navigate({ stockStatus: filterIsActive(query.stockStatus, option.value) ? undefined : option.value as NormalizedShopQuery['stockStatus'] })}
                  className={cn(
                    'border px-4 py-2 text-sm transition-all',
                    filterIsActive(query.stockStatus, option.value)
                      ? 'border-brand-primary bg-brand-primary text-white'
                      : 'border-brand-dark/10 text-brand-dark/60',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 flex gap-4 border-t border-brand-dark/10 bg-brand-light p-6">
          <button
            onClick={() => navigate({ category: undefined, size: undefined, stockStatus: undefined, minPrice: undefined, maxPrice: undefined, search: '' })}
            className="flex-1 border border-brand-dark/10 py-4 text-[11px] font-bold uppercase tracking-widest"
          >
            Clear
          </button>
          <button
            onClick={() => setIsFilterOpen(false)}
            className="flex-1 bg-brand-dark py-4 text-[11px] font-bold uppercase tracking-widest text-white"
          >
            Show Results
          </button>
        </div>
      </Drawer>
    </div>
  );
}
