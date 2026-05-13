'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, Minus, Heart, Share2, Ruler, ShieldCheck, Truck, RefreshCw, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ProductCard } from './ProductCard';
import { useCart } from '@/components/cart/CartProvider';
import { useCurrency } from '@/lib/currency-context';
import { FavoriteButton } from './FavoriteButton';
import { SizeGuide } from './SizeGuide';

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
  const [isSizeGuideOpen, setIsSizeGuideOpen] = React.useState(false);
  
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const images = product.images.edges.map((edge: any) => edge.node);
  const price = product.priceRange.minVariantPrice.amount;
  const currencyCode = product.priceRange.minVariantPrice.currencyCode;

  // Prepare product object for FavoriteButton
  const productData = {
    id: product.id,
    variantId: product.variants.edges[0]?.node.id || '',
    title: product.title,
    handle: product.handle,
    price: price,
    currencyCode: currencyCode,
    imageUrl: images[0]?.url || '',
    imageAlt: product.title
  };

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
    }
  };

  return (
    <div className="bg-brand-light min-h-screen pt-32 pb-20">
      <SizeGuide isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
      
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
                    {idx === images.length - 1 && (
                      <div className="absolute inset-0 bg-brand-dark/20 flex items-center justify-center">
                        <Play size={16} className="text-white fill-current" />
                      </div>
                    )}
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
                
                {/* Visual Accent */}
                <div className="absolute top-8 left-8 mix-blend-difference pointer-events-none">
                  <span className="text-[10px] uppercase tracking-[0.5em] font-black text-white/40 rotate-90 origin-left block">
                    Heritage Collection
                  </span>
                </div>

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
          <div className="lg:col-span-5 lg:sticky lg:top-40 h-fit space-y-12">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-px w-8 bg-brand-primary" />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-primary">Digital Flagship</span>
                </div>
                <div className="flex gap-4">
                  <FavoriteButton product={productData} size="md" />
                  <button className="text-brand-dark/40 hover:text-brand-dark transition-colors">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl uppercase tracking-tighter text-brand-dark leading-[0.85]">
                {product.title}
              </h1>
              <div className="flex items-baseline gap-4">
                <p className="text-3xl font-medium text-brand-dark tracking-tight">
                  {formatPrice(price, currencyCode)}
                </p>
                <span className="text-[10px] uppercase tracking-widest font-bold text-brand-dark/40">Inclusive of VAT</span>
              </div>
            </div>

            <div className="w-full h-px bg-brand-dark/5" />

            {/* Selection Options */}
            <div className="space-y-10">
              {/* Color Selector */}
              {colors.length > 0 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <h3 className="text-[11px] uppercase tracking-widest font-black text-brand-dark/40">Colorway</h3>
                    <span className="text-[10px] uppercase tracking-widest font-black text-brand-dark">{selectedColor || 'Select Color'}</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "px-8 py-4 border text-[11px] uppercase tracking-widest font-black transition-all duration-500",
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
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-6">
                      <h3 className="text-[11px] uppercase tracking-widest font-black text-brand-dark/40">Silhouette Size</h3>
                      <button 
                        onClick={() => setIsSizeGuideOpen(true)}
                        className="text-[10px] uppercase tracking-widest font-black text-brand-primary flex items-center gap-2 border-b border-brand-primary/20 hover:border-brand-primary transition-all pb-1"
                      >
                        <Ruler size={12} /> Size Guide
                      </button>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-black text-brand-dark">{selectedSize || 'Select Size'}</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "w-16 h-16 border flex items-center justify-center text-xs font-black transition-all duration-500",
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
              <div className="pt-6 space-y-6">
                <div className="flex gap-4">
                  <div className="flex items-center border border-brand-dark/10 px-6 py-4">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:text-brand-primary transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center text-sm font-black">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:text-brand-primary transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={(!selectedSize && sizes.length > 0) || (!selectedColor && colors.length > 0)}
                    className="flex-1 bg-brand-dark text-white text-[11px] uppercase tracking-[0.4em] font-black py-6 px-10 hover:bg-brand-primary transition-all duration-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-brand-dark/10 group overflow-hidden relative"
                  >
                    <span className="relative z-10">Add to Bag</span>
                    <div className="absolute inset-0 bg-brand-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-brand-dark/5">
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-black text-brand-dark/40">
                    <Truck size={14} className="text-brand-primary" /> 
                    <span>Lagos & Global <br /> Shipping</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-black text-brand-dark/40">
                    <ShieldCheck size={14} className="text-brand-primary" /> 
                    <span>Secure Heritage <br /> Authenticity</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-brand-dark/10 pt-10">
              <div className="space-y-8">
                {[
                  { id: 'description', label: 'Artisan Fit & Details', content: product.description },
                  { id: 'fabric', label: 'Material & Care', content: 'Our garments are crafted from ethically sourced, premium fibers. For this specific piece, we recommend dry cleaning to preserve the editorial silhouette and fabric integrity.' },
                  { id: 'delivery', label: 'Concierge Delivery', content: 'Hand-packed in Lagos. Domestic shipping within 2-5 business days. International express shipping within 7-10 business days. Includes signature FabTops floral packaging.' }
                ].map((item) => (
                  <div key={item.id} className="space-y-6">
                    <button 
                      onClick={() => setActiveTab(activeTab === item.id ? '' : item.id)}
                      className="w-full flex items-center justify-between group"
                    >
                      <span className="text-[12px] uppercase tracking-[0.2em] font-black text-brand-dark group-hover:text-brand-primary transition-colors">
                        {item.label}
                      </span>
                      <Plus className={cn("h-4 w-4 text-brand-dark transition-transform duration-700", activeTab === item.id && "rotate-45")} />
                    </button>
                    <AnimatePresence>
                      {activeTab === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-brand-dark/60 leading-relaxed pb-8 font-medium">
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
          <section className="mt-40 pt-32 border-t border-brand-dark/10">
            <div className="space-y-16">
              <div className="text-center space-y-4">
                <span className="text-[11px] uppercase tracking-[0.5em] font-black text-brand-primary">The Lookbook</span>
                <h2 className="font-heading text-5xl md:text-6xl uppercase tracking-tighter text-brand-dark leading-none">Complete The Vision</h2>
                <p className="text-[11px] uppercase tracking-widest text-brand-dark/40 font-black">Editorial pairings curated by our stylists</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                {relatedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    handle={p.handle}
                    title={p.title}
                    amount={p.priceRange.minVariantPrice.amount}
                    currencyCode={p.priceRange.minVariantPrice.currencyCode}
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

