'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useFavorites, FavoriteProduct } from '@/lib/favorites-context';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  product: FavoriteProduct;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteButton({ product, className, size = 'md' }: FavoriteButtonProps) {
  const { isFavorited, toggleFavorite } = useFavorites();
  
  const favorited = isFavorited(product.id);

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(product);
      }}
      className={cn(
        'relative rounded-full transition-colors duration-300',
        favorited ? 'bg-brand-primary/10 text-brand-primary' : 'bg-white/80 backdrop-blur-md text-brand-dark hover:text-brand-primary shadow-sm',
        sizeClasses[size],
        className
      )}
    >
      <Heart
        size={iconSizes[size]}
        className={cn('transition-all duration-300', favorited ? 'fill-brand-primary' : 'fill-none')}
        strokeWidth={1.5}
      />
      
      <AnimatePresence>
        {favorited && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 bg-brand-primary rounded-full -z-10"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}
