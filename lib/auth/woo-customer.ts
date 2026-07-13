import { prisma } from '@/lib/db/prisma';
import type { SessionUser } from './session';
import { createCustomer, getCustomer, getCustomerByEmail, type WooCustomer } from '@/lib/woocommerce/customers';

interface WooCustomerLinkResult {
  wooCustomerId: string;
  customer: WooCustomer;
}

function splitName(user: Pick<SessionUser, 'firstName' | 'lastName' | 'name'>) {
  const firstName = (user.firstName || '').trim();
  const lastName = (user.lastName || '').trim();

  if (firstName || lastName) {
    return { firstName, lastName };
  }

  const [derivedFirst = '', ...rest] = (user.name || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: derivedFirst,
    lastName: rest.join(' '),
  };
}

async function persistWooCustomerId(userId: string, wooCustomerId: string | null | undefined) {
  if (!wooCustomerId) {
    return;
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { wooCustomerId },
    });
  } catch (error) {
    if (isTransientPrismaPersistenceError(error)) {
      return;
    }

    throw error;
  }
}

function isTransientPrismaPersistenceError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as {
    code?: string;
    message?: string;
    meta?: { driverAdapterError?: { message?: string; cause?: { message?: string } } };
  };

  if (candidate.code && ['ECONNREFUSED', 'EAI_AGAIN', 'ENOTFOUND', 'ETIMEDOUT', 'P1001', 'P1008'].includes(candidate.code)) {
    return true;
  }

  const driverMessage = candidate.meta?.driverAdapterError?.message || candidate.meta?.driverAdapterError?.cause?.message || '';
  return /getaddrinfo\s+(EAI_AGAIN|ENOTFOUND)\b|Can't reach database server|Operation has timed out|SocketTimeout/i.test(
    `${candidate.message || ''} ${driverMessage}`,
  );
}

export async function ensureWooCustomerLink(sessionUser: SessionUser): Promise<WooCustomerLinkResult> {
  if (!sessionUser.email) {
    throw new Error('Signed-in customer email is required');
  }

  if (sessionUser.wooCustomerId) {
    try {
      const customer = await getCustomer(sessionUser.wooCustomerId);
      return {
        wooCustomerId: String(customer.id),
        customer,
      };
    } catch {
      // Fall through to repair by email or creation.
    }
  }

  const existingCustomer = await getCustomerByEmail(sessionUser.email);
  if (existingCustomer) {
    const wooCustomerId = String(existingCustomer.id);
    await persistWooCustomerId(sessionUser.id, wooCustomerId);
    return {
      wooCustomerId,
      customer: existingCustomer,
    };
  }

  const { firstName, lastName } = splitName(sessionUser);
  const createdCustomer = await createCustomer({
    email: sessionUser.email,
    first_name: firstName,
    last_name: lastName,
    username: sessionUser.email,
  });
  const wooCustomerId = String(createdCustomer.id);

  await persistWooCustomerId(sessionUser.id, wooCustomerId);

  return {
    wooCustomerId,
    customer: createdCustomer,
  };
}
