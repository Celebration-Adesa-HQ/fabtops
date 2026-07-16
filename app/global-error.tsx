'use client';

import { Playfair_Display, Raleway } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-heading' });
const raleway = Raleway({ subsets: ['latin'], variable: '--font-body' });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${raleway.variable}`}>
      <body className="min-h-screen bg-brand-light flex items-center justify-center p-6">
        <div className="text-center max-w-xl">
          <h1 className="text-6xl font-heading text-brand-dark mb-6">Critical Error</h1>
          <p className="text-brand-dark/85 font-body mb-10 text-sm uppercase tracking-widest leading-loose">
            A fundamental error has occurred. We are working to restore the digital flagship experience.
          </p>
          <button
            onClick={() => reset()}
            className="bg-brand-dark text-brand-light px-10 py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-brand-primary hover:text-brand-dark transition-all"
          >
            Refresh Platform
          </button>
        </div>
      </body>
    </html>
  );
}
