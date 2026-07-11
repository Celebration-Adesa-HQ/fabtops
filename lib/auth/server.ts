import { createNeonAuth } from '@neondatabase/auth/next/server';
import { getAuthEnv } from './env';

const env = getAuthEnv();

export const auth = createNeonAuth({
  baseUrl: env.neonAuthBaseUrl,
  cookies: {
    secret: env.neonAuthCookieSecret,
  },
});
