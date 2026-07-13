import { z } from 'zod';

const paystackEnvSchema = z.object({
  PAYSTACK_SECRET_KEY: z.string().min(1),
  PAYSTACK_WEBHOOK_SECRET: z.string().min(1),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

export interface PaystackEnvironment {
  secretKey: string;
  webhookSecret: string;
  publicKey: string;
  siteUrl: string;
  apiBaseUrl: string;
}

export function parsePaystackEnv(rawEnv: Record<string, string | undefined>): PaystackEnvironment {
  const env = paystackEnvSchema.parse(rawEnv);

  return {
    secretKey: env.PAYSTACK_SECRET_KEY,
    webhookSecret: env.PAYSTACK_WEBHOOK_SECRET,
    publicKey: env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    siteUrl: env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ''),
    apiBaseUrl: 'https://api.paystack.co',
  };
}

export function getPaystackEnv() {
  return parsePaystackEnv(process.env);
}
