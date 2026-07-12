import { auth } from './server';
import { prisma } from '@/lib/db/prisma';
import { createCustomer } from '@/lib/woocommerce/customers';
import { AuthRequestError } from './errors';

interface AuthHeadersInput {
  headers: Headers;
}

interface LoginInput extends AuthHeadersInput {
  email: string;
  password: string;
}

interface RegisterInput extends AuthHeadersInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  acceptsMarketing?: boolean;
}

interface RequestResetInput extends AuthHeadersInput {
  email: string;
}

interface ResetPasswordInput extends AuthHeadersInput {
  token: string;
  password: string;
}

interface AuthServiceResult<T> {
  status: number;
  headers: Headers;
  body: T;
}

interface SessionUser {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  wooCustomerId: string | null;
}

function normalizeHeaders(input: Headers) {
  return new Headers(input);
}

interface NeonAuthUserLike {
  id: string | number;
  email: string;
  name?: string | null;
}

interface MirroredProfile {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  wooCustomerId: string | null;
  acceptsMarketing?: boolean;
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

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error && typeof error === 'object') {
    const candidate = error as Record<string, unknown>;
    if (typeof candidate.message === 'string' && candidate.message) {
      return candidate.message;
    }
  }

  return fallbackMessage;
}

function toSessionUser(user: Record<string, unknown>): SessionUser {
  return {
    id: String(user.id),
    email: String(user.email),
    name: typeof user.name === 'string' ? user.name : '',
    firstName: typeof user.firstName === 'string' ? user.firstName : '',
    lastName: typeof user.lastName === 'string' ? user.lastName : '',
    phone: typeof user.phone === 'string' ? user.phone : '',
    wooCustomerId: typeof user.wooCustomerId === 'string' ? user.wooCustomerId : null,
  };
}

function toAuthUser(user: NeonAuthUserLike, profile?: Partial<MirroredProfile> | null): SessionUser {
  const fallbackName = typeof user.name === 'string' ? user.name : '';
  const derivedName = profile?.name || fallbackName;
  const derivedParts = splitName(derivedName);

  return {
    id: String(user.id),
    email: String(user.email),
    name: profile?.name || fallbackName,
    firstName: profile?.firstName || derivedParts.firstName,
    lastName: profile?.lastName || derivedParts.lastName,
    phone: profile?.phone || '',
    wooCustomerId: profile?.wooCustomerId || null,
  };
}

function extractAuthUser(data: unknown): NeonAuthUserLike | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const directUser = (data as { user?: NeonAuthUserLike }).user;
  if (directUser?.id && directUser?.email) {
    return directUser;
  }

  const nestedUser = (data as { session?: { user?: NeonAuthUserLike } }).session?.user;
  if (nestedUser?.id && nestedUser?.email) {
    return nestedUser;
  }

  return null;
}

function ensureNoAuthError(
  error: { message?: string; status: number; code?: string } | null | undefined,
  fallbackMessage: string,
) {
  if (error) {
    throw new AuthRequestError(getErrorMessage(error, fallbackMessage), error.status || 500, error.code);
  }
}

function normalizePersistenceError(error: unknown) {
  if (error && typeof error === 'object') {
    const candidate = error as { code?: string; message?: string };
    if (isTransientPrismaConnectivityError(candidate)) {
      return new AuthRequestError('Unable to reach the Prisma database configured by DATABASE_URL.', 503, candidate.code);
    }
  }

  return error;
}

function isTransientPrismaConnectivityError(error: { code?: string; message?: string } | null | undefined) {
  const code = error?.code;
  if (code && ['ECONNREFUSED', 'EAI_AGAIN', 'ENOTFOUND', 'ETIMEDOUT', 'P1001', 'P1008'].includes(code)) {
    return true;
  }

  const message = error?.message || '';
  return /getaddrinfo\s+(EAI_AGAIN|ENOTFOUND)\b|Can't reach database server|Operation has timed out|SocketTimeout/i.test(message);
}

async function findMirroredProfileSafely(userId: string) {
  try {
    return await findMirroredProfile(userId);
  } catch (error) {
    if (normalizePersistenceError(error) instanceof AuthRequestError) {
      return null;
    }

    throw error;
  }
}

async function ensureMirroredProfileForLogin(authUser: NeonAuthUserLike) {
  try {
    return await findMirroredProfile(String(authUser.id)) ?? await upsertMirroredProfile({ authUser });
  } catch (error) {
    if (normalizePersistenceError(error) instanceof AuthRequestError) {
      return null;
    }

    throw error;
  }
}

async function findMirroredProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
  }) as Promise<MirroredProfile | null>;
}

async function upsertMirroredProfile(input: {
  authUser: NeonAuthUserLike;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing?: boolean;
}) {
  const fullName = typeof input.authUser.name === 'string' ? input.authUser.name.trim() : '';
  const derived = splitName(fullName);
  const firstName = input.firstName ?? derived.firstName;
  const lastName = input.lastName ?? derived.lastName;
  const name = `${firstName} ${lastName}`.trim() || fullName || String(input.authUser.email);

  return prisma.user.upsert({
    where: { id: String(input.authUser.id) },
    create: {
      id: String(input.authUser.id),
      email: input.authUser.email,
      name,
      firstName,
      lastName,
      phone: input.phone ?? '',
      wooCustomerId: null,
      acceptsMarketing: input.acceptsMarketing ?? false,
    },
    update: {
      email: input.authUser.email,
      name,
      firstName,
      lastName,
      acceptsMarketing: input.acceptsMarketing ?? false,
    },
  });
}

export async function loginCustomer(input: LoginInput): Promise<AuthServiceResult<{ user: SessionUser }>> {
  void normalizeHeaders(input.headers);

  const result = await auth.signIn.email({
    email: input.email,
    password: input.password,
  });

  ensureNoAuthError(result.error, 'Unable to sign in');

  const authUser = extractAuthUser(result.data);
  if (!authUser) {
    throw new AuthRequestError('Unable to sign in', 500);
  }

  const profile = await ensureMirroredProfileForLogin(authUser);

  return {
    status: 200,
    headers: new Headers(),
    body: {
      user: toAuthUser(authUser, profile),
    },
  };
}

export async function registerCustomer(input: RegisterInput): Promise<AuthServiceResult<{ user: SessionUser }>> {
  void normalizeHeaders(input.headers);

  const result = await auth.signUp.email({
    email: input.email,
    password: input.password,
    name: `${input.firstName} ${input.lastName}`.trim(),
  });

  ensureNoAuthError(result.error, 'Unable to create account');

  const authUser = extractAuthUser(result.data);
  if (!authUser) {
    throw new AuthRequestError('Unable to create account', 500);
  }

  let mirroredProfileCreated = false;

  try {
    await upsertMirroredProfile({
      authUser,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: '',
      acceptsMarketing: input.acceptsMarketing ?? false,
    });
    mirroredProfileCreated = true;

    const customer = await createCustomer({
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      username: input.email,
      password: input.password,
    });

    const updatedUser = await prisma.user.update({
      where: { id: String(authUser.id) },
      data: {
        wooCustomerId: String(customer.id),
      },
    });

    return {
      status: 200,
      headers: new Headers(),
      body: {
        user: toSessionUser(updatedUser as unknown as Record<string, unknown>),
      },
    };
  } catch (error) {
    if (mirroredProfileCreated) {
      await prisma.user.delete({ where: { id: String(authUser.id) } });
    }

    throw normalizePersistenceError(error);
  }
}

export async function logoutCustomer(input: AuthHeadersInput): Promise<AuthServiceResult<null>> {
  void normalizeHeaders(input.headers);

  const result = await auth.signOut();

  ensureNoAuthError(result.error, 'Unable to sign out');

  return {
    status: 200,
    headers: new Headers(),
    body: null,
  };
}

export async function getCustomerSession(input: AuthHeadersInput): Promise<AuthServiceResult<{ user: SessionUser } | null>> {
  void normalizeHeaders(input.headers);

  const result = await auth.getSession();

  ensureNoAuthError(result.error, 'Unable to load session');

  const authUser = extractAuthUser(result.data);
  if (!authUser) {
    return {
      status: 401,
      headers: new Headers(),
      body: null,
    };
  }

  const profile = await findMirroredProfileSafely(String(authUser.id));

  return {
    status: 200,
    headers: new Headers(),
    body: {
      user: toAuthUser(authUser, profile),
    },
  };
}

export async function requestCustomerPasswordReset(
  input: RequestResetInput,
): Promise<AuthServiceResult<{ message: string }>> {
  void normalizeHeaders(input.headers);

  const result = await auth.requestPasswordReset({
    email: input.email,
    redirectTo: '/login',
  });

  ensureNoAuthError(result.error, 'Unable to send reset email');

  return {
    status: 200,
    headers: new Headers(),
    body: {
      message: 'If an account exists, a reset link has been sent.',
    },
  };
}

export async function resetCustomerPassword(
  input: ResetPasswordInput,
): Promise<AuthServiceResult<{ message: string }>> {
  void normalizeHeaders(input.headers);

  const result = await auth.resetPassword({
    newPassword: input.password,
    token: input.token,
  });

  ensureNoAuthError(result.error, 'Unable to reset password');

  return {
    status: 200,
    headers: new Headers(),
    body: {
      message: 'Password reset. You can now sign in.',
    },
  };
}
