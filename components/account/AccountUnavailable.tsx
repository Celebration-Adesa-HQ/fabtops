import Link from 'next/link';
import { UserRoundX } from 'lucide-react';

export function AccountUnavailable() {
  return (
    <main className="min-h-screen bg-brand-secondary px-6 pb-24 pt-40">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white/50 text-brand-dark">
          <UserRoundX size={32} strokeWidth={1.5} />
        </div>
        <p className="mb-5 text-[10px] font-black uppercase tracking-[0.45em] text-brand-dark/40">Customer Accounts</p>
        <h1 className="font-heading text-5xl uppercase tracking-tight text-brand-dark md:text-7xl">Returning Soon</h1>
        <p className="mt-8 max-w-lg text-sm leading-7 text-brand-dark/60">
          Guest checkout remains available through WooCommerce, while customer account access, wishlist tools, and saved profile features are temporarily offline during our commerce transition.
        </p>
        <Link href="/shop" className="mt-10 bg-brand-dark px-10 py-5 text-[10px] font-black uppercase tracking-[0.35em] text-white transition-colors hover:bg-brand-primary hover:text-brand-dark">
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
