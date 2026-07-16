'use client';

import { FabBabeSubscribeForm } from './FabBabeSubscribeForm';

export function NewsletterForm() {
  return (
    <div className="space-y-6">
      <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-accent">Join the Circle</h3>
      <p className="max-w-sm text-sm leading-relaxed text-brand-light/90">
        Retain your place in the Fab Babe community with first access to drops, styling notes, and monthly picks.
      </p>
      <FabBabeSubscribeForm source="fab-babe-footer" variant="footer" />
    </div>
  );
}
