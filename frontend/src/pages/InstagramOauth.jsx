import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Shield, Lock, Info } from 'lucide-react';
import axios from '../utils/axios';

const InstagramOauth = () => {
  const [searchParams] = useSearchParams();
  const username = searchParams.get('username') || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuthorize = async () => {
    setLoading(true);
    setError('');
    try {
      // Direct call to connect Instagram
      const res = await axios.post('/instagram/connect', { username });
      
      // Post success message to parent window (if opened as popup)
      if (window.opener) {
        window.opener.postMessage({ type: 'INSTAGRAM_AUTH_SUCCESS', profile: res.data }, window.location.origin);
      }
      
      // Close window
      setTimeout(() => {
        window.close();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check the handle and try again.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.opener) {
      window.opener.postMessage({ type: 'INSTAGRAM_AUTH_CANCEL' }, window.location.origin);
    }
    window.close();
  };

  useEffect(() => {
    // If username is missing, show error
    if (!username) {
      setError('Missing username parameter. Please start from Settings.');
    }
  }, [username]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8 flex flex-col relative z-10"
      >
        {/* Header branding */}
        <div className="flex flex-col items-center gap-3 text-center mb-8 pb-6 border-b border-white/10">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] rounded-2xl flex items-center justify-center shadow-lg">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </div>
          <h2 className="text-2xl font-black font-display tracking-tight uppercase">Instagram OAuth API</h2>
          <p className="text-white/60 text-xs font-semibold">Verify & Connect Social Analytics</p>
        </div>

        {error ? (
          <div className="flex flex-col gap-6 text-center py-6">
            <div className="bg-red-500/15 border border-red-500/30 p-4 rounded-2xl text-red-300 text-sm font-semibold leading-relaxed">
              {error}
            </div>
            <button
              onClick={handleCancel}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Close Window
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Connecting Handle</span>
              <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-base font-bold text-white flex items-center justify-between">
                <span>{username.startsWith('@') ? username : `@${username}`}</span>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div> Ready
                </span>
              </div>
            </div>

            {/* Permissions list */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-4">
              <h4 className="text-[11px] font-black text-white/40 uppercase tracking-widest">App Permissions Requested:</h4>
              <ul className="text-xs text-white/80 space-y-3 font-medium">
                <li className="flex items-start gap-3">
                  <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" strokeWidth={3} />
                  <span>Read basic profile information (username, display picture, count).</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" strokeWidth={3} />
                  <span>Read follower metrics and location analytics.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" strokeWidth={3} />
                  <span>Read engagement rate over recent media assets.</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-white/40 text-[10px] leading-relaxed font-medium">
              <Shield size={12} className="shrink-0" />
              <span>Your auth token will be stored securely. We will never post on your behalf.</span>
            </div>

            {loading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span className="text-xs font-black text-white/60 uppercase tracking-widest">Exchanging Codes...</span>
              </div>
            ) : (
              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAuthorize}
                  className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-pink-500/20 active:scale-98"
                >
                  Authorize
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default InstagramOauth;
