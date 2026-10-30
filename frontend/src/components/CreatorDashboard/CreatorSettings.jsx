import React, { useState, useEffect, useRef } from "react";
import axios from "../../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  User, Compass, Briefcase, Wallet, Settings, Bell,
  ExternalLink, ShieldCheck, Clock, TrendingUp, Building,
  Upload, Search, SlidersHorizontal, CheckCircle, AlertTriangle,
  Receipt, Download, ChevronLeft, ChevronRight, X, Building2, LayoutDashboard,
  Folder, ArrowUpRight, Edit3, ChevronDown, Film, UploadCloud,
  LogOut, Users, Check, Plus, Trash2, MessageCircle, MessageSquare, MapPin, Gauge, Star, Quote, FileText, Copy,
  LayoutGrid, Columns, Bookmark, Zap, Lock, ShieldAlert, AlertCircle,
  Calendar, FileSignature, Video, Filter, Loader2
} from "lucide-react";
import ChatOverlay from "../ChatOverlay";
import KycRequiredModal from "../KycRequiredModal";
import { useAuth } from "../../context/AuthContext";

export const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;
  let score = 0;
  if (profile.bio) score += 20;
  if (profile.niche && profile.niche !== 'Other') score += 15;
  if (profile.profilePicture) score += 20;
  if (profile.instagramProfile?.connected) score += 20;
  if (profile.expertise && profile.expertise.length > 0) score += 15;
  if (profile.payoutDetails?.isComplete || profile.payoutDetails?.upiId || profile.payoutDetails?.bankAccountNumber) score += 10;
  return score;
};

export 
const getPlaceholderImage = (niche) => {
  const map = {
    'Tech': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    'Fashion': 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80',
    'Gaming': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    'Lifestyle': 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=400&q=80',
    'Food': 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=400&q=80',
    'Travel': 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=400&q=80',
    'Beauty': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    'Other': 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=400&q=80'
  };
  return map[niche] || map['Other'];
};

const ANIMATION_VARIANTS = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.25, ease: "easeOut" }
};


const CreatorSettings = ({ profile, onSave, onUploadAvatar, isUploading, onLogout }) => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState(profile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(null);
  const [isGeneratingKit, setIsGeneratingKit] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState('');

  // Sub-tab Navigation state
  const [activeChunk, setActiveChunk] = useState('profile');

  // New Sections State
  const [shippingAddress, setShippingAddress] = useState(profile?.shippingAddress || { street: '', city: '', state: '', zip: '', country: '' });
  const [willNotPromote, setWillNotPromote] = useState(profile?.willNotPromote || []);
  const [securityData, setSecurityData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // In-place KYC form state
  const [kycPhone, setKycPhone] = useState('');
  const [kycAadhaar, setKycAadhaar] = useState('');
  const [kycInstagram, setKycInstagram] = useState('');
  const [kycDocument, setKycDocument] = useState(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycError, setKycError] = useState('');
  const [kycSuccess, setKycSuccess] = useState('');

  const formatAadhaar = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 12);
    const chunks = [];
    for (let i = 0; i < digits.length; i += 4) {
      chunks.push(digits.slice(i, i + 4));
    }
    return chunks.join(' ');
  };

  const handleKycFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setKycError('Document file too large. Max 10MB.');
        return;
      }
      setKycDocument(file);
      setKycError('');
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    setKycError('');
    setKycSuccess('');

    const cleanPhone = kycPhone.replace(/\D/g, '');
    const cleanAadhaar = kycAadhaar.replace(/\s/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      setKycError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (cleanAadhaar.length !== 12) {
      setKycError('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    if (!kycDocument) {
      setKycError('Please upload your Aadhaar document (PDF/Image).');
      return;
    }
    if (!kycInstagram.trim() || !kycInstagram.includes('instagram.com/')) {
      setKycError('Please enter a valid Instagram profile link (e.g. https://instagram.com/yourhandle).');
      return;
    }

    setKycLoading(true);
    try {
      // 1. Pre-validate details
      await axios.post('/kyc/validate-details', {
        personalInfo: {
          phoneNumber: cleanPhone,
          instagramLink: kycInstagram.trim(),
          aadhaarNumber: cleanAadhaar
        }
      });

      // 2. Upload Document
      const uploadData = new FormData();
      uploadData.append('document', kycDocument);
      uploadData.append('documentType', 'Aadhaar Card');
      await axios.post('/kyc/upload-document', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 3. Final Submit
      await axios.post('/kyc/submit', {
        personalInfo: {
          phoneNumber: cleanPhone,
          instagramLink: kycInstagram.trim(),
          aadhaarNumber: cleanAadhaar
        }
      });

      if (setUser) {
        setUser(prev => ({ ...prev, kycStatus: 'PENDING' }));
      }

      setKycSuccess('KYC application submitted successfully! Our compliance team will review your details.');
      setKycDocument(null);
      setKycAadhaar('');
      setKycPhone('');
      setKycInstagram('');
    } catch (err) {
      console.error(err);
      setKycError(err.response?.data?.message || 'Verification submission failed. Please try again.');
    } finally {
      setKycLoading(false);
    }
  };

  const handleGenerateMediaKit = () => {
    setIsGeneratingKit(true);
    setTimeout(() => {
      setIsGeneratingKit(false);
      alert('Media Kit PDF Generated successfully!');
    }, 2500);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    const { currentPassword, newPassword, confirmPassword } = securityData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'All password fields are required.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await axios.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      setPasswordMsg({ type: 'success', text: res.data.message || 'Password updated successfully!' });
      setSecurityData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update password. Please check your current password.'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        socialLinks: profile.socialLinks || []
      });
      if (profile.shippingAddress) {
        setShippingAddress(profile.shippingAddress);
      }
      if (profile.willNotPromote) {
        setWillNotPromote(profile.willNotPromote);
      }
    }
  }, [profile]);

  if (!formData) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();

    // JS validation for required profile fields
    if (!formData.name?.trim()) {
      setActiveChunk('profile');
      setTimeout(() => {
        const nameInput = document.getElementById('displayName');
        if (nameInput) {
          nameInput.focus();
          nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        alert('Display Name is required.');
      }, 100);
      return;
    }

    if (!formData.location?.trim()) {
      setActiveChunk('profile');
      setTimeout(() => {
        const locInput = document.getElementById('baseLocation');
        if (locInput) {
          locInput.focus();
          locInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        alert('Base Location is required.');
      }, 100);
      return;
    }

    setIsSubmitting(true);
    await onSave({ ...formData, shippingAddress, willNotPromote });
    setIsSubmitting(false);
  };

  const validateStep = (step) => {
    if (step === 'profile') {
      if (!formData.name?.trim()) {
        const nameInput = document.getElementById('displayName');
        if (nameInput) {
          nameInput.focus();
          nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        alert('Display Name is required.');
        return false;
      }
      if (!formData.location?.trim()) {
        const locInput = document.getElementById('baseLocation');
        if (locInput) {
          locInput.focus();
          locInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        alert('Base Location is required.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(activeChunk)) return;

    if (activeChunk === 'profile') {
      setActiveChunk('connections');
    } else if (activeChunk === 'connections') {
      setActiveChunk('security');
    } else if (activeChunk === 'security') {
      setActiveChunk('kyc');
    }

    setTimeout(() => {
      const formTop = document.getElementById('settingsFormWrapper');
      if (formTop) {
        formTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleBack = () => {
    if (activeChunk === 'connections') {
      setActiveChunk('profile');
    } else if (activeChunk === 'security') {
      setActiveChunk('connections');
    } else if (activeChunk === 'kyc') {
      setActiveChunk('security');
    }

    setTimeout(() => {
      const formTop = document.getElementById('settingsFormWrapper');
      if (formTop) {
        formTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <motion.div {...ANIMATION_VARIANTS} className="pb-24 pt-4 px-4 md:px-0 relative z-10">


      {/* Settings Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Creator Settings</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Update your profile details, connections, and platform preferences.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#d94e08] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow active:scale-98 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'} <Check size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Sequential Step Indicator */}
      <div className="relative flex items-center justify-between w-full max-w-xl mx-auto mb-10 mt-6 px-4">
        {/* Progress bar line background */}
        <div className="absolute top-1/2 left-8 right-8 h-[2px] bg-gray-200 -translate-y-1/2 z-0">
          <div
            className="h-full bg-[#EA580C] transition-all duration-500 ease-out"
            style={{
              width:
                activeChunk === 'profile' ? '25%' :
                activeChunk === 'connections' ? '50%' :
                activeChunk === 'security' ? '75%' : '100%'
            }}
          />
        </div>

        {/* Step Circles */}
        {[
          { id: 'profile', step: 1 },
          { id: 'connections', step: 2 },
          { id: 'security', step: 3 },
          { id: 'kyc', step: 4 }
        ].map((node, index) => {
          const isCurrent = activeChunk === node.id;
          const isCompleted =
            (activeChunk === 'connections' && index < 1) ||
            (activeChunk === 'security' && index < 2) ||
            (activeChunk === 'kyc' && index < 3);

          const isActiveOrCompleted = isCurrent || isCompleted;

          return (
            <div key={node.id} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  if (validateStep(activeChunk)) {
                    setActiveChunk(node.id);
                  }
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                  isActiveOrCompleted
                    ? 'bg-[#EA580C] border-[#EA580C] text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                }`}
              >
                {node.step}
              </button>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleUpdate} className="flex flex-col gap-6">
        {/* Form Container Card */}
        <div id="settingsFormWrapper" className="bg-white rounded-3xl border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-6 sm:p-10 flex flex-col">
          {/* Step Header inside card */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900">
              {activeChunk === 'profile' ? 'Basic Information' :
               activeChunk === 'connections' ? 'Audience & Content Boundaries' :
               activeChunk === 'security' ? 'Account Security & Payout' :
               'Identity Verification (KYC)'}
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {activeChunk === 'profile' ? 'Tell us about your creator identity and details' :
               activeChunk === 'connections' ? 'Manage your follower count, response time, and content boundaries' :
               activeChunk === 'security' ? 'Update your payout details and account security' :
               'Review your KYC identity verification details and status'}
            </p>
          </div>

          {/* Form Tabs Content */}
          <AnimatePresence mode="wait">
            {activeChunk === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                {/* Profile Avatar upload */}
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-6 border-b border-gray-100">
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm relative z-10">
                      {formData.profilePicture ? (
                        <img src={formData.profilePicture} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <User size={32} className="text-gray-300" />
                      )}
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-sm font-bold text-gray-900">Profile Avatar</h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm">JPG or PNG under 5MB. Recommendation: 500x500px square.</p>
                    <label className="inline-flex items-center gap-2 mt-3 bg-[#EA580C] hover:bg-[#d94e08] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:shadow-md">
                      <UploadCloud size={14} /> {isUploading ? 'Uploading...' : 'Upload'}
                      <input type="file" className="hidden" accept="image/*" onChange={onUploadAvatar} disabled={isUploading} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Display Name */}
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-xs font-bold text-gray-700 mb-2">Display Name <span className="text-red-500">*</span></label>
                    <input
                      id="displayName"
                      type="text"
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  {/* Niche */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-700 mb-2">Primary Niche <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        value={formData.niche || 'Tech'}
                        onChange={e => setFormData({ ...formData, niche: e.target.value })}
                        className="w-full bg-white border border-gray-200 focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl pl-4 pr-10 py-3 text-sm text-gray-900 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                      >
                        <option value="Tech">Tech</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Lifestyle">Lifestyle</option>
                        <option value="Food">Food</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Age */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      value={formData.age || ''}
                      onChange={e => setFormData({ ...formData, age: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
                      placeholder="e.g. 25"
                    />
                  </div>

                  {/* Base Location */}
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-xs font-bold text-gray-700 mb-2">Base Location <span className="text-red-500">*</span></label>
                    <input
                      id="baseLocation"
                      type="text"
                      value={formData.location || ''}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
                      placeholder="e.g. Mumbai, India"
                    />
                  </div>

                  {/* Bio */}
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-xs font-bold text-gray-700 mb-2">Professional Biography</label>
                    <textarea
                      rows="4"
                      value={formData.bio || ''}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all resize-none placeholder:text-gray-400 leading-relaxed shadow-sm"
                      placeholder="Tell brands about your creative journey, style, and what makes your content unique..."
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-8"></div>

                {/* Expertise & Portfolio Header */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Expertise & Portfolio</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Showcase your specialized fields and previous work samples.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Expertise Tags */}
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-xs font-bold text-gray-700 mb-2">Expertise Tags (comma separated)</label>
                    <input
                      type="text"
                      value={(formData.expertise || []).join(', ')}
                      onChange={e => setFormData({ ...formData, expertise: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full bg-white border border-gray-200 focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
                      placeholder="e.g. Video Editing, UI Design, Content Strategy"
                    />
                  </div>

                  {/* Portfolio URL */}
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-xs font-bold text-gray-700 mb-2">Work Portfolio URL</label>
                    <input
                      type="url"
                      value={formData.portfolioLink || ''}
                      onChange={e => setFormData({ ...formData, portfolioLink: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>

                  {/* Video Showcase */}
                  <div className="flex flex-col sm:col-span-2 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Video Showcase</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Upload high-quality videos of past brand partnerships (Max 80MB per video).</p>
                      </div>
                      <label className={`bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 group shrink-0 ${isVideoUploading ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}>
                        {isVideoUploading ? (
                          <>
                            <Loader2 size={14} className="animate-spin text-[#EA580C]" /> Uploading Video...
                          </>
                        ) : (
                          <>
                            <Plus size={14} className="group-hover:rotate-90 transition-transform" /> Upload Video (Max 80MB)
                          </>
                        )}
                        <input
                          type="file"
                          className="hidden"
                          accept="video/*"
                          disabled={isVideoUploading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setVideoUploadError('');
                            const MAX_VIDEO_SIZE = 80 * 1024 * 1024; // 80MB
                            if (file.size > MAX_VIDEO_SIZE) {
                              setVideoUploadError(`Video file exceeds 80MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a video under 80MB.`);
                              e.target.value = '';
                              return;
                            }

                            const fileData = new FormData();
                            fileData.append("video", file);
                            setIsVideoUploading(true);

                            try {
                              const res = await axios.post("/creators/portfolio-video", fileData, { headers: { "Content-Type": "multipart/form-data" } });
                              const videoUrl = res.data.url && res.data.url.includes('ik.imagekit.io') && !/\.(mp4|webm|mov|mkv|m4v)($|\?)/i.test(res.data.url) && !res.data.url.endsWith('/ik-video.mp4')
                                ? `${res.data.url.replace(/\/?$/, '/ik-video.mp4')}`
                                : res.data.url;
                              const newList = [...(formData.portfolioVideos || []), { url: videoUrl, fileId: res.data.fileId, title: 'Untitled Work' }];
                              setFormData({ ...formData, portfolioVideos: newList });
                            } catch (err) {
                              console.error('Video upload error:', err);
                              setVideoUploadError(err.response?.data?.message || 'Failed to upload video. Please ensure file is within 80MB and try again.');
                            } finally {
                              setIsVideoUploading(false);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </div>

                    {videoUploadError && (
                      <div className="mb-4 flex items-center justify-between gap-2 p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-200">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={15} className="shrink-0 text-red-500" />
                          <span>{videoUploadError}</span>
                        </div>
                        <button type="button" onClick={() => setVideoUploadError('')} className="text-red-400 hover:text-red-700">
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 pt-1">
                      {formData.portfolioVideos?.map((video, idx) => {
                        const videoSrc = video.url && video.url.includes('ik.imagekit.io') && !/\.(mp4|webm|mov|mkv|m4v)($|\?)/i.test(video.url) && !video.url.endsWith('/ik-video.mp4')
                          ? `${video.url.replace(/\/?$/, '/ik-video.mp4')}`
                          : video.url;
                        return (
                        <div key={video.fileId || idx} className="min-w-[200px] w-[200px] aspect-[4/5] bg-gray-100 rounded-xl relative overflow-hidden group shadow-sm border border-gray-200">
                          <video src={videoSrc} className="w-full h-full object-cover" muted />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <input
                              type="text"
                              value={video.title}
                              onChange={(e) => {
                                const newList = [...formData.portfolioVideos];
                                newList[idx].title = e.target.value;
                                setFormData({ ...formData, portfolioVideos: newList });
                              }}
                              className="bg-transparent text-white font-bold text-sm tracking-tight outline-none border-b border-white/20 mb-3 pb-1 focus:border-white w-full transition-colors"
                            />
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await axios.delete(`/creators/portfolio-video/${video.fileId}`);
                                  setFormData({ ...formData, portfolioVideos: formData.portfolioVideos.filter(v => v.fileId !== video.fileId) });
                                } catch (err) { }
                              }}
                              className="text-red-400 hover:text-red-300 text-[10px] font-bold text-left transition-colors uppercase tracking-wider flex items-center gap-1.5 bg-white/10 w-fit px-2.5 py-1.5 rounded-lg backdrop-blur-md"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                      {(!formData.portfolioVideos || formData.portfolioVideos.length === 0) && (
                        <div className="w-full border border-dashed border-gray-200 rounded-2xl bg-white flex flex-col items-center justify-center py-10 gap-2 text-center">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                            <Film size={20} className="text-gray-400" />
                          </div>
                          <h5 className="text-xs font-bold text-gray-900">No showcase videos</h5>
                          <p className="text-[11px] text-gray-400 max-w-xs px-4">Demonstrate past collaborations to boost brand conversion.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeChunk === 'connections' && (
              <motion.div
                key="connections"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  {/* Follower Count */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-700 mb-2">Total Audience (Followers)</label>
                    <div className="relative">
                      <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="number"
                        value={formData.followerCount || ''}
                        onChange={e => setFormData({ ...formData, followerCount: e.target.value })}
                        className="w-full bg-white border border-gray-200 focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Avg Response Time */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-700 mb-2">Average Response Time</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <select
                        value={formData.responseTime || '< 24h'}
                        onChange={e => setFormData({ ...formData, responseTime: e.target.value })}
                        className="w-full bg-white border border-gray-200 focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl pl-10 pr-10 py-3 text-sm text-gray-900 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                      >
                        <option value="< 24h">&lt; 24h</option>
                        <option value="1-2 days">1-2 days</option>
                        <option value="3+ days">3+ days</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Content Boundaries */}
                <div className="border-t border-gray-100 pt-8 mt-2 mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Content Boundaries</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Filter out deal categories that do not align with your brand values.</p>
                </div>

                <div className="flex flex-col gap-2 max-w-2xl">
                  <label className="text-xs font-bold text-gray-700">"Will Not Promote" Tags (comma separated)</label>
                  <input
                    type="text"
                    value={willNotPromote.join(', ')}
                    onChange={e => setWillNotPromote(e.target.value.split(',').map(s => s.trim()))}
                    className="w-full bg-white border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-red-300 shadow-sm"
                    placeholder="e.g. Gambling, Alcohol, Adult Content"
                  />
                </div>
              </motion.div>
            )}

            {activeChunk === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                {/* Shipping Address */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Shipping Address</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Provide direct shipping destination for PR packages and product samples.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  {/* Street Address */}
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-xs font-bold text-gray-700 mb-2">Street Address</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={shippingAddress.street}
                        onChange={e => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                        className="w-full bg-white border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 outline-none transition-all shadow-sm"
                        placeholder="e.g. 123 Creator Ave, Apt 4B"
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all shadow-sm"
                      placeholder="e.g. Mumbai"
                    />
                  </div>

                  {/* State */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-700 mb-2">State / Region</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={e => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all shadow-sm"
                      placeholder="e.g. Maharashtra"
                    />
                  </div>

                  {/* ZIP */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-700 mb-2">ZIP / Postal Code</label>
                    <input
                      type="text"
                      value={shippingAddress.zip}
                      onChange={e => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all shadow-sm"
                      placeholder="e.g. 400001"
                    />
                  </div>

                  {/* Country */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={shippingAddress.country}
                      onChange={e => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all shadow-sm"
                      placeholder="e.g. India"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-8"></div>

                {/* Security & Password */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Security & Credentials</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Manage secure login access credentials and two-factor authentication.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 max-w-3xl">
                  {/* Current Password */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={securityData.currentPassword}
                      onChange={e => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all shadow-sm tracking-widest"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="hidden sm:block"></div>

                  {/* New Password */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={securityData.newPassword}
                      onChange={e => setSecurityData({ ...securityData, newPassword: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all shadow-sm tracking-widest"
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Confirm New Password */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={e => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all shadow-sm tracking-widest"
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Password Feedback & Action */}
                  <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
                    {passwordMsg.text ? (
                      <div className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 ${
                        passwordMsg.type === 'success' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {passwordMsg.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                        {passwordMsg.text}
                      </div>
                    ) : <div />}
                    <button
                      type="button"
                      onClick={handlePasswordChange}
                      disabled={passwordLoading}
                      className="w-fit bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-8"></div>

                {/* Danger Zone */}
                <div className="border border-red-200 bg-red-50/20 rounded-2xl p-6 flex flex-col gap-3">
                  <h4 className="text-sm font-bold text-red-600 flex items-center gap-1.5"><ShieldAlert size={16} /> Danger Zone</h4>
                  <p className="text-xs text-red-500 leading-relaxed max-w-xl">Irreversible actions. Deactivating your account immediately cancels active campaign applications and hides your creator profile from all brand searches.</p>
                  <button
                    type="button"
                    onClick={() => alert('Account deactivation simulated.')}
                    className="bg-white border border-red-200 text-red-600 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm w-fit mt-2"
                  >
                    Deactivate Account
                  </button>
                </div>
              </motion.div>
            )}

            {activeChunk === 'kyc' && (
              <motion.div
                key="kyc"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Verification & KYC Profile</h3>
                  <p className="text-xs text-gray-400 mt-0.5">View and update your Know Your Customer identity verification documents.</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
                  {user?.kycStatus === 'APPROVED' ? (
                    <div className="flex flex-col gap-4">
                      <div>
                        <span className="text-xs font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 flex items-center gap-1.5 w-fit">
                          🟢 Verified Creator Account
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex flex-col gap-2 mt-2">
                        <p><span className="font-bold text-gray-800">Verification ID:</span> {profile?.kycProfile?.verificationId || `KYC-${(user?._id || user?.id || 'CREATOR').slice(-8).toUpperCase()}`}</p>
                        <p><span className="font-bold text-gray-800">Verified Date:</span> {profile?.kycProfile?.approvedAt ? new Date(profile.kycProfile.approvedAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  ) : user?.kycStatus === 'PENDING' || user?.kycStatus === 'UNDER_REVIEW' ? (
                    <div className="flex flex-col gap-4">
                      <div>
                        <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 flex items-center gap-1.5 w-fit">
                          🟡 Verification In Progress
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed font-bold">
                        Estimated Review Time: <span className="text-gray-900">24 Hours</span>.
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Our compliance agents are currently reviewing your submitted identity papers and selfie matching profile verification.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsKycModalOpen(true)}
                        className="w-fit bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-widest px-5 py-3 rounded-xl transition-all shadow-md active:scale-95"
                      >
                        Check Status
                      </button>
                    </div>
                  ) : (
                    /* In-place KYC Application / Reapplication Form for REJECTED or UNVERIFIED */
                    <div className="flex flex-col gap-6">
                      {user?.kycStatus === 'REJECTED' ? (
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 flex items-center gap-1.5 w-fit">
                            🔴 KYC Verification Rejected
                          </span>
                          <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
                            Rejection Reason: {user?.rejectionReason || 'Uploaded identity documents are not clearly visible or do not match your profile details. Please reapply below.'}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5 w-fit">
                            ⚪ Identity Status: Unverified
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Complete Aadhaar verification below to unlock campaign applications and secure payments.
                          </p>
                        </div>
                      )}

                      {/* Success / Error Banners */}
                      {kycSuccess && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                          <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                          <span>{kycSuccess}</span>
                        </div>
                      )}

                      {kycError && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                          <AlertTriangle size={16} className="text-red-500 shrink-0" />
                          <span>{kycError}</span>
                        </div>
                      )}

                      {/* In-Place KYC Submission Form */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-5">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <ShieldCheck size={16} className="text-[#EA580C]" /> Government Identity Verification
                          </h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md">
                            UIDAI / Aadhaar
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Mobile Number */}
                          <div className="flex flex-col">
                            <label className="text-xs font-bold text-gray-700 mb-1.5">
                              Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              value={kycPhone}
                              onChange={e => setKycPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              placeholder="10-digit mobile number"
                              className="w-full bg-gray-50/50 border border-gray-200 focus:bg-white focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
                            />
                          </div>

                          {/* Aadhaar Number */}
                          <div className="flex flex-col">
                            <label className="text-xs font-bold text-gray-700 mb-1.5">
                              Aadhaar Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={kycAadhaar}
                              onChange={e => setKycAadhaar(formatAadhaar(e.target.value))}
                              placeholder="XXXX XXXX XXXX"
                              className="w-full bg-gray-50/50 border border-gray-200 focus:bg-white focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm tracking-wider"
                            />
                          </div>

                          {/* Instagram Profile Link */}
                          <div className="flex flex-col sm:col-span-2">
                            <label className="text-xs font-bold text-gray-700 mb-1.5">
                              Instagram Profile URL <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="url"
                              value={kycInstagram}
                              onChange={e => setKycInstagram(e.target.value)}
                              placeholder="https://instagram.com/yourhandle"
                              className="w-full bg-gray-50/50 border border-gray-200 focus:bg-white focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
                            />
                          </div>

                          {/* Document Upload */}
                          <div className="flex flex-col sm:col-span-2">
                            <label className="text-xs font-bold text-gray-700 mb-1.5">
                              Upload Aadhaar Document (PDF / Image) <span className="text-red-500">*</span>
                            </label>
                            <label className="border-2 border-dashed border-gray-200 hover:border-[#EA580C] rounded-2xl p-6 bg-gray-50/30 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-orange-50/20 group text-center">
                              <UploadCloud size={28} className="text-gray-400 group-hover:text-[#EA580C] transition-colors mb-2" />
                              {kycDocument ? (
                                <div className="flex flex-col items-center">
                                  <span className="text-xs font-bold text-gray-900">{kycDocument.name}</span>
                                  <span className="text-[10px] text-gray-400 mt-0.5">{(kycDocument.size / (1024 * 1024)).toFixed(2)} MB • Click to replace</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <span className="text-xs font-bold text-gray-700">Click to upload Aadhaar card copy</span>
                                  <span className="text-[10px] text-gray-400 mt-0.5">JPEG, PNG or PDF up to 10MB</span>
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleKycFileChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Submit Action Button */}
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={handleKycSubmit}
                            disabled={kycLoading}
                            className="bg-[#EA580C] hover:bg-[#d94e08] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {kycLoading ? 'Submitting Application...' : (user?.kycStatus === 'REJECTED' ? 'Resubmit Verification' : 'Submit for Verification')}
                            <Check size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wizard Footer Controls */}
        <div className="flex justify-between items-center px-1">
          {/* Left: Previous Step Button */}
          <button
            type="button"
            onClick={handleBack}
            disabled={activeChunk === 'profile'}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500 transition-all ${
              activeChunk === 'profile'
                ? 'opacity-40 cursor-not-allowed bg-gray-50'
                : 'bg-white hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 active:scale-98 shadow-sm'
            }`}
          >
            <ChevronLeft size={14} strokeWidth={2.5} /> Previous
          </button>

          {/* Right: Next Step / Action Buttons */}
          <div className="flex items-center gap-3">
            {activeChunk !== 'kyc' ? (
              <>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'} <Check size={14} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 bg-[#EA580C] hover:bg-[#d94e08] text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow active:scale-98 group"
                >
                  Next <ChevronRight size={14} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(profile);
                    setActiveChunk('profile');
                  }}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 bg-white hover:bg-gray-50 transition-all shadow-sm hover:shadow"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#EA580C] hover:bg-[#d94e08] text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'} <Check size={14} strokeWidth={2.5} />
                </button>
              </>
            )}
          </div>
        </div>
      </form>

      {/* KYC Verification Pop-up Modal */}
      <KycRequiredModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        kycStatus={user?.kycStatus}
      />
    </motion.div>
  );
};


export default CreatorSettings;
