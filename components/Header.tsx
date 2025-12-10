
import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, X, AlertTriangle } from 'lucide-react';
import { NetworkStatus, SheetName, AppNotification } from '../types';

interface HeaderProps {
  status: NetworkStatus;
  onSync: () => void;
  pendingCount: number;
  activeTab: SheetName;
  notifications: AppNotification[];
  onDismissNotification: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  status, 
  onSync, 
  pendingCount, 
  activeTab,
  notifications,
  onDismissNotification
}) => {
  const titles: Record<SheetName, string> = {
    Products: 'المنتجات',
    Sales: 'المبيعات',
    Expenses: 'المصروفات',
    Customers: 'العملاء'
  };

  return (
    <div className="sticky top-0 z-50">
      {/* Main Header */}
      <header className="bg-emerald-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">{titles[activeTab]}</h1>
            <p className="text-xs text-emerald-100">إدارة {titles[activeTab]}</p>
          </div>
          
          <div className="flex items-center gap-3">
            
            {/* Sync Button with Badge */}
            <div className="relative">
              <button 
                onClick={onSync} 
                disabled={status === NetworkStatus.OFFLINE || status === NetworkStatus.SYNCING}
                className={`p-2 rounded-full transition-all ${status === NetworkStatus.SYNCING ? 'animate-spin bg-emerald-700' : 'active:bg-emerald-700 hover:bg-emerald-500/20'}`}
                title="مزامنة البيانات"
              >
                <RefreshCw size={20} />
              </button>
              
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-emerald-600 shadow-sm font-bold px-1">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </div>

            {/* Network Status Indicator */}
            <div className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
              {status === NetworkStatus.ONLINE ? (
                <>
                  <Wifi size={16} className="text-green-300" />
                  <span className="text-[10px] hidden sm:inline text-green-100">متصل</span>
                </>
              ) : status === NetworkStatus.SYNCING ? (
                <>
                  <RefreshCw size={16} className="text-yellow-300 animate-spin" />
                  <span className="text-[10px] hidden sm:inline text-yellow-100">جاري المزامنة...</span>
                </>
              ) : (
                <>
                  <WifiOff size={16} className="text-red-300" />
                  <span className="text-[10px] hidden sm:inline text-red-100">غير متصل</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Area */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-3xl mx-auto">
          {notifications.map((note) => (
            <div 
              key={note.id}
              className={`p-3 flex items-start justify-between gap-3 animate-[fadeIn_0.3s_ease-out] ${
                note.type === 'error' ? 'bg-red-100 text-red-800 border-b border-red-200' :
                note.type === 'warning' ? 'bg-amber-100 text-amber-800 border-b border-amber-200' :
                'bg-blue-50 text-blue-800 border-b border-blue-100'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                {note.type === 'error' && <AlertCircle size={18} className="text-red-600 shrink-0" />}
                {note.type === 'warning' && <AlertTriangle size={18} className="text-amber-600 shrink-0" />}
                <span>{note.message}</span>
              </div>
              <button 
                onClick={() => onDismissNotification(note.id)}
                className="p-1 hover:bg-black/5 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};