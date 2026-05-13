'use client';

import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Heart, Zap, Sparkles, Star, ArrowRight, Gem, ShieldCheck, Globe, Clock } from 'lucide-react';
import Image from 'next/image';

export default function CirclePage() {
  return (
    <div className="relative min-h-screen bg-white selection:bg-pink-100 selection:text-pink-900 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] right-[-10%] w-[70vw] h-[70vw] bg-pink-100/30 blur-[120px] rounded-full animate-morph-blob" />
        <div className="absolute bottom-[20%] left-[-10%] w-[50vw] h-[50vw] bg-rose-50/40 blur-[100px] rounded-full animate-morph-blob" style={{ animationDelay: '-4s' }} />
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
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white" />
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
        </div>
        
        <div className="relative z-10 text-center px-6">
          <ScrollReveal>
            <div className="inline-flex items-center gap-3 px-8 py-3 bg-pink-600 rounded-full text-white text-[10px] font-black uppercase tracking-[0.4em] mb-10 shadow-2xl shadow-pink-200">
              <Star size={14} fill="currentColor" /> Exclusive Membership
            </div>
            <h1 className="text-7xl md:text-9xl font-serif-logo leading-[0.8] mb-10 text-gray-900 tracking-tighter uppercase">
              Fab Babe <br /> <span className="italic text-pink-600">Circle</span>
            </h1>
            <p className="text-lg md:text-2xl font-light text-gray-400 max-w-2xl mx-auto mb-16 leading-relaxed tracking-wide">
              An elite sanctuary for the intentional woman. Early access, heritage-grade drops, and a curated fashion legacy.
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 opacity-60">
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-pink-600" />
                <span className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-900">Global Community</span>
              </div>
              <div className="hidden md:block w-px h-6 bg-pink-200" />
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-pink-600" />
                <span className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-900">24/7 Concierge</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Decorative divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-100 to-transparent" />
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
                <div className="bg-white/40 backdrop-blur-2xl p-12 rounded-[3rem] border border-pink-100/50 hover:border-pink-400 transition-all duration-700 group shadow-xl shadow-pink-100/10 h-full flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 mb-10 group-hover:bg-pink-600 group-hover:text-white transition-all duration-700 shadow-sm active:scale-95">
                    <benefit.icon size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-serif-logo uppercase tracking-tighter text-gray-900 mb-6">{benefit.title}</h3>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">{benefit.desc}</p>
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
            <div className="relative bg-white/40 backdrop-blur-3xl p-12 md:p-24 rounded-[4rem] border border-white shadow-[0_50px_100px_-20px_rgba(255,182,193,0.3)] text-center overflow-hidden">
              {/* Internal Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100/30 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-4 mb-10">
                  <div className="w-12 h-px bg-pink-600" />
                  <span className="text-[10px] uppercase tracking-[0.6em] text-pink-600 font-black">Digital Flagship Access</span>
                  <div className="w-12 h-px bg-pink-600" />
                </div>
                
                <h2 className="text-5xl md:text-7xl font-serif-logo text-gray-900 mb-10 leading-[0.85] tracking-tighter uppercase">
                  Secure Your <br /><span className="italic text-pink-600">Spot</span>
                </h2>
                
                <p className="text-base md:text-lg text-gray-400 font-light mb-16 max-w-xl mx-auto leading-relaxed">
                  Enter your digital identifier to apply for membership. By joining the Circle, you unlock the full Fabtops heritage experience.
                </p>
                
                <div className="max-w-md mx-auto space-y-6">
                  <div className="relative">
                    <input 
                      type="email" 
                      placeholder="Enter your email address" 
                      className="w-full px-12 py-8 rounded-full bg-white/80 backdrop-blur-md border-2 border-pink-50 focus:border-pink-600 focus:ring-4 focus:ring-pink-50 outline-none transition-all text-center text-sm font-black uppercase tracking-widest placeholder:text-gray-200 shadow-sm"
                    />
                  </div>
                  <button className="w-full py-8 bg-gray-900 text-white rounded-full text-[10px] uppercase tracking-[0.5em] font-black hover:bg-pink-600 transition-all duration-700 shadow-2xl shadow-pink-200 group flex items-center justify-center gap-6 active:scale-95">
                    Join the Movement <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
                
                <div className="mt-16 pt-10 border-t border-pink-50 flex items-center justify-center gap-8">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-pink-600" />
                    <span className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Secure Protocol</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem size={14} className="text-pink-600" />
                    <span className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Verified Heritage</span>
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
                <div className="w-px h-24 bg-pink-600" />
                <h3 className="text-xs uppercase tracking-[0.5em] text-pink-600 font-black">Legacy Philosophy</h3>
                <div className="space-y-10">
                  <div className="space-y-6">
                    <h4 className="text-3xl md:text-5xl font-serif-logo text-gray-900 leading-[0.9] uppercase tracking-tighter">Private <br /><span className="italic">Vaults</span></h4>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed max-w-md">Members gain exclusive access to the 'Hidden Vault'—a collection of limited prototypes and one-off pieces that never grace the public digital flagship.</p>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-3xl md:text-5xl font-serif-logo text-gray-900 leading-[0.9] uppercase tracking-tighter">Digital <br /><span className="italic">Stylist</span></h4>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed max-w-md">Dedicated 24/7 concierge support for bespoke sizing queries, event styling, and priority fabric selection via private channels.</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative aspect-square w-full rounded-[4rem] overflow-hidden shadow-2xl shadow-pink-200/20">
                <Image 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200"
                  alt="Philosophy"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-pink-900/10 backdrop-blur-[1px]" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      
      {/* Footer Bridge */}
      <div className="w-full h-32 md:h-64 bg-gradient-to-t from-pink-50/30 to-transparent" />
    </div>
  );
}
