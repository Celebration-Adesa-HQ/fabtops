'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';

interface SettingsTabProps {
  customer: any;
  onUpdateSuccess: (updatedData: any) => void;
}

export function SettingsTab({ customer, onUpdateSuccess }: SettingsTabProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [formData, setFormData] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    phone: customer?.phone || ''
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateStatus(null);

    try {
      const res = await fetch('/api/auth/customer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          onUpdateSuccess(result.data);
          setUpdateStatus({ type: 'success', message: result.message || 'Profile updated successfully.' });
        } else {
          setUpdateStatus({ type: 'error', message: result.error || 'Update failed.' });
        }
      } else {
        const error = await res.json();
        setUpdateStatus({ type: 'error', message: error.error || 'Update failed.' });
      }
    } catch (error) {
      setUpdateStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-2xl"
    >
      <h3 className="text-xs uppercase tracking-[0.3em] font-black text-brand-dark mb-12 border-b border-brand-dark/10 pb-4">Account Configuration</h3>
      
      <form onSubmit={handleUpdateProfile} className="space-y-10">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-[9px] uppercase tracking-widest font-black text-brand-dark/40 ml-4">Given Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full bg-white/40 border border-brand-dark/5 px-8 py-5 rounded-2xl focus:outline-none focus:border-brand-dark transition-all text-xs font-black uppercase tracking-widest"
              placeholder="First Name"
              required
            />
          </div>
          <div className="space-y-4">
            <label className="text-[9px] uppercase tracking-widest font-black text-brand-dark/40 ml-4">Family Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full bg-white/40 border border-brand-dark/5 px-8 py-5 rounded-2xl focus:outline-none focus:border-brand-dark transition-all text-xs font-black uppercase tracking-widest"
              placeholder="Last Name"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[9px] uppercase tracking-widest font-black text-brand-dark/40 ml-4">Mobile Reference</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-white/40 border border-brand-dark/5 px-8 py-5 rounded-2xl focus:outline-none focus:border-brand-dark transition-all text-xs font-black uppercase tracking-widest"
            placeholder="+234 ..."
          />
        </div>

        <div className="space-y-4">
          <label className="text-[9px] uppercase tracking-widest font-black text-brand-dark/40 ml-4">Primary Email (View Only)</label>
          <input
            type="email"
            value={customer?.email || ''}
            disabled
            className="w-full bg-brand-dark/5 border border-brand-dark/5 px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-widest opacity-40 cursor-not-allowed"
          />
        </div>

        <AnimatePresence>
          {updateStatus && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`text-[10px] uppercase tracking-widest font-black p-4 rounded-xl ${
                updateStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {updateStatus.message}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full md:w-auto bg-brand-dark text-white px-12 py-6 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-brand-primary hover:text-brand-dark transition-all shadow-2xl shadow-brand-dark/10 disabled:opacity-50 group flex items-center justify-center gap-4 rounded-xl"
        >
          {isUpdating ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Synchronizing...
            </>
          ) : (
            <>
              Commit Changes
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
