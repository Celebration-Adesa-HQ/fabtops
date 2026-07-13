import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerAuthSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { wishlistActionSchema } from '@/lib/schemas';

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

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: toWishlistData(items) });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to load wishlist' },
      { status: 400 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  const parsed = wishlistActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid wishlist payload' }, { status: 400 });
  }

  try {
    if (parsed.data.action === 'add') {
      await prisma.wishlistItem.upsert({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId: parsed.data.product.id,
          },
        },
        create: {
          userId: session.user.id,
          productId: parsed.data.product.id,
          variantId: parsed.data.product.variantId,
          title: parsed.data.product.title,
          handle: parsed.data.product.handle,
          price: parsed.data.product.price,
          currencyCode: parsed.data.product.currencyCode,
          imageUrl: parsed.data.product.imageUrl,
          imageAlt: parsed.data.product.imageAlt,
        },
        update: {
          variantId: parsed.data.product.variantId,
          title: parsed.data.product.title,
          handle: parsed.data.product.handle,
          price: parsed.data.product.price,
          currencyCode: parsed.data.product.currencyCode,
          imageUrl: parsed.data.product.imageUrl,
          imageAlt: parsed.data.product.imageAlt,
        },
      });
    } else {
      await prisma.wishlistItem.deleteMany({
        where: {
          userId: session.user.id,
          productId: parsed.data.product.id,
        },
      });
    }

    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: toWishlistData(items),
      message: 'Wishlist updated',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to update wishlist' },
      { status: 400 },
    );
  }
}
