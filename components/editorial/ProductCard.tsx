'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCart } from '@/components/cart/CartProvider';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  handle: string;
  title: string;
  price: string;
  image: string;
  secondaryImage?: string;
  swatches?: string[];
  className?: string;
  variantId?: string;
}

export function ProductCard({ handle, title, price, image, secondaryImage, swatches, className, variantId }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = React.useState(false);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!variantId) return;
    
    setIsAdding(true);
    try {
      await addToCart(variantId, 1);
    } finally {
      setIsAdding(false);
    }
  };

  // Simple color mapping for common fashion colors
  const colorMap: Record<string, string> = {
    Black: '#000000',
    White: '#FFFFFF',
    Cream: '#F5F5DC',
    Beige: '#F5F5DC',
    Rose: '#F8ACAE',
    Pink: '#ED99BB',
    Mauve: '#BF88BD',
    Lavender: '#937FBE',
    Charcoal: '#3B3B44',
  };

  return (
    <Link href={`/product/${handle}`} className={cn('group block w-full', className)}>
      <div className="relative aspect-editorial overflow-hidden bg-brand-light">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {secondaryImage && (
          <Image
            src={secondaryImage}
            alt={`${title} - alternative view`}
            fill
            className="object-cover opacity-0 transition-all duration-[0.8s] ease-in-out group-hover:opacity-100 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-0 flex items-end justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <motion.button
            onClick={handleQuickAdd}
            disabled={isAdding}
            initial={{ y: 20 }}
            whileHover={{ scale: 1.02 }}
            className="w-full bg-brand-light/95 backdrop-blur-md py-4 text-[10px] uppercase tracking-[0.3em] font-bold text-brand-dark text-center border border-brand-dark/5 shadow-2xl flex items-center justify-center gap-3 group/btn"
          >
            {isAdding ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border border-brand-dark/20 border-t-brand-dark rounded-full animate-spin" />
                Adding...
              </span>
            ) : (
              <>
                <ShoppingBag size={14} className="group-hover/btn:text-brand-primary transition-colors" />
                Quick Add
              </>
            )}
          </motion.button>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-center md:text-left">
        <h3 className="font-heading text-xl md:text-2xl tracking-tight text-brand-dark group-hover:text-brand-primary transition-colors duration-300">
          {title}
        </h3>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <p className="text-[11px] uppercase tracking-widest font-bold text-brand-dark/40">
              {price}
            </p>
            {swatches && swatches.length > 0 && (
              <div className="flex items-center gap-1.5 justify-center md:justify-start">
                {swatches.slice(0, 4).map((color) => (
                  <div 
                    key={color}
                    className="w-2.5 h-2.5 rounded-full border border-brand-dark/10"
                    style={{ backgroundColor: colorMap[color] || '#E5E5E5' }}
                    title={color}
                  />
                ))}
                {swatches.length > 4 && (
                  <span className="text-[9px] text-brand-dark/40">+{swatches.length - 4}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-brand-primary font-bold opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
            View <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </Link>
  );
}
