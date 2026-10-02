import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, ShieldCheck, Loader2, Sparkles, Sun, UploadCloud, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

const AadhaarVerification = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [instagramLink, setInstagramLink] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const isBrand = user?.role === 'brand';

  const formatAadhaarNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) parts.push(digits.slice(i, i + 4));
    return parts.join(' ');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File too large. Max 10MB.');
        return;
      }
      setAadhaarFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions from double clicks

    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!isBrand && aadhaarNumber.replace(/\s/g, '').length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    if (!aadhaarFile) {
      setError('Please upload your verification document.');
      return;
    }
    if (!isBrand && !instagramLink.includes('instagram.com/')) {
      setError('Please provide a valid Instagram profile link.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Pre-validate details (e.g. check for duplicate Aadhaar/GSTIN)
      const validationPayload = {
        personalInfo: {
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          instagramLink,
          aadhaarNumber: aadhaarNumber.replace(/\s/g, '')
        }
      };
      await axios.post('/kyc/validate-details', validationPayload);

      // 2. Upload Document only if it hasn't been uploaded yet in this form session
      if (uploadedFile !== aadhaarFile) {
        const formData = new FormData();
        formData.append('document', aadhaarFile);
        formData.append('documentType', isBrand ? 'Company Registration Certificate' : 'Aadhaar Card');
        await axios.post('/kyc/upload-document', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setUploadedFile(aadhaarFile);
      }

      // 3. Submit KYC with details and Instagram Link
      const payload = {
        personalInfo: {
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          instagramLink,
          aadhaarNumber: aadhaarNumber.replace(/\s/g, '')
        }
      };
      await axios.post('/kyc/submit', payload);

      if (user) {
        setUser({ ...user, kycStatus: 'PENDING' });
      }

      // Navigate to dashboard based on role
      if (isBrand) {
        navigate('/brand-dashboard');
      } else {
        navigate('/creator-dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Verification submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (isBrand) {
      navigate('/brand-dashboard');
    } else {
      navigate('/creator-dashboard');
    }
  };

  const primaryColorClass = 'bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-lg shadow-orange-500/20 active:scale-[0.98]';

  return (
    <div className="h-[calc(100dvh-5rem)] overflow-hidden w-full flex bg-[#FAF9F6] font-sans text-slate-900 relative">
      
      {/* Decorative Morning Backdrop Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-gradient-to-tr from-amber-300/30 to-orange-400/0 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[5%] right-[20%] w-[350px] h-[350px] bg-gradient-to-tr from-orange-300/15 to-amber-200/0 rounded-full blur-[80px] pointer-events-none z-0" />

      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-6 md:p-8 relative overflow-y-auto h-full hide-scrollbar z-10">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl border border-orange-100/60 rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-[0_24px_50px_rgba(251,146,60,0.06)] transition-all duration-300 animate-reveal-up">
          
          <div className="flex items-center justify-between mb-4">
             <div className="w-11 h-11 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/10 text-white relative">
               <FileText size={20} />
             </div>
             <div className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200/50 rounded-lg text-[10px] font-black uppercase tracking-widest">
               Final Step
             </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900 mb-0.5">
              {isBrand ? 'Business Details' : 'Identity & Socials'}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              {isBrand ? 'Upload your company registration to complete onboarding.' : 'Verify your Aadhaar and link your primary Instagram account.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl flex items-center gap-3 mb-6 text-sm font-bold">
              <ShieldCheck size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Mobile Number */}
            <div className="flex flex-col gap-1 group">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 group-focus-within:text-amber-500 transition-colors">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-0 top-0 bottom-0 px-4 flex items-center bg-slate-100 border-2 border-slate-200/80 rounded-l-2xl text-slate-500 font-bold text-sm">
                  +91
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full pl-16 pr-4 py-3 bg-slate-50/50 border-2 border-slate-100/80 rounded-2xl focus:bg-white outline-none transition-all text-sm text-slate-900 font-bold placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                  placeholder="000 000 0000"
                />
              </div>
            </div>

            {/* Identity Number */}
            <div className="flex flex-col gap-1 group">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 group-focus-within:text-amber-500 transition-colors">
                {isBrand ? 'Registration / GST Number' : 'Aadhaar Number (12-Digit)'}
              </label>
              <input
                type="text"
                required
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(isBrand ? e.target.value : formatAadhaarNumber(e.target.value))}
                maxLength={isBrand ? 20 : 14}
                className="w-full px-4 py-3 bg-slate-50/50 border-2 border-slate-100/80 rounded-2xl focus:bg-white outline-none transition-all text-sm text-slate-900 font-bold placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 tracking-widest font-mono"
                placeholder={isBrand ? "GSTIN / Reg No." : "0000 0000 0000"}
              />
            </div>

            {/* Instagram Link (Creators Only) */}
            {!isBrand && (
              <div className="flex flex-col gap-1 group">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 group-focus-within:text-amber-500 transition-colors">
                  Instagram Profile Link
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={16} />
                  <input
                    type="url"
                    required
                    value={instagramLink}
                    onChange={(e) => setInstagramLink(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border-2 border-slate-100/80 rounded-2xl focus:bg-white outline-none transition-all text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="flex flex-col gap-1 mt-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                {isBrand ? 'Upload Registration Document' : 'Upload Aadhaar Image (Front)'}
              </label>
              <label className={`w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${aadhaarFile ? 'border-amber-500 bg-amber-50/30' : 'border-slate-200 bg-slate-50 hover:border-amber-400 hover:bg-orange-50/20'}`}>
                <input type="file" onChange={handleFileChange} className="hidden" accept=".jpg,.jpeg,.png,.pdf" />
                {aadhaarFile ? (
                   <div className="text-center">
                      <ShieldCheck size={28} className="text-amber-500 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{aadhaarFile.name}</p>
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">Ready to upload</p>
                   </div>
                ) : (
                   <div className="text-center group-hover:scale-105 transition-transform">
                      <UploadCloud size={28} className="text-slate-400 mx-auto mb-2 group-hover:text-amber-500" />
                      <p className="text-sm font-bold text-slate-600">Click to upload file</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">JPG, PNG or PDF (Max 10MB)</p>
                   </div>
                )}
              </label>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-3.5 rounded-2xl text-white font-bold text-sm uppercase tracking-widest shadow-lg transition-all mt-6 flex items-center justify-center gap-2 group ${primaryColorClass} disabled:opacity-70 disabled:cursor-not-allowed`}>
              {loading ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : <>Complete Setup <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
            <button type="button" onClick={handleSkip} disabled={loading} className="w-full py-3.5 rounded-2xl text-slate-500 font-bold text-sm uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed">
              Skip for now
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Visual Panel */}
      <div className="hidden lg:flex w-1/2 bg-[#FAF9F6] p-6 h-full z-10 relative">
        <div className="w-full h-full bg-[#ffeecf]/70 border border-orange-100/30 rounded-[2.5rem] relative overflow-hidden shadow-[inset_0_4px_30px_rgba(0,0,0,0.01)] flex flex-col justify-around p-14 transition-all duration-500">
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #EA580C 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />
          
          <div className="relative z-10 mt-4">
            <h1 className="text-[44px] font-black font-display tracking-tight leading-[1.15] mb-5 text-slate-900">
              {isBrand ? (
                <>Establish your <br/>brand <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">authenticity.</span></>
              ) : (
                <>Link your socials <br/>and claim your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">creator identity.</span></>
              )}
            </h1>

            <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-sm mt-6 border-t border-orange-100/30 pt-6">
              {isBrand 
                ? 'We manually verify all brands to ensure a premium, scam-free environment for our talent network.'
                : 'Verifying your identity and socials allows us to automatically fetch your real-time follower count and pitch you to top brands securely.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AadhaarVerification;
