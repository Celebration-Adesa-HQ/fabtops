import { customerAccountsUnavailable } from '@/lib/account-unavailable';

export async function POST() {
  return customerAccountsUnavailable();
}
