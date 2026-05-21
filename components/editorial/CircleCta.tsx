'use client';

import { useAuth } from '@/lib/use-auth';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { ShieldCheck, Gem, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CircleCta() {
  const { customer, isAuthenticated } = useAuth();

  return (
    <section className="relative z-10 py-32 md:py-48 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="relative bg-white/20 backdrop-blur-3xl p-12 md:p-24 rounded-[4rem] border border-brand-dark/5 shadow-2xl shadow-brand-dark/10 text-center overflow-hidden">
            {/* Internal Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-4 mb-10">
                <div className="w-12 h-px bg-brand-dark/20" />
                <span className="text-[10px] uppercase tracking-[0.6em] text-brand-dark/40 font-black">Digital Flagship Access</span>
                <div className="w-12 h-px bg-brand-dark/20" />
              </div>
              
              <h2 className="text-5xl md:text-7xl font-heading text-brand-dark mb-10 leading-[0.85] tracking-tighter uppercase">
                Secure Your <br /><span className="italic opacity-80">Spot</span>
              </h2>
              
              <p className="text-sm md:text-base text-brand-dark/60 font-medium mb-16 max-w-xl mx-auto leading-relaxed uppercase tracking-widest text-[11px]">
                {isAuthenticated 
                  ? `Welcome back to your sanctuary, ${customer?.firstName}. Your elite heritage benefits are active across the flagship.`
                  : "Enter your digital identifier to apply for membership. By joining the Circle, you unlock the full Fabtops heritage experience."}
              </p>
              
              <div className="max-w-md mx-auto space-y-6">
                {isAuthenticated ? (
                  <Link 
                    href="/account"
                    className="w-full py-8 bg-brand-dark text-white rounded-full text-[10px] uppercase tracking-[0.5em] font-black hover:bg-brand-primary hover:text-brand-dark transition-all duration-700 shadow-2xl shadow-brand-dark/20 group flex items-center justify-center gap-6 active:scale-95"
                  >
                    Enter My Styling Vault <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <div className="relative">
                      <input 
                        type="email" 
                        placeholder="Enter your email address" 
                        className="w-full px-12 py-8 rounded-full bg-brand-secondary/40 backdrop-blur-md border-2 border-brand-dark/5 focus:border-brand-dark outline-none transition-all text-center text-sm font-black uppercase tracking-widest placeholder:text-brand-dark/20 shadow-sm"
                      />
                    </div>
                    <Link 
                      href="/register"
                      className="w-full py-8 bg-brand-dark text-white rounded-full text-[10px] uppercase tracking-[0.5em] font-black hover:bg-brand-primary hover:text-brand-dark transition-all duration-700 shadow-2xl shadow-brand-dark/20 group flex items-center justify-center gap-6 active:scale-95 animate-pulse hover:animate-none"
                    >
                      Join the Movement <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </>
                )}
              </div>
              
              <div className="mt-16 pt-10 border-t border-brand-dark/5 flex items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-brand-dark" />
                  <span className="text-[9px] uppercase tracking-[0.3em] font-black text-brand-dark/40">Secure Protocol</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gem size={14} className="text-brand-dark" />
                  <span className="text-[9px] uppercase tracking-[0.3em] font-black text-brand-dark/40">Verified Heritage</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
