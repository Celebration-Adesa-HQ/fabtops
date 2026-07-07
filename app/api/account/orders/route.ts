import { customerAccountsUnavailable } from '@/lib/account-unavailable';

export function GET() {
  return customerAccountsUnavailable();
}
