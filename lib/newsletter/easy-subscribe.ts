import type { NewsletterRequestSchema } from '@/lib/schemas';

const FORM_IDS: Record<NewsletterRequestSchema['source'], string> = {
  'fab-babe-modal': 'fab-babe-modal',
  'fab-babe-home': 'fab-babe-home',
  'fab-babe-footer': 'fab-babe-footer',
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, '');
}

export function getEasySubscribeEndpoint(env: Record<string, string | undefined> = process.env) {
  const storeUrl = env.WOOCOMMERCE_STORE_URL || env.NEXT_PUBLIC_SITE_URL;

  if (!storeUrl) {
    throw new Error('Missing WOOCOMMERCE_STORE_URL or NEXT_PUBLIC_SITE_URL for newsletter subscriptions.');
  }

  return `${trimTrailingSlash(storeUrl)}/wp-json/easy-subscribe/v1/subscribe`;
}

export function getNewsletterOrigin(env: Record<string, string | undefined> = process.env) {
  const origin = env.NEXT_PUBLIC_SITE_URL || env.WOOCOMMERCE_STORE_URL;

  if (!origin) {
    throw new Error('Missing NEXT_PUBLIC_SITE_URL or WOOCOMMERCE_STORE_URL for newsletter subscriptions.');
  }

  return trimTrailingSlash(origin);
}

export function mapNewsletterSourceToFormId(source: NewsletterRequestSchema['source']) {
  return FORM_IDS[source];
}

export interface EasySubscribeResult {
  success: boolean;
  message: string;
  error?: string;
}

function readMessage(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidate = payload as { message?: unknown; error?: unknown };
  if (typeof candidate.message === 'string' && candidate.message.trim()) {
    return candidate.message.trim();
  }

  if (typeof candidate.error === 'string' && candidate.error.trim()) {
    return candidate.error.trim();
  }

  return null;
}

export async function subscribeToEasySubscribe(input: NewsletterRequestSchema): Promise<EasySubscribeResult> {
  const response = await fetch(getEasySubscribeEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      origin_url: getNewsletterOrigin(),
      form_id: mapNewsletterSourceToFormId(input.source),
    }),
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      error: 'NEWSLETTER_PROVIDER_ERROR',
      message: readMessage(payload) || 'Unable to join the Circle right now. Please try again shortly.',
    };
  }

  return {
    success: true,
    message: readMessage(payload) || 'Welcome to the Circle.',
  };
}
