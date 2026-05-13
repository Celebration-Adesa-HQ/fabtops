import Link from 'next/link';
// import { Instagram, Twitter, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-brand-dark text-brand-light py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6 col-span-1 md:col-span-2">
          <h2 className="font-heading text-4xl uppercase tracking-tighter">FabTops</h2>
          <p className="text-brand-light/60 max-w-sm text-sm leading-relaxed">
            Contemporary, premium fashion rooted in confidence, femininity, and self-expression. 
            Crafted for the modern woman who values quality and timeless style.
          </p>
          {/* <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-brand-primary transition-colors"><Instagram className="h-5 w-5" /></Link>
            <Link href="#" className="hover:text-brand-primary transition-colors"><Twitter className="h-5 w-5" /></Link>
            <Link href="#" className="hover:text-brand-primary transition-colors"><Facebook className="h-5 w-5" /></Link>
          </div> */}
        </div>

        <div className="space-y-6">
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold">Shopping</h3>
          <ul className="space-y-4 text-sm text-brand-light/60">
            <li><Link href="/shop" className="hover:text-brand-light transition-colors">New Arrivals</Link></li>
            <li><Link href="/shop/best-sellers" className="hover:text-brand-light transition-colors">Best Sellers</Link></li>
            <li><Link href="/shop/collections" className="hover:text-brand-light transition-colors">Collections</Link></li>
            <li><Link href="/archive" className="hover:text-brand-light transition-colors">Archive</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold">Customer Care</h3>
          <ul className="space-y-4 text-sm text-brand-light/60">
            <li><Link href="/about" className="hover:text-brand-light transition-colors">Our Story</Link></li>
            <li><Link href="/shipping" className="hover:text-brand-light transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/size-guide" className="hover:text-brand-light transition-colors">Size Guide</Link></li>
            <li><Link href="/contact" className="hover:text-brand-light transition-colors">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-brand-light/10 flex flex-col md:row items-center justify-between gap-4 text-[10px] uppercase tracking-widest text-brand-light/40">
        <p>© 2024 FabTops. All rights reserved.</p>
        <div className="flex items-center gap-8">
          <Link href="/privacy" className="hover:text-brand-light transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-brand-light transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
