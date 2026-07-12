import { headers as nextHeaders } from 'next/headers';
import { AuthRequestError } from './errors';
import { auth } from './server';
import { prisma } from '@/lib/db/prisma';

export { AuthRequestError } from './errors';

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  wooCustomerId?: string | null;
}

export interface ServerAuthSession {
  user: SessionUser;
}

export async function getAccessToken() {
  return null;
}

export async function getRefreshToken() {
  return null;
}

export async function getServerAuthSession(): Promise<ServerAuthSession | null> {
  const headerStore = await nextHeaders();
  const result = await auth.getSession({
    headers: new Headers(headerStore),
  });

  if (result.error) {
    throw new AuthRequestError(result.error.message, result.error.status || 500, result.error.code);
  }

  const session = result.data as { user?: { id: string | number; email: string; name?: string | null } } | null;
  if (!session?.user) {
    return null;
  }

  const profile = await findProfileSafely(String(session.user.id));

  return {
    user: toSessionUser({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || '',
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      phone: profile?.phone || '',
      wooCustomerId: profile?.wooCustomerId || null,
    }),
  };
}

async function findProfileSafely(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
    }) as {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      wooCustomerId?: string | null;
    } | null;
  } catch (error) {
    if (isTransientPrismaError(error)) {
      return null;
    }

    throw error;
  }
}

function isTransientPrismaError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as {
    code?: string;
    message?: string;
    meta?: { driverAdapterError?: { message?: string; cause?: { message?: string } } };
  };
  if (candidate.code && ['ECONNREFUSED', 'EAI_AGAIN', 'ENOTFOUND', 'ETIMEDOUT', 'P1001', 'P1008'].includes(candidate.code)) {
    return true;
  }

  const driverMessage = candidate.meta?.driverAdapterError?.message || candidate.meta?.driverAdapterError?.cause?.message || '';
  return /getaddrinfo\s+(EAI_AGAIN|ENOTFOUND)\b|Can't reach database server|Operation has timed out|SocketTimeout/i.test(
    `${candidate.message || ''} ${driverMessage}`,
  );
}

export function toSessionUser(profile: {
  id: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  wooCustomerId?: string | null;
}) {
  const derived = splitName(profile.name || '');

  return {
    id: String(profile.id),
    email: profile.email,
    name: `${profile.firstName || derived.firstName || ''} ${profile.lastName || derived.lastName || ''}`.trim(),
    firstName: profile.firstName || derived.firstName || '',
    lastName: profile.lastName || derived.lastName || '',
    phone: profile.phone || '',
    wooCustomerId: profile.wooCustomerId || null,
  };
}

function splitName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { firstName: '', lastName: '' };
  }

  const [firstName, ...rest] = trimmed.split(/\s+/);
  return {
    firstName,
    lastName: rest.join(' '),
  };
}
