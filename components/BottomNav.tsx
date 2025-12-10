import React from 'react';
import { ShoppingCart, Package, DollarSign, Users } from 'lucide-react';
import { SheetName } from '../types';

interface BottomNavProps {
  activeTab: SheetName;
  onTabChange: (tab: SheetName) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: SheetName; label: string; icon: React.ReactNode }[] = [
    { id: 'Products', label: 'المنتجات', icon: <Package size={20} /> },
    { id: 'Sales', label: 'المبيعات', icon: <ShoppingCart size={20} /> },
    { id: 'Expenses', label: 'المصروفات', icon: <DollarSign size={20} /> },
    { id: 'Customers', label: 'العملاء', icon: <Users size={20} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-3xl mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`p-1 rounded-full ${isActive ? 'bg-emerald-50' : ''}`}>
                {tab.icon}
              </div>
              <span className="text-[10px] font-medium mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};