'use client';

import { Package, User, MapPin, Heart, Settings, ChevronRight } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number; strokeWidth?: number; className?: string }>;
}

interface AccountSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const items: SidebarItem[] = [
  { id: 'orders', label: 'Order History', icon: Package },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  { id: 'wishlist', label: 'Styling Vault', icon: Heart },
  { id: 'settings', label: 'Account Settings', icon: Settings },
];

export function AccountSidebar({ activeTab, setActiveTab }: AccountSidebarProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
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
  );
}
