import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAccessToken, getServerAuthSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { mergeGuestStateSchema } from '@/lib/schemas';
import { validateCsrf } from '@/lib/security';
import { addCartItem, getCart, updateCartItem } from '@/lib/woocommerce/cart';
import { getProductById } from '@/lib/woocommerce/products';

const CART_TOKEN_COOKIE = 'woocommerce_cart_token';
const MERGE_KEY_COOKIE = 'fabtops_guest_merge_key';

type GuestCartItem = {
  id: string;
  variantId: string;
  title: string;
  handle: string;
  price: string;
  quantity: number;
  image: string;
  selectedOptions: Array<{ name: string; value: string }>;
};

type ServerCart = {
  items: Array<{
    id: string;
    variantId: string;
    title: string;
    handle: string;
    price: string;
    quantity: number;
    image: string;
    selectedOptions?: Array<{ name: string; value: string }>;
  }>;
  subtotal: number;
  totalAmount: number;
  discountCodes: Array<{ code: string; applicable: boolean }>;
  currencyCode?: string;
  shippingRates?: unknown[];
  paymentMethods?: string[];
  needsShipping?: boolean;
};

function isTransientPrismaError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as { code?: string; message?: string };
  if (candidate.code && ['ECONNREFUSED', 'EAI_AGAIN', 'ENOTFOUND', 'P1001'].includes(candidate.code)) {
    return true;
  }

  return /getaddrinfo\s+(EAI_AGAIN|ENOTFOUND)\b|Can't reach database server/i.test(candidate.message || '');
}

function normalizeOptions(options: Array<{ name: string; value: string }>) {
  return [...options]
    .map((option) => ({
      name: option.name.trim().toLowerCase(),
      value: option.value.trim().toLowerCase(),
    }))
    .sort((left, right) => left.name.localeCompare(right.name) || left.value.localeCompare(right.value));
}

function buildLineSignature(item: { variantId: string; selectedOptions?: Array<{ name: string; value: string }> }) {
  return JSON.stringify({
    variantId: item.variantId,
    selectedOptions: normalizeOptions(item.selectedOptions || []),
  });
}

function dedupeGuestCartItems(items: GuestCartItem[]) {
  const merged = new Map<string, GuestCartItem>();

  for (const item of items) {
    const signature = buildLineSignature(item);
    const existing = merged.get(signature);
    if (existing) {
      existing.quantity += item.quantity;
      continue;
    }

    merged.set(signature, {
      ...item,
      selectedOptions: item.selectedOptions || [],
    });
  }

  return [...merged.entries()].map(([signature, item]) => ({ signature, item }));
}

async function resolveInventoryCap(variantId: string) {
  const numericId = Number(variantId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return 99;
  }

  const product = await getProductById(numericId).catch(() => null);
  if (!product) {
    return 99;
  }

  const legacyVariant = (product as {
    variants?: { edges?: Array<{ node?: { id?: string; availableForSale?: boolean; stockQuantity?: number } }> };
    availableForSale?: boolean;
    stockQuantity?: number;
  }).variants?.edges?.find((item) => item.node?.id === variantId)?.node;
  const variation = product.variations?.find((item) => item.id === variantId);

  if (variation && variation.availability.purchasable === false) {
    return 0;
  }

  if (!variation && legacyVariant && legacyVariant.availableForSale === false) {
    return 0;
  }

  if (!variation && product.availability?.purchasable === false) {
    return 0;
  }

  if (!variation && !product.availability && (product as { availableForSale?: boolean }).availableForSale === false) {
    return 0;
  }

  const stockQuantity = legacyVariant?.stockQuantity ?? (product as { stockQuantity?: number }).stockQuantity;
  if (typeof stockQuantity === 'number' && Number.isFinite(stockQuantity)) {
    return Math.max(0, stockQuantity);
  }

  return 99;
}

function toWishlistData(
  items: Array<{
    productId: string;
    variantId: string;
    title: string;
    handle: string;
    price: string;
    currencyCode: string;
    imageUrl: string;
    imageAlt: string;
  }>,
) {
  return items.map((item) => ({
    id: item.productId,
    variantId: item.variantId,
    title: item.title,
    handle: item.handle,
    price: item.price,
    currencyCode: item.currencyCode,
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
  }));
}

async function readCanonicalWishlist(userId: string) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });

  return toWishlistData(items);
}

async function readCanonicalWishlistSafely(userId: string, fallbackItems: Awaited<ReturnType<typeof readCanonicalWishlist>> = []) {
  try {
    return await readCanonicalWishlist(userId);
  } catch (error) {
    if (isTransientPrismaError(error)) {
      return fallbackItems;
    }

    throw error;
  }
}

function normalizeWishlistFallback(
  items: Array<{
    id: string;
    variantId: string;
    title: string;
    handle: string;
    price: string;
    currencyCode: string;
    imageUrl?: string;
    imageAlt: string;
  }>,
) {
  return items.map((item) => ({
    ...item,
    imageUrl: item.imageUrl || '',
  }));
}

function buildCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function POST(request: NextRequest) {
  if (!validateCsrf(request)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  const parsed = mergeGuestStateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid guest merge payload' }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();
    const mergeKey = parsed.data.mergeKey;
    const currentToken = cookieStore.get(CART_TOKEN_COOKIE)?.value || null;
    const previousMergeKey = cookieStore.get(MERGE_KEY_COOKIE)?.value || null;
    const bearerToken = await getAccessToken();

    if (previousMergeKey === mergeKey) {
      const currentCart = await getCart(currentToken, bearerToken);
      const wishlist = await readCanonicalWishlistSafely(session.user.id);

      if (currentCart.cartToken && currentCart.cartToken !== currentToken) {
        cookieStore.set(CART_TOKEN_COOKIE, currentCart.cartToken, buildCookieOptions());
      }

      return NextResponse.json({
        success: true,
        data: {
          merged: false,
          cart: currentCart.cart,
          wishlist,
        },
      });
    }

    let cartResult = await getCart(currentToken, bearerToken);
    const dedupedGuestItems = dedupeGuestCartItems(parsed.data.guestCart.items);

    for (const { signature, item } of dedupedGuestItems) {
      const currentLine = cartResult.cart.items.find((cartItem) => buildLineSignature(cartItem) === signature);
      const currentQuantity = currentLine?.quantity || 0;
      const inventoryCap = await resolveInventoryCap(item.variantId);
      const desiredQuantity = Math.min(99, currentQuantity + item.quantity);
      const targetQuantity = Math.min(desiredQuantity, inventoryCap);

      if (!currentLine) {
        if (targetQuantity <= 0) {
          continue;
        }

        cartResult = await addCartItem(cartResult.cartToken, Number(item.variantId), targetQuantity, bearerToken);
        continue;
      }

      if (targetQuantity === currentQuantity) {
        continue;
      }

      cartResult = await updateCartItem(cartResult.cartToken, currentLine.id, targetQuantity, bearerToken);
    }

    const dedupedWishlist = new Map(parsed.data.guestWishlist.map((item) => [item.id, item]));
    let wishlistMerged = true;

    try {
      await prisma.$transaction(async (transaction) => {
        for (const item of dedupedWishlist.values()) {
          await transaction.wishlistItem.upsert({
            where: {
              userId_productId: {
                userId: session.user.id,
                productId: item.id,
              },
            },
            create: {
              userId: session.user.id,
              productId: item.id,
              variantId: item.variantId,
              title: item.title,
              handle: item.handle,
              price: item.price,
              currencyCode: item.currencyCode,
              imageUrl: item.imageUrl,
              imageAlt: item.imageAlt,
            },
            update: {
              variantId: item.variantId,
              title: item.title,
              handle: item.handle,
              price: item.price,
              currencyCode: item.currencyCode,
              imageUrl: item.imageUrl,
              imageAlt: item.imageAlt,
            },
          });
        }
      });
    } catch (error) {
      if (isTransientPrismaError(error)) {
        wishlistMerged = false;
      } else {
        throw error;
      }
    }

    if (cartResult.cartToken && cartResult.cartToken !== currentToken) {
      cookieStore.set(CART_TOKEN_COOKIE, cartResult.cartToken, buildCookieOptions());
    }
    cookieStore.set(MERGE_KEY_COOKIE, mergeKey, buildCookieOptions());

    return NextResponse.json({
      success: true,
      data: {
        merged: true,
        cart: cartResult.cart as ServerCart,
        wishlistMerged,
        wishlist: wishlistMerged
          ? await readCanonicalWishlistSafely(session.user.id, normalizeWishlistFallback(parsed.data.guestWishlist))
          : normalizeWishlistFallback(parsed.data.guestWishlist),
      },
    });
  } catch (error) {
    console.error('Unable to merge guest commerce state:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unable to merge guest commerce state',
      },
      { status: 400 },
    );
  }
}
