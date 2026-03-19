import React, { useState, useEffect } from 'react';
import { Users, Plus, UserCircle, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

export default function UsersPage() {
  const { t } = useTranslation();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOwners = () => {
    setLoading(true);
    fetch('http://localhost:4001/api/owners')
      .then(res => res.json())
      .then(data => {
        setOwners(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleAddOwner = () => {
    Swal.fire({
      title: t('people.add_button'),
      html: `
        <input id="swal-owner-name" class="swal2-input font-sans text-sm" placeholder="Full Name">
        <input id="swal-owner-dept" class="swal2-input font-sans text-sm" placeholder="Department (e.g. IT, Science)">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Create',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const name = document.getElementById('swal-owner-name').value;
        const department = document.getElementById('swal-owner-dept').value;
        if (!name) {
          Swal.showValidationMessage('Name is required');
        }
        return { name, department };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        const backendUrl = `http://${window.location.hostname}:4001`;

        fetch(`${backendUrl}/api/owners`, {
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
          Swal.fire('Success', 'Person added successfully', 'success');
          fetchOwners();
        })
        .catch(err => Swal.fire('Error', err.message, 'error'));
      }
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{t('people.title')}</h1>
          <p className="text-gray-500 italic">{t('people.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={fetchOwners} className="p-2 border border-gray-200 rounded hover:bg-gray-50 transition shadow-sm">
            <RotateCcw className="w-5 h-5 text-gray-400" />
          </button>
          <button 
            onClick={handleAddOwner}
            className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('people.add_button')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{t('people.table.name')}</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{t('people.table.dept')}</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">{t('people.table.assets')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="3" className="text-center py-20 text-gray-400 font-medium italic">Fetching user directory...</td></tr>
            ) : owners.length === 0 ? (
              <tr><td colSpan="3" className="text-center py-20 text-gray-400 font-medium italic">No users found.</td></tr>
            ) : (
              owners.map(owner => (
                <tr key={owner.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-50 rounded-lg mr-3">
                            <UserCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900">{owner.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">ID: #{owner.id}</div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider">{owner.department}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-bold text-gray-900 font-mono bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 italic">
                      {owner.asset_count || 0} {t('assets.unit', { defaultValue: 'Units' })}
                    </span>
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
