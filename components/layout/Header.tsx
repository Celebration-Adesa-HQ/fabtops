'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Menu } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { scrollY } = useScroll();
  
  const headerBg = useTransform(
    scrollY,
    [0, 50],
    ['rgba(249, 235, 232, 0)', 'rgba(249, 235, 232, 0.95)']
  );

  const headerBorder = useTransform(
    scrollY,
    [0, 50],
    ['rgba(59, 59, 68, 0)', 'rgba(59, 59, 68, 0.1)']
  );

  const headerPadding = useTransform(
    scrollY,
    [0, 50],
    ['2.5rem', '1.25rem']
  );

  return (
    <motion.header
      style={{ backgroundColor: headerBg, borderBottomColor: headerBorder, paddingTop: headerPadding, paddingBottom: headerPadding }}
      className="fixed top-0 left-0 right-0 z-40 px-6 md:px-12 transition-all duration-300 border-b flex items-center justify-between"
    >
      <div className="flex items-center gap-6">
        <button className="md:hidden text-brand-dark">
          <Menu className="h-6 w-6" />
        </button>
        <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-dark">
          <Link href="/shop" className="hover:text-brand-primary transition-colors">Shop</Link>
          <Link href="/collections" className="hover:text-brand-primary transition-colors">Collections</Link>
          <Link href="/about" className="hover:text-brand-primary transition-colors">About</Link>
        </nav>
      </div>

      <Link href="/" className="absolute left-1/2 -translate-x-1/2">
        <h1 className="font-heading text-3xl md:text-4xl tracking-tighter text-brand-dark uppercase">
          FabTops
        </h1>
      </Link>

      <div className="flex items-center gap-5 text-brand-dark">
        <button className="hover:text-brand-primary transition-colors">
          <Search className="h-5 w-5" />
        </button>
        <Link href="/account" className="hover:text-brand-primary transition-colors">
          <User className="h-5 w-5" />
        </Link>
        <button className="hover:text-brand-primary transition-colors relative">
          <ShoppingBag className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-brand-primary text-brand-dark text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
            0
          </span>
        </button>
      </div>
    </motion.header>
  );
}
