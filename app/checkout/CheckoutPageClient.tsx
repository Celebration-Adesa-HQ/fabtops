'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckoutOrderSummary } from '@/components/checkout/CheckoutOrderSummary';
import { checkoutSchema, type CheckoutSchema } from '@/lib/schemas';
import { useCartStore } from '@/stores/use-cart-store';
import type { CartData } from '@/stores/types';
import { useCurrencyStore } from '@/stores/use-currency-store';

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
  return {
    data: result.data,
    cartToken: response.headers.get('Cart-Token') || result.cartToken || null,
  };
}

interface CheckoutPageClientProps {
  initialValues: CheckoutSchema;
  initialCart: CartData | null;
}

export default function CheckoutPageClient({ initialValues, initialCart }: CheckoutPageClientProps) {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [activeCartToken, setActiveCartToken] = useState<string | null>(null);
  const initializeCart = useCartStore((state) => state.initializeCart);
  const syncCart = useCartStore((state) => state.syncCart);
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);
  const totalAmount = useCartStore((state) => state.totalAmount);
  const currencyCode = useCartStore((state) => state.currencyCode);
  const discountCodes = useCartStore((state) => state.discountCodes);
  const shippingRates = useCartStore((state) => state.shippingRates);
  const needsShipping = useCartStore((state) => state.needsShipping);
  const cartLoading = useCartStore((state) => state.isLoading);
  const selectedCurrency = useCurrencyStore((state) => state.current.code);
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutSchema>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (initialCart?.items?.length) {
      syncCart(initialCart);
      return;
    }

    if (items.length === 0) {
      void initializeCart();
    }
  }, [initialCart, initializeCart, items.length, syncCart]);

  const summaryItems = items.length > 0 ? items : initialCart?.items || [];
  const summarySubtotal = items.length > 0 ? subtotal : initialCart?.subtotal || 0;
  const summaryTotalAmount = items.length > 0 ? totalAmount : initialCart?.totalAmount || 0;
  const summaryCurrencyCode = items.length > 0 ? currencyCode : initialCart?.currencyCode || 'NGN';
  const summaryDiscountCodes = items.length > 0 ? discountCodes : initialCart?.discountCodes || [];
  const summaryShippingRates = items.length > 0 ? shippingRates : initialCart?.shippingRates || [];
  const summaryNeedsShipping = items.length > 0 ? needsShipping : initialCart?.needsShipping || false;

  const submit = async (values: CheckoutSchema, isRetry = false) => {
    setSubmitting(true);
    setError('');
    try {
      const cartResponse = await postJson('/api/cart', {
        action: 'updateCustomer',
        billing_address: values.billing_address,
        shipping_address: values.shipping_address,
      });
      if (cartResponse.cartToken) {
        setActiveCartToken(cartResponse.cartToken);
      }

      const cart = cartResponse.data;
      const firstPackage = cart.shippingRates?.[0];
      const selectedRate = firstPackage?.shipping_rates?.find((rate: { selected: boolean }) => rate.selected)
        || firstPackage?.shipping_rates?.[0];
      let preparedCartToken = cartResponse.cartToken;

      if (cart.needsShipping && selectedRate) {
        const shippingResponse = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(cartResponse.cartToken ? { 'Cart-Token': cartResponse.cartToken } : {}),
          },
          body: JSON.stringify({
          action: 'selectShipping',
          packageId: firstPackage.package_id,
          rateId: selectedRate.rate_id,
          }),
        });
        const shippingResult = await shippingResponse.json();
        if (!shippingResponse.ok || !shippingResult.success) {
          const shippingError = new Error(shippingResult.error || 'Request failed') as Error & { status?: number; code?: string };
          shippingError.status = shippingResponse.status;
          shippingError.code = shippingResult.code;
          throw shippingError;
        }
        const nextCartToken = shippingResponse.headers.get('Cart-Token') || shippingResult.cartToken || cartResponse.cartToken || null;
        if (nextCartToken) {
          setActiveCartToken(nextCartToken);
          preparedCartToken = nextCartToken;
        }
      }

      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeCartToken || preparedCartToken ? { 'Cart-Token': activeCartToken || preparedCartToken } : {}),
        },
        body: JSON.stringify({
          ...values,
          selected_currency: selectedCurrency,
          coupon_codes: cart.discountCodes?.map((coupon: { code: string }) => coupon.code) || [],
          ...(selectedRate ? {
            selected_shipping_rate: {
              package_id: firstPackage.package_id,
              rate_id: selectedRate.rate_id,
            },
          } : {}),
        }),
      });
      const checkoutResult = await checkoutResponse.json();
      if (!checkoutResponse.ok || !checkoutResult.success) {
        const checkoutError = new Error(checkoutResult.error || 'Request failed') as Error & { status?: number; code?: string };
        checkoutError.status = checkoutResponse.status;
        checkoutError.code = checkoutResult.code;
        throw checkoutError;
      }
      const checkoutCartToken = checkoutResponse.headers.get('Cart-Token') || checkoutResult.cartToken || null;
      if (checkoutCartToken) {
        setActiveCartToken(checkoutCartToken);
      }

      if (
        typeof checkoutResult.authorizationUrl !== 'string' ||
        !checkoutResult.authorizationUrl.startsWith('https://checkout.paystack.com/')
      ) {
        throw new Error('Invalid Paystack authorization URL');
      }

      window.location.assign(checkoutResult.authorizationUrl);
      return;
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
        ? 'Paystack is not available for this checkout right now.'
        : message === 'PAYSTACK_UNSUPPORTED_CURRENCY'
          ? 'The selected currency is not available for Paystack checkout yet. Choose a supported currency and try again.'
        : message);
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-light px-6 pb-24 pt-32 md:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/cart" className="mb-12 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/80 hover:text-brand-dark">
          <ArrowLeft size={14} /> Return to bag
        </Link>
        <div className="grid gap-14 lg:grid-cols-[1fr_320px]">
          <div className="lg:order-2">
            <CheckoutOrderSummary
            items={summaryItems}
            subtotal={summarySubtotal}
            totalAmount={summaryTotalAmount}
            currencyCode={summaryCurrencyCode}
            discountCodes={summaryDiscountCodes}
            shippingRates={summaryShippingRates}
            needsShipping={summaryNeedsShipping}
            isLoading={cartLoading && summaryItems.length === 0}
            />
          </div>
          <form onSubmit={handleSubmit((values) => submit(values))} className="space-y-12 lg:order-1">
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
            <button disabled={submitting} className="flex w-full items-center justify-center gap-3 bg-brand-dark py-6 text-[10px] font-black uppercase tracking-[0.35em] text-brand-light transition-colors hover:bg-brand-primary hover:text-brand-dark disabled:opacity-50">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <LockKeyhole size={16} />}
              {isRetrying ? 'Cleaning up cart…' : submitting ? 'Preparing payment…' : 'Continue securely with Paystack'}
            </button>
          </form>
        </div>
        <div className="mt-10 rounded-[1.5rem] border border-brand-dark/8 bg-white/55 p-5 lg:max-w-[calc(100%-352px)]">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/75">Payment Interrupted?</p>
          <p className="mt-3 text-sm leading-7 text-brand-dark/85">
            Recovery is still available for legacy Woo-hosted unpaid orders. Direct Paystack checkout now stays on FabTops during the normal flow.
          </p>
          <Link
            href="/checkout/recover"
            className="mt-5 inline-flex text-[10px] font-black uppercase tracking-[0.32em] text-brand-primary"
          >
            Open Recovery
          </Link>
        </div>
      </div>
    </main>
  );
}
