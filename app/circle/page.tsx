'use client';

import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Heart, Zap, Sparkles, Star, ArrowRight, Gem, ShieldCheck, Globe, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/use-auth';

export default function CirclePage() {
  const { customer, isAuthenticated, loading } = useAuth();
  return (
    <div className="relative min-h-screen bg-brand-secondary selection:bg-brand-primary/20 selection:text-brand-dark overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] right-[-10%] w-[70vw] h-[70vw] bg-brand-primary/10 blur-[120px] rounded-full animate-morph-blob" />
        <div className="absolute bottom-[20%] left-[-10%] w-[50vw] h-[50vw] bg-brand-secondary/40 blur-[100px] rounded-full animate-morph-blob" style={{ animationDelay: '-4s' }} />
      </div>

      {/* Immersive Membership Hero */}
      <section className="relative h-[95vh] flex items-center justify-center overflow-hidden z-10">
        <div className="absolute inset-0">
          <Image 
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000"
            alt="Fab Babe Circle"
            fill
            className="object-cover opacity-80 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-secondary/10 via-transparent to-brand-secondary" />
          <div className="absolute inset-0 bg-brand-secondary/20 backdrop-blur-[1px]" />
        </div>
        
        <div className="relative z-10 text-center px-6">
          <ScrollReveal>
            <div className="inline-flex items-center gap-3 px-8 py-3 bg-brand-dark rounded-full text-white text-[10px] font-black uppercase tracking-[0.4em] mb-10 shadow-2xl shadow-brand-dark/20">
              <Star size={14} fill="currentColor" /> Exclusive Membership
            </div>
            <h1 className="text-7xl md:text-9xl font-heading leading-[0.8] mb-10 text-brand-dark tracking-tighter uppercase">
              Fab Babe <br /> <span className="italic opacity-80">Circle</span>
            </h1>
            <p className="text-sm md:text-xl font-medium text-brand-dark/60 max-w-2xl mx-auto mb-16 leading-relaxed tracking-widest uppercase text-[11px]">
              An elite sanctuary for the intentional woman. Early access, heritage-grade drops, and a curated fashion legacy.
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 opacity-60">
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-brand-dark" />
                <span className="text-[9px] uppercase tracking-[0.3em] font-black text-brand-dark">Global Community</span>
              </div>
              <div className="hidden md:block w-px h-6 bg-brand-dark/20" />
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-brand-dark" />
                <span className="text-[9px] uppercase tracking-[0.3em] font-black text-brand-dark">24/7 Concierge</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Decorative divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-dark/10 to-transparent" />
      </section>

      {/* Benefits Grid - Liquid Glass Cards */}
      <section className="relative z-10 py-32 md:py-48 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Priority Drops", desc: "First-tier access to all new silhouettes 48 hours before public launch." },
              { icon: Heart, title: "Bespoke Vault", desc: "Unlock the 'Hidden Archive'—one-off heritage pieces and prototypes." },
              { icon: Sparkles, title: "Luxe Gifting", desc: "Handcrafted accessories and limited edition tokens gifted seasonally." },
              { icon: Star, title: "White Glove", desc: "Dedicated WhatsApp styling concierge and expedited global shipping." },
            ].map((benefit, i) => (
              <ScrollReveal key={benefit.title} delay={i * 0.1}>
                <div className="bg-white/10 backdrop-blur-2xl p-12 rounded-[3rem] border border-brand-dark/5 hover:border-brand-primary transition-all duration-700 group shadow-2xl shadow-brand-dark/5 h-full flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-brand-dark/5 rounded-2xl flex items-center justify-center text-brand-dark mb-10 group-hover:bg-brand-dark group-hover:text-white transition-all duration-700 shadow-sm active:scale-95">
                    <benefit.icon size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-heading uppercase tracking-tighter text-brand-dark mb-6">{benefit.title}</h3>
                  <p className="text-[11px] text-brand-dark/60 font-black uppercase tracking-widest leading-relaxed">{benefit.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Join the Circle CTA - Massive Glass Card */}
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
                      className="w-full py-8 bg-brand-dark text-white rounded-full text-[10px] uppercase tracking-[0.5em] font-black hover:bg-brand-primary transition-all duration-700 shadow-2xl shadow-brand-dark/20 group flex items-center justify-center gap-6 active:scale-95"
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
                        className="w-full py-8 bg-brand-dark text-white rounded-full text-[10px] uppercase tracking-[0.5em] font-black hover:bg-brand-primary transition-all duration-700 shadow-2xl shadow-brand-dark/20 group flex items-center justify-center gap-6 active:scale-95"
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

      {/* Membership Philosophy */}
      <section className="relative z-10 py-32 md:py-48 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1440px] mx-auto">
          <ScrollReveal>
            <div className="flex flex-col lg:flex-row items-center gap-24">
              <div className="flex-1 space-y-12 text-left">
                <div className="w-px h-24 bg-brand-dark/20" />
                <h3 className="text-xs uppercase tracking-[0.5em] text-brand-dark opacity-40 font-black">Legacy Philosophy</h3>
                <div className="space-y-10">
                  <div className="space-y-6">
                    <h4 className="text-3xl md:text-5xl font-heading text-brand-dark leading-[0.9] uppercase tracking-tighter">Private <br /><span className="italic opacity-80">Vaults</span></h4>
                    <p className="text-[11px] text-brand-dark/60 font-black uppercase tracking-widest leading-relaxed max-w-md">Members gain exclusive access to the 'Hidden Vault'—a collection of limited prototypes and one-off pieces that never grace the public digital flagship.</p>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-3xl md:text-5xl font-heading text-brand-dark leading-[0.9] uppercase tracking-tighter">Digital <br /><span className="italic opacity-80">Stylist</span></h4>
                    <p className="text-[11px] text-brand-dark/60 font-black uppercase tracking-widest leading-relaxed max-w-md">Dedicated 24/7 concierge support for bespoke sizing queries, event styling, and priority fabric selection via private channels.</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative aspect-square w-full rounded-[4rem] overflow-hidden shadow-2xl shadow-brand-dark/20">
                <Image 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200"
                  alt="Philosophy"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-brand-dark/10 backdrop-blur-[1px]" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      
      {/* Footer Bridge */}
      <div className="w-full h-32 md:h-64 bg-gradient-to-t from-brand-dark/5 to-transparent" />
    </div>
  );
}
