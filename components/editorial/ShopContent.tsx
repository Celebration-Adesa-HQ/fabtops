'use client';

import * as React from 'react';
import { ProductCard } from './ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, Check, SlidersHorizontal } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  handle: string;
  title: string;
  productType: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: {
      node: {
        url: string;
        alt: string;
      };
    }[];
  };
  options: {
    name: string;
    values: string[];
  }[];
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        availableForSale: boolean;
        selectedOptions: {
          name: string;
          value: string;
        }[];
      };
    }[];
  };
}

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

interface ShopContentProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  heroImage?: string;
  isCollection?: boolean;
}

export function ShopContent({ 
  products: initialProducts, 
  title = "All Silhouettes", 
  subtitle = "Meticulously crafted silhouettes for the modern, evolving woman.",
  heroImage,
  isCollection = false
}: ShopContentProps) {
  const [products, setProducts] = React.useState(initialProducts);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [activeFilters, setActiveFilters] = React.useState<{ [key: string]: string[] }>({});
  const [sortBy, setSortBy] = React.useState('newest');

  // Extract all unique categories, sizes, and colors for filters
  const filterOptions = React.useMemo(() => {
    const categories = Array.from(new Set(initialProducts.map((p) => p.productType).filter(Boolean)));
    const sizes = new Set<string>();
    const colors = new Set<string>();

    initialProducts.forEach((product) => {
      product.options.forEach((option) => {
        if (option.name.toLowerCase() === 'size') option.values.forEach((v) => sizes.add(v));
        if (option.name.toLowerCase() === 'color') option.values.forEach((v) => colors.add(v));
      });
    });

    return [
      { name: 'Category', options: categories },
      { name: 'Size', options: Array.from(sizes) },
      { name: 'Color', options: Array.from(colors) },
    ];
  }, [initialProducts]);

  const toggleFilter = (category: string, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[category] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      
      return { ...prev, [category]: updated };
    });
  };

  const clearFilters = () => setActiveFilters({});

  // Filtering and Sorting Logic
  React.useEffect(() => {
    let filtered = [...initialProducts];

    // Apply filters
    Object.entries(activeFilters).forEach(([category, values]) => {
      if (values.length === 0) return;

      if (category === 'Category') {
        filtered = filtered.filter((p) => values.includes(p.productType));
      } else {
        filtered = filtered.filter((p) => 
          p.options.some((opt) => 
            opt.name.toLowerCase() === category.toLowerCase() && 
            opt.values.some((v) => values.includes(v))
          )
        );
      }
    });

    // Apply sorting
    filtered.sort((a, b) => {
      const priceA = parseFloat(a.priceRange.minVariantPrice.amount);
      const priceB = parseFloat(b.priceRange.minVariantPrice.amount);

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      return 0; // Default (newest - Shopify usually returns newest first by default in this query)
    });

    setProducts(filtered);
  }, [activeFilters, sortBy, initialProducts]);

  const totalActiveFilters = Object.values(activeFilters).flat().length;

  return (
    <div className="bg-brand-light min-h-screen pt-32 pb-20 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        {/* Hero Section if provided */}
        {heroImage && (
          <div className="relative w-full h-[40vh] mb-20 overflow-hidden">
            <img 
              src={heroImage} 
              alt={title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-brand-dark/20" />
            <div className="absolute inset-0 flex items-center justify-center text-center p-6">
              <div className="space-y-4">
                <h1 className="font-heading text-5xl md:text-8xl uppercase tracking-tighter text-brand-light leading-none">
                  {title}
                </h1>
                <p className="text-brand-light/80 text-sm md:text-base uppercase tracking-widest max-w-xl mx-auto">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <header className={cn("mb-12 space-y-6", heroImage && "hidden md:block")}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {!heroImage && (
              <div className="space-y-2">
                <h1 className="font-heading text-5xl md:text-7xl uppercase tracking-tighter text-brand-dark leading-none">
                  {title}
                </h1>
                <p className="text-brand-dark/60 text-sm max-w-md uppercase tracking-wide">
                  {subtitle}
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-6 py-3 border border-brand-dark/10 hover:border-brand-dark transition-colors text-[11px] uppercase tracking-widest font-bold md:hidden"
              >
                <SlidersHorizontal className="h-3 w-3" />
                Filter {totalActiveFilters > 0 && `(${totalActiveFilters})`}
              </button>

              <div className="relative group">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-transparent pl-6 pr-10 py-3 border border-brand-dark/10 hover:border-brand-dark transition-colors text-[11px] uppercase tracking-widest font-bold cursor-pointer focus:outline-none"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-brand-dark/10 pt-8">
            <span className="text-[11px] uppercase tracking-widest text-brand-dark/40 font-bold">
              {products.length} {products.length === 1 ? 'Piece' : 'Pieces'} Found
            </span>
            
            {totalActiveFilters > 0 && (
              <button 
                onClick={clearFilters}
                className="text-[10px] uppercase tracking-widest text-brand-primary font-bold hover:underline"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-12 sticky top-40 h-fit">
            <div className="space-y-4">
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] md:tracking-[0.6em] font-black text-brand-primary">
                Refine Your Selection
              </span>
              <div className="h-px w-full bg-brand-dark/5" />
            </div>

            {filterOptions.map((group) => (
              <div key={group.name} className="space-y-8">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-dark flex items-center justify-between">
                  {group.name}
                  {activeFilters[group.name]?.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                  )}
                </h3>
                <ul className="space-y-4">
                  {group.options.map((option) => (
                    <li key={option}>
                      <button
                        onClick={() => toggleFilter(group.name, option)}
                        className={cn(
                          "group flex items-center gap-4 text-xs tracking-wide transition-all duration-300 w-full text-left py-1",
                          activeFilters[group.name]?.includes(option) 
                            ? "text-brand-dark font-black translate-x-2" 
                            : "text-brand-dark/40 hover:text-brand-dark hover:translate-x-1"
                        )}
                      >
                        <div className={cn(
                          "h-5 w-5 rounded-lg border transition-all duration-500 flex items-center justify-center shadow-sm",
                          activeFilters[group.name]?.includes(option)
                            ? "border-brand-primary bg-brand-primary text-white shadow-brand-primary/20"
                            : "border-brand-dark/10 bg-white group-hover:border-brand-dark/30"
                        )}>
                          {activeFilters[group.name]?.includes(option) && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <span className="uppercase tracking-widest text-[10px] font-bold">{option}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="pt-8">
              <div className="bg-brand-dark/5 p-8 rounded-[2rem] space-y-4 border border-brand-dark/5">
                <h4 className="font-heading text-xl text-brand-dark uppercase">Personal Stylist</h4>
                <p className="text-[10px] text-brand-dark/60 leading-relaxed uppercase tracking-widest font-bold">
                  Need assistance finding the perfect silhouette for your body type?
                </p>
                <button className="text-[9px] uppercase tracking-[0.3em] font-black text-brand-primary hover:tracking-[0.4em] transition-all">
                  Contact Studio →
                </button>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-8 gap-y-16">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index % 3) * 0.1 }}
                  >
                    <ProductCard
                      id={product.id}
                      handle={product.handle}
                      title={product.title}
                      price={`₦${parseFloat(product.priceRange.minVariantPrice.amount).toLocaleString()}`}
                      image={product.images.edges[0]?.node.url || 'https://via.placeholder.com/600x800'}
                      secondaryImage={product.images.edges[1]?.node.url}
                      swatches={product.options.find(opt => opt.name.toLowerCase() === 'color')?.values}
                      variantId={product.variants.edges[0]?.node.id}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-40 text-center space-y-4">
                <p className="text-brand-dark/40 uppercase tracking-widest text-xs font-bold">No pieces match your selection</p>
                <button 
                  onClick={clearFilters}
                  className="px-8 py-4 bg-brand-dark text-brand-light text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-brand-primary transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Pieces"
      >
        <div className="space-y-10 pb-20">
          {filterOptions.map((group) => (group.options.length > 0 && (
            <div key={group.name} className="space-y-6">
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-dark/40">
                {group.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleFilter(group.name, option)}
                    className={cn(
                      "px-4 py-2 text-sm border transition-all",
                      activeFilters[group.name]?.includes(option)
                        ? "border-brand-primary bg-brand-primary text-white"
                        : "border-brand-dark/10 text-brand-dark/60"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )))}
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-brand-light border-t border-brand-dark/10 flex gap-4">
          <button
            onClick={clearFilters}
            className="flex-1 py-4 border border-brand-dark/10 text-[11px] uppercase tracking-widest font-bold"
          >
            Clear
          </button>
          <button
            onClick={() => setIsFilterOpen(false)}
            className="flex-1 py-4 bg-brand-dark text-white text-[11px] uppercase tracking-widest font-bold"
          >
            Show Results
          </button>
        </div>
      </Drawer>
    </div>
  );
}
