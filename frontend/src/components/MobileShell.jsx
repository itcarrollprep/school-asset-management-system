import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Wrench, 
  MapPin, 
  Users, 
  BarChart3, 
  Settings,
  Globe,
  Bell,
  Menu,
  X,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MobileShell({ activePage, onNavigate, children, title, user, onLogout }) {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
  };

  const menuItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'assets', label: t('nav.assets'), icon: Package },
    { id: 'maintenance', label: t('nav.maintenance'), icon: Wrench },
    { id: 'people', label: t('nav.people'), icon: Users },
  ];

  const moreItems = [
    { id: 'locations', label: t('nav.locations'), icon: MapPin },
    { id: 'reports', label: t('nav.reports'), icon: BarChart3 },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans text-sm">
      {/* Top Header */}
      <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-100">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-800 tracking-tight text-xs uppercase">Carrollprep</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="relative text-gray-500 p-1.5 hover:bg-gray-50 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-[10px]">
            {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 py-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 fixed bottom-0 left-0 right-0 z-30 pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center space-y-1 w-16 h-full transition-all duration-200 ${
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-blue-600 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
        
        <button
          onClick={() => setIsMenuOpen(true)}
          className={`flex flex-col items-center justify-center space-y-1 w-16 h-full ${
            moreItems.some(i => i.id === activePage) ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-bold opacity-80">{t('nav.more') || 'More'}</span>
        </button>
      </nav>

      {/* Slide-over Menu (Full screen for mobile) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-bottom duration-300">
          <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4">
            <span className="font-bold text-gray-800">{t('nav.menu') || 'Menu'}</span>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </header>
          
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center border border-white shadow-sm">
                  <span className="text-blue-600 font-bold">
                    {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{user?.full_name || user?.username}</p>
                  <p className="text-xs text-gray-500 font-medium capitalize">{user?.role || 'User'}</p>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Navigation</p>
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-bold">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30" />
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Preferences</p>
              <button
                onClick={toggleLanguage}
                className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <span className="font-bold text-gray-700">Language / ภาษา</span>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                  {i18n.language.startsWith('en') ? 'English' : 'ไทย'}
                </span>
              </button>

              <button
                onClick={onLogout}
                className="w-full flex items-center justify-between p-3 border border-red-50 bg-red-50/30 rounded-xl hover:bg-red-50 transition-colors text-red-600"
              >
                <div className="flex items-center space-x-3">
                  <LogOut className="w-5 h-5" />
                  <span className="font-bold">Sign Out</span>
                </div>
              </button>
            </div>
          </div>
          
          <div className="p-6 bg-gray-50 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Carrollprep Asset Management</p>
            <p className="text-[10px] text-blue-500 font-medium mt-1">Version 1.0.0</p>
          </div>
        </div>
      )}
    </div>
  );
}
