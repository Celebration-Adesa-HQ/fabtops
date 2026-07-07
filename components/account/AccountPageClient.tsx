'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AccountPageClientProps {
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  orders: Array<{
    id: string;
    number: string;
    status: string;
    dateCreated: string | null;
    total: {
      amount: string;
      currencyCode: string;
    };
  }>;
}

export function AccountPageClient({ profile, orders }: AccountPageClientProps) {
  const router = useRouter();
  const [form, setForm] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/account/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to update profile');
      }

      setForm(result.data);
      setMessage('Profile updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const signOut = async () => {
    await fetch('/api/account/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const fieldClass = 'w-full rounded-2xl border border-brand-dark/10 bg-white px-4 py-3 text-sm text-brand-dark outline-none transition focus:border-brand-primary';

  return (
    <div className="min-h-screen bg-brand-light px-5 pb-24 pt-28 md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr,0.95fr]">
        <section className="rounded-[2rem] border border-brand-dark/8 bg-white/80 p-6 shadow-sm md:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Customer Account</p>
              <h1 className="mt-3 text-3xl font-heading uppercase tracking-tight text-brand-dark md:text-4xl">
                Welcome Back
              </h1>
              <p className="mt-3 text-sm text-brand-dark/60">{profile.email}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="rounded-full border border-brand-dark/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
            >
              Sign Out
            </button>
          </div>

          <form onSubmit={saveProfile} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/50">First Name</span>
                <input className={fieldClass} value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/50">Last Name</span>
                <input className={fieldClass} value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} />
              </label>
            </div>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/50">Email</span>
              <input className={`${fieldClass} bg-brand-light/60`} value={form.email} readOnly />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/50">Phone</span>
              <input className={fieldClass} value={form.phone || ''} onChange={(event) => updateField('phone', event.target.value)} />
            </label>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-brand-dark px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-white transition hover:bg-brand-primary hover:text-brand-dark disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
              {message ? <p className="text-sm text-brand-dark/60">{message}</p> : null}
            </div>
          </form>
        </section>

        <section className="rounded-[2rem] border border-brand-dark/8 bg-white/60 p-6 shadow-sm md:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Order History</p>
          <h2 className="mt-3 text-3xl font-heading uppercase tracking-tight text-brand-dark">Recent Orders</h2>

          <div className="mt-8 space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-brand-dark/10 bg-brand-light/60 p-6 text-sm text-brand-dark/60">
                Your WooCommerce account is connected. Orders will appear here after checkout.
              </div>
            ) : (
              orders.map((order) => (
                <article key={order.id} className="rounded-[1.5rem] border border-brand-dark/8 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/40">Order #{order.number}</p>
                      <h3 className="mt-2 text-lg font-semibold text-brand-dark">{order.status}</h3>
                      <p className="mt-2 text-sm text-brand-dark/55">
                        {order.dateCreated ? new Date(order.dateCreated).toLocaleDateString() : 'Date unavailable'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/40">Total</p>
                      <p className="mt-2 text-lg font-semibold text-brand-dark">
                        {order.total.currencyCode} {order.total.amount}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
