'use client';

import { motion } from 'framer-motion';
import { MapPin, ShieldCheck, Home } from 'lucide-react';

interface AddressTabProps {
  customer: any;
}

export function AddressTab({ customer }: AddressTabProps) {
  const defaultAddress = customer?.defaultAddress;
  const addresses = customer?.addresses?.edges || [];

  return (
    <motion.div
      key="addresses"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-12"
    >
      <div className="flex justify-between items-end border-b border-brand-dark/10 pb-4 mb-12">
        <h3 className="text-xs uppercase tracking-[0.3em] font-black text-brand-dark">Shipping Addresses</h3>
        <span className="text-[9px] uppercase tracking-widest font-black text-brand-dark/40">
          {addresses.length || (defaultAddress ? 1 : 0)} Active Destination(s)
        </span>
      </div>

      {defaultAddress || addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Default Address Card */}
          {defaultAddress && (
            <div className="group relative bg-white/30 backdrop-blur-md border border-brand-dark p-8 rounded-[2.5rem] flex flex-col justify-between hover:shadow-2xl hover:shadow-brand-dark/5 transition-all duration-500">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-brand-dark text-white rounded-full flex items-center justify-center">
                    <Home size={18} strokeWidth={2} />
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-black bg-brand-dark text-white px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <ShieldCheck size={12} /> Default
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-dark/30">Recipient Identity</h4>
                  <p className="text-sm font-black text-brand-dark uppercase tracking-widest">
                    {defaultAddress.firstName} {defaultAddress.lastName}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-dark/30">Delivery Destination</h4>
                  <p className="text-sm font-bold text-brand-dark leading-relaxed">
                    {defaultAddress.address1}
                    {defaultAddress.address2 && `, ${defaultAddress.address2}`}
                    <br />
                    {defaultAddress.city}, {defaultAddress.province} {defaultAddress.zip}
                    <br />
                    {defaultAddress.country}
                  </p>
                </div>

                {defaultAddress.phone && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-dark/30">Contact Reference</h4>
                    <p className="text-xs font-bold text-brand-dark">{defaultAddress.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other Saved Addresses */}
          {addresses
            .filter(({ node: address }: any) => address.id !== defaultAddress?.id)
            .map(({ node: address }: any, idx: number) => (
              <div key={address.id || idx} className="group relative bg-white/20 backdrop-blur-md border border-brand-dark/5 p-8 rounded-[2.5rem] flex flex-col justify-between hover:border-brand-dark transition-all duration-500">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-brand-dark/5 text-brand-dark rounded-full flex items-center justify-center group-hover:bg-brand-dark group-hover:text-white transition-colors duration-500">
                      <MapPin size={18} strokeWidth={1.5} />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-dark/30">Recipient Identity</h4>
                    <p className="text-sm font-black text-brand-dark uppercase tracking-widest">
                      {address.firstName} {address.lastName}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-dark/30">Delivery Destination</h4>
                    <p className="text-sm font-bold text-brand-dark leading-relaxed">
                      {address.address1}
                      {address.address2 && `, ${address.address2}`}
                      <br />
                      {address.city}, {address.province} {address.zip}
                      <br />
                      {address.country}
                    </p>
                  </div>

                  {address.phone && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-dark/30">Contact Reference</h4>
                      <p className="text-xs font-bold text-brand-dark">{address.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="py-24 text-center border-2 border-dashed border-brand-dark/10 rounded-[3rem] bg-white/10 backdrop-blur-sm">
           <MapPin size={48} className="mx-auto text-brand-dark/10 mb-6" strokeWidth={1} />
           <p className="text-brand-dark/40 font-bold uppercase tracking-widest text-[11px] italic">No saved delivery destinations detected.</p>
           <p className="text-[9px] text-brand-dark/30 uppercase tracking-[0.2em] max-w-xs mx-auto mt-4 leading-relaxed font-black">
             You can configure a preferred delivery destination during your next check-out sequence.
           </p>
        </div>
      )}
    </motion.div>
  );
}
