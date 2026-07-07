import { z } from 'zod';

const wooEnvSchema = z.object({
  WOOCOMMERCE_STORE_URL: z.string().url().refine((value) => value.startsWith('https://'), 'WOOCOMMERCE_STORE_URL must use HTTPS'),
  WOOCOMMERCE_CONSUMER_KEY: z.string().startsWith('ck_', 'WOOCOMMERCE_CONSUMER_KEY must start with ck_'),
  WOOCOMMERCE_CONSUMER_SECRET: z.string().startsWith('cs_', 'WOOCOMMERCE_CONSUMER_SECRET must start with cs_'),
  WOOCOMMERCE_API_VERSION: z.string().default('wc/v3'),
  WOOCOMMERCE_STORE_API_BASE: z.string().url().optional(),
});

export interface WooEnvironment {
  storeUrl: string;
  restBaseUrl: string;
  storeApiBaseUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

export function parseWooEnv(rawEnv: Record<string, string | undefined>): WooEnvironment {
  const exposedSecret = Object.keys(rawEnv).find((key) =>
    /^(NEXT_PUBLIC_|VITE_|REACT_APP_).*WOOCOMMERCE.*(KEY|SECRET)/i.test(key),
  );

  if (exposedSecret) {
    throw new Error(`WooCommerce credentials must not use a public environment variable: ${exposedSecret}`);
  }

  const env = wooEnvSchema.parse(rawEnv);
  const storeUrl = env.WOOCOMMERCE_STORE_URL.replace(/\/$/, '');
  const version = env.WOOCOMMERCE_API_VERSION.replace(/^\/+|\/+$/g, '');

  return {
    storeUrl,
    restBaseUrl: `${storeUrl}/wp-json/${version}`,
    storeApiBaseUrl: (env.WOOCOMMERCE_STORE_API_BASE || `${storeUrl}/wp-json/wc/store/v1`).replace(/\/$/, ''),
    consumerKey: env.WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: env.WOOCOMMERCE_CONSUMER_SECRET,
  };
}

export function getWooEnv(): WooEnvironment {
  return parseWooEnv(process.env);
}
