import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle, Clock, AlertCircle, Plus, RotateCcw, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

export default function MaintenancePage() {
  const { t } = useTranslation();
  const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
  const isViewer = currentUser?.role === 'viewer';
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

  const [assets, setAssets] = useState([]);

  const fetchMaintenance = () => {
    const token = localStorage.getItem('auth_token');
    const backendUrl = `http://${window.location.hostname}:4001`;
    setLoading(true);
    fetch(`${backendUrl}/api/maintenance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setRecords(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchAssets = () => {
    const backendUrl = `http://${window.location.hostname}:4001`;
    fetch(`${backendUrl}/api/items`)
      .then(res => res.json())
      .then(data => setAssets(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchMaintenance();
    fetchAssets();
  }, []);

  const handleScheduleService = () => {
    if (assets.length === 0) {
      Swal.fire('Error', 'No assets available to schedule service for.', 'error');
      return;
    }

    Swal.fire({
      title: t('maintenance.schedule_button'),
      html: `
        <div class="text-left space-y-4 font-sans p-2">
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Select Asset</label>
            <select id="swal-m-asset" class="swal2-select w-full m-0 text-sm">
              <option value="">-- Choose Asset --</option>
              ${assets.map(a => `<option value="${a.id}">${a.name} (#${a.id})</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Service Type</label>
            <select id="swal-m-type" class="swal2-select w-full m-0 text-sm">
              <option value="Repair">Repair</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Upgrade">Upgrade</option>
              <option value="Inspection">Inspection</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Date</label>
              <input id="swal-m-date" type="date" class="swal2-input w-full m-0 text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Cost (฿)</label>
              <input id="swal-m-cost" type="number" class="swal2-input w-full m-0 text-sm" placeholder="0.00">
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Provider</label>
            <input id="swal-m-provider" class="swal2-input w-full m-0 text-sm" placeholder="Service Company Name">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Description</label>
            <textarea id="swal-m-desc" class="swal2-textarea w-full m-0 text-sm h-24" placeholder="Service details..."></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Schedule',
      confirmButtonColor: '#ea580c',
      preConfirm: () => {
        const item_id = document.getElementById('swal-m-asset').value;
        const maintenance_type = document.getElementById('swal-m-type').value;
        const maintenance_date = document.getElementById('swal-m-date').value;
        const description = document.getElementById('swal-m-desc').value;
        const cost = document.getElementById('swal-m-cost').value;
        const provider = document.getElementById('swal-m-provider').value;

        if (!item_id || !maintenance_date) {
          Swal.showValidationMessage('Asset and Date are required');
        }
        return { item_id, maintenance_type, maintenance_date, description, cost, provider, status: 'Pending' };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        const backendUrl = `http://${window.location.hostname}:4001`;

        fetch(`${backendUrl}/api/maintenance`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(result.value)
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          Swal.fire('Success', 'Maintenance scheduled successfully. Asset status updated to "maintenance".', 'success');
          fetchMaintenance();
          fetchAssets();
        })
        .catch(err => Swal.fire('Error', err.message, 'error'));
      }
    });
  };

  const handleEditMaintenance = (record) => {
    Swal.fire({
      title: 'Edit Maintenance',
      html: `
        <div class="text-left space-y-4 font-sans p-2">
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Service Type</label>
            <select id="swal-e-type" class="swal2-select w-full m-0 text-sm">
              <option value="Repair" ${record.maintenance_type === 'Repair' ? 'selected' : ''}>Repair</option>
              <option value="Cleaning" ${record.maintenance_type === 'Cleaning' ? 'selected' : ''}>Cleaning</option>
              <option value="Upgrade" ${record.maintenance_type === 'Upgrade' ? 'selected' : ''}>Upgrade</option>
              <option value="Inspection" ${record.maintenance_type === 'Inspection' ? 'selected' : ''}>Inspection</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Date</label>
              <input id="swal-e-date" type="date" class="swal2-input w-full m-0 text-sm" value="${record.maintenance_date ? record.maintenance_date.split('T')[0] : ''}">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Cost (฿)</label>
              <input id="swal-e-cost" type="number" class="swal2-input w-full m-0 text-sm" value="${record.cost || 0}">
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Provider</label>
            <input id="swal-e-provider" class="swal2-input w-full m-0 text-sm" value="${record.provider || ''}">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Status</label>
            <select id="swal-e-status" class="swal2-select w-full m-0 text-sm">
              <option value="Pending" ${record.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="In Progress" ${record.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Completed" ${record.status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Description</label>
            <textarea id="swal-e-desc" class="swal2-textarea w-full m-0 text-sm h-24">${record.description || ''}</textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      confirmButtonColor: '#ea580c',
      preConfirm: () => {
        const maintenance_date = document.getElementById('swal-e-date').value;
        if (!maintenance_date) { Swal.showValidationMessage('Date is required'); return false; }
        return {
          maintenance_type: document.getElementById('swal-e-type').value,
          maintenance_date,
          cost: document.getElementById('swal-e-cost').value,
          provider: document.getElementById('swal-e-provider').value,
          status: document.getElementById('swal-e-status').value,
          description: document.getElementById('swal-e-desc').value,
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        const backendUrl = `http://${window.location.hostname}:4001`;
        fetch(`${backendUrl}/api/maintenance/${record.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(result.value)
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          Swal.fire('Updated', 'Maintenance record updated successfully.', 'success');
          fetchMaintenance();
          fetchAssets();
        })
        .catch(err => Swal.fire('Error', err.message, 'error'));
      }
    });
  };

  const handleUpdateStatus = (id, currentStatus) => {
    Swal.fire({
      title: 'Update Status',
      input: 'select',
      inputOptions: {
        'Pending': t('maintenance.status.pending'),
        'In Progress': t('maintenance.status.in_progress'),
        'Completed': t('maintenance.status.completed')
      },
      inputValue: currentStatus,
      showCancelButton: true,
      confirmButtonText: 'Update',
      confirmButtonColor: '#ea580c',
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        const backendUrl = `http://${window.location.hostname}:4001`;

        fetch(`${backendUrl}/api/maintenance/${id}/status`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: result.value })
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          Swal.fire('Updated', `Status changed to ${result.value}`, 'success');
          fetchMaintenance();
          fetchAssets();
        })
        .catch(err => Swal.fire('Error', err.message, 'error'));
      }
    });
  };

  const getStatusBadge = (record) => {
    const status = record.status;
    const badgeClass = "px-2 py-1 rounded text-[10px] font-bold border uppercase cursor-pointer hover:scale-105 transition-transform active:scale-95";
    
    let content;
    switch(status) {
      case 'Completed': 
        content = <span className={`${badgeClass} bg-green-100 text-green-700 border-green-200`}>{t('maintenance.status.completed')}</span>;
        break;
      case 'In Progress': 
        content = <span className={`${badgeClass} bg-blue-100 text-blue-700 border-blue-200`}>{t('maintenance.status.in_progress')}</span>;
        break;
      default: 
        content = <span className={`${badgeClass} bg-orange-100 text-orange-700 border-orange-200`}>{t('maintenance.status.pending')}</span>;
    }

    return (
      <div
        onClick={!isViewer ? () => handleUpdateStatus(record.id, status) : undefined}
        title={isViewer ? '' : 'Click to change status'}
        className={isViewer ? '' : 'cursor-pointer'}
      >
        {content}
      </div>
    );
  };

  const filteredRecords = records.filter(r => {
    if (activeTab === 'active') return r.status !== 'Completed';
    return r.status === 'Completed';
  });

  const activeCount = records.filter(r => r.status !== 'Completed').length;
  const historyCount = records.filter(r => r.status === 'Completed').length;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{t('maintenance.title')}</h1>
          <p className="text-gray-500 italic">{t('maintenance.subtitle')}</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={fetchMaintenance} className="p-2 border border-gray-200 rounded hover:bg-gray-50 transition shadow-sm"><RotateCcw className="w-5 h-5 text-gray-400" /></button>
          {!isViewer && (
            <button 
              onClick={handleScheduleService}
              className="flex items-center px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg transition transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('maintenance.schedule_button')}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1.5 rounded-2xl w-fit border border-gray-200 shadow-inner">
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'active' ? 'bg-white text-orange-600 shadow-md ring-1 ring-orange-100' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Clock className="w-4 h-4" />
          <span>{t('maintenance.tabs.active') || 'ACTIVE TASKS'}</span>
          <span className={`ml-1.5 px-2 py-0.5 rounded-lg text-[10px] ${activeTab === 'active' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'}`}>{activeCount}</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'history' ? 'bg-white text-green-600 shadow-md ring-1 ring-green-100' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{t('maintenance.tabs.history') || 'SERVICE LOGS'}</span>
          <span className={`ml-1.5 px-2 py-0.5 rounded-lg text-[10px] ${activeTab === 'history' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>{historyCount}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center animate-pulse">
            <Wrench className="w-12 h-12 text-gray-200 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400 font-bold uppercase tracking-widest">{t('maintenance.loading')}</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest">{activeTab === 'active' ? t('maintenance.no_active') || 'No active maintenance tasks' : t('maintenance.no_history') || 'No service history available'}</p>
          </div>
        ) : (
          filteredRecords.map(record => (
            <div key={record.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-orange-200 transition group relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition"></div>
               <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <Wrench className="w-5 h-5 text-orange-500" />
                        <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">{record.item_name}</h3>
                        {getStatusBadge(record)}
                    </div>
                    <div className="text-sm font-bold text-gray-500 mb-2">{record.maintenance_type} - <span className="text-gray-400 font-medium italic">Provider: {record.provider}</span></div>
                    <p className="text-gray-600 mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100 italic">"{record.description}"</p>
                    
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-xs font-bold text-gray-500">{new Date(record.maintenance_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-xs font-bold text-orange-600">{t('maintenance.cost')}: ฿{record.cost}</span>
                        </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                     {!isViewer && (
                       <button
                         onClick={() => handleEditMaintenance(record)}
                         className="p-2 text-xs font-bold border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition"
                         title="Edit"
                       >
                         <Pencil className="w-4 h-4" />
                       </button>
                     )}
                     <button className="px-4 py-2 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50 transition uppercase">{t('maintenance.view_log')}</button>
                   </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

