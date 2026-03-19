import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Tag, Calendar, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AssetModal({ isOpen, onClose, onSave, editingItem }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Asset IT');
  const [status, setStatus] = useState('Available');
  const [location, setLocation] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [owner, setOwner] = useState('');
  const [startDate, setStartDate] = useState('');
  const [warrantyDate, setWarrantyDate] = useState('');
  
  const [ownersList, setOwnersList] = useState([]);
  const [locationsList, setLocationsList] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const backendUrl = `http://${window.location.hostname}:4001`;

    // Fetch owners
    fetch(`${backendUrl}/api/owners`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOwnersList(data))
      .catch(err => console.error('Fetch owners error:', err));
      
    // Fetch locations
    fetch(`${backendUrl}/api/locations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setLocationsList(data))
      .catch(err => console.error('Fetch locations error:', err));
  }, []);

  useEffect(() => {
    if (editingItem && isOpen) {
      setName(editingItem.name || '');
      setCategory(editingItem.category || 'Asset IT');
      setStatus(editingItem.status || 'Available');
      setLocation(editingItem.location || '');
      setAssetTag(editingItem.asset_tag || '');
      setOwner(editingItem.owner || '');
      setStartDate(editingItem.start_date ? new Date(editingItem.start_date).toISOString().split('T')[0] : '');
      setWarrantyDate(editingItem.warranty_date ? new Date(editingItem.warranty_date).toISOString().split('T')[0] : '');
    } else if (!editingItem) {
      setName('');
      setCategory('Asset IT');
      setStatus('Available');
      setLocation('');
      setAssetTag('');
      setOwner('');
      setStartDate('');
      setWarrantyDate('');
    }
  }, [editingItem, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: editingItem?.id,
      name,
      category,
      status,
      location,
      asset_tag: assetTag,
      owner,
      start_date: startDate || null,
      warranty_date: warrantyDate || null
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">
            {editingItem ? t('modal.edit_title') : t('modal.add_title')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm focus:outline-none">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Asset Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center">
                <Info className="w-4 h-4 mr-2 text-blue-500" /> {t('modal.name')}
              </label>
              <input 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50/30 font-medium"
                placeholder="e.g. MacBook Pro M2"
              />
            </div>

            {/* Asset Tag */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-blue-500" /> {t('modal.tag')}
              </label>
              <input 
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50/30 font-medium"
                placeholder="e.g. AST-001"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">{t('modal.category')}</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/30 font-medium cursor-pointer"
              >
                <option>Asset IT</option>
                <option>Asset School</option>
                <option>Asset Garden</option>
                <option>Asset Event</option>
                <option>Asset Office</option>
                <option>Asset Principal and Director</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">{t('modal.status')}</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/30 font-medium cursor-pointer"
              >
                <option value="Available">{t('assets.status.available')}</option>
                <option value="Borrow">{t('assets.status.borrow')}</option>
                <option value="maintenance">{t('assets.status.maintenance')}</option>
                <option value="End of Life">{t('assets.status.eol')}</option>
                <option value="Pending Disposal">{t('assets.status.pending')}</option>
              </select>
            </div>

            {/* Owner Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center">
                <User className="w-4 h-4 mr-2 text-blue-500" /> {t('modal.owner')}
              </label>
              <select 
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/30 font-medium cursor-pointer"
              >
                <option value="">{t('modal.select_owner')}</option>
                {ownersList.map(o => (
                  <option key={o.id} value={o.name}>{o.name}</option>
                ))}
              </select>
            </div>

            {/* Location Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-blue-500" /> {t('modal.location')}
              </label>
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/30 font-medium cursor-pointer"
              >
                <option value="">{t('modal.select_location')}</option>
                {locationsList.map(l => (
                  <option key={l.id} value={l.name}>{l.name}</option>
                ))}
              </select>
            </div>

            {/* Procurement Date */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" /> {t('modal.start_date')}
              </label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/30 font-medium cursor-pointer"
              />
            </div>

            {/* Warranty Date */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" /> {t('modal.warranty_date')}
              </label>
              <input 
                type="date"
                value={warrantyDate}
                onChange={(e) => setWarrantyDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/30 font-medium cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-colors"
            >
              {t('modal.cancel')}
            </button>
            <button 
              type="submit"
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              {editingItem ? t('modal.save') : t('modal.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
