import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-light px-6 py-32 text-center">
      <div className="max-w-xl">
        <CheckCircle2 className="mx-auto text-brand-primary" size={64} strokeWidth={1.25} />
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.45em] text-brand-dark/40">Order Received</p>
        <h1 className="mt-5 font-heading text-5xl uppercase tracking-tight text-brand-dark md:text-7xl">Thank You</h1>
        <p className="mt-8 text-sm leading-7 text-brand-dark/60">WooCommerce has received your order. Payment and delivery updates will be sent to the email address provided at checkout.</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/shop" className="inline-block bg-brand-dark px-10 py-5 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:bg-brand-primary hover:text-brand-dark">Continue Shopping</Link>
          <Link href="/checkout/recover" className="inline-block border border-brand-dark/10 px-10 py-5 text-[10px] font-black uppercase tracking-[0.35em] text-brand-dark hover:border-brand-primary hover:text-brand-primary">
            Need Recovery?
          </Link>
        </div>
      </div>
    </main>
  );
}
