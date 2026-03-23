import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import MobileShell from './components/MobileShell';
import DashboardPage from './pages/DashboardPage';
import AssetsPage from './pages/AssetsPage';
import MaintenancePage from './pages/MaintenancePage';
import LocationsPage from './pages/LocationsPage';
import UsersPage from './pages/UsersPage';
import SoftwarePage from './pages/SoftwarePage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import AssetDetailView from './components/AssetDetailView';
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [initialAssetId, setInitialAssetId] = useState(null);
  const [scanModeId, setScanModeId] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user_info')) || null);
  const [stats, setStats] = useState({ total_items: 0, in_maintenance: 0 });

  const fetchStats = () => {
    const backendUrl = `http://${window.location.hostname}:4001`;
    fetch(`${backendUrl}/api/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Error fetching stats:', err));
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);

    const params = new URLSearchParams(window.location.search);
    const viewAssetId = params.get('viewAsset');
    if (viewAssetId) {
      setScanModeId(viewAssetId);
    }

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    setUser(null);
  };

  const renderStatus = (statusValue) => {
    // Note: statusValue here might already be translated from AssetsPage, 
    // but we can make it robust by checking both translated and raw values.
    
    const isAvailable = statusValue === 'Available' || statusValue === t('assets.status.available');
    const isBorrow = statusValue === 'Borrow' || statusValue === t('assets.status.borrow');
    const isMaintenance = statusValue === 'maintenance' || statusValue === t('assets.status.maintenance');
    const isEOL = statusValue === 'End of Life' || statusValue === t('assets.status.eol');
    const isPending = statusValue === 'Pending Disposal' || statusValue === t('assets.status.pending');

    if (isAvailable) return (
      <div className="flex items-center text-xs font-medium text-gray-700">
        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
        {t('assets.status.available')}
      </div>
    );
    if (isBorrow) return (
      <div className="flex items-center text-xs font-medium text-gray-700">
        <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>
        {t('assets.status.borrow')}
      </div>
    );
    if (isMaintenance) return (
      <div className="flex items-center text-xs font-medium text-gray-700">
        <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
        {t('assets.status.maintenance')}
      </div>
    );
    if (isEOL) return (
      <div className="flex items-center text-xs font-medium text-gray-700">
        <span className="w-2 h-2 rounded-full bg-red-600 mr-2"></span>
        {t('assets.status.eol')}
      </div>
    );
    if (isPending) return (
      <div className="flex items-center text-xs font-medium text-gray-700">
        <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
        {t('assets.status.pending')}
      </div>
    );

    return (
      <div className="flex items-center text-xs font-medium text-gray-700">
        <span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>
        {statusValue}
      </div>
    );
  };

  const renderPage = () => {
    switch(activePage) {
      case 'dashboard': return <DashboardPage />;
      case 'assets': return <AssetsPage renderStatus={renderStatus} initialViewAssetId={initialAssetId} />;
      case 'maintenance': return <MaintenancePage />;
      case 'locations': return <LocationsPage />;
      case 'people': return <UsersPage />;
      case 'software': return <SoftwarePage />;
      case 'reports': return <div className="p-8"><h1 className="text-2xl font-bold">Reports Page coming soon...</h1></div>;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  const getPageTitle = () => {
    switch(activePage) {
      case 'dashboard': return t('nav.dashboard');
      case 'assets': return t('nav.assets');
      case 'maintenance': return t('nav.maintenance');
      case 'locations': return t('nav.locations');
      case 'people': return t('nav.people');
      default: return activePage.toUpperCase();
    }
  };

  if (scanModeId) {
    return <AssetDetailView assetId={scanModeId} />;
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  if (isMobile) {
    return (
      <MobileShell 
        activePage={activePage} 
        onNavigate={setActivePage} 
        title={getPageTitle()}
        user={user}
        onLogout={handleLogout}
      >
        {renderPage()}
      </MobileShell>
    );
  }

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden text-sm">
      <Sidebar 
        activePage={activePage} 
        onNavigate={setActivePage} 
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
        <TopNav 
          title={`Carrollprep - ${getPageTitle()}`} 
          user={user} 
          stats={stats}
          onNavigate={setActivePage}
        />
        
        <main className="flex-1 overflow-x-auto overflow-y-auto w-full">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
