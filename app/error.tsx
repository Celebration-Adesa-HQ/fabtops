'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 bg-brand-light">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-xl"
      >
        <div className="inline-block px-4 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold text-brand-primary mb-8">
          System Interruption
        </div>
        
        <h1 className="text-5xl md:text-7xl font-heading uppercase tracking-tighter text-brand-dark mb-6 leading-none">
          Something went <span className="italic opacity-50">Wrong</span>
        </h1>
        
        <p className="text-brand-dark/85 mb-12 text-[11px] uppercase tracking-widest leading-loose font-bold">
          We encountered an unexpected moment in our digital atelier. Our team has been notified.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-brand-dark text-brand-light px-10 py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-brand-primary hover:text-brand-dark transition-all duration-500 group shadow-xl"
          >
            <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-4 border border-brand-dark/10 text-brand-dark px-10 py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-brand-dark hover:text-white transition-all duration-500"
          >
            <Home size={14} />
            Return Home
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-16 p-6 bg-red-50 border border-red-100 rounded-2xl text-left overflow-auto max-h-48">
            <p className="text-xs font-mono text-red-600 whitespace-pre-wrap">
              {error.message}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
