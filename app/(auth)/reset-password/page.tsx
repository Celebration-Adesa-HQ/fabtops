'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/account/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: searchParams.get('token') || '',
          password,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to reset password');
      }
      setMessage(result.message || 'Password reset. You can now sign in.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light px-5 py-24">
      <div className="mx-auto max-w-md rounded-[2rem] border border-brand-dark/8 bg-white/85 p-8 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Choose New Password</p>
        <h1 className="mt-4 text-4xl font-heading uppercase tracking-tight text-brand-dark">New Password</h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            className="w-full rounded-full border border-brand-dark/10 bg-white px-5 py-4 text-sm text-brand-dark outline-none transition focus:border-brand-primary"
            type="password"
            placeholder="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button className="w-full rounded-full bg-brand-dark px-5 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-brand-light transition hover:bg-brand-primary hover:text-brand-dark" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        {message ? <p className="mt-4 text-sm text-brand-dark/90">{message}</p> : null}
      </div>
    </div>
  );
}
