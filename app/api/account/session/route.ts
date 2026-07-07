import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'SESSION_EXPIRED' }, { status: 401 });
  }

  return NextResponse.json({ success: true, data: session });
}
