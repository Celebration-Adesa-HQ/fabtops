'use client';

import React, { useState } from 'react';
import { subscribeToNewsletter } from '@/lib/shopify/server-actions';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    const result = await subscribeToNewsletter(email);

    if (result.success) {
      setStatus('success');
      setMessage(result.message || "Welcome to the circle!");
      setEmail('');
    } else {
      setStatus('error');
      setMessage(result.error || "Something went wrong.");
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-primary">Join the Circle</h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <div className="relative group">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading' || status === 'success'}
            placeholder="ENTER YOUR EMAIL" 
            className="w-full bg-transparent border-b border-brand-light/20 py-3 text-xs tracking-widest focus:outline-none focus:border-brand-primary transition-colors disabled:opacity-50"
          />
          <AnimatePresence>
            {status === 'loading' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-0 top-3 text-brand-primary"
              >
                <Loader2 className="animate-spin" size={16} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          disabled={status === 'loading' || status === 'success' || !email}
          className="text-[10px] uppercase tracking-[0.3em] font-bold border border-brand-light/20 px-8 py-4 hover:bg-brand-light hover:text-brand-dark transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden"
        >
          <span className="relative z-10">
            {status === 'success' ? 'Subscribed' : 'Subscribe'}
          </span>
          {status !== 'success' && (
            <div className="absolute inset-0 bg-brand-light translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          )}
        </button>
      </form>

      <AnimatePresence mode="wait">
        {status === 'success' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 text-green-400"
          >
            <CheckCircle2 size={14} />
            <span className="text-[10px] uppercase tracking-widest font-black">{message}</span>
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 text-red-400"
          >
            <AlertCircle size={14} />
            <span className="text-[10px] uppercase tracking-widest font-black">{message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!status || status === 'idle' && (
        <p className="text-[9px] text-brand-light/30 uppercase tracking-widest leading-relaxed">
          By subscribing, you agree to our Privacy Policy and join an elite tier of discoverers.
        </p>
      )}
    </div>
  );
}
