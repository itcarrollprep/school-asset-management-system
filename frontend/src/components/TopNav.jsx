import React from 'react';
import { Star, Bell, LayoutGrid, ChevronDown, UserSquare } from 'lucide-react';

export default function TopNav({ title = "Assets", user, stats, onNavigate }) {
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const initials = user ? (user.initials || getInitials(user.full_name || user.username)) : "JL";

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 w-full transition-all">
      <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500">{title}</h2>
      
      <div className="flex items-center space-x-6">
        {/* Inventories dropdown */}
        <div 
          onClick={() => onNavigate && onNavigate('assets')}
          className="group flex items-center text-xs font-black bg-gray-50 hover:bg-gray-100 rounded-2xl px-5 py-2 cursor-pointer text-gray-500 border border-gray-100 transition-all hover:scale-105 active:scale-95"
        >
          INVENTORIES <span className="text-blue-600 ml-2 font-black text-sm">{(stats && stats.totalAssets) || 0}</span>
          <ChevronDown className="w-4 h-4 ml-2 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100">
            <Star className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => onNavigate && onNavigate('maintenance')}
            className="relative p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-orange-100"
          >
            <Bell className="w-5 h-5" />
            {stats && stats.pendingMaintenance > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[9px] font-black text-white shadow-lg ring-2 ring-white animate-pulse">
                {stats.pendingMaintenance}
              </span>
            )}
          </button>
          
          <div 
            onClick={() => onNavigate && onNavigate('settings')}
            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-700 font-black text-xs cursor-pointer border-2 border-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            title={user ? (user.full_name || user.username) : "User profile"}
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
