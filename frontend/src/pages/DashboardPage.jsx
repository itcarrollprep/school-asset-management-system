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
  const [activity, setActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const backendUrl = `http://${window.location.hostname}:4001`;
    fetch(`${backendUrl}/api/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
      
    fetch(`${backendUrl}/api/dashboard-activity`)
      .then(res => res.json())
      .then(data => setActivity(data))
      .catch(err => console.error(err));
      
    fetch(`${backendUrl}/api/dashboard-alerts`)
      .then(res => res.json())
      .then(data => setAlerts(data))
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
            {activity.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">No recent activity</div>
            ) : (
              activity.map((act, i) => (
                <div key={i} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition">
                  {/* Tailwind dynamic class workaround by using style for color block, or specific color matching */}
                  <div className={`w-2 h-2 rounded-full mr-4 ${act.color === 'blue' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                  <div className="flex-1">
                    <div className={`text-sm font-bold text-gray-800 underline decoration-${act.color === 'blue' ? 'blue' : 'orange'}-200`}>
                      {act.type}: {act.title}
                    </div>
                    <div className="text-[11px] text-gray-500">{act.description}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-orange-400" />
            {t('dashboard.warranty.title')}
          </h3>
          <div className="text-center py-2">
            {alerts.length === 0 ? (
              <div className="py-8">
                <div className="inline-block p-4 bg-green-50 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-sm font-bold text-gray-900">{t('dashboard.warranty.normal') || 'All Good!'}</div>
                <div className="text-xs text-gray-500">{t('dashboard.warranty.no_expiring') || 'No warranties expiring soon'}</div>
              </div>
            ) : (
              <div className="space-y-3 text-left">
                {alerts.map((alert, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div>
                      <div className="text-sm font-bold text-red-900">{alert.name}</div>
                      <div className="text-xs text-red-700 font-mono">{alert.asset_tag || `#${alert.id}`}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-red-800">
                        {alert.days_left < 0 ? 'Expired' : `Expiring in ${alert.days_left} days`}
                      </div>
                      <div className="text-[10px] text-red-600">
                        {new Date(alert.warranty_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
