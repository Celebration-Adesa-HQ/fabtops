'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { StoreApiOrder } from '@/lib/woocommerce/storefront';

const fieldClass = 'w-full border-b border-brand-dark/15 bg-transparent py-3 text-sm text-brand-dark outline-none transition-colors focus:border-brand-dark';

function needsRecovery(status: string) {
  return ['pending', 'failed', 'on-hold'].includes(status);
}

export default function CheckoutRecoveryPage() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [orderKey, setOrderKey] = useState(searchParams.get('key') || '');
  const [billingEmail, setBillingEmail] = useState(searchParams.get('billingEmail') || '');
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [order, setOrder] = useState<StoreApiOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState('');

  async function loadOrder() {
    if (!orderId || !orderKey) {
      setError('Order ID and order key are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const query = new URLSearchParams({
        orderId,
        key: orderKey,
        ...(billingEmail ? { billingEmail } : {}),
      });
      const response = await fetch(`/api/checkout/recover?${query.toString()}`);
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Unable to recover this order');
      }

      setOrder(result.data as StoreApiOrder);
    } catch (caught) {
      setOrder(null);
      setError(caught instanceof Error ? caught.message : 'Unable to recover this order');
    } finally {
      setLoading(false);
    }
  }

  async function retryPayment() {
    if (!order?.billing_address || !order?.shipping_address) {
      setError('This order does not include enough address data to retry payment.');
      return;
    }

    setRetrying(true);
    setError('');

    try {
      const response = await fetch('/api/checkout/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          key: orderKey,
          billingEmail: billingEmail || order.billing_address.email || undefined,
          paymentMethod,
          paymentData: [],
          billingAddress: order.billing_address,
          shippingAddress: order.shipping_address,
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Unable to restart payment');
      }

      window.location.assign(result.data.redirectUrl || `/checkout/success?order=${result.data.orderId}`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unable to restart payment';
      setError(
        message === 'CART_NOT_INITIALIZED'
          ? 'Your current WooCommerce cart session is no longer available. Start a fresh checkout to create a new payment session.'
          : message,
      );
    } finally {
      setRetrying(false);
    }
  }

  useEffect(() => {
    if (searchParams.get('orderId') && searchParams.get('key')) {
      void loadOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-brand-light px-6 pb-24 pt-32 md:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/checkout" className="mb-12 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/50 hover:text-brand-dark">
          Return to checkout
        </Link>

        <div className="grid gap-10 lg:grid-cols-[0.95fr,1.05fr]">
          <section className="rounded-[2rem] border border-brand-dark/8 bg-white/85 p-6 shadow-sm md:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.45em] text-brand-primary">Order Recovery</p>
            <h1 className="mt-4 font-heading text-5xl uppercase tracking-tight text-brand-dark md:text-7xl">Resume Payment</h1>
            <p className="mt-6 text-sm leading-7 text-brand-dark/60">
              Recover an unpaid WooCommerce order using the Store API order and checkout-order flow. Guest orders may also require the billing email used at checkout.
            </p>

            <div className="mt-10 space-y-6">
              <label className="block">
                <span className="sr-only">Order ID</span>
                <input aria-label="Order ID" placeholder="Order ID" className={fieldClass} value={orderId} onChange={(event) => setOrderId(event.target.value)} />
              </label>
              <label className="block">
                <span className="sr-only">Order key</span>
                <input aria-label="Order key" placeholder="Order key" className={fieldClass} value={orderKey} onChange={(event) => setOrderKey(event.target.value)} />
              </label>
              <label className="block">
                <span className="sr-only">Billing email</span>
                <input aria-label="Billing email" type="email" placeholder="Billing email for guest recovery" className={fieldClass} value={billingEmail} onChange={(event) => setBillingEmail(event.target.value)} />
              </label>

              <button
                type="button"
                onClick={() => void loadOrder()}
                disabled={loading}
                className="w-full rounded-full bg-brand-dark px-6 py-5 text-[10px] font-black uppercase tracking-[0.35em] text-white transition hover:bg-brand-primary hover:text-brand-dark disabled:opacity-60"
              >
                {loading ? 'Loading Order...' : 'Recover Order'}
              </button>

              {error ? <p className="rounded-2xl bg-red-50 px-4 py-4 text-sm text-red-700">{error}</p> : null}
            </div>
          </section>

          <section className="rounded-[2rem] border border-brand-dark/8 bg-white/65 p-6 shadow-sm md:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-dark/45">Recovered Order</p>

            {!order ? (
              <div className="mt-8 rounded-[1.5rem] border border-dashed border-brand-dark/10 bg-brand-light/60 p-6 text-sm leading-7 text-brand-dark/60">
                Order details will appear here after a successful recovery lookup.
              </div>
            ) : (
              <div className="mt-8 space-y-6">
                <div className="rounded-[1.5rem] border border-brand-dark/8 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/40">Order #{order.id}</p>
                      <h2 className="mt-2 text-2xl font-semibold capitalize text-brand-dark">{order.status.replace(/-/g, ' ')}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/40">Total</p>
                      <p className="mt-2 text-lg font-semibold text-brand-dark">
                        {order.totals?.currency_code || ''} {order.totals?.total_price || ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-brand-dark/8 bg-white p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/40">Line Items</p>
                  <div className="mt-4 space-y-3">
                    {(order.items || []).map((item) => (
                      <div key={`${item.id}-${item.quantity}`} className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-brand-dark/8 px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-brand-dark">{item.name}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-brand-dark/45">Qty {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-brand-dark">
                          {item.totals?.currency_code || order.totals?.currency_code || ''} {item.totals?.line_total || ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {needsRecovery(order.status) ? (
                  <div className="rounded-[1.5rem] border border-brand-primary/20 bg-brand-primary/10 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/45">Retry Payment</p>
                    <p className="mt-3 text-sm leading-7 text-brand-dark/60">
                      We will replay this existing order through WooCommerce&apos;s checkout-order endpoint using your current shopper session.
                    </p>

                    <label className="mt-5 block">
                      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/45">Payment Method</span>
                      <select className={`${fieldClass} border rounded-2xl px-4`} value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                        <option value="paystack">Paystack</option>
                        <option value="bacs">Bank Transfer</option>
                        <option value="cod">Cash on Delivery</option>
                      </select>
                    </label>

                    <button
                      type="button"
                      onClick={() => void retryPayment()}
                      disabled={retrying}
                      className="mt-6 w-full rounded-full bg-brand-dark px-6 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-white transition hover:bg-brand-primary hover:text-brand-dark disabled:opacity-60"
                    >
                      {retrying ? 'Restarting Payment...' : 'Retry Payment'}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] border border-brand-dark/8 bg-brand-light/60 p-5 text-sm leading-7 text-brand-dark/60">
                    This order no longer needs payment recovery. You can continue shopping or review the order status through your account.
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
