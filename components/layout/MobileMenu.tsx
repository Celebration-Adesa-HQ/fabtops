'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Instagram, Twitter, MessageCircle, ArrowRight, ShoppingBag, User, Heart } from 'lucide-react';
import Image from 'next/image';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_LINKS = [
  { name: 'Shop All', href: '/shop', desc: 'The Complete Collection' },
  { name: 'Collections', href: '/collections', desc: 'Curated Stories' },
  { name: 'The Circle', href: '/circle', desc: 'Elite Membership' },
  { name: 'About', href: '/about', desc: 'Our Heritage' },
  { name: 'Concierge', href: '/contact', desc: 'Direct Support' },
];

const InstagramIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 2500 2500" className={className}><defs><radialGradient id="menu_insta_a" cx="332.14" cy="2511.81" r="3263.54" gradientUnits="userSpaceOnUse"><stop offset=".09" stopColor="#fa8f21"/><stop offset=".78" stopColor="#d82d7e"/></radialGradient><radialGradient id="menu_insta_b" cx="1516.14" cy="2623.81" r="2572.12" gradientUnits="userSpaceOnUse"><stop offset=".64" stopColor="#8c3aaa" stopOpacity="0"/><stop offset="1" stopColor="#8c3aaa"/></radialGradient></defs><path d="M833.4 1250c0-230.11 186.49-416.7 416.6-416.7s416.7 186.59 416.7 416.7-186.59 416.7-416.7 416.7-416.6-186.59-416.6-416.7m-225.26 0c0 354.5 287.36 641.86 641.86 641.86s641.86-287.36 641.86-641.86S1604.5 608.14 1250 608.14 608.14 895.5 608.14 1250m1159.13-667.31a150 150 0 1 0 150.06-149.94h-.06a150.07 150.07 0 0 0-150 149.94M745 2267.47c-121.87-5.55-188.11-25.85-232.13-43-58.36-22.72-100-49.78-143.78-93.5s-70.88-85.32-93.5-143.68c-17.16-44-37.46-110.26-43-232.13-6.06-131.76-7.27-171.34-7.27-505.15s1.31-373.28 7.27-505.15c5.55-121.87 26-188 43-232.13 22.72-58.36 49.78-100 93.5-143.78s85.32-70.88 143.78-93.5c44-17.16 110.26-37.46 232.13-43 131.76-6.06 171.34-7.27 505-7.27s373.28 1.31 505.15 7.27c121.87 5.55 188 26 232.13 43 58.36 22.62 100 49.78 143.78 93.5s70.78 85.42 93.5 143.78c17.16 44 37.46 110.26 43 232.13 6.06 131.87 7.27 171.34 7.27 505.15s-1.21 373.28-7.27 505.15c-5.55 121.87-25.95 188.11-43 232.13-22.72 58.36-49.78 100-93.5 143.68s-85.42 70.78-143.78 93.5c-44 17.16-110.26 37.46-232.13 43-131.76 6.06-171.34 7.27-505.15 7.27s-373.28-1.21-505-7.27M734.65 7.57c-133.07 6.06-224 27.16-303.41 58.06C349 97.54 279.38 140.35 209.81 209.81S97.54 349 65.63 431.24c-30.9 79.46-52 170.34-58.06 303.41C1.41 867.93 0 910.54 0 1250s1.41 382.07 7.57 515.35c6.06 133.08 27.16 223.95 58.06 303.41 31.91 82.19 74.62 152 144.18 221.43S349 2402.37 431.24 2434.37c79.56 30.9 170.34 52 303.41 58.06C868 2498.49 910.54 2500 1250 2500s382.07-1.41 515.35-7.57c133.08-6.06 223.95-27.16 303.41-58.06 82.19-32 151.86-74.72 221.43-144.18s112.18-139.24 144.18-221.43c30.9-79.46 52.1-170.34 58.06-303.41 6.06-133.38 7.47-175.89 7.47-515.35s-1.41-382.07-7.47-515.35c-6.06-133.08-27.16-224-58.06-303.41-32-82.19-74.72-151.86-144.18-221.43S2150.95 97.54 2068.86 65.63c-79.56-30.9-170.44-52.1-303.41-58.06C1632.17 1.51 1589.56 0 1250.1 0S868 1.41 734.65 7.57" fill="url(#menu_insta_a)"/><path d="M833.4 1250c0-230.11 186.49-416.7 416.6-416.7s416.7 186.59 416.7 416.7-186.59 416.7-416.7 416.7-416.6-186.59-416.6-416.7m-225.26 0c0 354.5 287.36 641.86 641.86 641.86s641.86-287.36 641.86-641.86S1604.5 608.14 1250 608.14 608.14 895.5 608.14 1250m1159.13-667.31a150 150 0 1 0 150.06-149.94h-.06a150.07 150.07 0 0 0-150 149.94M745 2267.47c-121.87-5.55-188.11-25.85-232.13-43-58.36-22.72-100-49.78-143.78-93.5s-70.88-85.32-93.5-143.68c-17.16-44-37.46-110.26-43-232.13-6.06-131.76-7.27-171.34-7.27-505.15s1.31-373.28 7.27-505.15c5.55-121.87 26-188 43-232.13 22.72-58.36 49.78-100 93.5-143.78s85.32-70.88 143.78-93.5c44-17.16 110.26-37.46 232.13-43 131.76-6.06 171.34-7.27 505-7.27s373.28 1.31 505.15 7.27c121.87 5.55 188 26 232.13 43 58.36 22.62 100 49.78 143.78 93.5s70.78 85.42 93.5 143.78c17.16 44 37.46 110.26 43 232.13 6.06 131.87 7.27 171.34 7.27 505.15s-1.21 373.28-7.27 505.15c-5.55 121.87-25.95 188.11-43 232.13-22.72 58.36-49.78 100-93.5 143.68s-85.42 70.78-143.78 93.5c-44 17.16-110.26 37.46-232.13 43-131.76 6.06-171.34 7.27-505.15 7.27s-373.28-1.21-505-7.27M734.65 7.57c-133.07 6.06-224 27.16-303.41 58.06C349 97.54 279.38 140.35 209.81 209.81S97.54 349 65.63 431.24c-30.9 79.46-52 170.34-58.06 303.41C1.41 867.93 0 910.54 0 1250s1.41 382.07 7.57 515.35c6.06 133.08 27.16 223.95 58.06 303.41 31.91 82.19 74.62 152 144.18 221.43S349 2402.37 431.24 2434.37c79.56 30.9 170.34 52 303.41 58.06C868 2498.49 910.54 2500 1250 2500s382.07-1.41 515.35-7.57c133.08-6.06 223.95-27.16 303.41-58.06 82.19-32 151.86-74.72 221.43-144.18s112.18-139.24 144.18-221.43c30.9-79.46 52.1-170.34 58.06-303.41 6.06-133.38 7.47-175.89 7.47-515.35s-1.41-382.07-7.47-515.35c-6.06-133.08-27.16-224-58.06-303.41-32-82.19-74.72-151.86-144.18-221.43S2150.95 97.54 2068.86 65.63c-79.56-30.9-170.44-52.1-303.41-58.06C1632.17 1.51 1589.56 0 1250.1 0S868 1.41 734.65 7.57" fill="url(#menu_insta_b)"/></svg>
);

const XIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg fill="currentColor" width={size} height={size} xmlns="http://www.w3.org/2000/svg" viewBox="0.254 0.25 500 451.95400000000006" className={className}><path d="M394.033.25h76.67L303.202 191.693l197.052 260.511h-154.29L225.118 294.205 86.844 452.204H10.127l179.16-204.77L.254.25H158.46l109.234 144.417zm-26.908 406.063h42.483L135.377 43.73h-45.59z"/></svg>
);

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-dark/40 backdrop-blur-md z-[60]"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-full max-w-[450px] bg-brand-secondary z-[70] overflow-y-auto overflow-x-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 flex items-center justify-between border-b border-brand-dark/5 bg-brand-secondary/80 backdrop-blur-xl sticky top-0 z-20">
              <Image
                src="/logo/Fab and Luxe Combined.png"
                alt="FabTops"
                width={80}
                height={80}
                className="object-contain"
              />
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-brand-dark text-white flex items-center justify-center hover:bg-brand-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 p-8 md:p-12 space-y-16">
              {/* Primary Links */}
              <nav className="space-y-8">
                {MENU_LINKS.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link 
                      href={link.href} 
                      onClick={onClose}
                      className="group block space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="text-4xl md:text-5xl font-heading text-brand-dark uppercase tracking-tighter group-hover:text-brand-primary transition-colors">
                          {link.name}
                        </h2>
                        <ArrowRight className="text-brand-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" size={24} />
                      </div>
                      <p className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-dark/40">
                        {link.desc}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Account Quick Links */}
              <div className="pt-12 border-t border-brand-dark/5 grid grid-cols-3 gap-4">
                {[
                  { icon: User, label: 'Profile', href: '/account' },
                  { icon: Heart, label: 'Wishlist', href: '/wishlist' },
                  { icon: ShoppingBag, label: 'Cart', href: '#' },
                ].map((item, i) => (
                  <Link 
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className="flex flex-col items-center gap-3 p-6 bg-white/40 rounded-3xl hover:bg-white transition-all group"
                  >
                    <item.icon size={20} className="text-brand-dark/40 group-hover:text-brand-primary transition-colors" />
                    <span className="text-[9px] uppercase tracking-widest font-black text-brand-dark/40 group-hover:text-brand-dark transition-colors">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Social Presence */}
              <div className="pt-12 space-y-8">
                <h3 className="text-[10px] uppercase tracking-[0.5em] font-black text-brand-dark/20 text-center">Connected Spaces</h3>
                <div className="flex justify-center gap-8">
                  <Link href="https://instagram.com/fabtops" className="text-brand-dark/40 hover:text-brand-primary transition-colors">
                    <InstagramIcon size={24} />
                  </Link>
                  <Link href="https://twitter.com/fabtops" className="text-brand-dark/40 hover:text-brand-primary transition-colors">
                    <XIcon size={24} />
                  </Link>
                  <Link href="https://wa.me/234000000000" className="text-brand-dark/40 hover:text-brand-primary transition-colors">
                    <MessageCircle size={24} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer Philosophy */}
            <div className="p-12 bg-brand-dark text-white/40 text-center">
              <p className="text-[9px] uppercase tracking-[0.4em] font-medium leading-loose">
                Contemporary Craft <br />
                Liquid Glass Rebrand — 2024
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
