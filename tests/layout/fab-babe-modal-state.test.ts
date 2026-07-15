import { describe, expect, it } from 'vitest';
import {
  isFabBabeModalExcludedPath,
  shouldShowFabBabeModal,
} from '@/lib/circle/modal-state';

describe('Fab Babe modal eligibility', () => {
  it('suppresses the modal on excluded routes', () => {
    expect(isFabBabeModalExcludedPath('/cart')).toBe(true);
    expect(isFabBabeModalExcludedPath('/checkout/recover')).toBe(true);
    expect(isFabBabeModalExcludedPath('/login')).toBe(true);
    expect(isFabBabeModalExcludedPath('/register')).toBe(true);
    expect(isFabBabeModalExcludedPath('/account/orders')).toBe(true);
    expect(isFabBabeModalExcludedPath('/collections')).toBe(false);
  });

  it('shows the modal for an eligible browser snapshot', () => {
    expect(
      shouldShowFabBabeModal({
        pathname: '/',
        status: 'eligible',
        dismissedAt: null,
        sessionSeen: false,
        now: 1_000_000,
      }),
    ).toBe(true);
  });

  it('suppresses the modal after it was already seen in the current session', () => {
    expect(
      shouldShowFabBabeModal({
        pathname: '/',
        status: 'eligible',
        dismissedAt: null,
        sessionSeen: true,
        now: 1_000_000,
      }),
    ).toBe(false);
  });

  it('suppresses the modal after a successful subscription', () => {
    expect(
      shouldShowFabBabeModal({
        pathname: '/',
        status: 'subscribed',
        dismissedAt: null,
        sessionSeen: false,
        now: 1_000_000,
      }),
    ).toBe(false);
  });

  it('suppresses the modal for 30 days after dismissal and allows it again afterward', () => {
    const now = 30 * 24 * 60 * 60 * 1000;

    expect(
      shouldShowFabBabeModal({
        pathname: '/',
        status: 'dismissed',
        dismissedAt: now - 1,
        sessionSeen: false,
        now,
      }),
    ).toBe(false);

    expect(
      shouldShowFabBabeModal({
        pathname: '/',
        status: 'dismissed',
        dismissedAt: 0,
        sessionSeen: false,
        now,
      }),
    ).toBe(true);
  });
});
