'use client';

import { CircleHero } from '@/components/editorial/CircleHero';
import { CircleBenefits } from '@/components/editorial/CircleBenefits';
import { CircleCta } from '@/components/editorial/CircleCta';
import { CirclePhilosophy } from '@/components/editorial/CirclePhilosophy';

export default function CirclePage() {
  return (
    <div className="relative min-h-screen bg-brand-secondary selection:bg-brand-primary/20 selection:text-brand-dark overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] right-[-10%] w-[70vw] h-[70vw] bg-brand-primary/10 blur-[120px] rounded-full animate-morph-blob" />
        <div className="absolute bottom-[20%] left-[-10%] w-[50vw] h-[50vw] bg-brand-secondary/40 blur-[100px] rounded-full animate-morph-blob" style={{ animationDelay: '-4s' }} />
      </div>

      {/* Circle Sections */}
      <CircleHero />
      <CircleBenefits />
      <CircleCta />
      <CirclePhilosophy />
      
      {/* Footer Bridge */}
      <div className="w-full h-32 md:h-64 bg-gradient-to-t from-brand-dark/5 to-transparent" />
    </div>
  );
}
