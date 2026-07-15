'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, TrendingUp, Sparkles, Clock, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCurrency } from '@/lib/currency-context';
import { fromMinorUnits } from '@/lib/woocommerce/store-api';
import { getEditorialImage } from '@/lib/content/editorial-images';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES = ['Minimal Tops', 'Summer Dresses', 'Silk Sets'];
const TRENDING_CATEGORIES = [
  { name: 'Signature Silhouettes', handle: 'tops' },
  { name: 'Evening Luxe', handle: 'dresses' },
  { name: 'The Archive', handle: 'archive' }
];
const featuredSearchImage = getEditorialImage('search-modal.featured-highlight');

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const { formatPrice } = useCurrency();

  // Debounced search logic
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const result = await res.json();
            if (result.success) {
              setResults(result.data || []);
            } else {
              setResults([]);
            }
          } else {
            setResults([]);
          }
        } catch (error) {
          console.error('Search failed:', error);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Lock scroll when open
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-dark/20 backdrop-blur-sm z-[60]"
          />

          {/* Modal content */}
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 overflow-y-auto bg-brand-secondary z-[70] pt-32 pb-20 px-6 md:px-12 shadow-2xl custom-scrollbar"
          >
            <div className="max-w-[1400px] mx-auto">
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-10 right-10 p-2 text-brand-dark/40 hover:text-brand-dark transition-colors"
              >
                <X size={32} strokeWidth={1} />
              </button>

              {/* Search Input Area */}
              <div className="relative mb-20 group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-dark/30 group-focus-within:text-brand-dark transition-colors" size={40} strokeWidth={1} />
                <input
                  autoFocus
                  type="text"
                  placeholder="WHAT ARE YOU LOOKING FOR?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-brand-dark/10 py-8 pl-16 pr-24 text-2xl md:text-5xl font-heading uppercase tracking-tighter text-brand-dark focus:outline-none focus:border-brand-dark transition-all placeholder:text-brand-dark/10"
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-4">
                  {isSearching && <Loader2 className="animate-spin text-brand-dark/40" size={24} />}
                  <AnimatePresence>
                    {query && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setQuery('')}
                        className="p-2 text-brand-dark/40 hover:text-brand-dark transition-colors"
                      >
                        <X size={24} strokeWidth={1.5} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Dynamic Results Grid */}
              <AnimatePresence mode="wait">
                {results.length > 0 ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8"
                  >
                    {results.map((product) => (
                      <Link 
                        key={product.id}
                        href={`/product/${product.handle}`}
                        onClick={onClose}
                        className="group space-y-4"
                      >
                        <div className="relative aspect-editorial overflow-hidden bg-brand-dark/5 rounded-lg">
                          <Image
                            src={product.gallery[0]?.url || '/logo/Fab and Luxe Combined.png'}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-[10px] uppercase font-bold tracking-widest text-brand-dark line-clamp-1">{product.title}</h4>
                          <p className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-widest">
                            {formatPrice(fromMinorUnits(product.price.amountMinor, product.price.minorUnit), product.price.currencyCode)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                ) : query.length >= 2 && !isSearching ? (
                  <motion.div 
                    key="no-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-20 text-center"
                  >
                    <p className="text-brand-dark/40 uppercase tracking-[0.4em] font-black italic">No silhouttes found for "{query}"</p>
                  </motion.div>
                ) : (
                  /* Initial Suggestions Grid */
                  <motion.div 
                    key="suggestions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-20"
                  >
                    {/* Recent Searches */}
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 text-brand-dark/40">
                        <Clock size={16} />
                        <span className="text-[11px] uppercase tracking-[0.3em] font-bold">Recent Discoveries</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {RECENT_SEARCHES.map((search) => (
                          <button 
                            key={search}
                            onClick={() => setQuery(search)}
                            className="px-6 py-3 bg-white/10 hover:bg-white/40 border border-brand-dark/5 text-[10px] uppercase tracking-widest font-black text-brand-dark transition-all rounded-full"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Trending */}
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 text-brand-dark/40">
                        <TrendingUp size={16} />
                        <span className="text-[11px] uppercase tracking-[0.3em] font-bold">Trending Now</span>
                      </div>
                      <div className="flex flex-col gap-4">
                        {TRENDING_CATEGORIES.map((cat) => (
                          <Link 
                            key={cat.handle}
                            href={`/collections/${cat.handle}`}
                            onClick={onClose}
                            className="group flex items-center justify-between text-lg font-bold uppercase tracking-widest text-brand-dark hover:text-brand-primary transition-colors"
                          >
                            {cat.name}
                            <ArrowRight size={16} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Featured Highlight */}
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 text-brand-dark/40">
                        <Sparkles size={16} />
                        <span className="text-[11px] uppercase tracking-[0.3em] font-bold">Curated Edit</span>
                      </div>
                      <Link 
                        href="/shop"
                        onClick={onClose}
                        className="group relative block aspect-[16/9] overflow-hidden bg-brand-dark/5 rounded-2xl"
                      >
                        <Image
                          src={featuredSearchImage.src}
                          alt={featuredSearchImage.alt}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
                          style={{ objectPosition: featuredSearchImage.objectPosition }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-transparent flex flex-col justify-end p-8">
                          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-white/60 mb-2">Editor's Choice</p>
                          <h4 className="text-xl font-heading text-white uppercase tracking-tight">The Modern Heritage Collection</h4>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
