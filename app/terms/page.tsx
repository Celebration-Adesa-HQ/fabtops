'use client';

import React from 'react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export default function TermsPage() {
  const sections = [
    {
      title: 'Usage Terms',
      content: 'By accessing the FabTops digital flagship, you agree to comply with all applicable laws and regulations. You are responsible for maintaining the confidentiality of your account credentials.'
    },
    {
      title: 'Intellectual Property',
      content: 'All content on this site, including designs, photography, and trademarks, is the exclusive property of FabTops. Unauthorized use or reproduction is strictly prohibited.'
    },
    {
      title: 'Purchase Conditions',
      content: 'Prices and availability are subject to change without notice. We reserve the right to refuse or cancel any order at our discretion.'
    },
    {
      title: 'Liability',
      content: 'FabTops shall not be liable for any indirect or consequential damages arising from the use of our products or website.'
    }
  ];

  return (
    <main className="min-h-screen bg-brand-light text-brand-dark pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="mb-24 space-y-8">
            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-brand-primary">Legal</span>
            <h1 className="text-6xl md:text-8xl font-heading uppercase leading-none tracking-tighter">
              Terms of <br />
              <span className="italic opacity-40">Service</span>
            </h1>
            <p className="text-sm uppercase tracking-widest font-black text-brand-dark/40 pt-4">
              Last Updated: May 2024
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-24">
          {sections.map((section, i) => (
            <ScrollReveal key={i}>
              <section className="space-y-6">
                <h2 className="text-xs uppercase tracking-[0.3em] font-black border-b border-brand-dark/10 pb-4">{section.title}</h2>
                <p className="text-sm md:text-base text-brand-dark/60 leading-relaxed uppercase tracking-widest font-bold">
                  {section.content}
                </p>
              </section>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </main>
  );
}
