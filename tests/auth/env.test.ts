import { describe, expect, it } from 'vitest';
import { parseAuthEnv } from '../../lib/auth/env';

const validEnv = {
  NEON_AUTH_BASE_URL: 'https://example.neonauth.eu-west-2.aws.neon.tech/neondb/auth',
  NEON_AUTH_COOKIE_SECRET: 'super-secret-cookie-key-that-is-long-enough',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/fabtops',
};

describe('parseAuthEnv', () => {
  it('parses the Neon Auth and PostgreSQL requirements', () => {
    expect(parseAuthEnv(validEnv)).toEqual({
      neonAuthBaseUrl: 'https://example.neonauth.eu-west-2.aws.neon.tech/neondb/auth',
      neonAuthCookieSecret: 'super-secret-cookie-key-that-is-long-enough',
      databaseUrl: 'postgresql://postgres:postgres@localhost:5432/fabtops',
    });
  });

  it('rejects missing Neon Auth cookie secrets', () => {
    expect(() =>
      parseAuthEnv({
        ...validEnv,
        NEON_AUTH_COOKIE_SECRET: undefined,
      }),
    ).toThrow();
  });
});
