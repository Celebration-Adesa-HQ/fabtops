'use server';

import { searchProducts } from '../shopify';
import { createCustomer } from './auth';

export async function searchProductsAction(query: string) {
  if (!query || query.length < 2) return [];
  return await searchProducts(query);
}

export async function subscribeToNewsletter(email: string) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  try {
    const result = await createCustomer({
      email,
      acceptsMarketing: true,
      // We don't need first/last name for a simple newsletter sub
      // but Shopify might require something or create a partial profile
    });

    if (result.customerUserErrors && result.customerUserErrors.length > 0) {
      // Check if it's "Email has already been taken"
      const alreadyExists = result.customerUserErrors.some((err: any) => 
        err.message.toLowerCase().includes('taken') || err.message.toLowerCase().includes('exists')
      );
      
      if (alreadyExists) {
        return { success: true, message: "You're already in the circle!" };
      }
      
      return { success: false, error: result.customerUserErrors[0].message };
    }

    return { success: true, message: "Welcome to the circle!" };
  } catch (error: any) {
    console.error('Newsletter sub failed:', error);
    return { success: false, error: 'Subscription failed. Please try again later.' };
  }
}
