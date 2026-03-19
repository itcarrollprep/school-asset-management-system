import React, { useState, useEffect } from 'react';
import { 
  Wrench, Clock, CheckCircle, AlertCircle, TrendingUp, 
  Package, MapPin, Users 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalAssets: 0,
    borrowedAssets: 0,
    totalLocations: 0,
    pendingMaintenance: 0
  });

  useEffect(() => {
    fetch('http://localhost:4001/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  const StatCard = ({ icon: Icon, label, value, color, description }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{description}</span>
      </div>
      <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-500">{label}</div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-gray-500">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={Package} 
          label={t('dashboard.stats.total_assets')} 
          value={stats.totalAssets} 
          color="bg-blue-500" 
          description={t('dashboard.stats.inventory_desc')}
        />
        <StatCard 
          icon={TrendingUp} 
          label={t('dashboard.stats.borrowed')} 
          value={stats.borrowedAssets} 
          color="bg-purple-500" 
          description={t('dashboard.stats.in_use_desc')}
        />
        <StatCard 
          icon={MapPin} 
          label={t('dashboard.stats.locations')} 
          value={stats.totalLocations} 
          color="bg-green-500" 
          description={t('dashboard.stats.facilities_desc')}
        />
        <StatCard 
          icon={Wrench} 
          label={t('dashboard.stats.maintenance')} 
          value={stats.pendingMaintenance} 
          color="bg-orange-500" 
          description={t('dashboard.stats.service_desc')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            {t('dashboard.activity.title')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-4"></div>
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-800 underline decoraton-blue-200">{t('dashboard.activity.new_asset')}</div>
                <div className="text-[11px] text-gray-500">Dell Latitude 5420 was registered to IT Lab</div>
              </div>
              <div className="text-[10px] font-mono text-gray-400">2h ago</div>
            </div>
            <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition">
              <div className="w-2 h-2 rounded-full bg-purple-500 mr-4"></div>
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-800 underline decoraton-purple-200">{t('dashboard.activity.borrowed')}</div>
                <div className="text-[11px] text-gray-500">Event Tent checked out by Manager Anne</div>
              </div>
              <div className="text-[10px] font-mono text-gray-400">5h ago</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-orange-400" />
            {t('dashboard.warranty.title')}
          </h3>
          <div className="text-center py-10">
            <div className="inline-block p-4 bg-green-50 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-sm font-bold text-gray-900">{t('dashboard.warranty.normal')}</div>
            <div className="text-xs text-gray-500">{t('dashboard.warranty.no_expiring')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
