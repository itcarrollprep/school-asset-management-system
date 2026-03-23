import React, { useState, useEffect } from 'react';
import { 
  Plus, RotateCcw, Search, Trash2, User, Calendar, Shield, Monitor, 
  Microscope, Tent, Wrench as Tool, Circle, Layout as ChairIcon,
  Lock, Unlock, Edit2, MapPin
} from 'lucide-react';
import AssetModal from '../components/AssetModal';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

export default function AssetsPage({ renderStatus, initialViewAssetId }) {
  const { t } = useTranslation();
  const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
  const isViewer = currentUser?.role === 'viewer';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');

  const fetchItems = () => {
    setLoading(true);
    fetch(`http://${window.location.hostname}:4001/api/items`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);
  
  useEffect(() => {
    if (initialViewAssetId && items.length > 0) {
      const item = items.find(i => i.id.toString() === initialViewAssetId.toString());
      if (item) {
        setEditingItem(item);
        setIsModalOpen(true);
      }
    }
  }, [initialViewAssetId, items]);

  // Compute unique owners and locations for filters
  const uniqueOwners = [...new Set(items.map(item => item.owner).filter(Boolean))].sort();
  const uniqueLocations = [...new Set(items.map(item => item.location).filter(Boolean))].sort();

  // Compute Filtered Items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.asset_tag && item.asset_tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesOwner = ownerFilter === 'All' || item.owner === ownerFilter;
    const matchesLocation = locationFilter === 'All' || item.location === locationFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesOwner && matchesLocation;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  const handleSaveAsset = (assetData) => {
    const isEdit = !!assetData.id;
    const url = isEdit ? `http://${window.location.hostname}:4001/api/items/${assetData.id}` : `http://${window.location.hostname}:4001/api/items`;
    const method = isEdit ? 'PUT' : 'POST';

    const token = localStorage.getItem('auth_token');
    fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(assetData)
    })
    .then(res => {
      if (!res.ok) throw new Error(t('assets.alerts.action_failed'));
      return res.json();
    })
    .then(() => {
      Swal.fire({
        icon: 'success',
        title: t('assets.alerts.save_success'),
        showConfirmButton: false,
        timer: 1500
      });
      fetchItems();
    })
    .catch(err => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message
      });
    });
  };

  const toggleLock = (id, currentLock) => {
    const token = localStorage.getItem('auth_token');
    fetch(`http://${window.location.hostname}:4001/api/items/${id}/lock`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ is_locked: !currentLock })
    })
    .then(() => fetchItems())
    .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: t('assets.alerts.delete_confirm'),
      text: t('assets.alerts.delete_text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        fetch(`http://${window.location.hostname}:4001/api/items/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
          if (!res.ok) throw new Error(t('assets.alerts.delete_error'));
          Swal.fire(
            t('assets.alerts.delete_success'),
            '',
            'success'
          );
          fetchItems();
        })
        .catch(err => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.message
          });
        });
      }
    });
  };

  const translateStatus = (status) => {
    const map = {
      'Available': t('assets.status.available'),
      'Borrow': t('assets.status.borrow'),
      'maintenance': t('assets.status.maintenance'),
      'End of Life': t('assets.status.eol'),
      'Pending Disposal': t('assets.status.pending')
    };
    return map[status] || status;
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 text-gray-400 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder={t('assets.search_placeholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64 shadow-sm"
            />
          </div>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-blue-500 shadow-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Available">{t('assets.status.available')}</option>
            <option value="Borrow">{t('assets.status.borrow')}</option>
            <option value="maintenance">{t('assets.status.maintenance')}</option>
            <option value="End of Life">{t('assets.status.eol')}</option>
            <option value="Pending Disposal">{t('assets.status.pending')}</option>
          </select>

          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-blue-500 shadow-sm"
          >
            <option value="All">All Categories</option>
            <option value="Asset IT">Asset IT</option>
            <option value="Asset School">Asset School</option>
            <option value="Asset Garden">Asset Garden</option>
            <option value="Asset Event">Asset Event</option>
            <option value="Asset Office">Asset Office</option>
            <option value="Asset Principal and Director">Asset Principal and Director</option>
          </select>

          <select 
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-blue-500 shadow-sm"
          >
            <option value="All">All Owners</option>
            {uniqueOwners.map(owner => (
              <option key={owner} value={owner}>{owner}</option>
            ))}
          </select>

          <select 
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-blue-500 shadow-sm"
          >
            <option value="All">All Locations</option>
            {uniqueLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <button 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('All');
              setCategoryFilter('All');
              setOwnerFilter('All');
              setLocationFilter('All');
              fetchItems();
            }} 
            className="flex items-center px-4 py-2 border border-gray-200 rounded text-gray-700 hover:bg-gray-50 font-medium shadow-sm transition"
          >
            <RotateCcw className="w-4 h-4 mr-2 text-gray-500" />
            Reset
          </button>
        </div>

        {!isViewer && (
          <button 
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg transition transform hover:scale-105 active:scale-95 whitespace-nowrap uppercase tracking-wide"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('assets.add_button')}
          </button>
        )}
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xl">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-gray-50/80 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 w-10"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('assets.table.info')}</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">QR</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('assets.table.status')}</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('assets.table.category')}</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('assets.table.owner_loc')}</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('assets.table.location')}</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('assets.table.dates')}</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">{t('assets.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="8" className="text-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></td></tr>
            ) : filteredItems.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-20 text-gray-400 font-medium">No assets found matching your filters.</td></tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 group transition-colors">
                  <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-bold text-gray-900">{item.name}</div>
                      <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">ID: #{item.id}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div 
                      onClick={() => {
                        const baseUrl = localStorage.getItem('public_url') || window.location.origin;
                        const fullUrl = baseUrl + window.location.pathname + '?viewAsset=' + item.id;
                        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullUrl)}`;
                        Swal.fire({
                          title: item.name,
                          text: `ID: ${item.id} - ${item.asset_tag || ''}`,
                          imageUrl: qrUrl,
                          imageWidth: 300,
                          imageHeight: 300,
                          imageAlt: 'QR Code',
                          showConfirmButton: false,
                          showCloseButton: true
                        });
                      }}
                      className="bg-white p-1 border border-gray-100 rounded-lg shadow-sm w-10 h-10 flex items-center justify-center overflow-hidden hover:scale-150 transition-transform cursor-pointer origin-left"
                    >
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent((localStorage.getItem('public_url') || window.location.origin) + window.location.pathname + '?viewAsset=' + item.id)}`} 
                        alt="QR"
                        className="w-8 h-8"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4">{renderStatus(translateStatus(item.status))}</td>
                  <td className="px-4 py-4">
                    <div className="text-xs font-mono text-gray-600 mb-1">{item.asset_tag || `AST-${item.id.toString().padStart(4, '0')}`}</div>
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[10px] font-bold border border-blue-100 uppercase">{item.category}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center text-xs text-gray-700 font-medium mb-1"><User className="w-3 h-3 mr-1 text-gray-400" />{item.owner || 'No Owner'}</div>
                    <div className="text-[11px] text-gray-500 italic">{item.location}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center text-xs text-gray-700 font-medium">
                      <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                      {item.location || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center text-[11px] text-gray-600 mb-1"><Calendar className="w-3 h-3 mr-1 text-gray-400" />Start: {formatDate(item.start_date)}</div>
                    <div className={`flex items-center text-[11px] ${item.warranty_date && new Date(item.warranty_date) < new Date() ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                      <Shield className={`w-3 h-3 mr-1 ${item.warranty_date && new Date(item.warranty_date) < new Date() ? 'text-red-600' : 'text-blue-400'}`} />
                      Warranty: {formatDate(item.warranty_date)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {!isViewer && (
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => toggleLock(item.id, item.is_locked)}
                          className={`p-2 rounded-lg transition-colors border ${item.is_locked ? 'text-yellow-600 bg-yellow-50 border-yellow-100' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 border-transparent'}`}
                          title={item.is_locked ? 'Unlock Asset' : 'Lock Asset'}
                        >
                          {item.is_locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>

                        <button 
                          disabled={item.is_locked}
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }} 
                          className={`p-2 rounded-lg transition-colors border ${item.is_locked ? 'text-gray-300 cursor-not-allowed border-transparent' : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50 border-transparent hover:border-blue-100'}`}
                          title="Edit Asset"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button 
                          disabled={item.is_locked}
                          onClick={() => handleDelete(item.id)} 
                          className={`p-2 rounded-lg transition-colors border ${item.is_locked ? 'text-gray-300 cursor-not-allowed border-transparent' : 'text-red-400 hover:text-red-600 hover:bg-red-50 border-transparent hover:border-red-100'}`}
                          title="Delete Asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AssetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveAsset} 
        editingItem={editingItem}
      />
    </div>
  );
}
