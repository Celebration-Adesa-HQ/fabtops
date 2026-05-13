'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Package, User, MapPin, CreditCard, LogOut, Heart, Settings, ChevronRight, Loader2, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useFavorites } from '@/lib/favorites-context';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { favorites, toggleFavorite } = useFavorites();

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
    <div className="min-h-screen bg-brand-secondary pt-40 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.5em] font-black text-brand-dark mb-4 block opacity-40">Babe Circle Member</span>
              <h1 className="text-5xl md:text-7xl font-heading text-brand-dark uppercase leading-none">
                Hello, <span className="italic opacity-80">{customer.firstName || 'Babe'}</span>
              </h1>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-black text-brand-dark/30 hover:text-brand-dark transition-colors"
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
                className={`w-full flex items-center justify-between p-6 text-[10px] uppercase tracking-[0.3em] font-black transition-all rounded-2xl ${
                  activeTab === item.id 
                  ? 'bg-brand-dark text-white shadow-2xl shadow-brand-dark/20' 
                  : 'text-brand-dark/40 hover:text-brand-dark hover:bg-white/40'
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
                  <h3 className="text-xs uppercase tracking-[0.3em] font-black text-brand-dark mb-8 border-b border-brand-dark/10 pb-4">Recent Selections</h3>
                  {orders.length > 0 ? (
                    <div className="space-y-6">
                      {orders.map(({ node: order }: any) => (
                        <div key={order.id} className="group bg-white/20 backdrop-blur-md border border-brand-dark/5 p-8 flex flex-col md:flex-row justify-between items-center gap-8 hover:border-brand-dark transition-all rounded-[2rem]">
                          <div className="flex items-center gap-8">
                            <div className="w-16 h-16 bg-brand-dark/5 flex items-center justify-center text-brand-dark/40">
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
                                <span className={`text-[10px] uppercase tracking-widest font-black ${order.fulfillmentStatus === 'FULFILLED' ? 'text-green-600' : 'text-brand-primary animate-pulse'}`}>
                                  {order.fulfillmentStatus || 'PROCESSING'}
                                </span>
                             </div>
                             <div>
                                <p className="text-[9px] uppercase tracking-widest font-black text-brand-dark/30 mb-1">Payment</p>
                                <p className="text-sm font-black text-brand-dark">{order.financialStatus}</p>
                             </div>
                             <div>
                                <p className="text-[9px] uppercase tracking-widest font-black text-brand-dark/30 mb-1">Total Amount</p>
                                <p className="text-sm font-black text-brand-dark">
                                  {order.totalPrice.currencyCode} {Number(order.totalPrice.amount).toLocaleString()}
                                </p>
                             </div>
                          </div>

                          <button className="px-8 py-3 bg-brand-dark text-white text-[9px] uppercase tracking-widest font-black hover:bg-brand-primary transition-all shadow-xl shadow-brand-dark/10">
                             Track Order
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-24 text-center border-2 border-dashed border-brand-dark/10 rounded-[3rem] bg-white/10 backdrop-blur-sm">
                       <Package size={48} className="mx-auto text-brand-dark/10 mb-6" strokeWidth={1} />
                       <p className="text-brand-dark/40 font-bold uppercase tracking-widest text-[11px] italic">Your heritage journey begins with your first selection.</p>
                       <Link href="/shop" className="mt-8 inline-block text-[10px] uppercase tracking-[0.4em] font-black text-brand-dark hover:text-brand-primary transition-colors underline underline-offset-8 decoration-brand-dark/10">Browse Collection</Link>
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
                  <button className="mt-16 bg-brand-dark text-white px-10 py-5 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-brand-primary transition-all shadow-2xl shadow-brand-dark/10">
                    Update Credentials
                  </button>
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <div className="flex justify-between items-end border-b border-brand-dark/10 pb-4 mb-12">
                    <h3 className="text-xs uppercase tracking-[0.3em] font-black text-brand-dark">Styling Vault</h3>
                    <span className="text-[9px] uppercase tracking-widest font-black text-brand-dark/40">{favorites.length} Items Archived</span>
                  </div>

                  {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {favorites.map((item) => (
                        <div key={item.id} className="group relative bg-white/20 backdrop-blur-md border border-brand-dark/5 p-6 rounded-[2rem] flex gap-6 hover:border-brand-dark transition-all">
                          <div className="relative w-32 aspect-[3/4] overflow-hidden rounded-xl">
                            <Image 
                              src={item.imageUrl} 
                              alt={item.title} 
                              fill 
                              className="object-cover group-hover:scale-110 transition-transform duration-700" 
                            />
                          </div>
                          <div className="flex flex-col justify-between py-2">
                            <div>
                              <h4 className="text-[11px] font-black uppercase tracking-widest text-brand-dark mb-2 leading-tight">{item.title}</h4>
                              <p className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-widest">{item.currencyCode} {Number(item.price).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-4">
                              <Link 
                                href={`/product/${item.handle}`}
                                className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-black text-brand-dark hover:text-brand-primary transition-colors"
                              >
                                View Piece <ArrowRight size={12} />
                              </Link>
                              <button 
                                onClick={() => toggleFavorite(item, true)}
                                className="text-brand-dark/20 hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-24 text-center border-2 border-dashed border-brand-dark/10 rounded-[3rem] bg-white/10 backdrop-blur-sm">
                       <Heart size={48} className="mx-auto text-brand-dark/10 mb-6" strokeWidth={1} />
                       <p className="text-brand-dark/40 font-bold uppercase tracking-widest text-[11px] italic">Your styling vault is currently empty.</p>
                       <Link href="/shop" className="mt-8 inline-block text-[10px] uppercase tracking-[0.4em] font-black text-brand-dark hover:text-brand-primary transition-colors underline underline-offset-8 decoration-brand-dark/10">Explore the Collection</Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
