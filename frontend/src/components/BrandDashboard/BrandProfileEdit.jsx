import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Edit3, X, Building, MapPin, Globe, ChevronDown, 
  UploadCloud, Lock, Loader2, Sparkles, ShieldCheck, ShieldAlert, AlertTriangle, Clock, CheckCircle, ArrowRight 
} from 'lucide-react';

const BrandProfileEdit = ({ profile, setProfile, showToast, setActiveTab, user: propUser }) => {
  const { user: authUser } = useAuth();
  const user = propUser || authUser;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: profile?.businessName || '',
    businessType: profile?.businessType || 'Online',
    location: profile?.location || '',
    website: profile?.website || '',
    description: profile?.description || '',
    preferences: {
      targetAgeGroup: profile?.preferences?.targetAgeGroup || 'Any',
      targetGender: profile?.preferences?.targetGender || 'Both',
      targetLocality: profile?.preferences?.targetLocality || 'Anywhere',
      brandPriority: profile?.preferences?.brandPriority || 'Reach'
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef(null);

  // Sync state if profile prop changes
  useEffect(() => {
    if (profile) {
      setFormData({
        businessName: profile.businessName || '',
        businessType: profile.businessType || 'Online',
        location: profile.location || '',
        website: profile.website || '',
        description: profile.description || '',
        preferences: {
          targetAgeGroup: profile.preferences?.targetAgeGroup || 'Any',
          targetGender: profile.preferences?.targetGender || 'Both',
          targetLocality: profile.preferences?.targetLocality || 'Anywhere',
          brandPriority: profile.preferences?.brandPriority || 'Reach'
        }
      });
    }
  }, [profile]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      if (showToast) showToast('Logo image must be under 10MB.', 'error');
      return;
    }

    const data = new FormData();
    data.append('logo', file);

    try {
      setIsUploadingLogo(true);
      const res = await axios.post('/brands/logo', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (setProfile) setProfile(res.data);
      if (showToast) showToast('Brand logo updated successfully!', 'success');
    } catch (err) {
      console.error('Logo upload error:', err);
      if (showToast) showToast(err.response?.data?.message || 'Failed to upload logo.', 'error');
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.businessName?.trim()) {
      if (showToast) showToast('Brand Name is required.', 'error');
      return;
    }

    try {
      setIsSaving(true);
      const res = await axios.post('/brands/profile', formData);
      if (setProfile) setProfile(res.data);
      if (showToast) showToast('Brand profile updated successfully!', 'success');
    } catch (err) {
      console.error('Profile update error:', err);
      if (showToast) showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (profile) {
      setFormData({
        businessName: profile.businessName || '',
        businessType: profile.businessType || 'Online',
        location: profile.location || '',
        website: profile.website || '',
        description: profile.description || '',
        preferences: {
          targetAgeGroup: profile.preferences?.targetAgeGroup || 'Any',
          targetGender: profile.preferences?.targetGender || 'Both',
          targetLocality: profile.preferences?.targetLocality || 'Anywhere',
          brandPriority: profile.preferences?.brandPriority || 'Reach'
        }
      });
    }
    if (showToast) showToast('Reset to saved profile details.', 'success');
  };

  return (
    <div className="flex flex-col animate-reveal-up bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden mb-24 md:mb-8">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 bg-gray-50/50">
            <Edit3 size={18} />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-gray-900 leading-tight">Edit Brand Profile</h2>
            <p className="text-[13px] text-gray-400 font-medium">Update your brand identity, contact links, and targeting preferences.</p>
          </div>
        </div>
        <button 
          onClick={() => setActiveTab && setActiveTab('overview')} 
          className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-50"
          title="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Form Content */}
      <form className="p-4 sm:p-6 flex flex-col gap-6" onSubmit={handleSubmit}>
        {/* Brand Core Details */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-gray-800">Brand Name <span className="text-red-500">*</span></label>
            <input 
              required 
              type="text" 
              value={formData.businessName} 
              onChange={e => setFormData({ ...formData, businessName: e.target.value })} 
              placeholder="e.g. Acme Corp" 
              className="w-full bg-white border border-gray-200 rounded-[12px] px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 transition-all placeholder:text-gray-400" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[12px] font-bold text-gray-800">Business Model <span className="text-red-500">*</span></label>
              <div className="relative">
                <select 
                  value={formData.businessType} 
                  onChange={e => setFormData({ ...formData, businessType: e.target.value })} 
                  className="w-full bg-white border border-gray-200 rounded-[12px] px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="Online">Online / D2C</option>
                  <option value="Local">Local Store / Retail</option>
                  <option value="Service">Service / Agency</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[12px] font-bold text-gray-800">Operating Location</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={formData.location} 
                  onChange={e => setFormData({ ...formData, location: e.target.value })} 
                  placeholder="e.g. Mumbai, India or Global" 
                  className="w-full bg-white border border-gray-200 rounded-[12px] pl-10 pr-4 py-3 text-[13px] text-gray-900 outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 transition-all placeholder:text-gray-400" 
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[12px] font-bold text-gray-800">Website or Store URL</label>
            <div className="relative">
              <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="url" 
                value={formData.website} 
                onChange={e => setFormData({ ...formData, website: e.target.value })} 
                placeholder="https://yourbrand.com" 
                className="w-full bg-white border border-gray-200 rounded-[12px] pl-10 pr-4 py-3 text-[13px] text-gray-900 outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 transition-all placeholder:text-gray-400" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[12px] font-bold text-gray-800">Target Age Group</label>
              <div className="relative">
                <select 
                  value={formData.preferences?.targetAgeGroup || 'Any'} 
                  onChange={e => setFormData({ ...formData, preferences: { ...formData.preferences, targetAgeGroup: e.target.value } })} 
                  className="w-full bg-white border border-gray-200 rounded-[12px] px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="Any">Any Age Demographic</option>
                  <option value="Gen Z (18-24)">Gen Z (18-24)</option>
                  <option value="Millennials (25-34)">Millennials (25-34)</option>
                  <option value="Gen X (35-54)">Gen X (35-54)</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[12px] font-bold text-gray-800">Target Gender</label>
              <div className="relative">
                <select 
                  value={formData.preferences?.targetGender || 'Both'} 
                  onChange={e => setFormData({ ...formData, preferences: { ...formData.preferences, targetGender: e.target.value } })} 
                  className="w-full bg-white border border-gray-200 rounded-[12px] px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="Both">All Genders</option>
                  <option value="Female">Female-Focused</option>
                  <option value="Male">Male-Focused</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Upload Logo Area */}
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-[12px] font-bold text-gray-800">Brand Logo</label>
          {profile?.logo ? (
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
              <img 
                src={profile.logo} 
                alt="Brand Logo" 
                className="w-16 h-16 rounded-xl object-cover border border-gray-200 bg-white shadow-sm" 
              />
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="text-xs font-bold text-gray-900">Current Logo Active</span>
                <span className="text-[11px] text-gray-400">PNG, JPG, WebP up to 10MB</span>
              </div>
              <button
                type="button"
                disabled={isUploadingLogo}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-800 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                {isUploadingLogo ? <Loader2 size={14} className="animate-spin text-[#EA580C]" /> : <UploadCloud size={14} />}
                {isUploadingLogo ? 'Uploading...' : 'Change Logo'}
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full border border-dashed border-gray-300 rounded-[16px] bg-white flex flex-col items-center justify-center py-8 gap-1.5 hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400 bg-gray-50 border border-gray-100 group-hover:scale-105 transition-transform">
                {isUploadingLogo ? <Loader2 size={22} className="animate-spin text-[#EA580C]" /> : <UploadCloud size={22} />}
              </div>
              <p className="text-[13px] font-bold text-gray-800">
                {isUploadingLogo ? 'Uploading logo to cloud...' : 'Tap to upload brand logo'}
              </p>
              <p className="text-[11px] text-gray-400 mb-2">PNG, JPG, or WebP up to 10MB</p>
              <button 
                type="button" 
                disabled={isUploadingLogo}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="px-4 py-2 bg-white border border-gray-200 rounded-[10px] text-[11px] font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                {isUploadingLogo ? 'Uploading...' : 'Browse files'}
              </button>
            </div>
          )}
          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleLogoUpload} 
          />
        </div>

        {/* Narrative / Description */}
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-[12px] font-bold text-gray-800">Brand Narrative & Mission</label>
          <textarea 
            value={formData.description} 
            onChange={e => setFormData({ ...formData, description: e.target.value })} 
            placeholder="Describe your brand identity, mission, target audience, and collaboration guidelines..." 
            className="w-full bg-white border border-gray-200 rounded-[12px] px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 transition-all min-h-[120px] resize-none placeholder:text-gray-400 leading-relaxed" 
          />
        </div>

        {/* Verification & KYC Section */}
        <div className="flex flex-col gap-3 mt-4 pt-6 border-t border-gray-100 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#EA580C] flex items-center justify-center border border-orange-100">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h3 className="text-[14px] font-black text-gray-900 tracking-tight">Identity Verification (KYC)</h3>
                <p className="text-[11px] text-gray-400 font-medium">Verify your company identity to create campaigns and contract with creators.</p>
              </div>
            </div>
            
            <div>
              {user?.kycStatus === 'APPROVED' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <ShieldCheck size={12} /> Verified
                </span>
              ) : user?.kycStatus === 'PENDING' || user?.kycStatus === 'UNDER_REVIEW' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
                  <Clock size={12} /> Under Review
                </span>
              ) : user?.kycStatus === 'REJECTED' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
                  <AlertTriangle size={12} /> Rejected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200">
                  <ShieldAlert size={12} /> Unverified
                </span>
              )}
            </div>
          </div>

          <div className="bg-gray-50/70 border border-gray-200/70 rounded-2xl p-5 flex flex-col gap-4 mt-1">
            {user?.kycStatus === 'APPROVED' ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-emerald-500" /> Company Verification Complete
                  </p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Your brand account is fully verified. You can launch unlimited campaigns, lock milestone coins into escrow, and directly hire creators.
                  </p>
                  {user?.kycVerificationId && (
                    <p className="text-[10px] font-mono font-bold text-gray-400 mt-1">
                      Verification ID: {user.kycVerificationId}
                    </p>
                  )}
                </div>
                <div className="px-3.5 py-2 bg-white rounded-xl border border-gray-200 text-center shrink-0">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 block">Status</span>
                  <span className="text-xs font-bold text-gray-800">Verified Partner</span>
                </div>
              </div>
            ) : user?.kycStatus === 'PENDING' || user?.kycStatus === 'UNDER_REVIEW' ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-500 animate-spin" /> Verification In Progress
                  </p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Our compliance team is currently reviewing your uploaded company registration papers. Approvals typically complete within 24 hours.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/kyc-onboarding')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95 transition-all shrink-0"
                >
                  View Details
                </button>
              </div>
            ) : user?.kycStatus === 'REJECTED' ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 p-3.5 bg-red-50 rounded-xl border border-red-200 text-red-800">
                  <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-black uppercase tracking-wide text-red-900">Verification Rejected</p>
                    <p className="text-xs text-red-700">
                      {user?.kycRejectionReason || 'The company certificate or documentation submitted was illegible or could not be verified. Please review requirements and resubmit.'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <p className="text-[11px] text-gray-500">
                    You can resubmit a clear photo or PDF of your Company Registration Certificate / GSTIN.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/kyc-onboarding')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    Resubmit KYC Now <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-bold text-gray-800">Identity verification is required</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Upload your Company Registration Certificate or GSTIN document to activate your account and start posting campaigns.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/kyc-onboarding')}
                  className="px-5 py-2.5 bg-[#EA580C] hover:bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  Start KYC Verification <ArrowRight size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 sm:pt-6 sm:border-t sm:border-gray-100">
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex-1 px-6 py-3.5 rounded-[12px] bg-[#EA580C] text-white text-[13px] font-bold hover:bg-[#C2410C] transition-all shadow-md shadow-orange-500/20 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSaving && <Loader2 size={15} className="animate-spin" />}
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </button>
          <button 
            type="button" 
            onClick={handleReset} 
            className="px-6 py-3.5 rounded-[12px] bg-white border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm text-center"
          >
            Reset Data
          </button>
        </div>
      </form>
    </div>
  );
};

export default BrandProfileEdit;
