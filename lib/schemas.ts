import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  acceptsMarketing: z.boolean().optional().default(true),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

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
