import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

interface CheckoutFailedPageProps {
  searchParams?: Promise<{
    reference?: string;
    message?: string;
  }>;
}

export default async function CheckoutFailedPage({
  searchParams,
}: CheckoutFailedPageProps) {
  const params = (await searchParams) || {};

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-light px-6 py-32 text-center">
      <div className="max-w-xl">
        <AlertCircle className="mx-auto text-brand-dark" size={64} strokeWidth={1.25} />
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.45em] text-brand-dark/40">
          Payment Incomplete
        </p>
        <h1 className="mt-5 font-heading text-5xl uppercase tracking-tight text-brand-dark md:text-7xl">
          Checkout Was Not Completed
        </h1>
        <p className="mt-8 text-sm leading-7 text-brand-dark/60">
          {params.message || 'Your payment was not confirmed. You can return to checkout and try again without leaving FabTops.'}
        </p>
        {params.reference ? (
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/45">
            Reference: {params.reference}
          </p>
        ) : null}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/checkout" className="inline-block bg-brand-dark px-10 py-5 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:bg-brand-primary hover:text-brand-dark">
            Try Again
          </Link>
          <Link href="/cart" className="inline-block border border-brand-dark/10 px-10 py-5 text-[10px] font-black uppercase tracking-[0.35em] text-brand-dark hover:border-brand-primary hover:text-brand-primary">
            Edit Cart
          </Link>
        </div>
      </div>
    </main>
  );
}
