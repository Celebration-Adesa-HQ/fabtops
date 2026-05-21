'use client';

import { motion } from 'framer-motion';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useFavorites } from '@/lib/favorites-context';

export function WishlistTab() {
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <motion.div
      key="wishlist"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-12"
    >
      <div className="flex justify-between items-end border-b border-brand-dark/10 pb-4 mb-12">
        <h3 className="text-xs uppercase tracking-[0.3em] font-black text-brand-dark">Styling Vault</h3>
        <span className="text-[9px] uppercase tracking-widest font-black text-brand-dark/40">{favorites.length} Items Archived</span>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {favorites.map((item) => (
            <div key={item.id} className="group relative bg-white/20 backdrop-blur-md border border-brand-dark/5 p-6 rounded-[2rem] flex gap-6 hover:border-brand-dark transition-all">
              <div className="relative w-32 aspect-[3/4] overflow-hidden rounded-xl bg-brand-dark/5 shrink-0">
                <Image 
                  src={item.imageUrl} 
                  alt={item.title} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              </div>
              <div className="flex flex-col justify-between py-2">
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-brand-dark mb-2 leading-tight">{item.title}</h4>
                  <p className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-widest">{item.currencyCode} {Number(item.price).toLocaleString()}</p>
                </div>
                <div className="flex gap-4 items-center">
                  <Link 
                    href={`/product/${item.handle}`}
                    className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-black text-brand-dark hover:text-brand-primary transition-colors"
                  >
                    View Piece <ArrowRight size={12} />
                  </Link>
                  <button 
                    onClick={() => toggleFavorite(item, true)}
                    className="text-brand-dark/20 hover:text-red-400 transition-colors p-1"
                    aria-label="Remove from Wishlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border-2 border-dashed border-brand-dark/10 rounded-[3rem] bg-white/10 backdrop-blur-sm">
           <Heart size={48} className="mx-auto text-brand-dark/10 mb-6" strokeWidth={1} />
           <p className="text-brand-dark/40 font-bold uppercase tracking-widest text-[11px] italic">Your styling vault is currently empty.</p>
           <Link href="/shop" className="mt-8 inline-block text-[10px] uppercase tracking-[0.4em] font-black text-brand-dark hover:text-brand-primary transition-colors underline underline-offset-8 decoration-brand-dark/10">Explore the Collection</Link>
        </div>
      )}
    </motion.div>
  );
}
