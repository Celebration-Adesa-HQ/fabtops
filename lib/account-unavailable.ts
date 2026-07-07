import { NextResponse } from 'next/server';

export const CUSTOMER_ACCOUNTS_UNAVAILABLE = 'CUSTOMER_ACCOUNTS_UNAVAILABLE';

export function customerAccountsUnavailable(status = 503) {
  return NextResponse.json({
    success: false,
    data: null,
    message: CUSTOMER_ACCOUNTS_UNAVAILABLE,
    code: CUSTOMER_ACCOUNTS_UNAVAILABLE,
  }, { status });
}
