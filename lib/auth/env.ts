import { z } from 'zod';

export class AuthConfigError extends Error {
  status = 503;

  constructor(message: string) {
    super(message);
    this.name = 'AuthConfigError';
  }
}

const authEnvSchema = z.object({
  WOOCOMMERCE_STORE_URL: z.string().url(),
  FABTOPS_AUTH_CLIENT_SECRET: z.string().min(32, 'FABTOPS_AUTH_CLIENT_SECRET must be at least 32 characters'),
  FABTOPS_AUTH_BASE_URL: z.string().url().optional(),
});

export interface AuthEnvironment {
  authBaseUrl: string;
  clientSecret: string;
}

export function parseAuthEnv(rawEnv: Record<string, string | undefined>): AuthEnvironment {
  const exposedSecret = Object.keys(rawEnv).find((key) =>
    /^(NEXT_PUBLIC_|VITE_|REACT_APP_).*FABTOPS_AUTH_CLIENT_SECRET/i.test(key),
  );

  if (exposedSecret) {
    throw new AuthConfigError(`Auth bridge secrets must not use a public environment variable: ${exposedSecret}`);
  }

  const parsed = authEnvSchema.safeParse(rawEnv);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new AuthConfigError(`Missing or invalid auth configuration. ${message}`);
  }

  const env = parsed.data;
  const storeUrl = env.WOOCOMMERCE_STORE_URL.replace(/\/$/, '');

  return {
    authBaseUrl: (env.FABTOPS_AUTH_BASE_URL || `${storeUrl}/wp-json/fabtops/v1`).replace(/\/$/, ''),
    clientSecret: env.FABTOPS_AUTH_CLIENT_SECRET,
  };
}

export function getAuthEnv() {
  return parseAuthEnv(process.env);
}
