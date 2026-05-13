'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, User, Mail, Lock } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => window.location.href = '/login', 2000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-secondary pt-40 pb-20 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
        {/* Editorial Side (Reverse side for variety) */}
        <div className="hidden lg:block lg:order-2 relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl shadow-brand-dark/10">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200" 
            alt="Fabtops Community" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-brand-dark/20 backdrop-blur-[2px]" />
          <div className="absolute bottom-12 left-12 right-12 text-white text-right">
            <span className="text-[10px] uppercase tracking-[0.5em] font-black mb-4 block">The Fab Babe Circle</span>
            <h2 className="text-4xl font-heading uppercase tracking-tighter leading-tight">
              Join our <br /> <span className="italic opacity-80">Heritage House</span>
            </h2>
          </div>
        </div>

        {/* Form Side */}
        <div className="max-w-md mx-auto w-full lg:order-1">
          <ScrollReveal>
            <div className="mb-12">
              <h1 className="text-4xl font-heading uppercase tracking-widest text-brand-dark mb-4">Create Account</h1>
              <p className="text-brand-dark/60 font-medium uppercase tracking-widest text-[10px] leading-relaxed">
                Join the Fabtops community for early access to drops, exclusive discounts, and personalized styling.
              </p>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-brand-primary/20 backdrop-blur-md border border-brand-primary/30 text-[10px] uppercase tracking-widest font-black text-brand-dark"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-green-500/20 backdrop-blur-md border border-green-500/30 text-[10px] uppercase tracking-widest font-black text-brand-dark"
                >
                  Account created successfully. Redirecting to login...
                </motion.div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="group">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-dark/40 mb-3 block group-focus-within:text-brand-dark transition-colors">First Name</label>
                  <div className="relative border-b-2 border-brand-dark/10 group-focus-within:border-brand-dark transition-all">
                    <input name="firstName" type="text" required placeholder="Amina" className="w-full py-4 bg-transparent outline-none text-brand-dark font-bold placeholder:text-brand-dark/20 uppercase tracking-widest text-xs" />
                  </div>
                </div>
                <div className="group">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-dark/40 mb-3 block group-focus-within:text-brand-dark transition-colors">Last Name</label>
                  <div className="relative border-b-2 border-brand-dark/10 group-focus-within:border-brand-dark transition-all">
                    <input name="lastName" type="text" required placeholder="Bello" className="w-full py-4 bg-transparent outline-none text-brand-dark font-bold placeholder:text-brand-dark/20 uppercase tracking-widest text-xs" />
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-dark/40 mb-3 block group-focus-within:text-brand-dark transition-colors">Email Address</label>
                <div className="relative border-b-2 border-brand-dark/10 group-focus-within:border-brand-dark transition-all">
                  <input name="email" type="email" required placeholder="hello@fabtops.com" className="w-full py-4 bg-transparent outline-none text-brand-dark font-bold placeholder:text-brand-dark/20 uppercase tracking-widest text-xs" />
                  <Mail size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-brand-dark/20 group-focus-within:text-brand-dark transition-colors" />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-dark/40 mb-3 block group-focus-within:text-brand-dark transition-colors">Create Password</label>
                <div className="relative border-b-2 border-brand-dark/10 group-focus-within:border-brand-dark transition-all">
                  <input name="password" type="password" required placeholder="••••••••" className="w-full py-4 bg-transparent outline-none text-brand-dark font-bold placeholder:text-brand-dark/20" />
                  <Lock size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-brand-dark/20 group-focus-within:text-brand-dark transition-colors" />
                </div>
              </div>

              <div className="flex items-start gap-4 py-4 group">
                 <input type="checkbox" required className="mt-1 accent-brand-dark" />
                 <p className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-black leading-relaxed">
                   I agree to the <Link href="/terms" className="text-brand-dark hover:text-brand-primary transition-colors underline decoration-brand-dark/10 underline-offset-4">Terms of Service</Link> and <Link href="/privacy" className="text-brand-dark hover:text-brand-primary transition-colors underline decoration-brand-dark/10 underline-offset-4">Privacy Policy</Link>.
                 </p>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-dark text-white py-6 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-brand-primary transition-all duration-500 shadow-2xl shadow-brand-dark/20 flex items-center justify-center gap-4 group disabled:bg-brand-dark/40"
                >
                  {isLoading ? "Creating Account..." : "Begin My Journey"}
                  {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>

              <div className="text-center pt-8">
                <p className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-black">
                  Already a member? 
                  <Link href="/login" className="text-brand-dark ml-3 hover:text-brand-primary transition-colors underline decoration-brand-dark/10 underline-offset-4">Login here</Link>
                </p>
              </div>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
