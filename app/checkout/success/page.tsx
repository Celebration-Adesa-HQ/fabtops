import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { getOrderById, getOrderMetaValue } from '@/lib/woocommerce/orders';

interface CheckoutSuccessPageProps {
  searchParams?: Promise<{
    reference?: string;
    order?: string;
  }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const params = (await searchParams) || {};
  const orderId = params.order ? Number.parseInt(params.order, 10) : null;
  const order = Number.isInteger(orderId || NaN) && orderId
    ? await getOrderById(orderId).catch(() => null)
    : null;
  const verifiedReference = order
    ? getOrderMetaValue(order.meta_data, 'fabtops_paystack_reference')
    : null;
  const isVerified = Boolean(
    order &&
    order.status === 'processing' &&
    typeof verifiedReference === 'string' &&
    verifiedReference === params.reference,
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-light px-6 py-32 text-center">
      <div className="max-w-xl">
        <CheckCircle2 className="mx-auto text-brand-primary" size={64} strokeWidth={1.25} />
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.45em] text-brand-dark/75">Order Received</p>
        <h1 className="mt-5 font-heading text-5xl uppercase tracking-tight text-brand-dark md:text-7xl">Thank You</h1>
        <p className="mt-8 text-sm leading-7 text-brand-dark/85">
          {isVerified
            ? `Your payment has been verified for order #${order?.number || order?.id}. Delivery updates will be sent to the email address you used at checkout.`
            : 'Your order was received, but payment confirmation could not be fully resolved from this page. If you need to retry a hosted Woo payment, use recovery below.'}
        </p>
        {params.reference ? (
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/75">
            Reference: {params.reference}
          </p>
        ) : null}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/shop" className="inline-block bg-brand-dark px-10 py-5 text-[10px] font-black uppercase tracking-[0.35em] text-brand-light hover:bg-brand-primary hover:text-brand-dark">Continue Shopping</Link>
          <Link href="/checkout/recover" className="inline-block border border-brand-dark/10 px-10 py-5 text-[10px] font-black uppercase tracking-[0.35em] text-brand-dark hover:border-brand-primary hover:text-brand-dark">
            Need Recovery?
          </Link>
        </div>
      </div>
    </main>
  );
}
