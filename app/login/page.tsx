'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = '/account';
      } else {
        setError(data.error || 'Login failed');
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
        {/* Editorial Side */}
        <div className="hidden lg:block relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl shadow-brand-dark/10">
          <Image 
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200" 
            alt="Fabtops Heritage" 
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-brand-dark/20 backdrop-blur-[2px]" />
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <span className="text-[10px] uppercase tracking-[0.5em] font-black mb-4 block">The Digital Flagship</span>
            <h2 className="text-4xl font-heading uppercase tracking-tighter leading-tight">
              Elevate your <br /> <span className="italic opacity-80">Styling Journey</span>
            </h2>
          </div>
        </div>

        {/* Form Side */}
        <div className="max-w-md mx-auto w-full">
          <ScrollReveal>
            <div className="mb-12">
              <h1 className="text-4xl font-heading uppercase tracking-widest text-brand-dark mb-4">Welcome Back</h1>
              <p className="text-brand-dark/60 font-medium uppercase tracking-widest text-[10px] leading-relaxed">
                Enter your credentials to access your curated selection and order history.
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
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                {/* Email Field */}
                <div className="group">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-dark/40 mb-3 block group-focus-within:text-brand-dark transition-colors">Email Address</label>
                  <div className="relative border-b-2 border-brand-dark/10 group-focus-within:border-brand-dark transition-all">
                    <input 
                      name="email"
                      type="email" 
                      required 
                      placeholder="name@example.com"
                      className="w-full py-4 bg-transparent outline-none text-brand-dark font-bold placeholder:text-brand-dark/20 uppercase tracking-widest text-xs"
                    />
                    <Mail size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-brand-dark/20 group-focus-within:text-brand-dark transition-colors" />
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-dark/40 group-focus-within:text-brand-dark transition-colors">Password</label>
                    <Link href="/forgot-password" title="Forgot Password" className="text-[9px] uppercase tracking-widest font-black text-brand-dark/30 hover:text-brand-dark transition-colors">Forgot?</Link>
                  </div>
                  <div className="relative border-b-2 border-brand-dark/10 group-focus-within:border-brand-dark transition-all">
                    <input 
                      name="password"
                      type={showPassword ? "text" : "password"} 
                      required 
                      placeholder="••••••••"
                      className="w-full py-4 bg-transparent outline-none text-brand-dark font-bold placeholder:text-brand-dark/20"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-brand-dark/20 hover:text-brand-dark transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-dark text-white py-6 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-brand-primary transition-all duration-500 shadow-2xl shadow-brand-dark/20 flex items-center justify-center gap-4 group disabled:bg-brand-dark/40"
                >
                  {isLoading ? "Verifying..." : "Access My Account"}
                  {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>

              <div className="text-center pt-8">
                <p className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-black">
                  New to Fabtops? 
                  <Link href="/register" title="Sign up" className="text-brand-dark ml-3 hover:text-brand-primary transition-colors underline decoration-brand-dark/10 underline-offset-4">Create an account</Link>
                </p>
              </div>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
