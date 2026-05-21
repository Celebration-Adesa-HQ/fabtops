'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { useCart, getEnhancedCheckoutUrl } from './CartProvider';
import { useAuth } from '@/lib/use-auth';
import { Drawer } from '@/components/ui/Drawer';
import { useCurrency } from '@/lib/currency-context';

export function CartDrawer() {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    items, 
    removeFromCart, 
    updateQuantity, 
    subtotal, 
    totalAmount,
    discountCodes,
    applyDiscountCode,
    removeDiscountCode,
    checkoutUrl,
    isLoading
  } = useCart();
  const { formatPrice } = useCurrency();
  const { isAuthenticated } = useAuth();
  const [promoCode, setPromoCode] = React.useState('');
  const [isApplying, setIsApplying] = React.useState(false);
  
  const enhancedCheckoutUrl = getEnhancedCheckoutUrl(checkoutUrl, '/shop');

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode) return;
    setIsApplying(true);
    await applyDiscountCode(promoCode);
    setPromoCode('');
    setIsApplying(false);
  };

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
            <div className="relative flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
              {/* Sync overlay — appears while any cart operation is in flight */}
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
                  <Loader2 size={28} className="animate-spin text-brand-primary" />
                </div>
              )}

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
                            disabled={isLoading}
                            className="text-brand-dark/20 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Remove item"
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
                            disabled={isLoading}
                            className="p-1 hover:text-brand-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-[10px] font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isLoading}
                            className="p-1 hover:text-brand-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
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

              {/* Discount Section */}
              <div className="pt-8 border-t border-brand-dark/5 space-y-4">
                <form onSubmit={handleApplyDiscount} className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="PROMO CODE"
                    className="flex-1 bg-brand-light/50 border border-brand-dark/10 px-4 py-3 text-[10px] uppercase tracking-widest font-bold focus:outline-none focus:border-brand-primary transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={isApplying || !promoCode}
                    className="px-6 py-3 bg-brand-dark text-white text-[10px] uppercase tracking-widest font-black hover:bg-brand-primary disabled:opacity-50 transition-all"
                  >
                    {isApplying ? '...' : 'Apply'}
                  </button>
                </form>

                {discountCodes.map((dc) => (
                  <div key={dc.code} className="flex items-center justify-between bg-brand-primary/10 px-4 py-2 rounded-full border border-brand-primary/20">
                    <span className="text-[9px] uppercase tracking-widest font-black text-brand-primary">
                      {dc.code} {!dc.applicable && <span className="opacity-60">(Not Applicable)</span>}
                    </span>
                    <button 
                      onClick={() => removeDiscountCode(dc.code)}
                      className="text-brand-primary hover:text-brand-dark transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 space-y-6 border-t border-brand-dark/10 mt-auto">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-brand-dark/40">Subtotal</span>
                  <span className="text-sm font-bold text-brand-dark">{formatPrice(subtotal, 'NGN')}</span>
                </div>
                {subtotal !== totalAmount && (
                   <div className="flex justify-between items-end">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-brand-primary">Savings</span>
                    <span className="text-sm font-bold text-brand-primary">-{formatPrice(subtotal - totalAmount, 'NGN')}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-2 border-t border-brand-dark/5">
                  <span className="text-[11px] uppercase tracking-widest font-black text-brand-dark">Estimated Total</span>
                  <span className="text-xl font-black text-brand-dark">{formatPrice(totalAmount, 'NGN')}</span>
                </div>
              </div>

              <p className="text-[10px] text-brand-dark/40 italic">Shipping and taxes calculated at checkout.</p>
              
              <div className="space-y-3">
                <a
                  href={enhancedCheckoutUrl || '#'}
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
