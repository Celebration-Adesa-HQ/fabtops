import { beforeEach, describe, expect, it, vi } from 'vitest';

const getCustomer = vi.fn();
const getCustomerByEmail = vi.fn();
const createCustomer = vi.fn();
const prismaUserUpdate = vi.fn();

vi.mock('@/lib/woocommerce/customers', () => ({
  getCustomer,
  getCustomerByEmail,
  createCustomer,
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      update: prismaUserUpdate,
    },
  },
}));

describe('Woo customer link repair', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('repairs a missing wooCustomerId by finding the customer via email', async () => {
    getCustomerByEmail.mockResolvedValue({
      id: 92,
      email: 'ada@example.com',
      first_name: 'Ada',
      last_name: 'Lovelace',
      billing: {},
      shipping: {},
    });

    const { ensureWooCustomerLink } = await import('../../lib/auth/woo-customer');
    const result = await ensureWooCustomerLink({
      id: 'user_18',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      name: 'Ada Lovelace',
      wooCustomerId: null,
    });

    expect(getCustomerByEmail).toHaveBeenCalledWith('ada@example.com');
    expect(prismaUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user_18' },
      data: { wooCustomerId: '92' },
    });
    expect(result.wooCustomerId).toBe('92');
  });

  it('returns the Woo customer when local wooCustomerId persistence times out', async () => {
    getCustomerByEmail.mockResolvedValue({
      id: 92,
      email: 'ada@example.com',
      first_name: 'Ada',
      last_name: 'Lovelace',
      billing: {},
      shipping: {},
    });
    prismaUserUpdate.mockRejectedValue(
      Object.assign(new Error('Operation has timed out'), {
        code: 'P1008',
      }),
    );

    const { ensureWooCustomerLink } = await import('../../lib/auth/woo-customer');
    const result = await ensureWooCustomerLink({
      id: 'user_18',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      name: 'Ada Lovelace',
      wooCustomerId: null,
    });

    expect(getCustomerByEmail).toHaveBeenCalledWith('ada@example.com');
    expect(prismaUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user_18' },
      data: { wooCustomerId: '92' },
    });
    expect(result.wooCustomerId).toBe('92');
    expect(result.customer.id).toBe(92);
  });

  it('creates and persists a Woo customer when no link or email match exists', async () => {
    getCustomerByEmail.mockResolvedValue(null);
    createCustomer.mockResolvedValue({
      id: 105,
      email: 'ada@example.com',
      first_name: 'Ada',
      last_name: 'Lovelace',
      billing: {},
      shipping: {},
    });

    const { ensureWooCustomerLink } = await import('../../lib/auth/woo-customer');
    const result = await ensureWooCustomerLink({
      id: 'user_18',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      name: 'Ada Lovelace',
      wooCustomerId: null,
    });

    expect(createCustomer).toHaveBeenCalledWith({
      email: 'ada@example.com',
      first_name: 'Ada',
      last_name: 'Lovelace',
      username: 'ada@example.com',
    });
    expect(prismaUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user_18' },
      data: { wooCustomerId: '105' },
    });
    expect(result.wooCustomerId).toBe('105');
  });
});
