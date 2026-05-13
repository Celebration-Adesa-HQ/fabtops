'use client';

import { useCart } from '@/components/cart/CartProvider';
import { useCurrency } from '@/lib/currency-context';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ChevronLeft, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, checkoutUrl } = useCart();
  const { formatPrice } = useCurrency();

  const subtotal = items.reduce(
    (acc, item) => acc + parseFloat(item.price) * item.quantity,
    0
  );

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

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 bg-white">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-lg"
        >
          <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center text-pink-600 mb-10 mx-auto">
            <ShoppingBag size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif-logo uppercase tracking-widest text-black mb-6">The Selection is Empty</h1>
          <p className="text-gray-500 mb-12 text-lg font-light leading-relaxed">
            Your shopping selection is currently unoccupied. Explore our curated collections to find your next statement piece.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-4 bg-pink-600 text-white px-10 py-6 text-xs uppercase tracking-[0.4em] font-black shadow-2xl shadow-pink-200 hover:bg-black transition-all group rounded-full"
          >
            Start Exploring
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <Link href="/shop" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black text-pink-600 mb-4 hover:translate-x-[-4px] transition-transform">
              <ChevronLeft size={14} />
              Continue Selection
            </Link>
            <h1 className="text-5xl md:text-7xl font-serif-logo uppercase tracking-tighter text-black">
              Shopping <span className="text-pink-600 italic">Bag</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-gray-400 mb-2">Total Items</p>
            <span className="text-2xl font-black">{items.length} {items.length === 1 ? 'Piece' : 'Pieces'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-10"
            >
              <AnimatePresence mode='popLayout'>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    exit={{ opacity: 0, x: -20 }}
                    layout
                    className="group relative bg-white rounded-[2rem] p-8 md:p-10 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col md:flex-row gap-10"
                  >
                    {/* Image Container */}
                    <div className="relative w-full md:w-48 aspect-[3/4] rounded-2xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <div className="max-w-[70%]">
                          <Link 
                            href={`/product/${item.handle}`}
                            className="text-xl font-serif-logo uppercase tracking-widest text-black hover:text-pink-600 transition-colors block mb-2 leading-tight"
                          >
                            {item.title}
                          </Link>
                          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                            Digital Flagship Exclusive
                          </p>
                        </div>
                        <p className="text-xl font-black text-black tracking-tighter">
                          {formatPrice(item.price, 'NGN')}
                        </p>
                      </div>

                      {/* Controls */}
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-6 pt-10 border-t border-gray-50">
                        <div className="flex items-center gap-6 bg-gray-50 p-2 rounded-full border border-gray-100">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors text-black disabled:opacity-30"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors text-black"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black text-gray-300 hover:text-pink-600 transition-colors cursor-pointer group/remove"
                        >
                          <Trash2 size={16} className="group-hover/remove:scale-110 transition-transform" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Extra Benefits */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Truck, title: "Complimentary Delivery", desc: "On all flagship orders" },
                { icon: ShieldCheck, title: "Secure Checkout", desc: "Fully encrypted processing" },
                { icon: RefreshCw, title: "Effortless Returns", desc: "14-day selection window" }
              ].map((benefit, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-pink-600 mb-6">
                    <benefit.icon size={20} />
                  </div>
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-black mb-2">{benefit.title}</h4>
                  <p className="text-xs text-gray-400 font-light">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              <div className="bg-black text-white rounded-[3rem] p-12 overflow-hidden relative shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-pink-600/20 blur-[50px] rounded-full" />
                
                <h2 className="text-2xl font-serif-logo uppercase tracking-[0.3em] mb-12 pb-6 border-b border-white/10">Order Summary</h2>
                
                <div className="space-y-8 mb-12">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.4em] font-black text-gray-500">Subtotal</span>
                    <span className="text-xl font-black">{formatPrice(subtotal.toString(), 'NGN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.4em] font-black text-gray-500">Delivery</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-pink-600">Complimentary</span>
                  </div>
                  <div className="pt-8 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs uppercase tracking-[0.5em] font-black">Estimated Total</span>
                    <span className="text-3xl font-black text-pink-600 tracking-tighter">
                      {formatPrice(subtotal.toString(), 'NGN')}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <a
                    href={checkoutUrl || '#'}
                    className="w-full bg-pink-600 text-white py-8 text-[11px] uppercase tracking-[0.5em] font-black hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4 shadow-xl shadow-pink-600/20 group"
                  >
                    Process Checkout
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                  <p className="text-[9px] text-gray-500 uppercase tracking-[0.3em] font-black text-center leading-relaxed">
                    By proceeding, you acknowledge the terms of heritage craftsmanship and elite delivery services.
                  </p>
                </div>
              </div>

              {/* Promo Section */}
              <div className="mt-8 bg-pink-50 rounded-[2rem] p-8 border border-pink-100/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-600 shadow-sm">
                    <ShoppingBag size={16} />
                  </div>
                  <div>
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-black">Member Privileges</h3>
                    <p className="text-[10px] text-pink-600 font-bold">Sign in for exclusive heritage pricing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}