'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { markFabBabeModalSubscribed } from '@/lib/circle/modal-state';
import type { NewsletterRequestSchema } from '@/lib/schemas';

type CircleSubscribeSource = NewsletterRequestSchema['source'];
type CircleSubscribeVariant = 'modal' | 'inline' | 'footer';

interface FabBabeSubscribeFormProps {
  source: CircleSubscribeSource;
  variant: CircleSubscribeVariant;
  onSuccess?: () => void;
}

function variantClasses(variant: CircleSubscribeVariant) {
  if (variant === 'footer') {
    return {
      form: 'flex flex-col gap-4 max-w-md',
      input:
        'w-full bg-transparent border-b border-brand-light/20 py-3 text-xs tracking-widest text-brand-light placeholder:text-brand-light/40 focus:outline-none focus:border-brand-primary transition-colors disabled:opacity-50',
      button:
        'text-[10px] uppercase tracking-[0.3em] font-bold border border-brand-light/20 px-8 py-4 hover:bg-brand-light hover:text-brand-dark transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden text-brand-light',
      buttonFill: 'bg-brand-light',
      note: 'text-[9px] text-brand-light/40 uppercase tracking-widest leading-relaxed',
      success: 'text-green-300',
      error: 'text-red-300',
    };
  }

  if (variant === 'modal') {
    return {
      form: 'flex flex-col gap-4',
      input:
        'w-full rounded-full border border-brand-dark/10 bg-white px-5 py-4 text-sm text-brand-dark placeholder:text-brand-dark/35 outline-none transition focus:border-brand-primary disabled:opacity-50',
      button:
        'w-full rounded-full bg-brand-dark px-5 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-white transition hover:bg-brand-primary hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-40',
      buttonFill: '',
      note: 'text-[10px] text-brand-dark/50 leading-relaxed',
      success: 'text-green-600',
      error: 'text-red-600',
    };
  }

  return {
    form: 'flex flex-col gap-5',
    input:
      'w-full rounded-full border border-brand-dark/10 bg-white/80 px-5 py-4 text-sm text-brand-dark placeholder:text-brand-dark/35 outline-none transition focus:border-brand-primary disabled:opacity-50',
    button:
      'w-full rounded-full bg-brand-dark px-5 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-white transition hover:bg-brand-primary hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-40',
    buttonFill: '',
    note: 'text-[10px] text-brand-dark/55 leading-relaxed',
    success: 'text-green-700',
    error: 'text-red-700',
  };
}

export function FabBabeSubscribeForm({
  source,
  variant,
  onSuccess,
}: FabBabeSubscribeFormProps) {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = React.useState('');
  const classes = variantClasses(variant);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || result?.error || 'Unable to join the Circle right now.');
      }

      setStatus('success');
      setMessage(result.message || 'Welcome to the Circle.');
      setEmail('');
      markFabBabeModalSubscribed();
      onSuccess?.();
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to join the Circle right now.');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className={classes.form}>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={status === 'loading' || status === 'success'}
            placeholder="Email Address"
            aria-label="Email Address"
            className={classes.input}
          />
          <AnimatePresence>
            {status === 'loading' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-primary"
              >
                <Loader2 className="animate-spin" size={16} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <button
          type="submit"
          disabled={status === 'loading' || status === 'success' || !email.trim()}
          className={classes.button}
        >
          {variant === 'footer' ? (
            <>
              <span className="relative z-10">{status === 'success' ? 'You’re In' : 'Join the Circle'}</span>
              {status !== 'success' && classes.buttonFill ? (
                <div className={`absolute inset-0 ${classes.buttonFill} translate-y-full group-hover:translate-y-0 transition-transform duration-500`} />
              ) : null}
            </>
          ) : (
            <span>{status === 'success' ? 'You’re In' : 'Join the Circle'}</span>
          )}
        </button>
      </form>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-3 ${classes.success}`}
          >
            <CheckCircle2 size={14} />
            <span className="text-[10px] uppercase tracking-widest font-black">{message}</span>
          </motion.div>
        ) : null}

        {status === 'error' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-3 ${classes.error}`}
          >
            <AlertCircle size={14} />
            <span className="text-[10px] uppercase tracking-widest font-black">{message}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <p className={classes.note}>
        By joining, you agree to our{' '}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-brand-primary transition-colors">
          Privacy Policy
        </Link>
        . You can unsubscribe at any time.
      </p>
    </div>
  );
}
