import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getCustomerByEmail = vi.fn();
const createCustomer = vi.fn();

vi.mock('@/lib/woocommerce/customers', () => ({
  getCustomerByEmail,
  createCustomer,
}));

describe('account routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('WOOCOMMERCE_STORE_URL', 'https://shop.example.com');
    vi.stubEnv('WOOCOMMERCE_CONSUMER_KEY', 'ck_test');
    vi.stubEnv('WOOCOMMERCE_CONSUMER_SECRET', 'cs_test');
    vi.stubEnv('WOOCOMMERCE_API_VERSION', 'wc/v3');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('creates session cookies when login finds an existing Woo customer', async () => {
    getCustomerByEmail.mockResolvedValue({
      id: 12,
      first_name: 'Ada',
      last_name: 'Lovelace',
      email: 'ada@example.com',
      billing: { phone: '' },
      shipping: {},
    });

    const { POST } = await import('../../app/api/account/login/route');
    const request = new NextRequest('https://fabtops.test/api/account/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'ada@example.com', password: 'password123' }),
    });

    const response = await POST(request);
    const setCookie = response.headers.get('set-cookie') || '';
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      data: {
        user: {
          id: '12',
          email: 'ada@example.com',
        },
      },
    });
    expect(setCookie).toContain('fabtops_access_token=');
    expect(setCookie).toContain('fabtops_refresh_token=');
  });

  it('creates a Woo customer and session cookies on registration', async () => {
    createCustomer.mockResolvedValue({
      id: 18,
      first_name: 'Ada',
      last_name: 'Lovelace',
      email: 'ada@example.com',
      billing: { phone: '' },
      shipping: {},
    });

    const { POST } = await import('../../app/api/account/register/route');
    const request = new NextRequest('https://fabtops.test/api/account/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      data: {
        user: {
          id: '18',
          email: 'ada@example.com',
        },
      },
    });
    expect(createCustomer).toHaveBeenCalledWith({
      email: 'ada@example.com',
      first_name: 'Ada',
      last_name: 'Lovelace',
      username: 'ada',
      password: 'password123',
    });
  });

  it('rejects malformed login payloads before Woo customer lookup', async () => {
    const { POST } = await import('../../app/api/account/login/route');
    const request = new NextRequest('https://fabtops.test/api/account/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'short' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(getCustomerByEmail).not.toHaveBeenCalled();
  });

  it('returns 401 when the customer email does not exist', async () => {
    getCustomerByEmail.mockResolvedValue(null);

    const { POST } = await import('../../app/api/account/login/route');
    const request = new NextRequest('https://fabtops.test/api/account/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'ada@example.com', password: 'password123' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
