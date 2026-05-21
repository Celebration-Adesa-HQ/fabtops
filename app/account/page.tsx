'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { LogOut, Loader2 } from 'lucide-react';

import { AccountSidebar } from '@/components/account/AccountSidebar';
import { OrderHistoryTab } from '@/components/account/OrderHistoryTab';
import { ProfileTab } from '@/components/account/ProfileTab';
import { WishlistTab } from '@/components/account/WishlistTab';
import { SettingsTab } from '@/components/account/SettingsTab';
import { AddressTab } from '@/components/account/AddressTab';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch('/api/auth/customer');
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            setCustomer(result.data);
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

  const handleUpdateSuccess = (updatedData: any) => {
    setCustomer((prevCustomer: any) => ({
      ...prevCustomer,
      ...updatedData
    }));
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
          <div className="lg:col-span-1">
            <AccountSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'orders' && (
                <OrderHistoryTab key="orders" customer={customer} />
              )}

              {activeTab === 'profile' && (
                <ProfileTab key="profile" customer={customer} setActiveTab={setActiveTab} />
              )}

              {activeTab === 'addresses' && (
                <AddressTab key="addresses" customer={customer} />
              )}

              {activeTab === 'wishlist' && (
                <WishlistTab key="wishlist" />
              )}

              {activeTab === 'settings' && (
                <SettingsTab key="settings" customer={customer} onUpdateSuccess={handleUpdateSuccess} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
