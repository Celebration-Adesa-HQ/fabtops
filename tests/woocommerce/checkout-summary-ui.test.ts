import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    React.createElement('a', { href, ...props }, children)
  ),
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement('img', props),
}));

const useCurrency = vi.fn();

vi.mock('@/lib/currency-context', () => ({
  useCurrency,
}));

describe('checkout order summary UI', () => {
  it('renders itemized order details, mobile summary toggle copy, and totals', async () => {
    useCurrency.mockReturnValue({
      formatPrice: (amount: number | string, currencyCode: string) => `${currencyCode} ${Number(amount).toFixed(2)}`,
    });

    const { CheckoutOrderSummary } = await import('../../components/checkout/CheckoutOrderSummary');
    const html = renderToStaticMarkup(React.createElement(CheckoutOrderSummary, {
      items: [
        {
          id: 'line-1',
          variantId: '101',
          title: 'Rose Top',
          handle: 'rose-top',
          price: '1250.00',
          quantity: 2,
          image: 'https://shop.example.com/rose-top.jpg',
          selectedOptions: [{ name: 'Size', value: 'M' }],
        },
      ],
      subtotal: 2500,
      totalAmount: 2375,
      currencyCode: 'NGN',
      discountCodes: [{
        code: 'WELCOME10',
        applicable: true,
        discountTotal: 125,
        currencyCode: 'NGN',
      }],
      shippingRates: [{
        package_id: 1,
        name: 'Delivery',
        destination: {},
        shipping_rates: [{
          rate_id: 'flat_rate:1',
          name: 'Lagos Express',
          description: '',
          delivery_time: '',
          price: '15000',
          taxes: '750',
          instance_id: 1,
          method_id: 'flat_rate',
          meta_data: [],
          selected: true,
          currency_code: 'NGN',
          currency_minor_unit: 2,
        }],
      }],
      needsShipping: true,
    }));

    expect(html).toContain('View order summary');
    expect(html).toContain('Rose Top');
    expect(html).toContain('Size: M');
    expect(html).toContain('Qty 2');
    expect(html).toContain('NGN 2500.00');
    expect(html).toContain('WELCOME10');
    expect(html).toContain('Lagos Express');
    expect(html).toContain('NGN 150.00');
    expect(html).toContain('NGN 7.50');
    expect(html).toContain('Edit cart');
    expect(html).toContain('NGN 2375.00');
  });
});
