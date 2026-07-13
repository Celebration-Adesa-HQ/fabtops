'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/account/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to send reset email');
      }
      setMessage(result.message || 'If the account exists, a reset email has been sent.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to send reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light px-5 py-24">
      <div className="mx-auto max-w-md rounded-[2rem] border border-brand-dark/8 bg-white/85 p-8 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Password Reset</p>
        <h1 className="mt-4 text-4xl font-heading uppercase tracking-tight text-brand-dark">Reset Password</h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            className="w-full rounded-full border border-brand-dark/10 bg-white px-5 py-4 text-sm text-brand-dark outline-none transition focus:border-brand-primary"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button className="w-full rounded-full bg-brand-dark px-5 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white transition hover:bg-brand-primary hover:text-brand-dark" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        {message ? <p className="mt-4 text-sm text-brand-dark/70">{message}</p> : null}
      </div>
    </div>
  );
}
