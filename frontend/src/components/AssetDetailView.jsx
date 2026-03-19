import React, { useState, useEffect } from 'react';
import { Package, User, MapPin, Tag, Calendar, ChevronLeft, ShieldCheck } from 'lucide-react';

export default function AssetDetailView({ assetId }) {
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Determine backend URL dynamically based on the current hostname
    const backendUrl = `http://${window.location.hostname}:4001`;
    
    fetch(`${backendUrl}/api/items/${assetId}`)
      .then(res => {
        if (!res.ok) throw new Error('Asset not found');
        return res.json();
      })
      .then(data => {
        setAsset(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [assetId]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-200 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  if (error || !asset) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <Package className="w-10 h-10 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Asset Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-xs mx-auto">The asset you are looking for might have been removed or the link is incorrect.</p>
      <button 
        onClick={() => window.location.href = '/'}
        className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all"
      >
        Go to Dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Banner */}
      <div className="bg-blue-600 h-32 relative">
        <button 
          onClick={() => window.location.href = '/'}
          className="absolute top-6 left-6 p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors backdrop-blur-md border border-white/20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="px-6 -mt-16">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 pr-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-blue-100 mb-3 inline-block">
                  {asset.category}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {asset.name}
                </h1>
              </div>
              <div className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-bold ${
                asset.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {asset.status}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-6 border-t border-gray-50">
               {/* Asset Tag */}
               <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Asset Tag</p>
                  <p className="text-gray-800 font-bold">{asset.asset_tag || 'N/A'}</p>
                </div>
              </div>

              {/* Owner */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Owner</p>
                  <p className="text-gray-800 font-bold">{asset.owner || 'Common Area'}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</p>
                  <p className="text-gray-800 font-bold">{asset.location || 'Unknown'}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <Calendar className="w-4 h-4 text-gray-400 mb-2" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acquired</p>
                  <p className="text-sm font-bold text-gray-700">
                    {asset.start_date ? new Date(asset.start_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <ShieldCheck className="w-4 h-4 text-gray-400 mb-2" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Warranty</p>
                  <p className="text-sm font-bold text-gray-700">
                    {asset.warranty_date ? new Date(asset.warranty_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-400">
          <p className="text-xs font-medium uppercase tracking-tight">Carrollprep Asset Management System</p>
          <p className="text-[10px] mt-1 italic">Scan verified by IT Department</p>
        </div>
      </div>
    </div>
  );
}
