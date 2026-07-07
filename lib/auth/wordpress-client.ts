import { randomUUID, createHmac, createHash } from 'crypto';
import { getAuthEnv } from './env';

export class AuthRequestError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'AuthRequestError';
    this.status = status;
    this.code = code;
  }
}

interface WordPressAuthRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  bearerToken?: string | null;
}

interface WordPressAuthResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

function buildCanonicalSignature(
  timestamp: string,
  method: string,
  route: string,
  body: string,
  nonce: string,
  secret: string,
) {
  const canonical = [
    timestamp,
    method.toUpperCase(),
    route,
    createHash('sha256').update(body).digest('hex'),
    nonce,
  ].join('\n');

  return createHmac('sha256', secret).update(canonical).digest('base64');
}

export async function wordpressAuthRequest<T = unknown>(
  path: string,
  options: WordPressAuthRequestOptions = {},
): Promise<WordPressAuthResponse<T>> {
  const env = getAuthEnv();
  const method = options.method || 'GET';
  const route = `/${path.replace(/^\/+/, '')}`;
  const url = `${env.authBaseUrl}${route}`;
  const nonce = randomUUID();
  const timestamp = String(Math.floor(Date.now() / 1000));
  const body = options.body ? JSON.stringify(options.body) : '';
  const signature = buildCanonicalSignature(timestamp, method, `/fabtops/v1${route}`, body, nonce, env.clientSecret);

  const response = await fetch(url, {
    method,
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      'X-Fabtops-Timestamp': timestamp,
      'X-Fabtops-Nonce': nonce,
      'X-Fabtops-Signature': signature,
      ...(options.bearerToken ? { Authorization: `Bearer ${options.bearerToken}` } : {}),
    },
    ...(body ? { body } : {}),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.message || payload?.code || response.statusText || 'Auth request failed';
    throw new AuthRequestError(message, response.status, payload?.code);
  }

  return payload as WordPressAuthResponse<T>;
}
