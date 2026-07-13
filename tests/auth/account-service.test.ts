import { beforeEach, describe, expect, it, vi } from 'vitest';

const signInEmail = vi.fn();
const signUpEmail = vi.fn();
const signOut = vi.fn();
const getSession = vi.fn();
const requestPasswordReset = vi.fn();
const resetPassword = vi.fn();

const createCustomer = vi.fn();
const prismaUserFindUnique = vi.fn();
const prismaUserUpsert = vi.fn();
const prismaUserUpdate = vi.fn();
const prismaUserDelete = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  auth: {
    signIn: {
      email: signInEmail,
    },
    signUp: {
      email: signUpEmail,
    },
    signOut,
    getSession,
    requestPasswordReset,
    resetPassword,
  },
}));

vi.mock('@/lib/woocommerce/customers', () => ({
  createCustomer,
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: prismaUserFindUnique,
      upsert: prismaUserUpsert,
      update: prismaUserUpdate,
      delete: prismaUserDelete,
    },
  },
}));

describe('account service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signs in through Neon Auth and merges the mirrored profile payload', async () => {
    signInEmail.mockResolvedValue({
      data: {
        user: {
          id: 'user_12',
          email: 'ada@example.com',
          name: 'Ada Lovelace',
        },
      },
      headers: new Headers({
        'set-cookie': 'neon-auth.session_token=abc123; Path=/; HttpOnly',
      }),
      error: null,
    });
    prismaUserFindUnique.mockResolvedValue({
      id: 'user_12',
      email: 'ada@example.com',
      name: 'Ada Lovelace',
      firstName: 'Ada',
      lastName: 'Lovelace',
      phone: '123456',
      wooCustomerId: '18',
      acceptsMarketing: false,
    });

    const { loginCustomer } = await import('../../lib/auth/account-service');
    const result = await loginCustomer({
      email: 'ada@example.com',
      password: 'password123',
      headers: new Headers({ origin: 'https://fabtops.test' }),
    });

    expect(signInEmail).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'password123',
    });
    expect(result).toMatchObject({
      status: 200,
      body: {
        user: {
          id: 'user_12',
          firstName: 'Ada',
          wooCustomerId: '18',
        },
      },
    });
  });

  it('still signs in when Prisma profile lookup is temporarily unavailable', async () => {
    signInEmail.mockResolvedValue({
      data: {
        user: {
          id: 'user_77',
          email: 'ada@example.com',
          name: 'Ada Lovelace',
        },
      },
      headers: new Headers(),
      error: null,
    });
    prismaUserFindUnique.mockRejectedValue(
      Object.assign(new Error("Invalid `prisma.user.findUnique()` invocation:\n\nCan't reach database server at pooled.db.prisma.io"), {
        code: 'P1001',
      }),
    );
    prismaUserUpsert.mockRejectedValue(
      Object.assign(new Error("Invalid `prisma.user.upsert()` invocation:\n\nCan't reach database server at pooled.db.prisma.io"), {
        code: 'P1001',
      }),
    );

    const { loginCustomer } = await import('../../lib/auth/account-service');
    const result = await loginCustomer({
      email: 'ada@example.com',
      password: 'password123',
      headers: new Headers({ origin: 'https://fabtops.test' }),
    });

    expect(result).toMatchObject({
      status: 200,
      body: {
        user: {
          id: 'user_77',
          email: 'ada@example.com',
          firstName: 'Ada',
          lastName: 'Lovelace',
          wooCustomerId: null,
        },
      },
    });
  });

  it('creates the Neon Auth user first, mirrors the Woo customer, and persists wooCustomerId', async () => {
    signUpEmail.mockResolvedValue({
      data: {
        user: {
          id: 'user_18',
          email: 'ada@example.com',
          name: 'Ada Lovelace',
        },
      },
      headers: new Headers({
        'set-cookie': 'neon-auth.session_token=signup123; Path=/; HttpOnly',
      }),
      error: null,
    });
    createCustomer.mockResolvedValue({
      id: 92,
      email: 'ada@example.com',
      first_name: 'Ada',
      last_name: 'Lovelace',
      billing: {
        phone: '',
      },
      shipping: {},
    });
    prismaUserUpsert.mockResolvedValue({
      id: 'user_18',
      email: 'ada@example.com',
      name: 'Ada Lovelace',
      firstName: 'Ada',
      lastName: 'Lovelace',
      phone: '',
      wooCustomerId: null,
      acceptsMarketing: false,
    });
    prismaUserUpdate.mockResolvedValue({
      id: 'user_18',
      email: 'ada@example.com',
      name: 'Ada Lovelace',
      firstName: 'Ada',
      lastName: 'Lovelace',
      phone: '',
      wooCustomerId: '92',
    });

    const { registerCustomer } = await import('../../lib/auth/account-service');
    const result = await registerCustomer({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'password123',
      acceptsMarketing: false,
      headers: new Headers({ origin: 'https://fabtops.test' }),
    });

    expect(signUpEmail).toHaveBeenCalledWith({
      email: 'ada@example.com',
      name: 'Ada Lovelace',
      password: 'password123',
    });
    expect(prismaUserUpsert).toHaveBeenCalledWith({
      where: { id: 'user_18' },
      create: {
        id: 'user_18',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        firstName: 'Ada',
        lastName: 'Lovelace',
        phone: '',
        wooCustomerId: null,
        acceptsMarketing: false,
      },
      update: {
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        firstName: 'Ada',
        lastName: 'Lovelace',
        acceptsMarketing: false,
      },
    });
    expect(createCustomer).toHaveBeenCalledWith({
      email: 'ada@example.com',
      first_name: 'Ada',
      last_name: 'Lovelace',
      username: 'ada@example.com',
      password: 'password123',
    });
    expect(prismaUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user_18' },
      data: { wooCustomerId: '92' },
    });
    expect(result.body.user.wooCustomerId).toBe('92');
  });

  it('rolls back the mirrored profile when Woo customer creation fails after Neon Auth signup', async () => {
    signUpEmail.mockResolvedValue({
      data: {
        user: {
          id: 'user_29',
          email: 'ada@example.com',
          name: 'Ada Lovelace',
        },
      },
      headers: new Headers(),
      error: null,
    });
    prismaUserUpsert.mockResolvedValue({
      id: 'user_29',
      email: 'ada@example.com',
      name: 'Ada Lovelace',
      firstName: 'Ada',
      lastName: 'Lovelace',
      phone: '',
      wooCustomerId: null,
      acceptsMarketing: false,
    });
    createCustomer.mockRejectedValue(new Error('Woo customer sync failed'));

    const { registerCustomer } = await import('../../lib/auth/account-service');

    await expect(
      registerCustomer({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        password: 'password123',
        acceptsMarketing: false,
        headers: new Headers({ origin: 'https://fabtops.test' }),
      }),
    ).rejects.toThrow('Woo customer sync failed');

    expect(prismaUserDelete).toHaveBeenCalledWith({ where: { id: 'user_29' } });
  });

  it('does not attempt mirrored-profile cleanup when prisma upsert fails before the profile exists', async () => {
    signUpEmail.mockResolvedValue({
      data: {
        user: {
          id: 'user_41',
          email: 'ada@example.com',
          name: 'Ada Lovelace',
        },
      },
      headers: new Headers(),
      error: null,
    });
    prismaUserUpsert.mockRejectedValue(
      Object.assign(new Error('Invalid `prisma.user.upsert()` invocation:'), { code: 'ECONNREFUSED' }),
    );

    const { registerCustomer } = await import('../../lib/auth/account-service');

    await expect(
      registerCustomer({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        password: 'password123',
        acceptsMarketing: false,
        headers: new Headers({ origin: 'https://fabtops.test' }),
      }),
    ).rejects.toThrow('Unable to reach the Prisma database configured by DATABASE_URL.');

    expect(prismaUserDelete).not.toHaveBeenCalled();
    expect(createCustomer).not.toHaveBeenCalled();
  });

  it('returns the Neon Auth session user enriched by the mirrored profile', async () => {
    getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user_18',
            email: 'ada@example.com',
            name: 'Ada Lovelace',
          },
        },
      },
      headers: new Headers(),
      error: null,
    });
    prismaUserFindUnique.mockResolvedValue({
      id: 'user_18',
      email: 'ada@example.com',
      name: 'Ada Lovelace',
      firstName: 'Ada',
      lastName: 'Lovelace',
      phone: '123456',
      wooCustomerId: '92',
      acceptsMarketing: false,
    });

    const { getCustomerSession } = await import('../../lib/auth/account-service');
    const result = await getCustomerSession({
      headers: new Headers({ cookie: 'neon-auth.session_token=abc123' }),
    });

    expect(getSession).toHaveBeenCalledWith();
    expect(result.body.user.wooCustomerId).toBe('92');
  });

  it('falls back to the auth session user when Prisma profile lookup is temporarily unavailable', async () => {
    getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user_88',
            email: 'ada@example.com',
            name: 'Ada Lovelace',
          },
        },
      },
      headers: new Headers(),
      error: null,
    });
    prismaUserFindUnique.mockRejectedValue(
      Object.assign(new Error("Invalid `prisma.user.findUnique()` invocation:\n\nCan't reach database server at pooled.db.prisma.io"), {
        code: 'P1001',
      }),
    );

    const { getCustomerSession } = await import('../../lib/auth/account-service');
    const result = await getCustomerSession({
      headers: new Headers({ cookie: 'neon-auth.session_token=abc123' }),
    });

    expect(result).toMatchObject({
      status: 200,
      body: {
        user: {
          id: 'user_88',
          email: 'ada@example.com',
          firstName: 'Ada',
          lastName: 'Lovelace',
          wooCustomerId: null,
        },
      },
    });
  });

  it('returns the auth session user when Prisma session enrichment times out', async () => {
    getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user_91',
            email: 'grace@example.com',
            name: 'Grace Hopper',
          },
        },
      },
      headers: new Headers(),
      error: null,
    });
    prismaUserFindUnique.mockRejectedValue(
      Object.assign(new Error('Operation has timed out'), {
        code: 'P1008',
      }),
    );

    const { getCustomerSession } = await import('../../lib/auth/account-service');
    const result = await getCustomerSession({
      headers: new Headers({ cookie: 'neon-auth.session_token=abc123' }),
    });

    expect(result).toMatchObject({
      status: 200,
      body: {
        user: {
          id: 'user_91',
          email: 'grace@example.com',
          firstName: 'Grace',
          lastName: 'Hopper',
          wooCustomerId: null,
        },
      },
    });
  });

  it('delegates forgot-password and reset-password through Neon Auth methods', async () => {
    requestPasswordReset.mockResolvedValue({
      data: {
        status: true,
      },
      headers: new Headers(),
      error: null,
    });
    resetPassword.mockResolvedValue({
      data: {
        status: true,
      },
      headers: new Headers(),
      error: null,
    });

    const { requestCustomerPasswordReset, resetCustomerPassword } = await import('../../lib/auth/account-service');

    await requestCustomerPasswordReset({
      email: 'ada@example.com',
      headers: new Headers({ origin: 'https://fabtops.test' }),
    });
    await resetCustomerPassword({
      token: 'reset-token-123456',
      password: 'password123',
      headers: new Headers({ origin: 'https://fabtops.test' }),
    });

    expect(requestPasswordReset).toHaveBeenCalledWith({
      email: 'ada@example.com',
      redirectTo: '/login',
    });
    expect(resetPassword).toHaveBeenCalledWith({
      newPassword: 'password123',
      token: 'reset-token-123456',
    });
  });
});
