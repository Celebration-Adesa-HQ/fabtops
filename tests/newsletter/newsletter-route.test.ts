import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const subscribeToEasySubscribe = vi.fn();

vi.mock('@/lib/newsletter/easy-subscribe', () => ({
  subscribeToEasySubscribe,
}));

describe('newsletter route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fails validation cleanly for invalid emails', async () => {
    const { POST } = await import('../../app/api/newsletter/route');
    const response = await POST(
      new NextRequest('https://fabtops.test/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email', source: 'fab-babe-modal' }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      success: false,
      error: 'Invalid email address',
    });
    expect(subscribeToEasySubscribe).not.toHaveBeenCalled();
  });

  it('forwards a valid subscription request with the selected source', async () => {
    subscribeToEasySubscribe.mockResolvedValue({
      success: true,
      message: 'Welcome to the Circle.',
    });

    const { POST } = await import('../../app/api/newsletter/route');
    const response = await POST(
      new NextRequest('https://fabtops.test/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'ada@example.com', source: 'fab-babe-home' }),
      }),
    );
    const body = await response.json();

    expect(subscribeToEasySubscribe).toHaveBeenCalledWith({
      email: 'ada@example.com',
      source: 'fab-babe-home',
    });
    expect(response.status).toBe(200);
    expect(body).toEqual({
      success: true,
      message: 'Welcome to the Circle.',
      data: {
        source: 'fab-babe-home',
      },
    });
  });

  it('maps upstream provider failures to a safe 502 response', async () => {
    subscribeToEasySubscribe.mockResolvedValue({
      success: false,
      error: 'NEWSLETTER_PROVIDER_ERROR',
      message: 'Provider rejected the request.',
    });

    const { POST } = await import('../../app/api/newsletter/route');
    const response = await POST(
      new NextRequest('https://fabtops.test/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'ada@example.com', source: 'fab-babe-footer' }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toEqual({
      success: false,
      error: 'NEWSLETTER_PROVIDER_ERROR',
      message: 'Provider rejected the request.',
    });
  });
});
