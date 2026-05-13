'use client';

import { useCart } from '@/components/cart/CartProvider';
import { useAuth } from '@/lib/use-auth';
import { useCurrency } from '@/lib/currency-context';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ChevronLeft, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, checkoutUrl, subtotal } = useCart();
  const { formatPrice } = useCurrency();
  const { isAuthenticated } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-brand-secondary">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-lg"
        >
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md border border-brand-dark/5 rounded-full flex items-center justify-center text-brand-dark mb-10 mx-auto">
            <ShoppingBag size={40} strokeWidth={1} />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading uppercase tracking-tighter text-brand-dark mb-6">Sign in to Shop</h1>
          <p className="text-brand-dark/60 mb-12 text-sm uppercase tracking-widest leading-relaxed font-bold">
            Please log in to your account to access your bag and continue your premium discovery.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-4 bg-brand-dark text-white px-10 py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-brand-primary transition-all duration-500 group shadow-2xl shadow-brand-dark/10"
          >
            Sign In Now
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-brand-secondary">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-lg"
        >
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md border border-brand-dark/5 rounded-full flex items-center justify-center text-brand-dark mb-10 mx-auto">
            <ShoppingBag size={40} strokeWidth={1} />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading uppercase tracking-tighter text-brand-dark mb-6">Your Bag is Empty</h1>
          <p className="text-brand-dark/60 mb-12 text-sm uppercase tracking-widest leading-relaxed font-bold">
            Meticulously crafted silhouettes are waiting to be discovered.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-4 bg-brand-dark text-white px-10 py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-brand-primary transition-all duration-500 group shadow-2xl shadow-brand-dark/10"
          >
            Explore Collections
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-secondary pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="space-y-4">
            <Link href="/shop" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-brand-dark/40 hover:text-brand-dark transition-colors">
              <ChevronLeft size={12} />
              Continue Shopping
            </Link>
            <h1 className="text-5xl md:text-8xl font-heading uppercase tracking-tighter text-brand-dark leading-none">
              Your <span className="italic opacity-50">Selection</span>
            </h1>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-brand-dark/40 mb-1">Items in Bag</p>
            <span className="text-3xl font-heading text-brand-dark">{items.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-12"
            >
              <AnimatePresence mode='popLayout'>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    exit={{ opacity: 0, x: -20 }}
                    layout
                    className="group relative flex flex-col md:flex-row gap-10 pb-12 border-b border-brand-dark/10"
                  >
                    {/* Image Container */}
                    <div className="relative w-full md:w-56 aspect-editorial overflow-hidden bg-white/20 backdrop-blur-md shrink-0">
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
                            className="text-brand-dark/40 hover:text-brand-dark transition-colors disabled:opacity-10"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-[11px] font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-brand-dark/40 hover:text-brand-dark transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-dark/40 hover:text-brand-primary transition-colors group/remove"
                        >
                          <Trash2 size={14} className="group-hover/remove:scale-110 transition-transform" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Service Benefits */}
            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { icon: Truck, title: "Elite Shipping", desc: "Complimentary on all orders" },
                { icon: ShieldCheck, title: "Secure Checkout", desc: "Encrypted payment processing" },
                { icon: RefreshCw, title: "Simple Exchange", desc: "14-day discovery window" }
              ].map((benefit, i) => (
                <div key={i} className="space-y-4">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md border border-brand-dark/5 rounded-full flex items-center justify-center text-brand-dark">
                    <benefit.icon size={16} strokeWidth={1.5} />
                  </div>
                  <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-dark">{benefit.title}</h4>
                  <p className="text-[11px] text-brand-dark/40 uppercase tracking-widest leading-loose font-bold">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-40 bg-white/30 backdrop-blur-xl border border-white/40 p-10 md:p-12 space-y-12 rounded-[2.5rem] shadow-2xl shadow-brand-dark/5">
              <h2 className="text-2xl font-heading uppercase tracking-tight text-brand-dark pb-8 border-b border-brand-dark/10">
                Summary
              </h2>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-dark/40">Subtotal</span>
                  <span className="text-lg font-bold text-brand-dark">{formatPrice(subtotal, 'NGN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-dark/40">Shipping</span>
                  <span className="text-[11px] uppercase tracking-[0.1em] font-bold text-brand-dark italic opacity-60">Complimentary</span>
                </div>
                <div className="pt-8 border-t border-brand-dark/10 flex justify-between items-end">
                  <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-brand-dark">Total</span>
                  <div className="text-right">
                    <span className="text-4xl font-heading text-brand-dark tracking-tighter">
                      {formatPrice(subtotal, 'NGN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <a
                  href={checkoutUrl || '#'}
                  className="w-full bg-brand-dark text-white py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-brand-primary transition-all duration-500 flex items-center justify-center gap-4 group shadow-2xl shadow-brand-dark/20"
                >
                  Process Checkout
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <p className="text-[9px] text-brand-dark/30 uppercase tracking-[0.2em] text-center leading-relaxed font-black">
                  Shipping and taxes calculated at handoff.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}