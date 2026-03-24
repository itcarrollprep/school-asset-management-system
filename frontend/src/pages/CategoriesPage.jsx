import React, { useState, useEffect } from 'react';
import { Tag, Plus, RotateCcw, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

export default function CategoriesPage() {
  const { t } = useTranslation();
  const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
  const isViewer = currentUser?.role === 'viewer';
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = `http://${window.location.hostname}:4001`;

  const fetchCategories = () => {
    setLoading(true);
    fetch(`${backendUrl}/api/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    Swal.fire({
      title: 'Add New Category',
      html: `
        <input id="swal-cat-name" class="swal2-input font-sans text-sm" placeholder="Category Name (e.g. Lab Equipment)">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Create',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const name = document.getElementById('swal-cat-name').value;
        if (!name) {
          Swal.showValidationMessage('Category name is required');
        }
        return { name };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        
        fetch(`${backendUrl}/api/categories`, {
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
          Swal.fire({ icon: 'success', title: 'Success', text: 'Category added successfully', timer: 1500, showConfirmButton: false });
          fetchCategories();
        })
        .catch(err => Swal.fire('Error', err.message, 'error'));
      }
    });
  };

  const handleEditCategory = (cat) => {
    Swal.fire({
      title: 'Edit Category',
      html: `
        <input id="swal-edit-cat-name" class="swal2-input font-sans text-sm" placeholder="Category Name" value="${cat.name || ''}">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const name = document.getElementById('swal-edit-cat-name').value;
        if (!name) {
          Swal.showValidationMessage('Category name is required');
        }
        return { name };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        fetch(`${backendUrl}/api/categories/${cat.id}`, {
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
          Swal.fire({ icon: 'success', title: 'Updated!', text: 'Category updated successfully.', timer: 1500, showConfirmButton: false });
          fetchCategories();
        })
        .catch(err => Swal.fire('Error', err.message, 'error'));
      }
    });
  };

  const handleDeleteCategory = (cat) => {
    Swal.fire({
      title: 'Delete Category?',
      html: `Are you sure you want to delete <strong>${cat.name}</strong>?<br/><span style="font-size:12px;color:#888">You cannot delete categories that are currently assigned to assets.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        fetch(`${backendUrl}/api/categories/${cat.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Category removed successfully.', timer: 1500, showConfirmButton: false });
          fetchCategories();
        })
        .catch(err => Swal.fire('Error', err.message, 'error'));
      }
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{t('categories.title')}</h1>
          <p className="text-gray-500 italic">{t('categories.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={fetchCategories} className="p-2 border border-gray-200 rounded hover:bg-gray-50 transition shadow-sm">
            <RotateCcw className="w-5 h-5 text-gray-400" />
          </button>
          {!isViewer && (
            <button 
              onClick={handleAddCategory}
              className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('categories.add_button')}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{t('categories.table.name')}</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">{t('categories.table.assets')}</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">{t('categories.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="3" className="text-center py-20 text-gray-400 font-medium italic">Loading categories...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="3" className="text-center py-20 text-gray-400 font-medium italic">No categories found.</td></tr>
            ) : (
              categories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-50 rounded-xl mr-3">
                            <Tag className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-bold text-gray-900 uppercase">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-bold text-gray-900 font-mono bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 italic">
                      {cat.asset_count || 0} Units
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!isViewer && (
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditCategory(cat)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
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
