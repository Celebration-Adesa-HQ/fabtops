import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerAuthSession } from '@/lib/auth/session';
import { productReviewDeleteSchema, productReviewMutationSchema } from '@/lib/schemas';
import {
  createProductReview,
  deleteProductReview,
  getCustomerProductReview,
  updateProductReview,
} from '@/lib/woocommerce/reviews';

function reviewerName(user: {
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
}) {
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  if (fullName) return fullName;
  if (user.name?.trim()) return user.name.trim();
  return user.email.split('@')[0] || user.email;
}

function revalidateProductReviewCaches(productId: string, productHandle?: string) {
  revalidateTag(`woo-product-reviews-${productId}`, 'max');
  if (productHandle) {
    revalidatePath(`/product/${productHandle}`);
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  const parsed = productReviewMutationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid review payload' }, { status: 400 });
  }

  try {
    const existingReview = await getCustomerProductReview(parsed.data.productId, session.user.email);
    if (existingReview) {
      return NextResponse.json({ success: false, error: 'You already reviewed this product.' }, { status: 409 });
    }

    const review = await createProductReview({
      productId: parsed.data.productId,
      reviewer: reviewerName(session.user),
      reviewerEmail: session.user.email,
      review: parsed.data.review,
      rating: parsed.data.rating,
    });

    revalidateProductReviewCaches(parsed.data.productId, parsed.data.productHandle);

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review submitted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to submit review' },
      { status: 502 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  const parsed = productReviewMutationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid review payload' }, { status: 400 });
  }

  try {
    const ownedReview = await getCustomerProductReview(parsed.data.productId, session.user.email);
    if (!ownedReview) {
      return NextResponse.json({ success: false, error: 'Review not found.' }, { status: 404 });
    }

    const review = await updateProductReview(ownedReview.id, {
      review: parsed.data.review,
      rating: parsed.data.rating,
    });

    revalidateProductReviewCaches(parsed.data.productId, parsed.data.productHandle);

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to update review' },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  const parsed = productReviewDeleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid review payload' }, { status: 400 });
  }

  try {
    const ownedReview = await getCustomerProductReview(parsed.data.productId, session.user.email);
    if (!ownedReview) {
      return NextResponse.json({ success: false, error: 'Review not found.' }, { status: 404 });
    }

    await deleteProductReview(ownedReview.id);
    revalidateProductReviewCaches(parsed.data.productId, parsed.data.productHandle);

    return NextResponse.json({
      success: true,
      data: { deleted: true },
      message: 'Review deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to delete review' },
      { status: 502 },
    );
  }
}
