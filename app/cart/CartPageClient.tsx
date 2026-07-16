'use client';

import { useCart } from '@/components/cart/CartProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import Link from 'next/link';

import { EmptyCart } from '@/components/cart/EmptyCart';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { CartSummaryCard } from '@/components/cart/CartSummaryCard';

export default function CartPageClient() {
  const { 
    items, 
    removeFromCart, 
    updateQuantity,
    isLoading
  } = useCart();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-brand-secondary pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="space-y-4">
            <Link href="/shop" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-brand-dark/75 hover:text-brand-dark transition-colors">
              <ChevronLeft size={12} />
              Continue Shopping
            </Link>
            <h1 className="text-5xl md:text-8xl font-heading uppercase tracking-tighter text-brand-dark leading-none">
              Your <span className="italic opacity-50">Selection</span>
            </h1>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-brand-dark/75 mb-1">Items in Bag</p>
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
                  <CartItemRow
                    key={item.id}
                    item={item}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                    isLoading={isLoading}
                  />
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
                  <p className="text-[11px] text-brand-dark/75 uppercase tracking-widest leading-loose font-bold">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-4">
            <CartSummaryCard />
          </div>
        </div>
      </div>
    </div>
  );
}
