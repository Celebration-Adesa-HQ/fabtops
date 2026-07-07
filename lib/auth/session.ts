import { createHmac } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getWooEnv } from '@/lib/woocommerce/env';

export const ACCESS_TOKEN_COOKIE = 'fabtops_access_token';
export const REFRESH_TOKEN_COOKIE = 'fabtops_refresh_token';

interface SessionUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface SessionTokens {
  accessToken?: string;
  refreshToken?: string;
  accessExpiresAt?: number;
  refreshExpiresAt?: number;
  user?: SessionUser;
}

export interface ServerAuthSession extends SessionTokens {
  user: SessionUser;
}

function cookieConfig(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

function signSessionPayload(payload: string) {
  const env = getWooEnv();
  return createHmac('sha256', env.consumerSecret).update(payload).digest('base64url');
}

function encodeSession(user: SessionUser) {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64url');
  const signature = signSessionPayload(payload);
  return `${payload}.${signature}`;
}

function decodeSession(token: string): SessionUser | null {
  const [payload, signature] = token.split('.', 2);
  if (!payload || !signature) return null;
  if (signSessionPayload(payload) !== signature) return null;

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionUser;
  } catch {
    return null;
  }
}

export function applyAuthCookies(response: NextResponse, session: SessionTokens) {
  const user = session.user;
  if (!user) {
    throw new Error('Cannot create customer session without a user payload.');
  }

  const signedSession = encodeSession(user);
  response.cookies.set(ACCESS_TOKEN_COOKIE, signedSession, cookieConfig(60 * 60 * 24 * 7));
  response.cookies.set(REFRESH_TOKEN_COOKIE, 'local-session', cookieConfig(60 * 60 * 24 * 7));
  return response;
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', { ...cookieConfig(0), maxAge: 0 });
  response.cookies.set(REFRESH_TOKEN_COOKIE, '', { ...cookieConfig(0), maxAge: 0 });
  return response;
}

export async function getAccessToken() {
  return null;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value || null;
}

export async function getServerAuthSession(): Promise<ServerAuthSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value || null;

  if (!accessToken) {
    return null;
  }

  const user = decodeSession(accessToken);
  if (!user) {
    return null;
  }

  return {
    accessToken,
    refreshToken: refreshToken || '',
    user,
  };
}
