import React, { useState, useEffect } from 'react';
import { Save, User, Shield, Globe, Lock, Bell, Trash2, Key, UserCircle, Calendar, ShieldCheck, RefreshCw, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

export default function SettingsPage() {
  const { t } = useTranslation();
  const [publicUrl, setPublicUrl] = useState(localStorage.getItem('public_url') || window.location.origin);
  const [detectedIp, setDetectedIp] = useState('');
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'staff' });
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Determine backend URL from current window location
  const backendUrl = `http://${window.location.hostname}:4001`;

  const handleResetPassword = (id, username) => {
    Swal.fire({
      title: `Reset Password for ${username}`,
      input: 'password',
      inputLabel: 'New Password',
      inputPlaceholder: 'Enter new password',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Reset',
      confirmButtonColor: '#2563eb',
      preConfirm: (newPassword) => {
        if (!newPassword) {
          Swal.showValidationMessage('Password cannot be empty');
        }
        return newPassword;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        fetch(`${backendUrl}/api/users/${id}/password`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ password: result.value })
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          Swal.fire('Success', 'Password has been reset successfully', 'success');
        })
        .catch(err => Swal.fire('Error', err.message, 'error'));
      }
    });
  };

  const fetchUsers = () => {
    setLoadingUsers(true);
    const token = localStorage.getItem('auth_token');
    fetch(`${backendUrl}/api/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
        setLoadingUsers(false);
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
        setLoadingUsers(false);
      });
  };

  useEffect(() => {
    fetch(`${backendUrl}/api/server-info`)
      .then(res => res.json())
      .then(data => {
        setDetectedIp(data.ip);
        if (!localStorage.getItem('public_url')) {
          setPublicUrl(`http://10.10.13.201:4000`);
        }
      })
      .catch(err => console.error('Failed to fetch IP:', err));

    fetchUsers();
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('public_url', publicUrl);
    Swal.fire({
      icon: 'success',
      title: 'Settings Saved',
      text: 'Public URL updated.',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) {
      return Swal.fire('Error', 'Username and password are required', 'error');
    }

    const token = localStorage.getItem('auth_token');
    fetch(`${backendUrl}/api/users`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newUser)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        Swal.fire('Success', 'User added successfully', 'success');
        setNewUser({ username: '', password: '', full_name: '', role: 'staff' });
        fetchUsers();
      })
      .catch(err => Swal.fire('Error', err.message, 'error'));
  };

  const handleDeleteUser = (id, username) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete user "${username}". This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        fetch(`${backendUrl}/api/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.error) throw new Error(data.error);
            Swal.fire('Deleted!', 'User has been removed.', 'success');
            fetchUsers();
          })
          .catch(err => Swal.fire('Error', err.message, 'error'));
      }
    });
  };

  const useDetectedIp = () => {
    if (detectedIp) {
      const port = window.location.port ? `:${window.location.port}` : '';
      setPublicUrl(`http://${detectedIp}${port}`);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Settings</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: General Settings */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center space-x-3 bg-gray-50/50">
              <Globe className="w-5 h-5 text-blue-500" />
              <h2 className="font-bold text-gray-800">QR Connectivity</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Public URL Base
                </label>
                <input 
                  type="text" 
                  value={publicUrl}
                  onChange={(e) => setPublicUrl(e.target.value)}
                  placeholder="http://10.10.13.201:4000"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-xs"
                />
                <button 
                  onClick={handleSaveSettings}
                  className="w-full mt-4 bg-gray-900 text-white py-3 rounded-2xl font-bold hover:bg-black transition flex items-center justify-center space-x-2 shadow-lg shadow-gray-200"
                >
                  <Save className="w-4 h-4" />
                  <span>Update URL</span>
                </button>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Server IP</p>
                      <p className="text-xs font-bold text-blue-700">{detectedIp || '...'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={useDetectedIp}
                    className="p-2 bg-white text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-50 transition shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: User Management */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-purple-500" />
                <h2 className="font-bold text-gray-800">User Management</h2>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black uppercase">{users.length} Active</span>
            </div>

            <div className="p-6">
              {/* Add User Form */}
              <form onSubmit={handleAddUser} className="mb-8 p-6 bg-gray-50 rounded-3xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 flex items-center space-x-2 mb-2">
                  <UserPlus className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold text-gray-600 uppercase">Create New Access</span>
                </div>
                <input 
                  type="text" 
                  placeholder="Username"
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input 
                  type="password" 
                  placeholder="Password"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input 
                  type="text" 
                  placeholder="Full Name"
                  value={newUser.full_name}
                  onChange={e => setNewUser({...newUser, full_name: e.target.value})}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <select 
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white font-bold text-xs"
                >
                  <option value="staff">Staff (Standard)</option>
                  <option value="admin">Admin (Full Access)</option>
                  <option value="viewer">Viewer (Read-only)</option>
                </select>
                <div className="md:col-span-2">
                  <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-2xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-100 flex items-center justify-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Create User Account</span>
                  </button>
                </div>
              </form>

              {/* Users List */}
              <div className="space-y-3">
                {loadingUsers ? (
                  <div className="text-center py-10 italic text-gray-400">Loading users...</div>
                ) : users.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-purple-200 transition group">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                        {u.full_name ? u.full_name.charAt(0).toUpperCase() : u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-gray-900">{u.username}</p>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {u.role}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">{u.full_name || 'No full name'}</p>
                      </div>
                    </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleResetPassword(u.id, u.username)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center text-gray-400">
        <p className="text-xs font-medium italic opacity-50 tracking-tight flex items-center justify-center space-x-2">
          <Shield className="w-3 h-3 text-green-500" />
          <span>Carrollprep Secure Infrastructure v2.1</span>
        </p>
      </div>
    </div>
  );
}
