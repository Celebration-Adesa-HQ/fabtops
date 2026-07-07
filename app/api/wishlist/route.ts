import { customerAccountsUnavailable } from '@/lib/account-unavailable';

export async function GET() {
  return customerAccountsUnavailable();
}

export async function POST() {
  return customerAccountsUnavailable();
}
