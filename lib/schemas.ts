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
  acceptsMarketing: z.boolean().optional(),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().max(20).optional().or(z.literal('')),
});

export type ProfileUpdateSchema = z.infer<typeof profileUpdateSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10).max(255),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const accountAddressSchema = z.object({
  firstName: z.string().trim().max(100).default(''),
  lastName: z.string().trim().max(100).default(''),
  company: z.string().trim().max(100).default(''),
  address1: z.string().trim().max(200).default(''),
  address2: z.string().trim().max(200).default(''),
  city: z.string().trim().max(100).default(''),
  state: z.string().trim().max(100).default(''),
  postcode: z.string().trim().max(30).default(''),
  country: z.string().trim().length(2).or(z.literal('')).default(''),
  email: z.string().email().or(z.literal('')).optional(),
  phone: z.string().trim().max(30).optional(),
});

export const accountAddressesSchema = z.object({
  billing: accountAddressSchema,
  shipping: accountAddressSchema.omit({ email: true, phone: true }),
});

export const checkoutAddressSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  company: z.string().trim().max(100).optional(),
  address_1: z.string().trim().min(1).max(200),
  address_2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().max(100).optional(),
  postcode: z.string().trim().max(30).optional(),
  country: z.string().trim().length(2),
  email: z.string().email().optional(),
  phone: z.string().trim().max(30).optional(),
});

export const cartActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.enum(['create', 'get']) }),
  z.object({ action: z.literal('add'), productId: z.number().int().positive(), quantity: z.number().int().min(1).max(99) }),
  z.object({ action: z.literal('update'), lineKey: z.string().min(1), quantity: z.number().int().min(1).max(99) }),
  z.object({ action: z.literal('remove'), lineKey: z.string().min(1) }),
  z.object({ action: z.literal('applyCoupon'), code: z.string().trim().min(1).max(100) }),
  z.object({ action: z.literal('removeCoupon'), code: z.string().trim().min(1).max(100) }),
  z.object({ action: z.literal('updateCustomer'), billing_address: checkoutAddressSchema, shipping_address: checkoutAddressSchema }),
  z.object({ action: z.literal('selectShipping'), packageId: z.number().int().min(0), rateId: z.string().min(1) }),
]);

export type CartActionSchema = z.infer<typeof cartActionSchema>;

export const checkoutSchema = z.object({
  billing_address: checkoutAddressSchema.extend({
    email: z.string().email(),
    phone: z.string().trim().min(5).max(30),
  }),
  shipping_address: checkoutAddressSchema,
  payment_method: z.string().trim().min(1).max(100),
  selected_currency: z.string().trim().length(3).optional(),
  selected_shipping_rate: z.object({
    package_id: z.number().int().min(0),
    rate_id: z.string().trim().min(1).max(200),
  }).optional(),
  coupon_codes: z.array(z.string().trim().min(1).max(100)).optional(),
  payment_data: z.array(z.object({
    key: z.string().min(1).max(100),
    value: z.string().max(500),
  })),
  customer_note: z.string().trim().max(500).optional(),
});

export type CheckoutSchema = z.infer<typeof checkoutSchema>;

export const checkoutVerificationSchema = z.object({
  reference: z.string().trim().min(1).max(200),
});

export type CheckoutVerificationSchema = z.infer<typeof checkoutVerificationSchema>;

export const productReviewMutationSchema = z.object({
  productId: z.string().trim().min(1),
  productHandle: z.string().trim().min(1).optional(),
  rating: z.number().int().min(0).max(5),
  review: z.string().trim().min(1).max(5000),
});

export type ProductReviewMutationSchema = z.infer<typeof productReviewMutationSchema>;

export const productReviewDeleteSchema = z.object({
  productId: z.string().trim().min(1),
  productHandle: z.string().trim().min(1).optional(),
});

export type ProductReviewDeleteSchema = z.infer<typeof productReviewDeleteSchema>;

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

export const mergeGuestCartItemSchema = z.object({
  id: z.string().min(1),
  variantId: z.string().min(1),
  title: z.string().min(1),
  handle: z.string().min(1),
  price: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  image: z.string().min(1),
  selectedOptions: z.array(z.object({
    name: z.string().min(1),
    value: z.string().min(1),
  })).default([]),
});

export const mergeGuestStateSchema = z.object({
  mergeKey: z.string().min(1).max(5000),
  guestCart: z.object({
    items: z.array(mergeGuestCartItemSchema).default([]),
  }),
  guestWishlist: z.array(wishlistActionSchema.shape.product).default([]),
});

export type MergeGuestStateSchema = z.infer<typeof mergeGuestStateSchema>;

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type NewsletterSchema = z.infer<typeof newsletterSchema>;

