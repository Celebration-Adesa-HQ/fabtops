'use server';

import { searchProducts } from '../shopify';

export async function searchProductsAction(query: string) {
  if (!query || query.length < 2) return [];
  return await searchProducts(query);
}
