export class AuthConfigError extends Error {
  status = 503;

  constructor(message: string) {
    super(message);
    this.name = 'AuthConfigError';
  }
}

export interface AuthEnvironment {
  neonAuthBaseUrl: string;
  neonAuthCookieSecret: string;
  databaseUrl: string;
}

export function parseAuthEnv(rawEnv: Record<string, string | undefined>): AuthEnvironment {
  const neonAuthBaseUrl = rawEnv.NEON_AUTH_BASE_URL;
  const neonAuthCookieSecret = rawEnv.NEON_AUTH_COOKIE_SECRET;
  const databaseUrl = rawEnv.DATABASE_URL;

  if (!neonAuthBaseUrl) {
    throw new AuthConfigError('Missing NEON_AUTH_BASE_URL for customer authentication.');
  }

  if (!neonAuthCookieSecret) {
    throw new AuthConfigError('Missing NEON_AUTH_COOKIE_SECRET for customer authentication.');
  }

  if (!databaseUrl) {
    throw new AuthConfigError('Missing DATABASE_URL for Prisma customer authentication.');
  }

  return {
    neonAuthBaseUrl,
    neonAuthCookieSecret,
    databaseUrl,
  };
}

export function getAuthEnv(): AuthEnvironment {
  return parseAuthEnv(process.env);
}
