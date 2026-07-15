'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronRight, ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/lib/currency-context';
import { useCart } from '@/components/cart/CartProvider';
import { FavoriteButton } from '@/components/editorial/FavoriteButton';
import confetti from 'canvas-confetti';

interface WishlistGridProps {
  favorites: any[];
  customer: any;
  count: number;
}

export function WishlistGrid({ favorites, customer, count }: WishlistGridProps) {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  const handleAddToCart = async (e: React.MouseEvent, variantId: string) => {
    e.preventDefault();
    try {
      await addToCart(variantId);
    } catch (error) {
      if (error instanceof Error && error.message === 'SESSION_EXPIRED') {
        router.push('/login?redirect=/wishlist');
        return;
      }
      throw error;
    }
    confetti({ 
      particleCount: 100, 
      spread: 70, 
      origin: { y: 0.6 }, 
      colors: ['#F8ACAE', '#ED99BB', '#BF88BD'] 
    });
  };

  return (
    <div className="min-h-screen bg-brand-light pt-24 md:pt-32 pb-40 px-5 md:px-8 lg:px-12 xl:px-24">
      <div className="max-w-[1440px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-brand-dark/30 mb-10 md:mb-20">
          <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
          <ChevronRight size={10} />
          <span className="text-brand-dark">Wishlist</span>
        </nav>

        {/* Header Section with Liquid Glass feel */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24 gap-12 relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full -z-10" />
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-8 h-px bg-brand-primary" />
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] md:tracking-[0.6em] font-black text-brand-primary">
                {customer?.firstName ? `${customer.firstName}'s Private Collection` : 'Your Private Collection'}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-heading text-brand-dark uppercase tracking-tighter leading-[0.85]">
              My Wish<br /><span className="italic opacity-50">List</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full md:w-auto"
          >
            <div className="bg-white/70 backdrop-blur-xl border border-brand-dark/5 rounded-3xl p-6 md:p-8 flex items-center justify-between md:justify-start gap-8 shadow-2xl shadow-brand-dark/5">
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-widest font-black text-brand-dark/40 mb-2">Pieces Saved</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-brand-dark tracking-tighter">{count}</span>
                  <Heart size={16} className="text-brand-primary fill-brand-primary" />
                </div>
              </div>
              <div className="w-px h-12 bg-brand-dark/5" />
              <Link
                href="/shop"
                className="group flex flex-col items-end"
              >
                <span className="text-[8px] uppercase tracking-widest font-black text-brand-primary mb-2 group-hover:translate-x-1 transition-transform">Explore More</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-dark">Digital Catalog</span>
                  <ChevronRight size={14} className="text-brand-dark/30" />
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
                <div className="block relative">
                  {/* Image Container with Liquid Glass feel */}
                  <div className="relative aspect-[3/4] mb-8 overflow-hidden bg-white border border-brand-dark/5 group-hover:border-brand-primary/20 transition-all duration-700 shadow-sm hover:shadow-2xl hover:shadow-brand-primary/5 rounded-[2.5rem]">
                    <Link href={`/product/${product.handle}`} className="block w-full h-full">
                      <Image
                        src={product.imageUrl}
                        alt={product.imageAlt || product.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </Link>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    {/* Actions on hover - Glassmorphism */}
                    <div className="absolute inset-x-0 bottom-0 p-6 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 z-10">
                      <button
                        onClick={(e) => handleAddToCart(e, product.variantId)}
                        className="flex items-center gap-3 bg-brand-light/90 backdrop-blur-md text-brand-dark px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-brand-dark hover:text-white transition-all shadow-xl active:scale-95"
                      >
                        <ShoppingBag size={16} /> Quick Add
                      </button>

                      <FavoriteButton
                        product={product}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Product Info */}
                  <Link href={`/product/${product.handle}`} className="px-2 block text-center md:text-left">
                    <div className="flex flex-col gap-2">
                      <span className="text-[8px] uppercase tracking-[0.5em] font-black text-brand-dark/30">Silhouettes</span>
                      <h3 className="text-sm md:text-base font-heading uppercase tracking-widest text-brand-dark group-hover:text-brand-primary transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 justify-center md:justify-start">
                        <p className="text-brand-primary font-black text-sm md:text-base tracking-tighter">
                          {formatPrice(product.price, 'NGN')}
                        </p>
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/20" />
                        <span className="text-[9px] uppercase tracking-widest font-black text-brand-dark/40">Available</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-32 pt-20 border-t border-brand-dark/5 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-8 relative">
            <Sparkles size={24} className="text-brand-primary" />
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute inset-0 bg-brand-primary/20 rounded-full"
            />
          </div>
          <h4 className="text-xl md:text-2xl font-heading uppercase tracking-tighter text-brand-dark mb-6">Complete The Vision</h4>
          <p className="text-brand-dark/60 font-light text-sm max-w-sm mb-12 leading-relaxed">
            Every piece is designed to tell a story. Discover the perfect pairing in our digital showroom.
          </p>
          <Link
            href="/shop"
            className="px-12 py-6 bg-brand-dark text-white text-[10px] uppercase tracking-[0.5em] font-black hover:bg-brand-primary hover:text-brand-dark transition-all rounded-full shadow-2xl shadow-brand-dark/5"
          >
            Explore Catalog
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
