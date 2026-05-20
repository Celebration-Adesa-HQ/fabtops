'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Package, User, MapPin, CreditCard, LogOut, Heart, Settings, ChevronRight, Loader2, Trash2, ArrowRight, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useFavorites } from '@/lib/favorites-context';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { favorites, toggleFavorite } = useFavorites();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch('/api/auth/customer');
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            const customerData = result.data;
            setCustomer(customerData);
            setFormData({
              firstName: customerData.firstName || '',
              lastName: customerData.lastName || '',
              phone: customerData.phone || ''
            });
          } else {
            window.location.href = '/login';
          }
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
          setCustomer({ ...customer, ...result.data });
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
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" strokeWidth={1} />
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
                      {orders.map(({ node: order }: any) => {
                        const trackingInfo = order.successfulFulfillments?.[0]?.trackingInfo?.[0];
                        const items = order.lineItems?.edges || [];

                        return (
                          <div key={order.id} className="group bg-white/20 backdrop-blur-md border border-brand-dark/5 p-8 flex flex-col gap-8 hover:border-brand-dark transition-all rounded-[2rem]">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b border-brand-dark/5">
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
                                    <span className={`text-[10px] uppercase tracking-widest font-black bg-brand-dark p-2 rounded-lg ${order.fulfillmentStatus === 'FULFILLED' ? 'text-green-600' : 'text-brand-primary animate-pulse'}`}>
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
                                    className="flex-1 md:flex-none px-8 py-4 bg-brand-dark text-white text-[9px] uppercase tracking-widest font-black hover:bg-brand-primary transition-all text-center shadow-xl shadow-brand-dark/10"
                                  >
                                     Track Shipment
                                  </a>
                                ) : (
                                  <button 
                                    disabled
                                    className="flex-1 md:flex-none px-8 py-4 bg-brand-dark/5 text-brand-dark/20 text-[9px] uppercase tracking-widest font-black cursor-not-allowed"
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
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="mt-16 bg-brand-dark text-white px-10 py-5 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-brand-primary transition-all shadow-2xl shadow-brand-dark/10"
                  >
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

              {activeTab === 'settings' && (
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
                        value={customer.email}
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
                      className="w-full md:w-auto bg-brand-dark text-white px-12 py-6 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-brand-primary transition-all shadow-2xl shadow-brand-dark/10 disabled:opacity-50 group flex items-center justify-center gap-4"
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
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
