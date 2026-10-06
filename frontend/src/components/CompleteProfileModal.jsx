import React, { useState, useEffect } from 'react';
import { UploadCloud, ArrowRight, ShieldCheck, Loader2, Sparkles, X, AlertCircle } from 'lucide-react';
import axios from '../utils/axios';

const CompleteProfileModal = ({ isOpen, onClose, user, initialProfile, onComplete }) => {
  const [name, setName] = useState(() => {
    const initialName = initialProfile?.businessName || initialProfile?.name || '';
    if (initialName.startsWith('Brand-') || initialName.startsWith('Creator-')) {
      return '';
    }
    return initialName;
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialProfile) {
      const initialName = initialProfile.businessName || initialProfile.name || '';
      if (!initialName.startsWith('Brand-') && !initialName.startsWith('Creator-')) {
        setName(initialName);
      }
    }
  }, [initialProfile]);

  if (!isOpen) return null;

  const isBrand = user?.role === 'brand';

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        setError('File too large. Max 10MB.');
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const trimmedName = (name || '').trim();

    if (!trimmedName) {
      setError(`Please enter your ${isBrand ? 'company name' : 'full name'}.`);
      return;
    }

    // Check default names
    if (isBrand && (trimmedName.startsWith('Brand-') || trimmedName.toLowerCase() === 'brand')) {
      setError('Please provide a custom brand name.');
      return;
    }
    if (!isBrand && (trimmedName.startsWith('Creator-') || trimmedName.toLowerCase() === 'creator')) {
      setError('Please provide a custom creator name.');
      return;
    }

    if (!file && !(initialProfile?.logo || initialProfile?.profilePicture)) {
      setError('Please upload an avatar / logo image.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let uploadedUrl = null;
      // 1. Upload Avatar/Logo file if a new file is selected
      if (file) {
        const formData = new FormData();
        if (isBrand) {
          formData.append('logo', file);
          const uploadRes = await axios.post('/brands/logo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          uploadedUrl = uploadRes.data.logo;
        } else {
          formData.append('profilePicture', file);
          const uploadRes = await axios.post('/creators/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          uploadedUrl = uploadRes.data.profilePicture;
        }
      }

      // 2. Save Name / Business Name
      if (isBrand) {
        const profilePayload = {
          ...initialProfile,
          businessName: trimmedName
        };
        if (uploadedUrl) {
          profilePayload.logo = uploadedUrl;
        }
        await axios.post('/brands/profile', profilePayload);
      } else {
        const profilePayload = {
          ...initialProfile,
          name: trimmedName
        };
        if (uploadedUrl) {
          profilePayload.profilePicture = uploadedUrl;
        }
        await axios.post('/creators/profile', profilePayload);
      }

      onComplete(); // Triggers refresh in parent dashboard
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-md bg-white border border-orange-100 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative text-left max-h-[95vh] overflow-y-auto flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="mb-6 flex items-center justify-between">
          <div className="w-11 h-11 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/10 text-white">
            <Sparkles size={20} />
          </div>
          <span className="px-3 py-1 bg-orange-50 text-orange-600 border border-orange-200/50 rounded-lg text-[10px] font-black uppercase tracking-widest">
            Required Action
          </span>
        </div>

        <h3 className="font-display font-black text-2xl tracking-tight text-slate-900 mb-1">
          Complete Your Profile
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mb-6">
          To access the marketplace and unlock KYC verification, you must first complete your profile basics. A custom {isBrand ? 'company name' : 'full name'} and logo/avatar are required.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl flex items-center gap-2 mb-5 text-xs font-bold">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              {isBrand ? 'Brand / Company Name' : 'Your Full Name'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={isBrand ? "e.g. Nike, Pepsi, Inc." : "e.g. John Doe"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white outline-none transition-all text-sm font-bold placeholder:text-slate-400 focus:border-amber-500"
            />
          </div>

          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              {isBrand ? 'Upload Logo' : 'Upload Profile Picture'} <span className="text-red-500">*</span>
            </label>
            <label className={`w-full h-28 border border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${file ? 'border-amber-500 bg-amber-50/30' : 'border-slate-200 bg-slate-50 hover:border-amber-400 hover:bg-orange-50/20'}`}>
              <input type="file" onChange={handleFileChange} className="hidden" accept=".jpg,.jpeg,.png" />
              {file ? (
                <div className="text-center p-2">
                  <ShieldCheck size={24} className="text-amber-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[220px]">{file.name}</p>
                  <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mt-0.5">Ready to upload</p>
                </div>
              ) : (initialProfile?.logo || initialProfile?.profilePicture) ? (
                <div className="text-center p-2 flex items-center gap-3">
                  <img src={initialProfile.logo || initialProfile.profilePicture} alt="Current logo" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">Logo/Avatar Already Set</p>
                    <p className="text-[9px] font-bold text-slate-400">Click to change logo</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-2">
                  <UploadCloud size={24} className="text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-600">Click to upload image</p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">JPG or PNG (Max 10MB)</p>
                </div>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-rose-600 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-[0.98] transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Saving Profile...</> : <>Save & Continue <ArrowRight size={16} /></>}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-widest rounded-2xl border border-slate-200 transition-colors"
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileModal;
