'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, Minus, Heart, Share2, Ruler, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ProductCard } from './ProductCard';
import { useCart } from '@/components/cart/CartProvider';
import { useCurrency } from '@/lib/currency-context';

interface ProductViewProps {
  product: any;
  relatedProducts: any[];
}

export function ProductView({ product, relatedProducts }: ProductViewProps) {
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [selectedSize, setSelectedSize] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState('');
  const [quantity, setQuantity] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState('description');
  
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const images = product.images.edges.map((edge: any) => edge.node);
  const price = product.priceRange.minVariantPrice.amount;
  const currencyCode = product.priceRange.minVariantPrice.currencyCode;

  // Extract sizes and colors
  const sizes = product.options.find((opt: any) => opt.name.toLowerCase() === 'size')?.values || [];
  const colors = product.options.find((opt: any) => opt.name.toLowerCase() === 'color')?.values || [];

  const handleAddToCart = async () => {
    // Find matching variant
    const variant = product.variants.edges.find((v: any) => {
      const options = v.node.selectedOptions;
      const sizeMatch = !sizes.length || options.some((o: any) => o.name.toLowerCase() === 'size' && o.value === selectedSize);
      const colorMatch = !colors.length || options.some((o: any) => o.name.toLowerCase() === 'color' && o.value === selectedColor);
      return sizeMatch && colorMatch;
    });

    if (variant) {
      await addToCart(variant.node.id, quantity);
      // In a real app, show a toast or open cart drawer here
    }
  };

  return (
    <div className="bg-brand-light min-h-screen pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-dark/40 mb-12">
          <a href="/shop" className="hover:text-brand-primary transition-colors">Shop</a>
          <ChevronRight size={10} />
          <span className="text-brand-dark">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Desktop Thumbnails */}
              <div className="hidden md:flex flex-col gap-4 w-24 shrink-0">
                {images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "relative aspect-[3/4] overflow-hidden border transition-all duration-500",
                      selectedImage === idx ? "border-brand-dark" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || product.title}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Main Image View */}
              <div className="flex-1 relative aspect-editorial bg-white overflow-hidden group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={images[selectedImage]?.url || 'https://via.placeholder.com/1200x1500'}
                      alt={product.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                    />
                  </motion.div>
                </AnimatePresence>
                
                {/* Mobile dots */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 md:hidden">
                  {images.map((_: any, idx: number) => (
                    <div 
                      key={idx}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-300",
                        selectedImage === idx ? "bg-brand-dark w-4" : "bg-brand-dark/20"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Info Panel */}
          <div className="lg:col-span-5 lg:sticky lg:top-40 h-fit space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-brand-primary" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-primary">Digital Flagship</span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter text-brand-dark leading-none">
                {product.title}
              </h1>
              <p className="text-2xl font-medium text-brand-dark/80 tracking-tight">
                {formatPrice(price, currencyCode)}
              </p>
            </div>

            {/* Selection Options */}
            <div className="space-y-8">
              {/* Color Selector */}
              {colors.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <h3 className="text-[11px] uppercase tracking-widest font-bold text-brand-dark/40">Color</h3>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-brand-dark">{selectedColor || 'Select Color'}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "px-6 py-3 border text-[11px] uppercase tracking-widest font-bold transition-all duration-300",
                          selectedColor === color 
                            ? "bg-brand-dark text-white border-brand-dark" 
                            : "border-brand-dark/10 hover:border-brand-dark/40 text-brand-dark/60"
                        )}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {sizes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[11px] uppercase tracking-widest font-bold text-brand-dark/40">Size</h3>
                      <button className="text-[10px] uppercase tracking-widest font-bold text-brand-primary flex items-center gap-1.5 ml-4">
                        <Ruler size={12} /> Size Guide
                      </button>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-brand-dark">{selectedSize || 'Select Size'}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "w-14 h-14 border flex items-center justify-center text-[11px] font-bold transition-all duration-300",
                          selectedSize === size 
                            ? "bg-brand-dark text-white border-brand-dark" 
                            : "border-brand-dark/10 hover:border-brand-dark/40 text-brand-dark/60"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and CTA */}
              <div className="pt-4 space-y-4">
                <div className="flex gap-4">
                  <div className="flex items-center border border-brand-dark/10 px-4 py-2">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:text-brand-primary transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:text-brand-primary transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={(!selectedSize && sizes.length > 0) || (!selectedColor && colors.length > 0)}
                    className="flex-1 bg-brand-dark text-white text-[11px] uppercase tracking-[0.3em] font-bold py-5 px-8 hover:bg-brand-primary transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-dark/5"
                  >
                    Add to Bag
                  </button>
                  <button className="p-5 border border-brand-dark/10 hover:border-brand-dark transition-colors group">
                    <Heart size={20} className="group-hover:fill-brand-primary group-hover:text-brand-primary transition-all" />
                  </button>
                </div>
                
                <div className="flex items-center justify-center gap-8 pt-4">
                  <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-brand-dark/40">
                    <Truck size={14} /> Complimentary Shipping
                  </div>
                  <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-brand-dark/40">
                    <RefreshCw size={14} /> 14-Day Returns
                  </div>
                </div>
              </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-brand-dark/10 pt-10">
              <div className="space-y-6">
                {[
                  { id: 'description', label: 'Fit & Details', content: product.description },
                  { id: 'fabric', label: 'Fabric & Care', content: 'Premium craftsmanship using only the finest sourced materials. Dry clean highly recommended for heritage longevity.' },
                  { id: 'delivery', label: 'Delivery', content: 'Hand-packed in our signature floral packaging. Domestic shipping (Nigeria) within 2-5 business days. International shipping within 7-14 business days.' }
                ].map((item) => (
                  <div key={item.id} className="space-y-4">
                    <button 
                      onClick={() => setActiveTab(activeTab === item.id ? '' : item.id)}
                      className="w-full flex items-center justify-between group"
                    >
                      <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-dark group-hover:text-brand-primary transition-colors">
                        {item.label}
                      </span>
                      <Plus className={cn("h-4 w-4 text-brand-dark transition-transform duration-500", activeTab === item.id && "rotate-45")} />
                    </button>
                    <AnimatePresence>
                      {activeTab === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-brand-dark/60 leading-relaxed pb-6">
                            {item.content}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Styled With / Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-32 pt-20 border-t border-brand-dark/10">
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="font-heading text-4xl uppercase tracking-tighter text-brand-dark">Complete The Vision</h2>
                <p className="text-[11px] uppercase tracking-widest text-brand-dark/40 font-bold">Recommended pairings for this silhouette</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    handle={p.handle}
                    title={p.title}
                    price={`₦${parseFloat(p.priceRange.minVariantPrice.amount).toLocaleString()}`}
                    image={p.images.edges[0]?.node.url}
                    secondaryImage={p.images.edges[1]?.node.url}
                    swatches={p.options.find((opt: any) => opt.name.toLowerCase() === 'color')?.values}
                    variantId={p.variants.edges[0]?.node.id}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
