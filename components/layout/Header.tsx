"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Search, User, Menu, Heart } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useCart } from "@/components/cart/CartProvider";
import { useFavorites } from "@/lib/favorites-context";
import { SearchModal } from "./SearchModal";
import { MobileMenu } from "./MobileMenu";
import { CurrencySelector } from "./CurrencySelector";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const { scrollY } = useScroll();
  const { totalItems, setIsCartOpen } = useCart();
  const { count: favoritesCount } = useFavorites();

  const headerBg = useTransform(
    scrollY,
    [0, 50],
    ["rgba(237, 153, 187, 0)", "rgba(237, 153, 187, 0.95)"],
  );

  const headerBorder = useTransform(
    scrollY,
    [0, 50],
    ["rgba(59, 59, 68, 0)", "rgba(59, 59, 68, 0.1)"],
  );

  const headerColor = useTransform(
    scrollY,
    [0, 50],
    ["rgba(59, 59, 68, 1)", "rgba(59, 59, 68, 1)"],
  );

  const headerPadding = useTransform(scrollY, [0, 50], ["2.5rem", "2.5rem"]);

  return (
    <>
      <motion.header
        style={{
          backgroundColor: headerBg,
          borderBottomColor: headerBorder,
          paddingTop: headerPadding,
          paddingBottom: headerPadding,
          color: headerColor,
        }}
        className="fixed top-0 left-0 right-0 z-40 px-6 md:px-12 transition-all duration-300 border-b flex items-center justify-between backdrop-blur-md"
      >
        <div className="flex-1 flex items-center gap-6">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden p-2 hover:text-brand-primary transition-colors"
            style={{ color: "inherit" }}
          >
            <Menu className="h-6 w-6" />
          </button>
          <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] font-black">
            <Link
              href="/shop"
              className="hover:text-brand-primary transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/collections"
              className="hover:text-brand-primary transition-colors"
            >
              Collections
            </Link>
            <Link
              href="/circle"
              className="hover:text-brand-primary transition-colors"
            >
              The Circle
            </Link>
            <Link
              href="/about"
              className="hover:text-brand-primary transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="hover:text-brand-primary transition-colors"
            >
              Concierge
            </Link>
          </nav>
        </div>

        <motion.div
          className="absolute left-1/2 -translate-x-1/2 z-10"
          style={{
            filter: useTransform(
              scrollY,
              [0, 50],
              ["brightness(0) invert(1)", "brightness(1) invert(0)"],
            ),
          }}
        >
          <Link href="/">
            <Image
              src="/logo/Fab and Luxe Combined.png"
              alt="FabTops"
              width={100}
              height={100}
              className="object-contain w-18 md:w-24"
              priority
            />
          </Link>
        </motion.div>

        <div className="flex-1 flex items-center justify-end gap-2 md:gap-5">
          <CurrencySelector className="hidden lg:block mr-4" />

          <button
            onClick={() => setIsSearchOpen(true)}
            className="hover:text-brand-primary transition-colors p-2"
            style={{ color: "inherit" }}
          >
            <Search className="h-5 w-5" />
          </button>

          <Link
            href="/wishlist"
            className="hover:text-brand-primary transition-colors p-2 relative group"
            style={{ color: "inherit" }}
          >
            <Heart className="h-5 w-5" />
            <AnimatePresence>
              {favoritesCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-0 right-0 bg-brand-primary text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-brand-light shadow-sm"
                >
                  {favoritesCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <Link
            href="/account"
            className="hover:text-brand-primary transition-colors p-2"
            style={{ color: "inherit" }}
          >
            <User className="h-5 w-5" />
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative hover:text-brand-primary transition-colors p-2 group"
            style={{ color: "inherit" }}
          >
            <ShoppingBag className="h-5 w-5" />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-0 right-0 bg-brand-dark text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-brand-light shadow-sm group-hover:bg-brand-primary transition-colors"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>


      </motion.header>
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
