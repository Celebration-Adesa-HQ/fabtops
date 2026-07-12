import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt || ''} />,
}));

vi.mock('@/components/ui/Drawer', () => ({
  Drawer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const useCart = vi.fn();
const useCurrency = vi.fn();

vi.mock('@/components/cart/CartProvider', () => ({
  useCart,
}));

vi.mock('@/lib/currency-context', () => ({
  useCurrency,
}));

describe('coupon cart UI', () => {
  it('renders coupon savings and feedback in the cart summary', async () => {
    useCurrency.mockReturnValue({
      formatPrice: (amount: number, currencyCode: string) => `${currencyCode} ${amount.toFixed(2)}`,
    });
    useCart.mockReturnValue({
      checkoutUrl: '/checkout',
      subtotal: 2500,
      totalAmount: 2375,
      currencyCode: 'NGN',
      discountCodes: [{
        code: 'WELCOME10',
        applicable: true,
        discountTotal: 125,
        currencyCode: 'NGN',
      }],
      couponFeedback: {
        action: 'apply',
        code: 'WELCOME10',
        message: 'Coupon WELCOME10 applied.',
        status: 'success',
      },
      applyDiscountCode: vi.fn(),
      removeDiscountCode: vi.fn(),
      isLoading: false,
    });

    const { CartSummaryCard } = await import('../../components/cart/CartSummaryCard');
    const html = renderToStaticMarkup(<CartSummaryCard />);

    expect(html).toContain('Coupon WELCOME10 applied.');
    expect(html).toContain('Coupon Savings');
    expect(html).toContain('WELCOME10');
    expect(html).toContain('NGN 125.00');
  });

  it('renders coupon savings and error feedback in the cart drawer', async () => {
    useCurrency.mockReturnValue({
      formatPrice: (amount: number, currencyCode: string) => `${currencyCode} ${amount.toFixed(2)}`,
    });
    useCart.mockReturnValue({
      isCartOpen: true,
      setIsCartOpen: vi.fn(),
      items: [{
        id: 'line-1',
        variantId: '101',
        title: 'Rose Top',
        handle: 'rose-top',
        price: '1250.00',
        quantity: 1,
        image: 'https://shop.example.com/rose-top.jpg',
        selectedOptions: [],
      }],
      removeFromCart: vi.fn(),
      updateQuantity: vi.fn(),
      subtotal: 2500,
      totalAmount: 2375,
      currencyCode: 'NGN',
      discountCodes: [{
        code: 'WELCOME10',
        applicable: true,
        discountTotal: 125,
        currencyCode: 'NGN',
      }],
      applyDiscountCode: vi.fn(),
      removeDiscountCode: vi.fn(),
      couponFeedback: {
        action: 'apply',
        code: 'WELCOME10',
        message: 'Coupon is not valid.',
        status: 'error',
      },
      checkoutUrl: '/checkout',
      isLoading: false,
    });

    const { CartDrawer } = await import('../../components/cart/CartDrawer');
    const html = renderToStaticMarkup(<CartDrawer />);

    expect(html).toContain('Coupon is not valid.');
    expect(html).toContain('Coupon Savings');
    expect(html).toContain('WELCOME10');
    expect(html).toContain('NGN 125.00');
  });
});
