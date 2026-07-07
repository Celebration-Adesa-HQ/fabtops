'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to sign in');
      }

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = 'w-full rounded-full border border-brand-dark/10 bg-white px-5 py-4 text-sm text-brand-dark outline-none transition focus:border-brand-primary';

  return (
    <div className="min-h-screen bg-brand-light px-5 py-24">
      <div className="mx-auto max-w-md rounded-[2rem] border border-brand-dark/8 bg-white/85 p-8 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Customer Sign In</p>
        <h1 className="mt-4 text-4xl font-heading uppercase tracking-tight text-brand-dark">Welcome Back</h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input className={fieldClass} type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} />
          <input className={fieldClass} type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <button className="w-full rounded-full bg-brand-dark px-5 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white transition hover:bg-brand-primary hover:text-brand-dark" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        {message ? <p className="mt-4 text-sm text-red-600">{message}</p> : null}
        <div className="mt-6 flex items-center justify-between text-sm text-brand-dark/60">
          <Link href="/forgot-password" className="hover:text-brand-primary">Forgot password?</Link>
          <Link href={`/register?redirect=${encodeURIComponent(redirectTo)}`} className="hover:text-brand-primary">Create account</Link>
        </div>
      </div>
    </div>
  );
}
