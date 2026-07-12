import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

describe('currency context', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('keeps server-rendered price output in the source currency before client hydration', async () => {
    const { useCurrencyStore, currencies } = await import('../../stores/use-currency-store');
    useCurrencyStore.setState({
      current: currencies.find((currency) => currency.code === 'USD') ?? currencies[0],
    });

    const { useCurrency } = await import('../../lib/currency-context');

    function PriceProbe() {
      const { formatPrice } = useCurrency();
      return React.createElement('p', null, formatPrice(110000, 'NGN'));
    }

    const html = renderToStaticMarkup(React.createElement(PriceProbe));

    expect(html).toContain('NGN');
    expect(html).not.toContain('$69.30');
  });
});
