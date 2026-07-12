'use client';

import { useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { useCurrency } from '@/lib/currency-context';
import { ArrowRight, X, Loader2 } from 'lucide-react';

export function CartSummaryCard() {
  const { 
    checkoutUrl, 
    subtotal, 
    totalAmount,
    currencyCode,
    discountCodes,
    applyDiscountCode,
    removeDiscountCode,
    couponFeedback,
    isLoading
  } = useCart();
  const { formatPrice } = useCurrency();
  const [promoCode, setPromoCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  
  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode) return;
    setIsApplying(true);
    const err = await applyDiscountCode(promoCode);
    if (!err) {
      setPromoCode('');
    }
    setIsApplying(false);
  };

  const totalSavings = discountCodes.reduce((sum, coupon) => sum + coupon.discountTotal, 0);

  return (
    <div className="sticky top-40 bg-brand-light backdrop-blur-xl border border-white/40 p-10 md:p-12 space-y-12 rounded-[2.5rem] shadow-2xl shadow-brand-dark/5">
      <h2 className="text-2xl font-heading uppercase tracking-tight text-brand-dark pb-8 border-b border-brand-dark/10">
        Summary
      </h2>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-dark/40">Subtotal</span>
          <span className="text-lg font-bold text-brand-dark">{formatPrice(subtotal, currencyCode)}</span>
        </div>
        
        {/* Discount Application */}
        <div className="py-6 border-t border-brand-dark/5 space-y-4">
          <form onSubmit={handleApplyDiscount} className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="ENTER PROMO CODE"
              className="flex-1 bg-white/20 border border-brand-dark/10 px-6 py-4 text-[10px] uppercase tracking-widest font-bold focus:outline-none focus:border-brand-primary transition-colors rounded-xl"
            />
            <button 
              type="submit"
              disabled={isApplying || !promoCode}
              className="px-8 py-4 bg-brand-dark text-white text-[10px] uppercase tracking-widest font-black hover:bg-brand-primary hover:text-brand-dark disabled:opacity-50 transition-all rounded-xl"
            >
              {isApplying ? '...' : 'Apply'}
            </button>
          </form>

          {couponFeedback.message ? (
            <p
              className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
                couponFeedback.status === 'error' ? 'text-red-700' : 'text-brand-primary'
              }`}
            >
              {couponFeedback.message}
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            {discountCodes.map((dc) => (
              <div key={dc.code} className="flex items-center justify-between gap-3 bg-brand-primary/10 px-4 py-3 rounded-2xl border border-brand-primary/20">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-widest font-black text-brand-primary">
                    {dc.code} {!dc.applicable && <span className="opacity-60">(Invalid)</span>}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-dark/60">
                    -{formatPrice(dc.discountTotal, dc.currencyCode)}
                  </span>
                </div>
                <button 
                  onClick={() => removeDiscountCode(dc.code)}
                  className="text-brand-primary hover:text-brand-dark transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-dark/40">Shipping</span>
          <span className="text-[11px] uppercase tracking-[0.1em] font-bold text-brand-dark italic opacity-60">Complimentary</span>
        </div>

        {totalSavings > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-primary">Coupon Savings</span>
            <span className="text-lg font-bold text-brand-primary">-{formatPrice(totalSavings, currencyCode)}</span>
          </div>
        )}

        {subtotal !== totalAmount && (
          <div className="flex justify-between items-center">
            <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-primary">Total Savings</span>
            <span className="text-lg font-bold text-brand-primary">-{formatPrice(subtotal - totalAmount, currencyCode)}</span>
          </div>
        )}

        <div className="pt-8 border-t border-brand-dark/10 flex justify-between items-end">
          <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-brand-dark">Order Total</span>
          <div className="text-right">
            <span className="text-4xl font-heading text-brand-dark tracking-tighter">
              {formatPrice(totalAmount, currencyCode)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <a
          href={isLoading ? undefined : (checkoutUrl || '#')}
          aria-disabled={isLoading}
          className={`w-full bg-brand-dark text-white py-6 text-[11px] uppercase tracking-[0.4em] font-black transition-all duration-700 flex items-center justify-center gap-4 group shadow-2xl shadow-brand-dark/20 relative overflow-hidden rounded-xl ${
            isLoading
              ? 'opacity-50 cursor-not-allowed pointer-events-none'
              : 'hover:bg-brand-primary hover:text-brand-dark'
          }`}
        >
          <span className="relative z-10 flex items-center gap-4">
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Syncing Bag…
              </>
            ) : (
              <>
                Secure Checkout via Paystack
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
          {!isLoading && (
            <div className="absolute inset-0 bg-brand-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          )}
        </a>
        <p className="text-[9px] text-brand-dark/30 uppercase tracking-[0.2em] text-center leading-relaxed font-black">
          Shipping and taxes calculated at handoff.
        </p>
      </div>
    </div>
  );
}
