'use client';

import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCurrency } from '@/lib/currency-context';

interface CartItem {
  id: string;
  title: string;
  price: number | string;
  quantity: number;
  image?: string;
  handle: string;
}

interface CartItemRowProps {
  item: CartItem;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  isLoading?: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function CartItemRow({ item, updateQuantity, removeFromCart, isLoading = false }: CartItemRowProps) {
  const { formatPrice } = useCurrency();

  return (
    <motion.div
      variants={itemVariants}
      exit={{ opacity: 0, x: -20 }}
      layout
      className={`group relative flex flex-col md:flex-row gap-10 pb-12 border-b border-brand-dark/10 transition-opacity duration-300 ${
        isLoading ? 'opacity-60 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Loading overlay pill */}
      {isLoading && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-brand-primary px-3 py-1.5 rounded-full shadow-sm">
          <Loader2 size={12} className="animate-spin" />
          <span className="text-[9px] uppercase tracking-widest font-black">Syncing…</span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative w-full md:w-56 aspect-[3/4] overflow-hidden bg-white/20 backdrop-blur-md shrink-0 rounded-2xl">
        {item.image && (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-[cubic-bezier(0.2,0,0,1)]"
            sizes="(max-width: 768px) 100vw, 224px"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-2">
            <Link 
              href={`/product/${item.handle}`}
              className="text-2xl md:text-3xl font-heading uppercase tracking-tight text-brand-dark hover:text-brand-primary transition-colors block leading-tight"
            >
              {item.title}
            </Link>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-dark/30">
              Signature Collection
            </p>
          </div>
          <p className="text-xl font-bold text-brand-dark tracking-tight">
            {formatPrice(item.price, 'NGN')}
          </p>
        </div>

        {/* Controls */}
        <div className="mt-auto flex items-center justify-between gap-6 pt-8">
          <div className="flex items-center gap-8 border border-brand-dark/10 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full">
            <button
              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
              className="text-brand-dark/40 hover:text-brand-dark transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              disabled={item.quantity <= 1 || isLoading}
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="text-[11px] font-bold w-4 text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="text-brand-dark/40 hover:text-brand-dark transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              disabled={isLoading}
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          <button 
            onClick={() => removeFromCart(item.id)}
            disabled={isLoading}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-dark/40 hover:text-brand-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed group/remove"
            aria-label="Remove item"
          >
            <Trash2 size={14} className="group-hover/remove:scale-110 transition-transform" />
            Remove
          </button>
        </div>
      </div>
    </motion.div>
  );
}
