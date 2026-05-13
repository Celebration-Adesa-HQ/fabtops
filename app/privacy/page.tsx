'use client';

import React from 'react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export default function PrivacyPage() {
  const sections = [
    {
      title: 'Information We Collect',
      content: 'We collect information that you provide directly to us, such as when you create an account, make a purchase, or communicate with our concierge team. This includes your name, email address, shipping address, and payment information.'
    },
    {
      title: 'How We Use Your Information',
      content: 'We use the information we collect to fulfill your orders, provide customer support, and personalize your experience with the FabTops digital flagship. We also use your data for marketing communications if you have opted in.'
    },
    {
      title: 'Data Security',
      content: 'We implement rigorous security measures to protect your personal information. Your payment data is processed through secure gateways like Paystack and Stripe, and we do not store sensitive credit card details on our servers.'
    },
    {
      title: 'Cookies and Tracking',
      content: 'We use cookies to enhance your browsing experience and analyze site traffic. You can manage your cookie preferences through your browser settings.'
    }
  ];

  return (
    <main className="min-h-screen bg-brand-light text-brand-dark pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="mb-24 space-y-8">
            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-brand-primary">Legal</span>
            <h1 className="text-6xl md:text-8xl font-heading uppercase leading-none tracking-tighter">
              Privacy <br />
              <span className="italic opacity-40">Policy</span>
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
