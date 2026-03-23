import React, { useState, useEffect } from 'react';
import { MonitorSmartphone, Plus, RotateCcw, Pencil, Trash2, Calendar, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';

export default function SoftwarePage() {
  const [software, setSoftware] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = `http://${window.location.hostname}:4001`;
  const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
  const isViewer = currentUser?.role === 'viewer';

  const fetchSoftware = () => {
    setLoading(true);
    fetch(`${backendUrl}/api/software`)
      .then(res => res.json())
      .then(data => { setSoftware(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchSoftware(); }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
  };

  const isExpired = (dateStr) => dateStr && new Date(dateStr) < new Date();

  const getStatusBadge = (status, expiryDate) => {
    const expired = isExpired(expiryDate);
    const effectiveStatus = expired && status === 'Active' ? 'Expired' : status;
    const styles = {
      Active:     'bg-green-100 text-green-700 border-green-200',
      Expired:    'bg-red-100 text-red-700 border-red-200',
      Unassigned: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return (
      <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase ${styles[effectiveStatus] || styles.Unassigned}`}>
        {effectiveStatus}
      </span>
    );
  };

  const getLicenseBadge = (type) => {
    const styles = {
      'Perpetual':    'bg-blue-50 text-blue-700 border-blue-100',
      'Subscription': 'bg-purple-50 text-purple-700 border-purple-100',
      'Open Source':  'bg-emerald-50 text-emerald-700 border-emerald-100',
      'Trial':        'bg-yellow-50 text-yellow-700 border-yellow-100',
      'Other':        'bg-gray-50 text-gray-600 border-gray-100',
    };
    return (
      <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase ${styles[type] || styles.Other}`}>
        {type || 'Other'}
      </span>
    );
  };

  const softwareForm = (defaults = {}) => `
    <div style="text-align:left;font-family:sans-serif;padding:4px 8px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px">
        <div>
          <label style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:4px">Software Name *</label>
          <input id="sw-name" class="swal2-input" style="margin:0;width:100%" placeholder="e.g. Adobe Acrobat" value="${defaults.name || ''}">
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:4px">Version</label>
          <input id="sw-version" class="swal2-input" style="margin:0;width:100%" placeholder="e.g. 2024.1" value="${defaults.version || ''}">
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:4px">Vendor</label>
          <input id="sw-vendor" class="swal2-input" style="margin:0;width:100%" placeholder="e.g. Adobe Inc." value="${defaults.vendor || ''}">
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:4px">License Type</label>
          <select id="sw-license-type" class="swal2-select" style="margin:0;width:100%">
            ${['Perpetual','Subscription','Open Source','Trial','Other'].map(t => `<option value="${t}" ${defaults.license_type===t?'selected':''}>${t}</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:4px">Cost (฿)</label>
          <input id="sw-cost" type="number" class="swal2-input" style="margin:0;width:100%" placeholder="0.00" value="${defaults.cost || ''}">
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:4px">Billing Period</label>
          <select id="sw-billing" class="swal2-select" style="margin:0;width:100%">
            ${['Monthly','Yearly','One-time','Free'].map(b => `<option value="${b}" ${defaults.billing_period===b?'selected':''}>${b}</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:4px">Install Date</label>
          <input id="sw-install" type="date" class="swal2-input" style="margin:0;width:100%" value="${defaults.install_date ? defaults.install_date.split('T')[0] : ''}">
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:4px">Expiry Date</label>
          <input id="sw-expiry" type="date" class="swal2-input" style="margin:0;width:100%" value="${defaults.expiry_date ? defaults.expiry_date.split('T')[0] : ''}">
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:4px">Assigned To</label>
          <input id="sw-assigned" class="swal2-input" style="margin:0;width:100%" placeholder="Person or dept" value="${defaults.assigned_to || ''}">
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:4px">Location</label>
          <input id="sw-location" class="swal2-input" style="margin:0;width:100%" placeholder="e.g. IT Lab" value="${defaults.location || ''}">
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:4px">Status</label>
          <select id="sw-status" class="swal2-select" style="margin:0;width:100%">
            ${['Active','Expired','Unassigned'].map(s => `<option value="${s}" ${defaults.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:4px">License Key</label>
          <input id="sw-key" class="swal2-input" style="margin:0;width:100%" placeholder="XXXX-XXXX-XXXX" value="${defaults.license_key || ''}">
        </div>
      </div>
      <div>
        <label style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:4px">Notes</label>
        <textarea id="sw-notes" class="swal2-textarea" style="margin:0;width:100%;height:70px" placeholder="Additional notes...">${defaults.notes || ''}</textarea>
      </div>
    </div>
  `;

  const getFormValues = () => ({
    name: document.getElementById('sw-name').value,
    version: document.getElementById('sw-version').value,
    vendor: document.getElementById('sw-vendor').value,
    license_type: document.getElementById('sw-license-type').value,
    cost: document.getElementById('sw-cost').value,
    billing_period: document.getElementById('sw-billing').value,
    install_date: document.getElementById('sw-install').value,
    expiry_date: document.getElementById('sw-expiry').value,
    assigned_to: document.getElementById('sw-assigned').value,
    location: document.getElementById('sw-location').value,
    status: document.getElementById('sw-status').value,
    license_key: document.getElementById('sw-key').value,
    notes: document.getElementById('sw-notes').value,
  });

  const handleAdd = () => {
    Swal.fire({
      title: 'Add Software',
      html: softwareForm(),
      width: 700,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Add Software',
      confirmButtonColor: '#6d28d9',
      preConfirm: () => {
        const vals = getFormValues();
        if (!vals.name) { Swal.showValidationMessage('Software name is required'); }
        return vals;
      }
    }).then(result => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        fetch(`${backendUrl}/api/software`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(result.value)
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          Swal.fire({ icon: 'success', title: 'Added!', timer: 1500, showConfirmButton: false });
          fetchSoftware();
        })
        .catch(err => Swal.fire('Error', err.message, 'error'));
      }
    });
  };

  const handleEdit = (sw) => {
    Swal.fire({
      title: 'Edit Software',
      html: softwareForm(sw),
      width: 700,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      confirmButtonColor: '#6d28d9',
      preConfirm: () => {
        const vals = getFormValues();
        if (!vals.name) { Swal.showValidationMessage('Software name is required'); }
        return vals;
      }
    }).then(result => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        fetch(`${backendUrl}/api/software/${sw.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(result.value)
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          Swal.fire({ icon: 'success', title: 'Updated!', timer: 1500, showConfirmButton: false });
          fetchSoftware();
        })
        .catch(err => Swal.fire('Error', err.message, 'error'));
      }
    });
  };

  const handleDelete = (sw) => {
    Swal.fire({
      title: 'Delete Software?',
      html: `Remove <strong>${sw.name}</strong> from the registry?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete'
    }).then(result => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        fetch(`${backendUrl}/api/software/${sw.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
          fetchSoftware();
        })
        .catch(err => Swal.fire('Error', err.message, 'error'));
      }
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Software Licenses</h1>
          <p className="text-gray-500 italic">Manage software licenses, subscriptions and installations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={fetchSoftware} className="p-2 border border-gray-200 rounded hover:bg-gray-50 transition shadow-sm">
            <RotateCcw className="w-5 h-5 text-gray-400" />
          </button>
          {!isViewer && (
            <button
              onClick={handleAdd}
              className="flex items-center px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg transition transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Software
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Software</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">License</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Cost</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Assigned To</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Expiry</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="7" className="text-center py-20 text-gray-400 italic">Loading software registry...</td></tr>
            ) : software.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-20 text-gray-400 italic">No software records found.</td></tr>
            ) : (
              software.map(sw => (
                <tr key={sw.id} className="hover:bg-gray-50 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-50 rounded-xl mr-3">
                        <MonitorSmartphone className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{sw.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono uppercase">{sw.vendor || '—'} {sw.version ? `v${sw.version}` : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getLicenseBadge(sw.license_type)}</td>
                  <td className="px-6 py-4">
                    {sw.cost > 0 ? (
                      <div className="flex items-center text-xs font-bold text-gray-700">
                        <DollarSign className="w-3 h-3 mr-1 text-gray-400" />
                        ฿{Number(sw.cost).toLocaleString()}
                        <span className="ml-1 text-gray-400 font-normal">/ {sw.billing_period}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Free</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-gray-700">{sw.assigned_to || '—'}</div>
                    {sw.location && <div className="text-[10px] text-gray-400 italic">{sw.location}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center text-xs font-medium ${isExpired(sw.expiry_date) ? 'text-red-600' : 'text-gray-600'}`}>
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(sw.expiry_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(sw.status, sw.expiry_date)}</td>
                  <td className="px-6 py-4 text-right">
                    {!isViewer && (
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(sw)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-100"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sw)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Delete"
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
    </div>
  );
}
