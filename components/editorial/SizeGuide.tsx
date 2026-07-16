'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuide({ isOpen, onClose }: SizeGuideProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-xl bg-brand-light z-[101] shadow-2xl overflow-y-auto"
          >
            <div className="p-12 space-y-12">
              <div className="flex justify-between items-center">
                <h2 className="font-heading text-4xl uppercase tracking-tighter text-brand-dark">Size Guide</h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-brand-dark/5 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-brand-dark" />
                </button>
              </div>

              <div className="space-y-8">
                <p className="text-sm text-brand-dark/85 leading-relaxed uppercase tracking-widest font-bold">
                  Find your perfect FabTops fit. Our garments are designed with a contemporary editorial silhouette.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] uppercase tracking-widest text-brand-dark">
                    <thead>
                      <tr className="border-b border-brand-dark/10">
                        <th className="py-4 text-left font-black">Size</th>
                        <th className="py-4 text-left font-black">Bust (in)</th>
                        <th className="py-4 text-left font-black">Waist (in)</th>
                        <th className="py-4 text-left font-black">Hips (in)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-dark/5">
                      {[
                        { size: 'XS', bust: '32-33', waist: '24-25', hips: '34-35' },
                        { size: 'S', bust: '34-35', waist: '26-27', hips: '36-37' },
                        { size: 'M', bust: '36-37', waist: '28-29', hips: '38-39' },
                        { size: 'L', bust: '38-40', waist: '30-32', hips: '40-42' },
                        { size: 'XL', bust: '41-43', waist: '33-35', hips: '43-45' },
                      ].map((row) => (
                        <tr key={row.size} className="hover:bg-brand-primary/5 transition-colors">
                          <td className="py-4 font-black">{row.size}</td>
                          <td className="py-4 opacity-60">{row.bust}</td>
                          <td className="py-4 opacity-60">{row.waist}</td>
                          <td className="py-4 opacity-60">{row.hips}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-6 pt-8 border-t border-brand-dark/10">
                  <h3 className="font-bold uppercase tracking-[0.2em] text-xs text-brand-dark">How to Measure</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-bold text-[10px] uppercase text-brand-primary mb-1">Bust</p>
                      <p className="text-xs text-brand-dark/85 leading-relaxed">Measure around the fullest part of your chest, keeping the tape horizontal.</p>
                    </div>
                    <div>
                      <p className="font-bold text-[10px] uppercase text-brand-primary mb-1">Waist</p>
                      <p className="text-xs text-brand-dark/85 leading-relaxed">Measure around your natural waistline (narrowest part), keeping the tape horizontal.</p>
                    </div>
                    <div>
                      <p className="font-bold text-[10px] uppercase text-brand-primary mb-1">Hips</p>
                      <p className="text-xs text-brand-dark/85 leading-relaxed">Measure around the fullest part of your hips, keeping the tape horizontal.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-primary/10 p-8 rounded-3xl">
                  <p className="text-[10px] uppercase tracking-widest font-black text-brand-primary mb-2">Need Help?</p>
                  <p className="text-xs text-brand-dark/85 leading-relaxed mb-6">
                    Our concierge team is available to assist with finding your perfect fit.
                  </p>
                  <button className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-dark hover:text-brand-dark transition-colors border-b border-brand-dark hover:border-brand-primary pb-1">
                    Contact Styling Concierge
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
