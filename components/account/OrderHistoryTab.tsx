'use client';

import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface OrderHistoryTabProps {
  customer: any;
}

export function OrderHistoryTab({ customer }: OrderHistoryTabProps) {
  const orders = customer?.orders?.edges || [];

  return (
    <motion.div
      key="orders"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <h3 className="text-xs uppercase tracking-[0.3em] font-black text-brand-dark mb-8 border-b border-brand-dark/10 pb-4">Recent Selections</h3>
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map(({ node: order }: any) => {
            const trackingInfo = order.successfulFulfillments?.[0]?.trackingInfo?.[0];
            const items = order.lineItems?.edges || [];

            return (
              <div key={order.id} className="group bg-white/20 backdrop-blur-md border border-brand-dark/5 p-8 flex flex-col gap-8 hover:border-brand-dark transition-all rounded-[2rem]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b border-brand-dark/5">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-brand-dark/5 flex items-center justify-center text-brand-dark/40 rounded-xl">
                       <Package size={24} strokeWidth={1} />
                    </div>
                    <div>
                       <p className="text-[10px] uppercase tracking-widest font-black text-brand-dark/40 mb-1">
                         {new Date(order.processedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                       </p>
                       <h4 className="text-sm font-black uppercase text-brand-dark">{order.orderNumber ? `#${order.orderNumber}` : order.id.slice(-8)}</h4>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-12 text-center md:text-left">
                     <div>
                        <p className="text-[9px] uppercase tracking-widest font-black text-brand-dark/30 mb-1">Status</p>
                        <span className={`text-[10px] uppercase tracking-widest font-black rounded-lg ${order.fulfillmentStatus === 'FULFILLED' ? 'text-green-600' : 'text-brand-primary animate-pulse'}`}>
                          {order.fulfillmentStatus || 'PROCESSING'}
                        </span>
                     </div>
                     <div>
                        <p className="text-[9px] uppercase tracking-widest font-black text-brand-dark/30 mb-1">Total Amount</p>
                        <p className="text-sm font-black text-brand-dark">
                          {order.totalPrice.currencyCode} {Number(order.totalPrice.amount).toLocaleString()}
                        </p>
                     </div>
                  </div>

                  <div className="flex gap-4 w-full md:w-auto">
                    {trackingInfo?.url ? (
                      <a 
                        href={trackingInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 md:flex-none px-8 py-4 bg-brand-dark text-white text-[9px] uppercase tracking-widest font-black hover:bg-brand-primary transition-all text-center shadow-xl shadow-brand-dark/10 rounded-xl"
                      >
                         Track Shipment
                      </a>
                    ) : (
                      <button 
                        disabled
                        className="flex-1 md:flex-none px-8 py-4 bg-brand-dark/5 text-brand-dark/20 text-[9px] uppercase tracking-widest font-black cursor-not-allowed rounded-xl"
                      >
                         Preparing to Ship
                      </button>
                    )}
                  </div>
                </div>

                {/* Line Items Preview */}
                <div className="flex flex-wrap gap-4">
                  {items.map(({ node: item }: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 bg-white/40 px-4 py-2 rounded-full border border-brand-dark/5">
                      {item.variant?.image?.url && (
                        <div className="relative w-6 h-8 bg-brand-dark/5 overflow-hidden rounded-sm">
                          <Image src={item.variant.image.url} alt={item.title} fill className="object-cover" />
                        </div>
                      )}
                      <span className="text-[9px] uppercase tracking-widest font-black text-brand-dark">
                        {item.title} <span className="opacity-40 ml-2">x{item.quantity}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center border-2 border-dashed border-brand-dark/10 rounded-[3rem] bg-white/10 backdrop-blur-sm">
           <Package size={48} className="mx-auto text-brand-dark/10 mb-6" strokeWidth={1} />
           <p className="text-brand-dark/40 font-bold uppercase tracking-widest text-[11px] italic">Your heritage journey begins with your first selection.</p>
           <Link href="/shop" className="mt-8 inline-block text-[10px] uppercase tracking-[0.4em] font-black text-brand-dark hover:text-brand-primary transition-colors underline underline-offset-8 decoration-brand-dark/10">Browse Collection</Link>
        </div>
      )}
    </motion.div>
  );
}
