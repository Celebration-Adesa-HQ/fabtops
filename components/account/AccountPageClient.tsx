'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthSessionStore } from '@/stores/use-auth-session-store';
import { useWishlistStore } from '@/stores/use-wishlist-store';

type AccountSection = 'profile' | 'addresses' | 'orders' | 'wishlist' | 'recovery';

interface SessionUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface AccountProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AccountAddress {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

interface AccountAddresses {
  billing: AccountAddress;
  shipping: AccountAddress;
}

interface AccountOrder {
  id: string;
  number: string;
  status: string;
  key?: string;
  dateCreated: string | null;
  total: {
    amount: string;
    currencyCode: string;
  };
  lineItems?: Array<{
    id: string;
    name: string;
    quantity: number;
    total: string;
    image?: string | null;
  }>;
  trackingUrl?: string;
}

interface AccountPageClientProps {
  initialUser: SessionUser;
}

const fieldClass = 'w-full rounded-2xl border border-brand-dark/10 bg-white px-4 py-3 text-sm text-brand-dark outline-none transition focus:border-brand-primary';
const panelClass = 'rounded-[2rem] border border-brand-dark/8 bg-white/80 p-6 shadow-sm md:p-8';
const emptyAddress = {
  firstName: '',
  lastName: '',
  company: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postcode: '',
  country: 'NG',
  email: '',
  phone: '',
};

async function readJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const result = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new Error('SESSION_EXPIRED');
  }

  if (!response.ok || !result?.success) {
    throw new Error(result?.error || 'Request failed');
  }

  return result.data as T;
}

function labelizeStatus(status: string) {
  return status.replace(/-/g, ' ');
}

function isRecoverableStatus(status: string) {
  return ['pending', 'failed', 'on-hold'].includes(status);
}

function buildRecoveryHref(order?: AccountOrder | null) {
  if (!order?.id || !order.key) {
    return '/checkout/recover';
  }

  const search = new URLSearchParams({
    orderId: order.id,
    key: order.key,
  });

  return `/checkout/recover?${search.toString()}`;
}

function SectionButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-3 text-[10px] font-black uppercase tracking-[0.32em] transition ${
        active
          ? 'bg-brand-dark text-brand-light'
          : 'border border-brand-dark/10 bg-white text-brand-dark hover:border-brand-primary hover:text-brand-dark'
      }`}
    >
      {label}
    </button>
  );
}

function AddressFields({
  prefix,
  address,
  onChange,
}: {
  prefix: 'billing' | 'shipping';
  address: AccountAddress;
  onChange: (field: keyof AccountAddress, value: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/80">First Name</span>
        <input className={fieldClass} value={address.firstName} onChange={(event) => onChange('firstName', event.target.value)} />
      </label>
      <label className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/80">Last Name</span>
        <input className={fieldClass} value={address.lastName} onChange={(event) => onChange('lastName', event.target.value)} />
      </label>
      <label className="space-y-2 md:col-span-2">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/80">Company</span>
        <input className={fieldClass} value={address.company} onChange={(event) => onChange('company', event.target.value)} />
      </label>
      <label className="space-y-2 md:col-span-2">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/80">Address Line 1</span>
        <input className={fieldClass} value={address.address1} onChange={(event) => onChange('address1', event.target.value)} />
      </label>
      <label className="space-y-2 md:col-span-2">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/80">Address Line 2</span>
        <input className={fieldClass} value={address.address2} onChange={(event) => onChange('address2', event.target.value)} />
      </label>
      <label className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/80">City</span>
        <input className={fieldClass} value={address.city} onChange={(event) => onChange('city', event.target.value)} />
      </label>
      <label className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/80">State</span>
        <input className={fieldClass} value={address.state} onChange={(event) => onChange('state', event.target.value)} />
      </label>
      <label className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/80">Postcode</span>
        <input className={fieldClass} value={address.postcode} onChange={(event) => onChange('postcode', event.target.value)} />
      </label>
      <label className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/80">Country</span>
        <input className={fieldClass} value={address.country} maxLength={2} onChange={(event) => onChange('country', event.target.value.toUpperCase())} />
      </label>
      {prefix === 'billing' ? (
        <>
          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/80">Email</span>
            <input className={fieldClass} value={address.email || ''} onChange={(event) => onChange('email', event.target.value)} />
          </label>
          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/80">Phone</span>
            <input className={fieldClass} value={address.phone || ''} onChange={(event) => onChange('phone', event.target.value)} />
          </label>
        </>
      ) : null}
    </div>
  );
}

export function AccountPageClient({ initialUser }: AccountPageClientProps) {
  const router = useRouter();
  const wishlist = useWishlistStore((state) => state.favorites);
  const initializeWishlist = useWishlistStore((state) => state.initializeWishlist);
  const logout = useAuthSessionStore((state) => state.logout);
  const [activeSection, setActiveSection] = useState<AccountSection>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [addressMessage, setAddressMessage] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAddresses, setIsSavingAddresses] = useState(false);
  const [profile, setProfile] = useState<AccountProfile>({
    id: initialUser.id,
    firstName: initialUser.firstName || '',
    lastName: initialUser.lastName || '',
    email: initialUser.email,
    phone: initialUser.phone || '',
  });
  const [addresses, setAddresses] = useState<AccountAddresses>({
    billing: { ...emptyAddress, email: initialUser.email },
    shipping: { ...emptyAddress },
  });
  const [orders, setOrders] = useState<AccountOrder[]>([]);

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      setIsLoading(true);
      setError('');

      try {
        const [nextProfile, nextAddresses, nextOrders] = await Promise.all([
          readJson<AccountProfile>('/api/account/me'),
          readJson<AccountAddresses>('/api/account/addresses'),
          readJson<AccountOrder[]>('/api/account/orders'),
          initializeWishlist(),
        ]);

        if (!active) {
          return;
        }

        setProfile(nextProfile);
        setAddresses(nextAddresses);
        setOrders(nextOrders);
      } catch (caught) {
        if (!active) {
          return;
        }

        const message = caught instanceof Error ? caught.message : 'Unable to load account details';
        if (message === 'SESSION_EXPIRED') {
          router.replace('/login?redirect=/account');
          router.refresh();
          return;
        }

        setError(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadAccount();

    return () => {
      active = false;
    };
  }, [initializeWishlist, router]);

  const pendingOrder = orders.find((order) => isRecoverableStatus(order.status)) || null;

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage('');

    try {
      const nextProfile = await readJson<AccountProfile>('/api/account/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
        }),
      });
      setProfile(nextProfile);
      setProfileMessage('Profile updated.');
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unable to update profile';
      if (message === 'SESSION_EXPIRED') {
        router.replace('/login?redirect=/account');
        router.refresh();
        return;
      }
      setProfileMessage(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const saveAddresses = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingAddresses(true);
    setAddressMessage('');

    try {
      const nextAddresses = await readJson<AccountAddresses>('/api/account/addresses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addresses),
      });
      setAddresses(nextAddresses);
      setAddressMessage('Addresses updated.');
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unable to update addresses';
      if (message === 'SESSION_EXPIRED') {
        router.replace('/login?redirect=/account');
        router.refresh();
        return;
      }
      setAddressMessage(message);
    } finally {
      setIsSavingAddresses(false);
    }
  };

  const signOut = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  const updateProfileField = (field: keyof AccountProfile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const updateAddressField = (group: keyof AccountAddresses, field: keyof AccountAddress, value: string) => {
    setAddresses((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-brand-light px-5 pb-24 pt-28 md:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[2.5rem] border border-brand-dark/8 bg-white/85 p-6 shadow-sm md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr] lg:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.45em] text-brand-primary">Customer Account</p>
              <h1 className="mt-4 font-heading text-4xl uppercase tracking-tight text-brand-dark md:text-6xl">
                Your FabTops
                <span className="block text-brand-dark/80">Private Studio</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-brand-dark/85">
                Profile updates, saved delivery details, order tracking, wishlist pieces, and payment recovery now flow through your private FabTops account.
              </p>
            </div>
            <div className="rounded-[2rem] border border-brand-dark/8 bg-brand-light/70 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-brand-dark/75">Signed In As</p>
              <p className="mt-3 text-xl font-semibold text-brand-dark">{profile.email}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/wishlist"
                  className="rounded-full border border-brand-dark/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.32em] text-brand-dark transition hover:border-brand-primary hover:text-brand-dark"
                >
                  Wishlist {wishlist.length > 0 ? `(${wishlist.length})` : ''}
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-full bg-brand-dark px-4 py-3 text-[10px] font-black uppercase tracking-[0.32em] text-brand-light transition hover:bg-brand-primary hover:text-brand-dark"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap gap-3">
          <SectionButton active={activeSection === 'profile'} label="Profile" onClick={() => setActiveSection('profile')} />
          <SectionButton active={activeSection === 'addresses'} label="Addresses" onClick={() => setActiveSection('addresses')} />
          <SectionButton active={activeSection === 'orders'} label="Orders" onClick={() => setActiveSection('orders')} />
          <SectionButton active={activeSection === 'wishlist'} label="Wishlist" onClick={() => setActiveSection('wishlist')} />
          <SectionButton active={activeSection === 'recovery'} label="Recovery" onClick={() => setActiveSection('recovery')} />
        </section>

        {error ? (
          <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className={`${panelClass} flex min-h-[320px] items-center justify-center`}>
            <div className="space-y-4 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-brand-primary/20 border-t-brand-primary" />
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-dark/75">Refreshing account studio</p>
            </div>
          </div>
        ) : null}

        {!isLoading && activeSection === 'profile' ? (
          <section className={panelClass}>
            <div className="mb-8">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-primary">Profile</p>
              <h2 className="mt-3 text-3xl font-heading uppercase tracking-tight text-brand-dark">Personal Details</h2>
            </div>

            <form onSubmit={saveProfile} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/80">First Name</span>
                  <input className={fieldClass} value={profile.firstName} onChange={(event) => updateProfileField('firstName', event.target.value)} />
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/80">Last Name</span>
                  <input className={fieldClass} value={profile.lastName} onChange={(event) => updateProfileField('lastName', event.target.value)} />
                </label>
              </div>
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/80">Email</span>
                <input className={`${fieldClass} bg-brand-light/60`} value={profile.email} readOnly />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/80">Phone</span>
                <input className={fieldClass} value={profile.phone || ''} onChange={(event) => updateProfileField('phone', event.target.value)} />
              </label>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="rounded-full bg-brand-dark px-6 py-3 text-[10px] font-black uppercase tracking-[0.32em] text-brand-light transition hover:bg-brand-primary hover:text-brand-dark disabled:opacity-60"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
                {profileMessage ? <p className="text-sm text-brand-dark/85">{profileMessage}</p> : null}
              </div>
            </form>
          </section>
        ) : null}

        {!isLoading && activeSection === 'addresses' ? (
          <section className={panelClass}>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-primary">Addresses</p>
                <h2 className="mt-3 text-3xl font-heading uppercase tracking-tight text-brand-dark">Delivery Book</h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-brand-dark/85">
                Keep billing and shipping details ready so checkout can stay fast and consistent across devices.
              </p>
            </div>

            <form onSubmit={saveAddresses} className="space-y-8">
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-[1.75rem] border border-brand-dark/8 bg-brand-light/45 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.32em] text-brand-dark/75">Billing Address</p>
                  <div className="mt-5">
                    <AddressFields
                      prefix="billing"
                      address={addresses.billing}
                      onChange={(field, value) => updateAddressField('billing', field, value)}
                    />
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-brand-dark/8 bg-brand-light/45 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.32em] text-brand-dark/75">Shipping Address</p>
                  <div className="mt-5">
                    <AddressFields
                      prefix="shipping"
                      address={addresses.shipping}
                      onChange={(field, value) => updateAddressField('shipping', field, value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={isSavingAddresses}
                  className="rounded-full bg-brand-dark px-6 py-3 text-[10px] font-black uppercase tracking-[0.32em] text-brand-light transition hover:bg-brand-primary hover:text-brand-dark disabled:opacity-60"
                >
                  {isSavingAddresses ? 'Saving...' : 'Save Addresses'}
                </button>
                {addressMessage ? <p className="text-sm text-brand-dark/85">{addressMessage}</p> : null}
              </div>
            </form>
          </section>
        ) : null}

        {!isLoading && activeSection === 'orders' ? (
          <section className={panelClass}>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-primary">Orders</p>
                <h2 className="mt-3 text-3xl font-heading uppercase tracking-tight text-brand-dark">Recent Activity</h2>
              </div>
              {pendingOrder ? (
                <Link
                  href={buildRecoveryHref(pendingOrder)}
                  className="rounded-full border border-brand-primary/25 bg-brand-primary/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.32em] text-brand-dark transition hover:border-brand-primary hover:bg-brand-primary hover:text-brand-dark"
                >
                  Recover Pending Order
                </Link>
              ) : null}
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-brand-dark/10 bg-brand-light/60 p-6 text-sm text-brand-dark/85">
                  Your account is active. Orders will appear here after checkout.
                </div>
              ) : (
                orders.map((order) => (
                  <article key={order.id} className="rounded-[1.5rem] border border-brand-dark/8 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/75">Order #{order.number}</p>
                        <h3 className="mt-2 text-lg font-semibold capitalize text-brand-dark">{labelizeStatus(order.status)}</h3>
                        <p className="mt-2 text-sm text-brand-dark/80">
                          {order.dateCreated ? new Date(order.dateCreated).toLocaleDateString() : 'Date unavailable'}
                        </p>
                        {order.lineItems?.length ? (
                          <p className="mt-3 text-xs uppercase tracking-[0.24em] text-brand-dark/75">
                            {order.lineItems.length} item{order.lineItems.length === 1 ? '' : 's'}
                          </p>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/75">Total</p>
                        <p className="mt-2 text-lg font-semibold text-brand-dark">
                          {order.total.currencyCode} {order.total.amount}
                        </p>
                        {order.trackingUrl ? (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-block text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary"
                          >
                            Track Parcel
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ) : null}

        {!isLoading && activeSection === 'wishlist' ? (
          <section className={panelClass}>
            <div className="grid gap-6 lg:grid-cols-[0.85fr,1.15fr] lg:items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-primary">Wishlist</p>
                <h2 className="mt-3 text-3xl font-heading uppercase tracking-tight text-brand-dark">Saved Silhouettes</h2>
                <p className="mt-5 text-sm leading-7 text-brand-dark/85">
                  Your wishlist is saved directly to your private FabTops account, so only your signed-in session can load or change it.
                </p>
                <Link
                  href="/wishlist"
                  className="mt-8 inline-flex rounded-full bg-brand-dark px-6 py-3 text-[10px] font-black uppercase tracking-[0.32em] text-brand-light transition hover:bg-brand-primary hover:text-brand-dark"
                >
                  Open Wishlist
                </Link>
              </div>
              <div className="rounded-[1.75rem] border border-brand-dark/8 bg-brand-light/45 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-brand-dark/75">Saved Right Now</p>
                <div className="mt-6 flex items-end gap-4">
                  <span className="text-5xl font-heading text-brand-dark">{wishlist.length}</span>
                  <span className="pb-2 text-[10px] font-black uppercase tracking-[0.32em] text-brand-dark/75">pieces</span>
                </div>
                <div className="mt-8 space-y-3">
                  {wishlist.slice(0, 3).map((item) => (
                    <div key={item.id} className="rounded-[1.25rem] border border-brand-dark/8 bg-white px-4 py-4">
                      <p className="text-sm font-semibold text-brand-dark">{item.title}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-brand-dark/75">{item.currencyCode} {item.price}</p>
                    </div>
                  ))}
                  {wishlist.length === 0 ? (
                    <div className="rounded-[1.25rem] border border-dashed border-brand-dark/10 bg-white/60 px-4 py-5 text-sm text-brand-dark/80">
                      No saved pieces yet. Tap the heart on a product to begin your private edit.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {!isLoading && activeSection === 'recovery' ? (
          <section className={panelClass}>
            <div className="grid gap-6 lg:grid-cols-[1fr,0.9fr]">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-primary">Payment Recovery</p>
                <h2 className="mt-3 text-3xl font-heading uppercase tracking-tight text-brand-dark">Resume an Interrupted Order</h2>
                <p className="mt-5 text-sm leading-7 text-brand-dark/85">
                  If a gateway redirected you away before payment completed, use the recovery flow to reload the Woo order and continue checkout from the same shopper session.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={buildRecoveryHref(pendingOrder)}
                    className="rounded-full bg-brand-dark px-6 py-3 text-[10px] font-black uppercase tracking-[0.32em] text-brand-light transition hover:bg-brand-primary hover:text-brand-dark"
                  >
                    Open Recovery Flow
                  </Link>
                  <Link
                    href="/checkout"
                    className="rounded-full border border-brand-dark/10 px-6 py-3 text-[10px] font-black uppercase tracking-[0.32em] text-brand-dark transition hover:border-brand-primary hover:text-brand-dark"
                  >
                    Start Fresh Checkout
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-brand-dark/8 bg-brand-light/45 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-brand-dark/75">Recovery Status</p>
                {pendingOrder ? (
                  <div className="mt-5 space-y-4">
                    <div className="rounded-[1.25rem] border border-brand-primary/20 bg-white px-4 py-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-dark/75">Pending Order</p>
                      <p className="mt-2 text-xl font-semibold capitalize text-brand-dark">#{pendingOrder.number}</p>
                      <p className="mt-2 text-sm text-brand-dark/85">
                        Status: {labelizeStatus(pendingOrder.status)}. You can jump straight back into recovery from here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-[1.25rem] border border-dashed border-brand-dark/10 bg-white/60 px-4 py-5 text-sm text-brand-dark/80">
                    No interrupted customer orders are showing right now. You can still use the recovery page if you have an order ID, key, and guest billing email.
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
