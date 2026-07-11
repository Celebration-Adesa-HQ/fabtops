import { beforeEach, describe, expect, it, vi } from 'vitest';

const nextHeaders = vi.fn();
const authGetSession = vi.fn();
const prismaUserFindUnique = vi.fn();

vi.mock('next/headers', () => ({
  headers: nextHeaders,
}));

vi.mock('@/lib/auth/server', () => ({
  auth: {
    getSession: authGetSession,
  },
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: prismaUserFindUnique,
    },
  },
}));

describe('auth session helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('falls back to the auth identity when Prisma enrichment is temporarily unavailable', async () => {
    nextHeaders.mockResolvedValue(new Headers());
    authGetSession.mockResolvedValue({
      data: {
        user: {
          id: 'user_501',
          email: 'ada@example.com',
          name: 'Ada Lovelace',
        },
      },
      error: null,
    });
    prismaUserFindUnique.mockRejectedValue(
      Object.assign(new Error("Invalid `prisma.user.findUnique()` invocation:\n\nCan't reach database server at pooled.db.prisma.io"), {
        code: 'P1001',
      }),
    );

    const { getServerAuthSession } = await import('../../lib/auth/session');
    const session = await getServerAuthSession();

    expect(session).toMatchObject({
      user: {
        id: 'user_501',
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        wooCustomerId: null,
      },
    });
  });
});
