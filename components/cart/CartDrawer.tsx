'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from './CartProvider';
import { useAuth } from '@/lib/use-auth';
import { Drawer } from '@/components/ui/Drawer';
import { useCurrency } from '@/lib/currency-context';

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, removeFromCart, updateQuantity, subtotal, checkoutUrl } = useCart();
  const { formatPrice } = useCurrency();
  const { isAuthenticated } = useAuth();

  return (
    <Drawer
      isOpen={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      title="My Bag"
    >
      <div className="flex flex-col h-[calc(100vh-180px)]">
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center text-brand-dark/20">
              <ShoppingBag size={40} />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-widest font-bold text-brand-dark">Sign in to Shop</p>
              <p className="text-sm text-brand-dark/40 font-light">Please log in to your account to manage your shopping bag and access exclusive features.</p>
            </div>
            <Link
              href="/login"
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-brand-dark text-white text-[10px] uppercase tracking-[0.3em] font-bold py-5 hover:bg-brand-primary transition-all duration-500"
            >
              Sign In
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center text-brand-dark/20">
              <ShoppingBag size={40} />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-widest font-bold text-brand-dark">Your bag is empty</p>
              <p className="text-sm text-brand-dark/40 font-light">Explore our latest silhouettes to find your next statement piece.</p>
            </div>
            <Link
              href="/shop"
              onClick={() => setIsCartOpen(false)}
              className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-primary border-b border-brand-primary pb-1"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-8 overflow-y-auto pr-2">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-6 group"
                  >
                    <div className="relative w-24 aspect-editorial bg-brand-light shrink-0 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <Link 
                            href={`/product/${item.handle}`}
                            onClick={() => setIsCartOpen(false)}
                            className="text-xs uppercase tracking-widest font-bold text-brand-dark hover:text-brand-primary transition-colors"
                          >
                            {item.title}
                          </Link>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-brand-dark/20 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-medium">
                          {formatPrice(item.price, 'NGN')}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-brand-dark/10 px-2 py-1">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-1 hover:text-brand-primary transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-[10px] font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-brand-primary transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-brand-dark">
                          {formatPrice(parseFloat(item.price) * item.quantity, 'NGN')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="pt-8 space-y-6 border-t border-brand-dark/10 mt-auto">
              <div className="flex justify-between items-end">
                <span className="text-[11px] uppercase tracking-widest font-bold text-brand-dark/40">Subtotal</span>
                <span className="text-xl font-bold text-brand-dark">{formatPrice(subtotal, 'NGN')}</span>
              </div>
              <p className="text-[10px] text-brand-dark/40 italic">Shipping and taxes calculated at checkout.</p>
              
              <div className="space-y-3">
                <a
                  href={checkoutUrl || '#'}
                  className="w-full bg-brand-dark text-white text-[11px] uppercase tracking-[0.4em] font-black py-6 flex items-center justify-center gap-3 hover:bg-brand-primary transition-all duration-700 shadow-2xl shadow-brand-dark/20 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Secure Checkout via Paystack <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-brand-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </a>
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full border border-brand-dark text-brand-dark text-[11px] uppercase tracking-[0.3em] font-bold py-5 flex items-center justify-center hover:bg-brand-dark hover:text-white transition-all duration-500"
                >
                  View Full Bag
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}
