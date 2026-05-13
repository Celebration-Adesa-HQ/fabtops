'use client';

import { useFavorites } from '@/lib/favorites-context';
import { useAuth } from '@/lib/use-auth';
import { FavoriteButton } from '@/components/product/FavoriteButton';
import { useCurrency } from '@/lib/currency-context';
import { useCart } from '@/components/cart/CartProvider';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, ChevronRight, ArrowRight, Lock, Sparkles, Package, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const { favorites, count } = useFavorites();
  const { isAuthenticated, customer, loading } = useAuth();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = async (e: React.MouseEvent, variantId: string) => {
    e.preventDefault();
    await addToCart(variantId);
    confetti({ 
      particleCount: 100, 
      spread: 70, 
      origin: { y: 0.6 }, 
      colors: ['#ED99BB', '#F8ACAE', '#BF88BD'] 
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-40 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 rounded-full border-2 border-pink-200 border-t-pink-600 animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-gray-300">Synchronizing Collection…</p>
        </div>
      </div>
    );
  }

  // Unauthenticated gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md w-full"
        >
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center mx-auto mb-10 md:mb-12 relative">
            <Heart size={40} className="text-pink-300 md:size-48" strokeWidth={1.5} />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 md:w-10 md:h-10 bg-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-pink-200">
              <Lock size={14} className="text-white md:size-16" />
            </div>
          </div>
          <span className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] md:tracking-[0.6em] font-black text-pink-600 mb-4 md:mb-6 block">Secure Access</span>
          <h1 className="text-4xl md:text-5xl font-serif-logo text-gray-900 mb-6 leading-[0.9] uppercase tracking-tighter">
            Your Selection<br /><span className="italic text-pink-600">Vault</span>
          </h1>
          <p className="text-gray-400 font-light text-sm md:text-base leading-relaxed mb-10 md:mb-12">
            Please sign in to view your saved selection and proceed to a secure checkout experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login?redirect=/wishlist"
              className="inline-block px-10 md:px-12 py-4 md:py-5 bg-gray-900 text-white text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-black hover:bg-pink-600 transition-all duration-500 rounded-[2rem] shadow-xl shadow-gray-200"
            >
              Sign In to View
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Empty wishlist state
  if (count === 0) {
    return (
      <div className="min-h-screen bg-white pt-32 md:pt-40 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-gray-300 mb-12 md:mb-16">
            <Link href="/" className="hover:text-pink-600 transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span className="text-gray-900">Wishlist</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center pt-8 md:pt-16"
          >
            <div className="relative w-32 h-32 md:w-40 md:h-40 mb-12 md:mb-16">
              <div className="absolute inset-0 bg-pink-50 rounded-full" />
              <div className="absolute inset-4 bg-pink-100/50 rounded-full flex items-center justify-center backdrop-blur-md">
                <Heart size={48} className="text-pink-200 md:size-56" strokeWidth={1} />
              </div>
              <motion.div
                animate={{ y: [-4, 4, -4], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="absolute top-[20%] right-[-5%]"
              >
                <Sparkles size={12} className="text-pink-300 md:size-14" />
              </motion.div>
            </div>

            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] md:tracking-[0.6em] font-black text-pink-600 mb-4 md:mb-6 block">Selection is Empty</span>
            <h2 className="text-4xl md:text-7xl font-serif-logo text-gray-900 mb-6 md:mb-8 uppercase tracking-tighter leading-[0.85]">
              Begin Your<br /><span className="italic text-pink-600">Heritage Story</span>
            </h2>
            <Link
              href="/shop"
              className="inline-flex items-center gap-4 md:gap-6 group"
            >
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] font-black text-gray-900 group-hover:text-pink-600 transition-colors">
                Explore The Silhouettes
              </span>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white group-hover:border-pink-600 transition-all duration-500 shadow-lg shadow-pink-50/20">
                <ArrowRight size={18} className="md:size-20 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Filled wishlist
  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-40 px-5 md:px-8 lg:px-12 xl:px-24">
      <div className="max-w-[1440px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-gray-300 mb-10 md:mb-20">
          <Link href="/" className="hover:text-pink-600 transition-colors">Home</Link>
          <ChevronRight size={10} />
          <span className="text-gray-900">Wishlist</span>
        </nav>

        {/* Header Section with Liquid Glass feel */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24 gap-12 relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-pink-100/30 blur-[100px] rounded-full -z-10" />
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-8 h-px bg-pink-600" />
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] md:tracking-[0.6em] font-black text-pink-600">
                {customer?.firstName}'s Private Collection
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-serif-logo text-gray-900 uppercase tracking-tighter leading-[0.85]">
              My Wish<br /><span className="italic text-pink-600">List</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full md:w-auto"
          >
            <div className="bg-white/70 backdrop-blur-xl border border-pink-100/50 rounded-3xl p-6 md:p-8 flex items-center justify-between md:justify-start gap-8 shadow-2xl shadow-pink-200/10">
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-widest font-black text-gray-400 mb-2">Pieces Saved</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gray-900 tracking-tighter">{count}</span>
                  <Heart size={16} className="text-pink-600 fill-pink-600" />
                </div>
              </div>
              <div className="w-px h-12 bg-pink-100" />
              <Link
                href="/shop"
                className="group flex flex-col items-end"
              >
                <span className="text-[8px] uppercase tracking-widest font-black text-pink-600 mb-2 group-hover:translate-x-1 transition-transform">Explore More</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">Digital Catalog</span>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 lg:gap-x-12 gap-y-16 md:gap-y-24">
          <AnimatePresence mode="popLayout">
            {favorites.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group"
              >
                <Link href={`/product/${product.handle}`} className="block relative">
                  {/* Image Container with Liquid Glass feel */}
                  <div className="relative aspect-[3/4] mb-8 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-pink-50/30 border border-pink-100/30 group-hover:border-pink-200 transition-all duration-700 shadow-sm hover:shadow-2xl hover:shadow-pink-200/20">
                    <Image
                      src={product.imageUrl}
                      alt={product.imageAlt || product.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Actions on hover - Glassmorphism */}
                    <div className="absolute inset-x-0 bottom-0 p-6 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 z-10">
                      <button
                        onClick={(e) => handleAddToCart(e, product.variantId)}
                        className="flex items-center gap-3 bg-white/80 backdrop-blur-md text-gray-900 px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-pink-600 hover:text-white transition-all shadow-xl active:scale-95"
                      >
                        <ShoppingBag size={16} /> Quick Add
                      </button>

                      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-1 shadow-xl">
                        <FavoriteButton
                          product={product}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="px-2">
                    <div className="flex flex-col items-center text-center gap-2">
                      <span className="text-[8px] uppercase tracking-[0.5em] font-black text-gray-300">Silhouettes</span>
                      <h3 className="text-sm md:text-base font-serif-logo uppercase tracking-widest text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-pink-600 font-black text-sm md:text-base tracking-tighter">
                          {formatPrice(product.price, 'NGN')}
                        </p>
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-100" />
                        <span className="text-[9px] uppercase tracking-widest font-black text-gray-400">Available</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-32 pt-20 border-t border-pink-50 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mb-8 relative">
            <Sparkles size={24} className="text-pink-600" />
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute inset-0 bg-pink-200 rounded-full"
            />
          </div>
          <h4 className="text-xl md:text-2xl font-serif-logo uppercase tracking-tighter text-gray-900 mb-6">Complete The Vision</h4>
          <p className="text-gray-400 font-light text-sm max-w-sm mb-12 leading-relaxed">
            Every piece is designed to tell a story. Discover the perfect pairing in our digital showroom.
          </p>
          <Link
            href="/shop"
            className="px-12 py-6 bg-gray-900 text-white text-[10px] uppercase tracking-[0.5em] font-black hover:bg-pink-600 transition-all rounded-full shadow-2xl shadow-gray-200"
          >
            Explore Catalog
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
