import { customerAccountsUnavailable } from '@/lib/account-unavailable';

export async function GET() {
  return customerAccountsUnavailable();
}
