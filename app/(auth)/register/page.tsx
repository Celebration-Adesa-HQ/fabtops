'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthSessionStore } from '@/stores/use-auth-session-store';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshSession = useAuthSessionStore((state) => state.refreshSession);
  const redirectTo = searchParams.get('redirect') || '/account';
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/account/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to create account');
      }

      const user = await refreshSession();
      if (!user) {
        throw new Error('Unable to confirm your session');
      }
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = 'w-full rounded-full border border-brand-dark/10 bg-white px-5 py-4 text-sm text-brand-dark outline-none transition focus:border-brand-primary';

  return (
    <div className="min-h-screen bg-brand-light px-5 py-24">
      <div className="mx-auto max-w-md rounded-[2rem] border border-brand-dark/8 bg-white/85 p-8 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Create Account</p>
        <h1 className="mt-4 text-4xl font-heading uppercase tracking-tight text-brand-dark">Join FabTops</h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input className={fieldClass} placeholder="First name" value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} />
            <input className={fieldClass} placeholder="Last name" value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} />
          </div>
          <input className={fieldClass} type="email" placeholder="Email address" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
          <input className={fieldClass} type="password" placeholder="Password" value={form.password} onChange={(event) => updateField('password', event.target.value)} />
          <button className="w-full rounded-full bg-brand-dark px-5 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white transition hover:bg-brand-primary hover:text-brand-dark" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        {message ? <p className="mt-4 text-sm text-red-600">{message}</p> : null}
        <p className="mt-6 text-sm text-brand-dark/60">
          Already have an account? <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="hover:text-brand-primary">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
