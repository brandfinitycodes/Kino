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
  Calendar, FileSignature, Video, Filter
} from "lucide-react";
import ChatOverlay from "../ChatOverlay";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAuth } from "../../context/AuthContext";

export const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;
  let score = 0;
  if (profile.bio) score += 15;
  if (profile.niche && profile.niche !== 'Other') score += 15;
  if (profile.profilePicture) score += 15;
  if (profile.instagramProfile?.connected) score += 20;
  if (profile.expertise && profile.expertise.length > 0) score += 15;
  if (profile.pricing?.basic?.price > 0 || profile.pricing?.standard?.price > 0 || profile.pricing?.premium?.price > 0) score += 10;
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
  const { user } = useAuth();
  const [formData, setFormData] = useState(profile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payoutEmail, setPayoutEmail] = useState(profile?.payoutEmail || 'creator@example.com');
  const [taxId, setTaxId] = useState('');
  const [notifications, setNotifications] = useState({ email: true, sms: false, weeklyReport: true });
  const [isConnecting, setIsConnecting] = useState(null);
  const [isGeneratingKit, setIsGeneratingKit] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Sub-tab Navigation state
  const [activeChunk, setActiveChunk] = useState('profile');

  // New Sections State
  const [shippingAddress, setShippingAddress] = useState({ street: '', city: '', state: '', zip: '', country: '' });
  const [demographics, setDemographics] = useState({ topCountries: '', genderSplit: '', ageRange: '' });
  const [willNotPromote, setWillNotPromote] = useState([]);
  const [securityData, setSecurityData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '', twoFactorEnabled: false });

  // Linking Social Modal State
  const [linkModal, setLinkModal] = useState({
    isOpen: false,
    platform: '',
    step: 'username',
    username: '',
    followers: 0
  });

  const openLinkModal = (platform) => {
    setLinkModal({
      isOpen: true,
      platform,
      step: 'username',
      username: '',
      followers: 0
    });
  };

  const closeLinkModal = () => {
    setLinkModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (!linkModal.username.trim()) return;

    if (linkModal.platform === 'instagram') {
      setLinkModal(prev => ({ ...prev, step: 'loading' }));
      const width = 500;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      window.open(
        `/instagram-oauth?username=${encodeURIComponent(linkModal.username)}`,
        'Instagram Authorization',
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
      );
    } else {
      let platformFollowers = 0;
      if (linkModal.platform === 'tiktok') {
        platformFollowers = 0;
      } else if (linkModal.platform === 'youtube') {
        platformFollowers = 0;
      }

      setLinkModal(prev => ({
        ...prev,
        step: 'oauth',
        followers: platformFollowers
      }));
    }
  };

  const handleAuthorize = () => {
    setLinkModal(prev => ({ ...prev, step: 'loading' }));

    setTimeout(() => {
      const cleanHandle = linkModal.username.startsWith('@') ? linkModal.username : `@${linkModal.username}`;
      const newLink = {
        platform: linkModal.platform,
        handle: cleanHandle,
        url: `https://${linkModal.platform}.com/${cleanHandle.replace('@', '')}`
      };

      const currentLinks = formData.socialLinks || [];
      const updatedLinks = [...currentLinks.filter(l => l.platform !== linkModal.platform), newLink];
      const totalFollowers = Number(formData.followerCount || 0) + linkModal.followers;

      const updated = {
        ...formData,
        socialLinks: updatedLinks,
        followerCount: totalFollowers
      };

      setFormData(updated);
      if (onSave) onSave(updated);

      setLinkModal(prev => ({
        ...prev,
        step: 'success'
      }));
    }, 2000);
  };

  const handleDisconnect = async (platform) => {
    if (platform === 'instagram') {
      try {
        const res = await axios.post('/instagram/disconnect');
        setFormData(res.data);
        if (onSave) onSave(res.data);
      } catch (err) {
        console.error('Failed to disconnect Instagram:', err);
      }
    } else {
      const currentLinks = formData.socialLinks || [];
      const updatedLinks = currentLinks.filter(l => l.platform !== platform);

      let deduction = 25000;
      if (platform === 'tiktok') deduction = 60000;
      else if (platform === 'youtube') deduction = 15000;

      const currentFollowers = Number(formData.followerCount || 0);
      const newFollowers = Math.max(0, currentFollowers - deduction);

      const updated = {
        ...formData,
        socialLinks: updatedLinks,
        followerCount: newFollowers
      };

      setFormData(updated);
      if (onSave) onSave(updated);
    }
  };

  const handleGenerateMediaKit = () => {
    setIsGeneratingKit(true);
    setTimeout(() => {
      setIsGeneratingKit(false);
      alert('Media Kit PDF Generated successfully!');
    }, 2500);
  };

  useEffect(() => {
    const handleOauthMessage = (event) => {
      if (event.data.type === 'INSTAGRAM_AUTH_SUCCESS') {
        const updatedProfile = event.data.profile;
        setFormData(updatedProfile);
        setLinkModal(prev => ({
          ...prev,
          step: 'success',
          followers: updatedProfile.instagramProfile?.followers || 85200
        }));
        if (onSave) {
          onSave(updatedProfile);
        }
      } else if (event.data.type === 'INSTAGRAM_AUTH_CANCEL') {
        closeLinkModal();
      }
    };

    window.addEventListener('message', handleOauthMessage);
    return () => window.removeEventListener('message', handleOauthMessage);
  }, [onSave]);

  useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        socialLinks: profile.socialLinks || []
      });
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
    await onSave({ ...formData, shippingAddress, demographics, willNotPromote });
    setIsSubmitting(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
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
      setActiveChunk('pricing');
    } else if (activeChunk === 'pricing') {
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
    if (activeChunk === 'pricing') {
      setActiveChunk('profile');
    } else if (activeChunk === 'connections') {
      setActiveChunk('pricing');
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

      {/* Toast Notification */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-800"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle size={16} />
            </div>
            <div>
              <p className="text-[13px] font-bold">Profile Updated</p>
              <p className="text-[11px] text-gray-400">Your changes have been saved successfully.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Creator Settings</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Update your profile details, connections, and platform preferences.</p>
      </div>

      {/* Sequential Step Indicator */}
      <div className="relative flex items-center justify-between w-full max-w-xl mx-auto mb-10 mt-6 px-4">
        {/* Progress bar line background */}
        <div className="absolute top-1/2 left-8 right-8 h-[2px] bg-gray-200 -translate-y-1/2 z-0">
          <div
            className="h-full bg-[#EA580C] transition-all duration-500 ease-out"
            style={{
              width:
                activeChunk === 'profile' ? '20%' :
                activeChunk === 'pricing' ? '40%' :
                activeChunk === 'connections' ? '60%' :
                activeChunk === 'security' ? '80%' : '100%'
            }}
          />
        </div>

        {/* Step Circles */}
        {[
          { id: 'profile', step: 1 },
          { id: 'pricing', step: 2 },
          { id: 'connections', step: 3 },
          { id: 'security', step: 4 },
          { id: 'kyc', step: 5 }
        ].map((node, index) => {
          const isCurrent = activeChunk === node.id;
          const isCompleted =
            (activeChunk === 'pricing' && index < 1) ||
            (activeChunk === 'connections' && index < 2) ||
            (activeChunk === 'security' && index < 3) ||
            (activeChunk === 'kyc' && index < 4);

          const isActiveOrCompleted = isCurrent || isCompleted;

          return (
            <div key={node.id} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  if (isCompleted || isCurrent) {
                    setActiveChunk(node.id);
                  } else {
                    if (validateStep(activeChunk)) {
                      const currentIndex = ['profile', 'pricing', 'connections', 'security', 'kyc'].indexOf(activeChunk);
                      if (index <= currentIndex + 1) {
                        setActiveChunk(node.id);
                      }
                    }
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
               activeChunk === 'pricing' ? 'Pricing & Packages' :
               activeChunk === 'connections' ? 'Social Connections' :
               activeChunk === 'security' ? 'Account Security' :
               'Identity Verification (KYC)'}
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {activeChunk === 'profile' ? 'Tell us about your creator identity and details' :
               activeChunk === 'pricing' ? 'Set rates and deliverables for your packages' :
               activeChunk === 'connections' ? 'Connect your channels to verify metrics' :
               activeChunk === 'security' ? 'Manage notification preferences and security settings' :
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
                        <p className="text-xs text-gray-400 mt-0.5">Upload high-quality videos of past brand partnerships.</p>
                      </div>
                      <label className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-sm flex items-center justify-center gap-1.5 group shrink-0">
                        <Plus size={14} className="group-hover:rotate-90 transition-transform" /> Upload Video
                        <input
                          type="file"
                          className="hidden"
                          accept="video/*"
                          onChange={async (e) => {
                            if (!e.target.files[0]) return;
                            const fileData = new FormData();
                            fileData.append("video", e.target.files[0]);
                            try {
                              const res = await axios.post("/creators/portfolio-video", fileData, { headers: { "Content-Type": "multipart/form-data" } });
                              const newList = [...(formData.portfolioVideos || []), { url: res.data.url, fileId: res.data.fileId, title: 'Untitled Work' }];
                              setFormData({ ...formData, portfolioVideos: newList });
                            } catch (err) { console.error(err); }
                          }}
                        />
                      </label>
                    </div>

                    <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 pt-1">
                      {formData.portfolioVideos?.map((video, idx) => (
                        <div key={video.fileId} className="min-w-[200px] w-[200px] aspect-[4/5] bg-gray-100 rounded-xl relative overflow-hidden group shadow-sm border border-gray-200">
                          <video src={video.url} className="w-full h-full object-cover" muted />
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
                      ))}
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

                {/* Divider */}
                <div className="border-t border-gray-100 my-8"></div>

                {/* Audience Demographics Header */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Audience Demographics</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Define core segments of your audience.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Top Countries */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-700 mb-2">Top Countries</label>
                    <input
                      type="text"
                      value={demographics.topCountries}
                      onChange={e => setDemographics({ ...demographics, topCountries: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
                      placeholder="e.g. US 45%, UK 20%"
                    />
                  </div>

                  {/* Gender Split */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-700 mb-2">Gender Split</label>
                    <input
                      type="text"
                      value={demographics.genderSplit}
                      onChange={e => setDemographics({ ...demographics, genderSplit: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
                      placeholder="e.g. 60% F / 40% M"
                    />
                  </div>

                  {/* Top Age Range */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-700 mb-2">Top Age Range</label>
                    <input
                      type="text"
                      value={demographics.ageRange}
                      onChange={e => setDemographics({ ...demographics, ageRange: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
                      placeholder="e.g. 18-24"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeChunk === 'pricing' && (
              <motion.div
                key="pricing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[
                    { id: 'basic', title: 'Basic Tier', color: 'orange', text: 'text-orange-500', bg: 'bg-orange-50/30', border: 'border-orange-100/60' },
                    { id: 'standard', title: 'Standard Tier', color: 'pink', text: 'text-pink-500', bg: 'bg-pink-50/20', border: 'border-pink-100/50' },
                    { id: 'premium', title: 'Premium Tier', color: 'purple', text: 'text-purple-500', bg: 'bg-purple-50/20', border: 'border-purple-100/50' }
                  ].map(tier => (
                    <div key={tier.id} className={`${tier.bg} border ${tier.border} rounded-2xl p-6 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all`}>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-wider text-gray-800">{tier.title}</span>
                        <span className={`${tier.text}`}><TrendingUp size={16} /></span>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">🪙</span>
                          <input
                            type="number"
                            placeholder="Rate"
                            value={formData.pricing?.[tier.id]?.price || ''}
                            onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing, [tier.id]: { ...formData.pricing?.[tier.id], price: e.target.value } } })}
                            className="w-full bg-white border border-gray-200 focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl pl-8 pr-4 py-2.5 text-sm font-semibold text-gray-900 outline-none transition-all shadow-sm"
                          />
                        </div>
                        <textarea
                          rows="4"
                          placeholder="What is included (e.g. 1 Instagram Post, 1 Story)"
                          value={formData.pricing?.[tier.id]?.description || ''}
                          onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing, [tier.id]: { ...formData.pricing?.[tier.id], description: e.target.value } } })}
                          className="w-full bg-white border border-gray-200 focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl px-4 py-3 text-xs font-medium text-gray-700 outline-none transition-all resize-none leading-relaxed shadow-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-8"></div>

                {/* Content Boundaries */}
                <div className="mb-6">
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

                {/* Divider */}
                <div className="border-t border-gray-100 my-8"></div>

                {/* Social Integrations */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Connected Accounts</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Integrate platforms to automatically verify your follower metrics.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  {[
                    { id: 'instagram', name: 'Instagram', border: 'border-pink-100 hover:border-pink-200', bg: 'bg-pink-50/10', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#ig-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="ig-grad" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stopColor="#feda75" /><stop offset="25%" stopColor="#fa7e1e" /><stop offset="50%" stopColor="#d62976" /><stop offset="75%" stopColor="#962fbf" /><stop offset="100%" stopColor="#4f5bd5" /></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> },
                    { id: 'tiktok', name: 'TikTok', border: 'border-gray-200 hover:border-gray-300', bg: 'bg-gray-50/50', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg> },
                    { id: 'youtube', name: 'YouTube', border: 'border-red-100 hover:border-red-200', bg: 'bg-red-50/10', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF0000]"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg> }
                  ].map(social => {
                    const connectedInfo = formData.socialLinks?.find(s => s.platform === social.id);
                    const isLinked = !!connectedInfo;

                    return (
                      <div key={social.id} className={`${social.bg} border ${social.border} rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 transition-all`}>
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
                          {social.icon}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-900">{social.name}</div>
                          {isLinked && (
                            <span className="text-xs text-gray-400 font-medium block mt-0.5">{connectedInfo.handle}</span>
                          )}
                        </div>
                        {isLinked ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Connected
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDisconnect(social.id)}
                              className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors mt-2"
                            >
                              Disconnect
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openLinkModal(social.id)}
                            className="text-[10px] font-bold uppercase tracking-wider text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-8"></div>

                {/* Payout Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Payout Details</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Setup direct payout channels for earnings settlement.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Payout Email */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-700 mb-2">Payout Email (Stripe / PayPal)</label>
                    <div className="relative">
                      <Wallet size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="email"
                        value={payoutEmail}
                        onChange={e => setPayoutEmail(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 outline-none transition-all shadow-sm"
                        placeholder="creator@example.com"
                      />
                    </div>
                  </div>

                  {/* Tax ID */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-700 mb-2">Tax ID / SSN (Encrypted)</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="password"
                        value={taxId}
                        onChange={e => setTaxId(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100/50 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 outline-none transition-all shadow-sm tracking-wider"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
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
                {/* Notification Preferences */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Control channel delivery options for campaign updates.</p>
                </div>

                <div className="flex flex-col gap-4 max-w-2xl mb-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  {[
                    { id: 'email', label: 'Email Notifications', desc: 'Daily briefs, brand offers and payout confirmations.' },
                    { id: 'sms', label: 'SMS Instant Deal Alerts', desc: 'Receive instant mobile messages when deals are offered.' },
                    { id: 'weeklyReport', label: 'Weekly Performance Report', desc: 'Summary of analytics, reach expansion and payouts.' }
                  ].map(notif => (
                    <div key={notif.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{notif.label}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">{notif.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications(prev => ({ ...prev, [notif.id]: !prev[notif.id] }))}
                        className={`relative w-12 h-6.5 rounded-full transition-colors duration-300 ${notifications[notif.id] ? 'bg-emerald-500' : 'bg-gray-200'}`}
                      >
                        <motion.div
                          layout
                          initial={false}
                          animate={{ x: notifications[notif.id] ? 22 : 2 }}
                          className="w-5 h-5 bg-white rounded-full shadow absolute top-0.5"
                        />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-8"></div>

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

                  {/* 2FA Toggle */}
                  <div className="sm:col-span-2 bg-blue-50/30 border border-blue-100/50 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><ShieldCheck size={16} className="text-blue-500" /> Two-Factor Authentication</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Reinforce account access security by requiring dynamic code entry.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSecurityData(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                      className={`relative w-12 h-6.5 rounded-full transition-colors duration-300 ${securityData.twoFactorEnabled ? 'bg-blue-500' : 'bg-gray-200'}`}
                    >
                      <motion.div
                        layout
                        initial={false}
                        animate={{ x: securityData.twoFactorEnabled ? 22 : 2 }}
                        className="w-5 h-5 bg-white rounded-full shadow absolute top-0.5"
                      />
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
                        <p><span className="font-bold text-gray-800">Verification ID:</span> {profile?.kycProfile?.verificationId || `KYC-${user.id.substring(user.id.length - 8).toUpperCase()}`}</p>
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
                    </div>
                  ) : user?.kycStatus === 'REJECTED' ? (
                    <div className="flex flex-col gap-4">
                      <div>
                        <span className="text-xs font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 flex items-center gap-1.5 w-fit">
                          🔴 KYC Verification Rejected
                        </span>
                      </div>
                      <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
                        Rejection Reason: {user?.rejectionReason || 'Uploaded identity documents are not clearly visible or do not match your profile details.'}
                      </div>
                      <Link 
                        to="/kyc-verification"
                        className="w-fit bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-widest px-5 py-3 rounded-xl transition-all shadow-md active:scale-95"
                      >
                        Resubmit Verification
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div>
                        <span className="text-xs font-black text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 flex items-center gap-1.5 w-fit">
                          ⚪ Identity Status: Unverified
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed max-w-lg font-medium">
                        Verify your identity to lock in brand campaign applications, Secure Payments direct payments, and start messaging brands.
                      </p>
                      <Link 
                        to="/kyc-onboarding"
                        className="w-fit bg-[#EA580C] hover:bg-[#d94e08] text-white font-bold text-[10px] uppercase tracking-widest px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 text-center"
                      >
                        Complete Verification
                      </Link>
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
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 bg-[#EA580C] hover:bg-[#d94e08] text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow active:scale-98 group"
              >
                Next <ChevronRight size={14} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
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

      {/* 13. Social Authentication Modal (OAuth Flow) */}
      <AnimatePresence>
        {linkModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLinkModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl border border-white relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeLinkModal}
                className="absolute top-6 right-6 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all shadow-sm z-[160]"
              >
                <X size={18} />
              </button>

              {/* Platform branding headers */}
              {linkModal.platform === 'instagram' && (
                <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-8 pt-12 text-white flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="url(#ig-grad-modal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="ig-grad-modal" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stopColor="#feda75" /><stop offset="25%" stopColor="#fa7e1e" /><stop offset="50%" stopColor="#d62976" /><stop offset="75%" stopColor="#962fbf" /><stop offset="100%" stopColor="#4f5bd5" /></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </div>
                  <h3 className="font-display font-black text-xl tracking-tight uppercase">Link Instagram</h3>
                  <p className="text-white/80 text-[12px] font-medium tracking-wide">Secure connection via Instagram Graph API</p>
                </div>
              )}

              {linkModal.platform === 'tiktok' && (
                <div className="bg-black p-8 pt-12 text-white flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                  </div>
                  <h3 className="font-display font-black text-xl tracking-tight uppercase">Link TikTok</h3>
                  <p className="text-white/70 text-[12px] font-medium tracking-wide font-sans">Secure authentication via TikTok for Creators</p>
                </div>
              )}

              {linkModal.platform === 'youtube' && (
                <div className="bg-[#FF0000] p-8 pt-12 text-white flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF0000]"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                  </div>
                  <h3 className="font-display font-black text-xl tracking-tight uppercase">Link YouTube</h3>
                  <p className="text-white/80 text-[12px] font-medium tracking-wide">Secure connection via Google API OAuth</p>
                </div>
              )}

              {/* Step 1: Input username */}
              {linkModal.step === 'username' && (
                <div className="p-8 flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Social Media Handle / Username</label>
                    <input
                      required
                      autoFocus
                      type="text"
                      placeholder="@username"
                      value={linkModal.username}
                      onChange={e => setLinkModal(prev => ({ ...prev, username: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleUsernameSubmit(e);
                      }}
                      className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-500/10 rounded-[20px] px-6 py-4.5 text-[15px] font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                    />
                  </div>
                  <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
                    We will fetch and verify your public follower counts, engagement stats, and metrics.
                  </p>
                  <button
                    type="button"
                    onClick={handleUsernameSubmit}
                    className="w-full py-4.5 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all shadow-md active:scale-98"
                  >
                    Authenticate Account
                  </button>
                </div>
              )}

              {/* Step 2: OAuth Consent Screen */}
              {linkModal.step === 'oauth' && (
                <div className="p-8 flex flex-col gap-6">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4">
                    <h4 className="font-black text-gray-900 text-sm">Permissions Requested:</h4>
                    <ul className="text-xs text-gray-600 space-y-2.5">
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-500 font-bold">✓</span> Read public profile info (name, handle, avatar)
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-500 font-bold">✓</span> Verify audience size and follower analytics
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-500 font-bold">✓</span> Import recent posts and engagement metrics
                      </li>
                    </ul>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                    By clicking Authorize, you agree to allow Elevate Pulse to sync your social credentials. You can revoke access at any time.
                  </p>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={closeLinkModal}
                      className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border border-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAuthorize}
                      className="flex-1 py-4 bg-gradient-to-r from-[#EA580C] to-[#eb4898] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md active:scale-98"
                    >
                      Authorize App
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Loading transition */}
              {linkModal.step === 'loading' && (
                <div className="p-12 flex flex-col items-center justify-center gap-6">
                  <div className="w-16 h-16 border-4 border-[#EA580C]/20 border-t-[#EA580C] rounded-full animate-spin"></div>
                  <div className="text-center flex flex-col gap-1.5 animate-pulse">
                    <h4 className="text-gray-900 font-black text-sm uppercase tracking-wider">Establishing Connection</h4>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Retrieving metrics securely...</p>
                  </div>
                </div>
              )}

              {/* Step 4: Success message */}
              {linkModal.step === 'success' && (
                <div className="p-8 flex flex-col items-center justify-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-inner">
                    <Check size={28} strokeWidth={3} />
                  </div>
                  <div className="text-center">
                    <h4 className="text-gray-900 font-black text-lg">Account Linked!</h4>
                    <p className="text-xs text-gray-500 font-medium mt-2">
                      Successfully connected to <strong className="text-gray-900 font-bold">{linkModal.username.startsWith('@') ? linkModal.username : `@${linkModal.username}`}</strong>.
                    </p>
                    <div className="mt-4 bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest">
                      +{linkModal.followers.toLocaleString()} Followers Imported
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeLinkModal}
                    className="w-full py-4.5 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all shadow-md"
                  >
                    Return to Settings
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


export default CreatorSettings;
