'use client';

import { motion } from 'framer-motion';

interface ProfileTabProps {
  customer: any;
  setActiveTab: (tab: string) => void;
}

export function ProfileTab({ customer, setActiveTab }: ProfileTabProps) {
  if (!customer) return null;

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-2xl"
    >
      <h3 className="text-xs uppercase tracking-[0.3em] font-black text-brand-dark mb-12 border-b border-brand-dark/10 pb-4">Personal Details</h3>
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-2">
           <p className="text-[9px] uppercase tracking-widest font-black text-brand-dark/30">Full Identity</p>
           <p className="text-sm font-black text-brand-dark border-b border-brand-dark/5 pb-2 uppercase tracking-widest">{customer.firstName} {customer.lastName}</p>
        </div>
        <div className="space-y-2">
           <p className="text-[9px] uppercase tracking-widest font-black text-brand-dark/30">Email Reference</p>
           <p className="text-sm font-black text-brand-dark border-b border-brand-dark/5 pb-2 uppercase tracking-widest">{customer.email}</p>
        </div>
        <div className="space-y-2">
           <p className="text-[9px] uppercase tracking-widest font-black text-brand-dark/30">Default Region</p>
           <p className="text-sm font-black text-brand-dark border-b border-brand-dark/5 pb-2 uppercase tracking-widest">{customer.defaultAddress?.city || 'Unset'}, {customer.defaultAddress?.country || 'Global'}</p>
        </div>
        <div className="space-y-2">
           <p className="text-[9px] uppercase tracking-widest font-black text-brand-dark/30">Membership</p>
           <p className="text-sm font-black text-brand-dark border-b border-brand-dark/5 pb-2 uppercase tracking-widest">Babe Circle Elite</p>
        </div>
      </div>
      <button 
        onClick={() => setActiveTab('settings')}
        className="mt-16 bg-brand-dark text-white px-10 py-5 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-brand-primary hover:text-brand-dark transition-all shadow-2xl shadow-brand-dark/10 rounded-xl"
      >
        Update Credentials
      </button>
    </motion.div>
  );
}
