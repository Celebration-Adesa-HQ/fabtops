'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { checkoutSchema, type CheckoutSchema } from '@/lib/schemas';
import { useCartStore } from '@/stores/use-cart-store';

const fieldClass = 'w-full border-b border-brand-dark/15 bg-transparent py-3 text-sm text-brand-dark outline-none transition-colors focus:border-brand-dark';

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    const err = new Error(result.error || 'Request failed') as Error & { status?: number; code?: string };
    err.status = response.status;
    err.code = result.code;
    throw err;
  }
  return result.data;
}

interface CheckoutPageClientProps {
  initialValues: CheckoutSchema;
}

export default function CheckoutPageClient({ initialValues }: CheckoutPageClientProps) {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const initializeCart = useCartStore((state) => state.initializeCart);
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutSchema>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: initialValues,
  });

  const submit = async (values: CheckoutSchema, isRetry = false) => {
    setSubmitting(true);
    setError('');
    try {
      const cart = await postJson('/api/cart', {
        action: 'updateCustomer',
        billing_address: values.billing_address,
        shipping_address: values.shipping_address,
      });
      const firstPackage = cart.shippingRates?.[0];
      const selectedRate = firstPackage?.shipping_rates?.find((rate: { selected: boolean }) => rate.selected)
        || firstPackage?.shipping_rates?.[0];

      if (cart.needsShipping && selectedRate) {
        await postJson('/api/cart', {
          action: 'selectShipping',
          packageId: firstPackage.package_id,
          rateId: selectedRate.rate_id,
        });
      }

      const checkout = await postJson('/api/checkout', values);
      window.location.assign(checkout.redirectUrl || `/checkout/success?order=${checkout.orderId}`);
    } catch (caught) {
      const err = caught as Error & { status?: number; code?: string };
      const message = err.message || 'Checkout failed';

      // 409 = WooCommerce detected a stale/unavailable item and has already
      // removed it from the server cart in the same request. Auto-retry once
      // so the user doesn't have to do anything — the clean cart will succeed.
      if ((err.status === 409 || err.code === 'CART_ITEM_UNAVAILABLE') && !isRetry) {
        // Refresh client-side cart state so the UI reflects what WooCommerce
        // actually holds (the stale item is already gone server-side).
        setIsRetrying(true);
        await initializeCart();
        setIsRetrying(false);
        // Retry the checkout immediately — the cart is now clean.
        await submit(values, true);
        return;
      }

      // Retry also hit a 409 (a second unavailable item). Refresh cart and
      // surface the error so the user can review what's left.
      if (err.status === 409 || err.code === 'CART_ITEM_UNAVAILABLE') {
        void initializeCart();
      }

      setError(message === 'PAYMENT_GATEWAY_UNAVAILABLE'
        ? 'Paystack is not available through WooCommerce Store API. Enable a WooCommerce Blocks-compatible Paystack gateway.'
        : message);
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-light px-6 pb-24 pt-32 md:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/cart" className="mb-12 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/50 hover:text-brand-dark">
          <ArrowLeft size={14} /> Return to bag
        </Link>
        <div className="grid gap-14 lg:grid-cols-[1fr_320px]">
          <form onSubmit={handleSubmit((values) => submit(values))} className="space-y-12">
            <header>
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.45em] text-brand-primary">Secure Customer Checkout</p>
              <h1 className="font-heading text-5xl uppercase tracking-tight text-brand-dark md:text-7xl">Delivery Details</h1>
            </header>

            <section className="grid gap-7 md:grid-cols-2">
              <input aria-label="First name" placeholder="First name" className={fieldClass} {...register('billing_address.first_name')} />
              <input aria-label="Last name" placeholder="Last name" className={fieldClass} {...register('billing_address.last_name')} />
              <input aria-label="Email" type="email" placeholder="Email" className={fieldClass} {...register('billing_address.email')} />
              <input aria-label="Phone" placeholder="Phone" className={fieldClass} {...register('billing_address.phone')} />
              <input aria-label="Address" placeholder="Street address" className={`${fieldClass} md:col-span-2`} {...register('billing_address.address_1')} />
              <input aria-label="City" placeholder="City" className={fieldClass} {...register('billing_address.city')} />
              <input aria-label="State" placeholder="State" className={fieldClass} {...register('billing_address.state')} />
              <input aria-label="Postcode" placeholder="Postcode" className={fieldClass} {...register('billing_address.postcode')} />
              <input aria-label="Country code" placeholder="Country code" maxLength={2} className={fieldClass} {...register('billing_address.country')} />
            </section>

            <section className="space-y-7 border-t border-brand-dark/10 pt-10">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-dark">Shipping Address</h2>
              <div className="grid gap-7 md:grid-cols-2">
                <input aria-label="Shipping first name" placeholder="First name" className={fieldClass} {...register('shipping_address.first_name')} />
                <input aria-label="Shipping last name" placeholder="Last name" className={fieldClass} {...register('shipping_address.last_name')} />
                <input aria-label="Shipping address" placeholder="Street address" className={`${fieldClass} md:col-span-2`} {...register('shipping_address.address_1')} />
                <input aria-label="Shipping city" placeholder="City" className={fieldClass} {...register('shipping_address.city')} />
                <input aria-label="Shipping state" placeholder="State" className={fieldClass} {...register('shipping_address.state')} />
                <input aria-label="Shipping postcode" placeholder="Postcode" className={fieldClass} {...register('shipping_address.postcode')} />
                <input aria-label="Shipping country code" placeholder="Country code" maxLength={2} className={fieldClass} {...register('shipping_address.country')} />
              </div>
            </section>

            {(error || Object.keys(errors).length > 0) ? (
              <p role="alert" className="bg-red-50 p-4 text-sm text-red-700">{error || 'Please complete every required checkout field.'}</p>
            ) : null}
            <button disabled={submitting} className="flex w-full items-center justify-center gap-3 bg-brand-dark py-6 text-[10px] font-black uppercase tracking-[0.35em] text-white transition-colors hover:bg-brand-primary hover:text-brand-dark disabled:opacity-50">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <LockKeyhole size={16} />}
              {isRetrying ? 'Cleaning up cart…' : submitting ? 'Preparing payment…' : 'Continue securely with Paystack'}
            </button>
          </form>

          <aside className="h-fit border border-brand-dark/10 bg-white/60 p-8 lg:sticky lg:top-32">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-dark/50">WooCommerce Checkout</p>
            <p className="mt-5 text-sm leading-7 text-brand-dark/60">Prices, stock, coupons, shipping, taxes, and payment availability are calculated directly by WooCommerce.</p>
            <div className="mt-8 rounded-[1.5rem] border border-brand-dark/8 bg-brand-light/70 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/45">Payment Interrupted?</p>
              <p className="mt-3 text-sm leading-7 text-brand-dark/60">
                If your gateway redirects you out before payment completes, use the order recovery flow to reload the unpaid Woo order and continue.
              </p>
              <Link
                href="/checkout/recover"
                className="mt-5 inline-flex text-[10px] font-black uppercase tracking-[0.32em] text-brand-primary"
              >
                Open Recovery
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
