import React from 'react';
import {
  LayoutDashboard,
  Package,
  Wrench,
  MapPin,
  Users,
  BarChart3,
  Settings,
  Globe,
  LogOut,
  MonitorSmartphone,
  Tag
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Sidebar({ activePage, onNavigate, user, onLogout }) {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
  };

  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'assets', label: t('nav.assets'), icon: Package },
    { id: 'maintenance', label: t('nav.maintenance'), icon: Wrench },
    { id: 'locations', label: t('nav.locations'), icon: MapPin },
    { id: 'categories', label: t('nav.categories'), icon: Tag },
    { id: 'people', label: t('nav.people'), icon: Users },
    { id: 'reports', label: t('nav.reports'), icon: BarChart3 },
    ...(isAdmin ? [
      { id: 'software', label: 'Software', icon: MonitorSmartphone },
      { id: 'settings', label: t('nav.settings'), icon: Settings },
    ] : []),
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 shadow-sm overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div>
            <img src="/logo.png" alt="Logo" className="w-10 mx-auto mb-6" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-800 leading-tight">Carroll Prep Asset</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Management</p>
            <p className="text-[9px] text-blue-500 font-medium">by IT</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-50 font-bold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-medium'
                  }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-sm">
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors text-sm font-bold text-gray-600 shadow-sm"
        >
          <Globe className="w-4 h-4 text-blue-500" />
          <span>{i18n.language.startsWith('en') ? 'ไทย' : 'English'}</span>
        </button>

        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center border border-white">
                <span className="text-blue-600 font-bold text-xs">
                  {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">{user?.full_name || user?.username}</p>
                <p className="text-[10px] text-gray-400 font-medium capitalize">{user?.role || 'User'}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-white border border-red-50 text-red-500 rounded-xl hover:bg-red-50 transition-colors text-xs font-bold shadow-sm"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
