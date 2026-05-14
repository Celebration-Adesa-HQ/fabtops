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

  const headerPadding = useTransform(scrollY, [0, 50], ["1rem", "1rem"]);

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
        className="
    fixed top-0 left-0 right-0 z-40
    border-b backdrop-blur-md
    transition-all duration-300
    px-3 sm:px-6 md:px-10 lg:px-12
  "
      >
        <div className="flex items-center justify-between w-full relative">
          {/* LEFT */}
          <div className="flex items-center gap-1 sm:gap-4 min-w-0 flex-1">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="min-[1150px]:hidden p-1.5 sm:p-2 hover:text-brand-primary transition-colors shrink-0"
              style={{ color: "inherit" }}
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <nav className="hidden min-[1150px]:flex items-center gap-6 xl:gap-8 text-[11px] uppercase tracking-[0.2em] font-black">
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

          {/* LOGO */}
          <motion.div
            className="
        absolute left-1/2 -translate-x-1/2
        min-[390px]:static
        min-[390px]:translate-x-0
        flex-shrink-0
        flex justify-center
      "
            style={{
              filter: useTransform(
                scrollY,
                [0, 50],
                ["brightness(0) invert(1)", "brightness(1) invert(0)"],
              ),
            }}
          >
            <Link href="/" className="block">
              <Image
                src="/logo/Fab and Luxe Combined.png"
                alt="FabTops"
                width={100}
                height={100}
                priority
                className="
            object-contain
            w-14 min-[390px]:w-16 md:w-20 lg:w-24
            h-auto
          "
              />
            </Link>
          </motion.div>

          {/* RIGHT */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-2 md:gap-4 min-w-0 flex-1">
            <CurrencySelector className="hidden xl:block mr-2" />

            <button
              onClick={() => setIsSearchOpen(true)}
              className="hover:text-brand-primary transition-colors p-1.5 sm:p-2 shrink-0"
              style={{ color: "inherit" }}
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              href="/wishlist"
              className="hover:text-brand-primary transition-colors p-1.5 sm:p-2 relative group shrink-0"
              style={{ color: "inherit" }}
            >
              <Heart className="h-5 w-5" />

              <AnimatePresence>
                {favoritesCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="
                absolute top-0 right-0
                bg-brand-primary text-white
                text-[8px] font-black
                w-4 h-4 rounded-full
                flex items-center justify-center
                border-2 border-brand-light
                shadow-sm
              "
                  >
                    {favoritesCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <Link
              href="/account"
              className="hover:text-brand-primary transition-colors p-1.5 sm:p-2 shrink-0"
              style={{ color: "inherit" }}
            >
              <User className="h-5 w-5" />
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative hover:text-brand-primary transition-colors p-1.5 sm:p-2 group shrink-0"
              style={{ color: "inherit" }}
            >
              <ShoppingBag className="h-5 w-5" />

              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="
                absolute top-0 right-0
                bg-brand-dark text-white
                text-[8px] font-black
                w-4 h-4 rounded-full
                flex items-center justify-center
                border-2 border-brand-light
                shadow-sm
                group-hover:bg-brand-primary
                transition-colors
              "
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
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
