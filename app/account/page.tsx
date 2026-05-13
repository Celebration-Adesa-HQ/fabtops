'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Package, User, MapPin, CreditCard, LogOut, Heart, Settings, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch('/api/auth/customer');
        if (res.ok) {
          const data = await res.json();
          setCustomer(data);
        } else {
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Failed to fetch customer:', error);
        window.location.href = '/login';
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 text-pink-600 animate-spin" strokeWidth={1} />
      </div>
    );
  }

  if (!customer) return null;

  const orders = customer.orders?.edges || [];

  return (
    <div className="min-h-screen bg-white pt-40 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.5em] font-black text-pink-600 mb-4 block">Babe Circle Member</span>
              <h1 className="text-5xl md:text-7xl font-serif-logo text-black uppercase leading-none">
                Hello, <span className="italic text-pink-600">{customer.firstName || 'Babe'}</span>
              </h1>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-black text-gray-300 hover:text-pink-600 transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-4 gap-16">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-2">
            {[
              { id: 'orders', label: 'Order History', icon: Package },
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
              { id: 'wishlist', label: 'Styling Vault', icon: Heart },
              { id: 'settings', label: 'Account Settings', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-4 text-[10px] uppercase tracking-widest font-black transition-all ${
                  activeTab === item.id 
                  ? 'bg-pink-600 text-white shadow-xl shadow-pink-100' 
                  : 'text-gray-400 hover:text-black hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={16} strokeWidth={activeTab === item.id ? 2.5 : 1.5} />
                  {item.label}
                </div>
                <ChevronRight size={14} className={activeTab === item.id ? 'opacity-100' : 'opacity-0'} />
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <h3 className="text-xs uppercase tracking-[0.3em] font-black text-black mb-8 border-b border-gray-100 pb-4">Recent Selections</h3>
                  {orders.length > 0 ? (
                    <div className="space-y-6">
                      {orders.map(({ node: order }: any) => (
                        <div key={order.id} className="group border border-gray-100 p-8 flex flex-col md:flex-row justify-between items-center gap-8 hover:border-pink-600 transition-colors">
                          <div className="flex items-center gap-8">
                            <div className="w-16 h-16 bg-gray-50 flex items-center justify-center text-gray-300">
                               <Package size={24} strokeWidth={1} />
                            </div>
                            <div>
                               <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">
                                 {new Date(order.processedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                               </p>
                               <h4 className="text-sm font-black uppercase text-black">{order.orderNumber ? `#${order.orderNumber}` : order.id.slice(-8)}</h4>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-12 text-center md:text-left">
                             <div>
                                <p className="text-[9px] uppercase tracking-widest font-black text-gray-300 mb-1">Status</p>
                                <span className={`text-[10px] uppercase tracking-widest font-black ${order.fulfillmentStatus === 'FULFILLED' ? 'text-green-500' : 'text-pink-600 animate-pulse'}`}>
                                  {order.fulfillmentStatus || 'PROCESSING'}
                                </span>
                             </div>
                             <div>
                                <p className="text-[9px] uppercase tracking-widest font-black text-gray-300 mb-1">Payment</p>
                                <p className="text-sm font-black text-black">{order.financialStatus}</p>
                             </div>
                             <div>
                                <p className="text-[9px] uppercase tracking-widest font-black text-gray-300 mb-1">Total Amount</p>
                                <p className="text-sm font-black text-pink-600">
                                  {order.totalPrice.currencyCode} {Number(order.totalPrice.amount).toLocaleString()}
                                </p>
                             </div>
                          </div>

                          <button className="px-8 py-3 border border-black text-[9px] uppercase tracking-widest font-black hover:bg-black hover:text-white transition-all">
                             Track Order
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[2rem]">
                       <Package size={48} className="mx-auto text-gray-100 mb-6" strokeWidth={1} />
                       <p className="text-gray-400 font-light italic">Your heritage journey begins with your first selection.</p>
                       <Link href="/shop" className="mt-8 inline-block text-[10px] uppercase tracking-[0.4em] font-black text-pink-600 hover:text-black transition-colors underline underline-offset-8">Browse Collection</Link>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-2xl"
                >
                  <h3 className="text-xs uppercase tracking-[0.3em] font-black text-black mb-12 border-b border-gray-100 pb-4">Personal Details</h3>
                  <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-2">
                       <p className="text-[9px] uppercase tracking-widest font-black text-gray-300">Full Identity</p>
                       <p className="text-sm font-bold text-black border-b border-gray-50 pb-2">{customer.firstName} {customer.lastName}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] uppercase tracking-widest font-black text-gray-300">Email Reference</p>
                       <p className="text-sm font-bold text-black border-b border-gray-50 pb-2">{customer.email}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] uppercase tracking-widest font-black text-gray-300">Default Region</p>
                       <p className="text-sm font-bold text-black border-b border-gray-50 pb-2">{customer.defaultAddress?.city || 'Unset'}, {customer.defaultAddress?.country || 'Global'}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] uppercase tracking-widest font-black text-gray-300">Membership</p>
                       <p className="text-sm font-bold text-pink-600 border-b border-gray-50 pb-2">Babe Circle Elite</p>
                    </div>
                  </div>
                  <button className="mt-16 bg-black text-white px-10 py-5 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-pink-600 transition-all">
                    Update Credentials
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
