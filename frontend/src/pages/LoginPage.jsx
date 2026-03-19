import React, { useState } from 'react';
import { User, Lock, LogIn, ShieldAlert } from 'lucide-react';
import Swal from 'sweetalert2';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use window.location.hostname to support network access
      const backendUrl = `http://${window.location.hostname}:4001`;
      
      const response = await fetch(`${backendUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_info', JSON.stringify(data.user));
        onLogin(data.user);
        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: `Welcome back, ${data.user.full_name || data.user.username}!`,
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: data.error || 'Invalid username or password'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Could not connect to the authentication server.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Logo / Branding Area */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-blue-200 mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
            <ShieldAlert className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Carrollprep</h1>
          <p className="text-slate-500 font-medium mt-2 uppercase text-[10px] tracking-[0.2em]">Asset Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 p-10 border border-slate-100 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
          
          <h2 className="text-xl font-bold text-slate-800 mb-8">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:bg-blue-400 disabled:translate-y-0"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Login</span>
                  <LogIn className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 leading-relaxed italic">
              Forgot your credentials? <br />
              <span className="text-slate-300 not-italic">Contact IT Department for access retrieval.</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-400">
          <p className="text-xs font-medium">© 2024 Carrollprep Education</p>
          <div className="flex items-center justify-center space-x-4 mt-3">
             <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
             <p className="text-[10px] uppercase tracking-widest font-bold text-slate-300">Enterprise Security Active</p>
             <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
