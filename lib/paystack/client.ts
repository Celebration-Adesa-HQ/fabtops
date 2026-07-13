import { getPaystackEnv } from './env';

export class PaystackApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly responseBody?: unknown,
  ) {
    super(message);
    this.name = 'PaystackApiError';
  }
}

export interface PaystackInitializeInput {
  email: string;
  amount: number;
  currency: string;
  reference: string;
  callback_url: string;
  metadata: Record<string, unknown>;
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at?: string;
    metadata?: Record<string, unknown>;
    gateway_response?: string;
    customer?: {
      email?: string;
    };
  };
}

async function paystackRequest<T>(path: string, init: RequestInit): Promise<T> {
  const env = getPaystackEnv();
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.secretKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init.headers,
    },
    cache: 'no-store',
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result) {
    throw new PaystackApiError(
      (result as { message?: string } | null)?.message || `Paystack request failed: ${response.status}`,
      response.status,
      result,
    );
  }

  return result as T;
}

export function initializeTransaction(input: PaystackInitializeInput) {
  return paystackRequest<PaystackInitializeResponse>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function verifyTransaction(reference: string) {
  return paystackRequest<PaystackVerifyResponse>(`/transaction/verify/${encodeURIComponent(reference)}`, {
    method: 'GET',
  });
}
