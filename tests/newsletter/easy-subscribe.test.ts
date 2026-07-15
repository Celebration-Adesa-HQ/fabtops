import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getEasySubscribeEndpoint,
  getNewsletterOrigin,
  mapNewsletterSourceToFormId,
  subscribeToEasySubscribe,
} from '@/lib/newsletter/easy-subscribe';

describe('Easy Subscribe helper', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('builds the public subscription endpoint and origin from env', () => {
    vi.stubEnv('WOOCOMMERCE_STORE_URL', 'https://store.example.com/');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://fabtops.example.com/');

    expect(getEasySubscribeEndpoint()).toBe('https://store.example.com/wp-json/easy-subscribe/v1/subscribe');
    expect(getNewsletterOrigin()).toBe('https://fabtops.example.com');
  });

  it('maps each capture surface to a stable form id', () => {
    expect(mapNewsletterSourceToFormId('fab-babe-modal')).toBe('fab-babe-modal');
    expect(mapNewsletterSourceToFormId('fab-babe-home')).toBe('fab-babe-home');
    expect(mapNewsletterSourceToFormId('fab-babe-footer')).toBe('fab-babe-footer');
  });

  it('posts the email payload to the discovered Easy Subscribe route', async () => {
    vi.stubEnv('WOOCOMMERCE_STORE_URL', 'https://store.example.com/');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://fabtops.example.com/');

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Subscribed successfully.' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const result = await subscribeToEasySubscribe({
      email: 'ada@example.com',
      source: 'fab-babe-home',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://store.example.com/wp-json/easy-subscribe/v1/subscribe',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        cache: 'no-store',
      }),
    );

    const requestInit = fetchMock.mock.calls[0]?.[1];
    expect(requestInit).toBeDefined();
    expect(JSON.parse(String(requestInit?.body))).toEqual({
      email: 'ada@example.com',
      origin_url: 'https://fabtops.example.com',
      form_id: 'fab-babe-home',
    });
    expect(result).toEqual({
      success: true,
      message: 'Subscribed successfully.',
    });
  });
});
