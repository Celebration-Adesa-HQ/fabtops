import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const loginCustomer = vi.fn();
const logoutCustomer = vi.fn();
const registerCustomer = vi.fn();
const requestCustomerPasswordReset = vi.fn();
const resetCustomerPassword = vi.fn();
const getCustomerSession = vi.fn();

vi.mock('@/lib/auth/account-service', () => ({
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  requestCustomerPasswordReset,
  resetCustomerPassword,
  getCustomerSession,
}));

describe('account auth routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('logs in with Neon Auth-backed credentials and forwards the session cookie', async () => {
    loginCustomer.mockResolvedValue({
      status: 200,
      headers: new Headers({
        'set-cookie': 'neon-auth.session_token=abc123; Path=/; HttpOnly',
      }),
      body: {
        user: {
          id: 'user_12',
          email: 'ada@example.com',
          firstName: 'Ada',
          lastName: 'Lovelace',
          wooCustomerId: '18',
        },
      },
    });

    const { POST } = await import('../../app/api/account/login/route');
    const request = new NextRequest('https://fabtops.test/api/account/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://fabtops.test' },
      body: JSON.stringify({ email: 'ada@example.com', password: 'password123' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(loginCustomer).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'password123',
      headers: request.headers,
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain('Path=/');
    expect(body).toMatchObject({
      success: true,
      data: {
        user: {
          id: 'user_12',
          email: 'ada@example.com',
          wooCustomerId: '18',
        },
      },
    });
  });

  it('registers the app user, syncs Woo, and forwards the authenticated session cookie', async () => {
    registerCustomer.mockResolvedValue({
      status: 200,
      headers: new Headers({
        'set-cookie': 'neon-auth.session_token=signup123; Path=/; HttpOnly',
      }),
      body: {
        user: {
          id: 'user_18',
          email: 'ada@example.com',
          firstName: 'Ada',
          lastName: 'Lovelace',
          wooCustomerId: '92',
        },
      },
    });

    const { POST } = await import('../../app/api/account/register/route');
    const request = new NextRequest('https://fabtops.test/api/account/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://fabtops.test' },
      body: JSON.stringify({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(registerCustomer).toHaveBeenCalledWith({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'password123',
      acceptsMarketing: false,
      headers: request.headers,
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(body).toMatchObject({
      success: true,
      data: {
        user: {
          wooCustomerId: '92',
        },
      },
    });
  });

  it('requests a Better Auth password reset instead of returning a mock response', async () => {
    requestCustomerPasswordReset.mockResolvedValue({
      status: 200,
      body: {
        message: 'If an account exists, a reset link has been sent.',
      },
    });

    const { POST } = await import('../../app/api/account/forgot-password/route');
    const request = new NextRequest('https://fabtops.test/api/account/forgot-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://fabtops.test' },
      body: JSON.stringify({ email: 'ada@example.com' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(requestCustomerPasswordReset).toHaveBeenCalledWith({
      email: 'ada@example.com',
      headers: request.headers,
    });
    expect(response.status).toBe(200);
    expect(body.message).toContain('reset link has been sent');
  });

  it('resets the password with a Neon Auth token payload', async () => {
    resetCustomerPassword.mockResolvedValue({
      status: 200,
      body: {
        message: 'Password reset. You can now sign in.',
      },
    });

    const { POST } = await import('../../app/api/account/reset-password/route');
    const request = new NextRequest('https://fabtops.test/api/account/reset-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://fabtops.test' },
      body: JSON.stringify({ token: 'reset-token-123456', password: 'password123' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(resetCustomerPassword).toHaveBeenCalledWith({
      token: 'reset-token-123456',
      password: 'password123',
      headers: request.headers,
    });
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('returns the current Neon Auth-backed session payload', async () => {
    getCustomerSession.mockResolvedValue({
      status: 200,
      body: {
        user: {
          id: 'user_18',
          email: 'ada@example.com',
          firstName: 'Ada',
          lastName: 'Lovelace',
          wooCustomerId: '92',
        },
      },
    });

    const { GET } = await import('../../app/api/account/session/route');
    const request = new NextRequest('https://fabtops.test/api/account/session', {
      method: 'GET',
      headers: { cookie: 'neon-auth.session_token=abc123' },
    });

    const response = await GET(request);
    const body = await response.json();

    expect(getCustomerSession).toHaveBeenCalledWith({ headers: request.headers });
    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      data: {
        user: {
          wooCustomerId: '92',
        },
      },
    });
  });

  it('clears the Neon Auth session cookie on logout', async () => {
    logoutCustomer.mockResolvedValue({
      status: 200,
      headers: new Headers({
        'set-cookie': 'neon-auth.session_token=; Path=/; Max-Age=0; HttpOnly',
      }),
      body: {
        message: 'Signed out',
      },
    });

    const { POST } = await import('../../app/api/account/logout/route');
    const request = new NextRequest('https://fabtops.test/api/account/logout', {
      method: 'POST',
      headers: { cookie: 'neon-auth.session_token=abc123' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(logoutCustomer).toHaveBeenCalledWith({ headers: request.headers });
    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
    expect(body.message).toBe('Signed out');
  });
});
