import { redirect } from 'next/navigation';
import { getServerAuthSession } from '@/lib/auth/session';
import { AccountPageClient } from '@/components/account/AccountPageClient';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/login?redirect=/account');
  }

  return <AccountPageClient initialUser={session.user} />;
}
