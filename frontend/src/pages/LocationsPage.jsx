import React, { useState, useEffect } from 'react';
import { MapPin, Plus, RotateCcw, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

export default function LocationsPage() {
  const { t } = useTranslation();
  const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
  const isViewer = currentUser?.role === 'viewer';
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = `http://${window.location.hostname}:4001`;

  const fetchLocations = () => {
    setLoading(true);
    fetch(`${backendUrl}/api/locations`)
      .then(res => res.json())
      .then(data => {
        setLocations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAddLocation = () => {
    Swal.fire({
      title: t('locations.add_button'),
      html: `
        <input id="swal-loc-name" class="swal2-input font-sans text-sm" placeholder="Location Name (e.g. Science Lab)">
        <select id="swal-loc-type" class="swal2-select font-sans text-sm w-[76%] mx-auto block mt-4">
          <option value="Room">Room</option>
          <option value="Building">Building</option>
          <option value="Floor">Floor</option>
          <option value="Other">Other</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Create',
      confirmButtonColor: '#16a34a',
      preConfirm: () => {
        const name = document.getElementById('swal-loc-name').value;
        const type = document.getElementById('swal-loc-type').value;
        if (!name) {
          Swal.showValidationMessage('Location name is required');
        }
        return { name, type };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        
        fetch(`${backendUrl}/api/locations`, {
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
          Swal.fire('Success', 'Location added successfully', 'success');
          fetchLocations();
        })
        .catch(err => Swal.fire('Error', err.message, 'error'));
      }
    });
  };

  const handleEditLocation = (loc) => {
    Swal.fire({
      title: 'Edit Location',
      html: `
        <input id="swal-edit-loc-name" class="swal2-input font-sans text-sm" placeholder="Location Name" value="${loc.name || ''}">
        <select id="swal-edit-loc-type" class="swal2-select font-sans text-sm w-[76%] mx-auto block mt-4">
          <option value="Room" ${loc.type === 'Room' ? 'selected' : ''}>Room</option>
          <option value="Building" ${loc.type === 'Building' ? 'selected' : ''}>Building</option>
          <option value="Floor" ${loc.type === 'Floor' ? 'selected' : ''}>Floor</option>
          <option value="Other" ${loc.type === 'Other' ? 'selected' : ''}>Other</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      confirmButtonColor: '#16a34a',
      preConfirm: () => {
        const name = document.getElementById('swal-edit-loc-name').value;
        const type = document.getElementById('swal-edit-loc-type').value;
        if (!name) {
          Swal.showValidationMessage('Location name is required');
        }
        return { name, type };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        fetch(`${backendUrl}/api/locations/${loc.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(result.value)
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          Swal.fire({ icon: 'success', title: 'Updated!', text: 'Location updated successfully.', timer: 1500, showConfirmButton: false });
          fetchLocations();
        })
        .catch(err => Swal.fire('Error', err.message, 'error'));
      }
    });
  };

  const handleDeleteLocation = (loc) => {
    Swal.fire({
      title: 'Delete Location?',
      html: `Are you sure you want to delete <strong>${loc.name}</strong>?<br/><span style="font-size:12px;color:#888">Assets in this location will retain the location name but the record will be removed.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        fetch(`${backendUrl}/api/locations/${loc.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Location removed successfully.', timer: 1500, showConfirmButton: false });
          fetchLocations();
        })
        .catch(err => Swal.fire('Error', err.message, 'error'));
      }
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{t('locations.title')}</h1>
          <p className="text-gray-500 italic">{t('locations.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={fetchLocations} className="p-2 border border-gray-200 rounded hover:bg-gray-50 transition shadow-sm">
            <RotateCcw className="w-5 h-5 text-gray-400" />
          </button>
          {!isViewer && (
            <button 
              onClick={handleAddLocation}
              className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg transition transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('locations.add_button')}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{t('locations.table.name')}</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{t('locations.table.type')}</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">{t('locations.table.assets')}</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-20 text-gray-400 font-medium italic">Scanning facilities...</td></tr>
            ) : locations.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-20 text-gray-400 font-medium italic">No locations found.</td></tr>
            ) : (
              locations.map(loc => (
                <tr key={loc.id} className="hover:bg-gray-50 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-50 rounded-xl mr-3">
                            <MapPin className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="font-bold text-gray-900 uppercase">{loc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider">{loc.type || 'Room'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-bold text-gray-900 font-mono bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 italic">
                      {loc.asset_count || 0} {t('assets.unit', { defaultValue: 'Units' })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!isViewer && (
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditLocation(loc)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(loc)}
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
