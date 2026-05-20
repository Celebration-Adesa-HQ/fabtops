import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  acceptsMarketing: z.boolean().optional().default(true),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().max(20).optional().or(z.literal('')),
});

export type ProfileUpdateSchema = z.infer<typeof profileUpdateSchema>;

export const cartActionSchema = z.object({
  action: z.enum(['create', 'get', 'add', 'update', 'remove', 'updateDiscount']),
  cartId: z.string().optional(),
  lines: z.array(z.any()).optional(),
  lineIds: z.array(z.string()).optional(),
  lineId: z.string().optional(),
  quantity: z.number().optional(),
  discountCodes: z.array(z.string()).optional(),
});

export type CartActionSchema = z.infer<typeof cartActionSchema>;

export const wishlistActionSchema = z.object({
  action: z.enum(['add', 'remove']),
  product: z.object({
    id: z.string().min(1),
    variantId: z.string().min(1),
    title: z.string().min(1),
    handle: z.string().min(1),
    price: z.string().min(1),
    currencyCode: z.string().min(1),
    imageUrl: z.string().url().or(z.string().min(1)),
    imageAlt: z.string().optional().default(''),
  }),
});

export type WishlistActionSchema = z.infer<typeof wishlistActionSchema>;

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type NewsletterSchema = z.infer<typeof newsletterSchema>;

