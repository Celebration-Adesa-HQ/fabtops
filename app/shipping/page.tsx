'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Truck, RefreshCw, Globe, ShieldCheck, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';

const SHIPPING_METHODS = [
  {
    region: 'Lagos, Nigeria',
    methods: [
      { name: 'Priority Courier', time: 'Same Day / Next Day', price: 'Calculated at Checkout', icon: Clock },
      { name: 'Standard Delivery', time: '2-3 Business Days', price: 'Complimentary', icon: Truck },
    ]
  },
  {
    region: 'Rest of Nigeria',
    methods: [
      { name: 'Express Shipping', time: '2-4 Business Days', price: 'Calculated at Checkout', icon: Clock },
      { name: 'Standard Shipping', time: '5-7 Business Days', price: 'Complimentary on orders over ₦50,000', icon: Truck },
    ]
  },
  {
    region: 'International Delivery',
    methods: [
      { name: 'DHL Express Worldwide', time: '5-10 Business Days', price: 'Calculated at Checkout', icon: Globe },
    ]
  }
];

const RETURN_STEPS = [
  {
    title: 'Initiate Request',
    description: 'Log into your account and select the items you wish to return within 14 days of delivery.',
    icon: ShieldCheck
  },
  {
    title: 'Prepare Package',
    description: 'Ensure items are in original condition with all tags attached and in the original packaging.',
    icon: Package
  },
  {
    title: 'Ship Back',
    description: 'Use our pre-paid return label (Domestic only) or ship via your preferred carrier.',
    icon: Truck
  },
  {
    title: 'Quality Audit',
    description: 'Once received, our atelier will inspect the items to ensure they meet our quality standards.',
    icon: ShieldCheck
  },
  {
    title: 'Refund Processed',
    description: 'Approved returns are refunded to the original payment method within 5-7 business days.',
    icon: RefreshCw
  }
];

function Package({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/>
      <path d="M12 22V12"/>
    </svg>
  );
}

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-brand-light text-brand-dark pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        {/* Hero Section */}
        <ScrollReveal>
          <div className="mb-24 space-y-8">
            <div className="flex items-center gap-4 text-brand-accent">
              <div className="h-px w-12 bg-brand-primary" />
              <span className="text-[10px] uppercase tracking-[0.5em] font-black">Customer Care</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-heading uppercase leading-none tracking-tighter">
              Shipping & <br />
              <span className="italic opacity-40">Returns</span>
            </h1>
            <p className="text-sm md:text-lg text-brand-dark/85 max-w-2xl leading-relaxed uppercase tracking-widest font-medium italic">
              Our commitment to a seamless discovery process includes meticulous handling and transparent delivery timelines.
            </p>
          </div>
        </ScrollReveal>

        {/* Shipping Grid */}
        <section className="mb-40">
          <ScrollReveal>
            <h2 className="text-xs uppercase tracking-[0.4em] font-black mb-16 border-b border-brand-dark/10 pb-4">Global Fulfillment</h2>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {SHIPPING_METHODS.map((region, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="space-y-10 group">
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase tracking-widest text-brand-dark/90 font-black">Destination</span>
                    <h3 className="text-2xl font-heading uppercase tracking-tight">{region.region}</h3>
                  </div>
                  
                  <div className="space-y-8">
                    {region.methods.map((method, j) => (
                      <div key={j} className="flex gap-6 group/item">
                        <div className="w-12 h-12 bg-brand-dark/5 rounded-full flex items-center justify-center shrink-0 group-hover/item:bg-brand-primary group-hover/item:text-white transition-colors duration-500">
                          <method.icon size={18} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[11px] uppercase tracking-widest font-black">{method.name}</p>
                          <p className="text-sm text-brand-dark/75 font-medium italic">{method.time}</p>
                          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-accent">{method.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Returns Policy */}
        <section className="mb-40 bg-brand-dark text-brand-light -mx-6 md:-mx-12 px-6 md:px-24 py-32 rounded-[3rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
          
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 relative z-10">
            <ScrollReveal>
              <div className="space-y-10">
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-6xl font-heading uppercase leading-tight tracking-tighter">
                    Our Return <br />
                    <span className="italic text-brand-accent">Philosophy</span>
                  </h2>
                  <p className="text-brand-light/90 text-sm md:text-base leading-relaxed uppercase tracking-widest font-bold max-w-md">
                    We want you to be completely satisfied with your FabTops selection. If the fit or feel isn't exactly as you envisioned, we invite you to return or exchange your piece.
                  </p>
                </div>
                
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 border border-brand-light/20 rounded-full flex items-center justify-center text-brand-accent font-heading text-xl">14</div>
                    <p className="text-[11px] uppercase tracking-[0.3em] font-black">Days to return after delivery</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 border border-brand-light/20 rounded-full flex items-center justify-center text-brand-accent">
                      <ShieldCheck size={20} />
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.3em] font-black">Complimentary domestic exchanges</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 gap-12">
              {RETURN_STEPS.map((step, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="flex gap-8 group">
                    <div className="text-brand-accent font-heading text-4xl opacity-20 group-hover:opacity-100 transition-opacity duration-700">0{i + 1}</div>
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase tracking-[0.3em] font-black">{step.title}</h4>
                      <p className="text-xs text-brand-light/95 leading-relaxed uppercase tracking-widest font-bold">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Quality Commitment */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="bg-brand-secondary p-12 md:p-24 rounded-[3rem] text-center space-y-10 relative overflow-hidden">
               <div className="absolute inset-0 bg-brand-primary/5 opacity-50" />
               <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                  <ShieldCheck size={48} className="mx-auto text-brand-accent" strokeWidth={1} />
                  <h2 className="text-3xl md:text-5xl font-heading uppercase tracking-tighter">The FabTops Guarantee</h2>
                  <p className="text-brand-dark/85 text-sm uppercase tracking-widest leading-relaxed font-bold">
                    Each garment undergoes a rigorous three-stage quality audit before being hand-packaged in our signature boutique boxes. We ensure your items reach you in pristine, runway-ready condition.
                  </p>
                  <div className="pt-8">
                    <Link 
                      href="/contact" 
                      className="inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] font-black text-brand-dark border-b border-brand-dark pb-2 hover:text-brand-dark hover:border-brand-primary transition-all duration-500"
                    >
                      Speak with an Advisor
                      <ArrowRight size={14} />
                    </Link>
                  </div>
               </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Legal Note */}
        <ScrollReveal>
          <div className="pt-24 border-t border-brand-dark/10 text-center">
             <p className="text-[9px] uppercase tracking-[0.4em] text-brand-dark/90 font-black max-w-2xl mx-auto leading-relaxed">
               By placing an order, you agree to our full shipping terms and conditions. International orders may be subject to customs duties and taxes which are the responsibility of the recipient.
             </p>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}

function ArrowRight({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14"/>
      <path d="m12 5 7 7-7 7"/>
    </svg>
  );
}
