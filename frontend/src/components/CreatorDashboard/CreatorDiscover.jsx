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

export const getPlaceholderImage = (niche) => {
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


const CreatorDiscover = ({ campaigns, applications, profile, onApply, setActiveTab }) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [budgetRange, setBudgetRange] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'budget', 'match'
  const [savedCampaigns, setSavedCampaigns] = useState({});

  const filters = ['All', 'Technology', 'Fashion', 'Gaming', 'Lifestyle', 'Fitness', 'Food'];

  const calculateMatchScore = (camp) => {
    if (!profile) return 0;
    let score = 55;
    if (camp.niche === profile.niche) score += 40;
    else if (camp.category === profile.category) score += 25;
    score += (camp.title?.length % 5);
    return Math.min(score, 99);
  };

  const filteredCampaigns = campaigns.filter(c => {
    const passCategory = activeFilter === 'All' || (c.niche || c.category) === activeFilter;
    const passBudget = budgetRange === 0 || (c.budget || 0) >= budgetRange;
    const hasPlatform = c.platforms && c.platforms.length > 0;
    const mockPlatform = c.title?.toLowerCase().includes('tiktok') ? 'TikTok' : (c.title?.toLowerCase().includes('youtube') ? 'YouTube' : 'Instagram');
    const campPlatforms = hasPlatform ? c.platforms : [mockPlatform];
    const passPlatform = selectedPlatform === 'All' || campPlatforms.includes(selectedPlatform);
    return passCategory && passBudget && passPlatform;
  }).sort((a, b) => {
    if (sortBy === 'budget') return (b.budget || 0) - (a.budget || 0);
    if (sortBy === 'match') return calculateMatchScore(b) - calculateMatchScore(a);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const topPicks = [...campaigns]
    .sort((a, b) => calculateMatchScore(b) - calculateMatchScore(a))
    .filter(c => calculateMatchScore(c) >= 85)
    .slice(0, 3);

  const toggleSave = (campId, e) => {
    e.stopPropagation();
    setSavedCampaigns(prev => ({ ...prev, [campId]: !prev[campId] }));
  };

  const renderCampaignCard = (camp, i, isTopPick = false) => {
    const hasApplied = applications.some(a => a.campaignId?._id === camp._id);
    const matchScore = calculateMatchScore(camp);
    const isSaved = savedCampaigns[camp._id];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
        key={camp._id || i}
        className={`group relative bg-white rounded-[32px] p-3 hover:bg-white transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(234,88,12,0.12)] border flex flex-col ${isTopPick ? 'border-orange-200 shadow-orange-100/50' : 'border-gray-100 hover:border-orange-100'} ${isTopPick ? 'min-w-[340px] max-w-[340px]' : ''}`}
      >
        {/* Premium Image Header */}
        <div className="relative h-60 w-full rounded-[24px] overflow-hidden mb-5 bg-gradient-to-br from-gray-100 to-gray-200">
          <img src={getPlaceholderImage(camp.niche || camp.category)} alt={camp.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100" />

          {/* Brand Logo Float */}
          <div className="absolute top-4 right-4 w-12 h-12 rounded-[14px] bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-lg overflow-hidden z-10 group-hover:-translate-y-1 transition-transform">
            {camp.brandId?.logo ? <img src={camp.brandId.logo} className="w-full h-full object-cover" /> : <Building2 size={20} className="text-white drop-shadow-md" />}
          </div>

          {/* Status/Match Badge Float with Tooltip */}
          {hasApplied ? (
            <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-md border border-emerald-400 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl z-10 flex items-center gap-1.5 shadow-lg">
              <CheckCircle size={12} /> Applied
            </div>
          ) : (
            <div className="group/tooltip absolute top-4 left-4 z-10">
              <div className="bg-gradient-to-r from-[#eb4898]/90 to-purple-500/90 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg cursor-help">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div> {matchScore}% Match
              </div>
              <div className="absolute top-full left-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-md text-white text-[10px] font-bold p-4 rounded-2xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-2xl z-20 border border-gray-700 leading-relaxed">
                Highly aligned with your niche ({camp.niche || camp.category}) and current engagement metrics.
              </div>
            </div>
          )}

          {/* Darker Cinematic Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

          {/* Budget on Image */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10">
            <div className="flex flex-col">
              <span className="text-[9px] text-white/70 uppercase tracking-[0.2em] font-black mb-1">Campaign Budget</span>
              <span className="text-3xl font-display font-black text-white flex items-center gap-2 drop-shadow-md"><Wallet size={20} className="text-[#eb4898]" /> 🪙{camp.budget?.toLocaleString() || '0'}</span>
            </div>
            {/* Save Bookmark */}
            <button
              onClick={(e) => toggleSave(camp._id, e)}
              className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg hover:scale-110 mb-1 ${isSaved ? 'bg-white text-[#EA580C]' : 'bg-white/20 text-white hover:bg-white hover:text-[#EA580C]'}`}
            >
              <Bookmark size={16} className={isSaved ? 'fill-current' : ''} />
            </button>
          </div>
        </div>

        {/* Premium Content */}
        <div className="px-3 pb-3 flex flex-col flex-1">
          <h4 className="text-[18px] font-black text-gray-900 tracking-tight mb-2 line-clamp-2 group-hover:text-[#EA580C] transition-colors leading-tight">{camp.title}</h4>

          <p className="text-[13px] text-gray-500 mb-5 line-clamp-2 leading-relaxed flex-1 font-medium">
            {camp.description}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100/50 flex flex-col justify-center">
              <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock size={10}/> Deadline</p>
              <p className="text-[13px] font-bold text-gray-900">3 Days Left</p>
            </div>
            <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100/50 flex flex-col justify-center">
              <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1 flex items-center gap-1"><User size={10}/> Competition</p>
              <p className="text-[13px] font-bold text-gray-900">12 Applied</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
               {camp.niche || 'Any Niche'}
            </span>
            {matchScore >= 85 && (
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-100 to-amber-100 text-[#EA580C] border border-orange-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                <Zap size={12} className="text-orange-500 fill-orange-500" /> Fast Track
              </span>
            )}
          </div>

          <div className="mt-auto">
          {hasApplied ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (setActiveTab) setActiveTab('applications');
                else navigate('/creator-dashboard?tab=applications');
              }}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[12px] font-black uppercase tracking-widest py-4 rounded-xl border border-emerald-200 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle size={14} /> View Application <ArrowUpRight size={14} />
            </button>
          ) : (
            <Link 
              to={`/campaigns/${camp._id}`} 
              className="relative overflow-hidden w-full bg-gradient-to-r from-[#EA580C] to-[#F59E0B] text-white text-[12px] font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_8px_20px_rgba(234,88,12,0.2)] hover:shadow-[0_15px_30px_rgba(234,88,12,0.3)] hover:-translate-y-0.5 group/btn flex items-center justify-center gap-2"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                View Details <ArrowUpRight size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out rounded-xl"></div>
            </Link>
          )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div {...ANIMATION_VARIANTS} className="pb-24 pt-4 px-4 md:px-0 relative z-10">

      {/* Premium Light Hero Banner */}
      <div className="mb-10 p-10 sm:p-14 rounded-[32px] bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 border border-white relative overflow-hidden group shadow-[0_20px_50px_rgba(234,88,12,0.05)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-200/40 to-rose-200/40 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-1000 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-200/40 to-yellow-200/40 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4 group-hover:scale-110 transition-transform duration-1000 pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 border border-white/80 backdrop-blur-md mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EA580C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EA580C]"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#EA580C]">Curated Opportunities</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-5xl sm:text-6xl lg:text-7xl font-display font-black leading-[1.05] tracking-tight mb-6 text-gray-900">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA580C] to-[#eb4898]">Premium Brands</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-lg text-gray-600 font-medium leading-relaxed max-w-lg">
            Connect with industry-leading brands and scale your creative journey with exclusive high-ticket campaigns.
          </motion.p>
        </div>
      </div>

      {/* Top Picks Carousel */}
      {topPicks.length > 0 && (
        <div className="mb-12 relative bg-gradient-to-b from-orange-50/50 to-transparent -mx-4 px-4 py-8 rounded-[40px] md:mx-0 md:px-8 border border-orange-50/50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl sm:text-3xl font-black font-display text-gray-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EA580C] to-[#eb4898] flex items-center justify-center shadow-lg">
                <Star className="text-white fill-white" size={20} /> 
              </div>
              Top Picks for You
            </h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#EA580C] bg-orange-100/50 px-4 py-2 rounded-xl border border-orange-200">High Match Score</span>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar snap-x">
            {topPicks.map((camp, i) => (
              <div key={camp._id || i} className="snap-start shrink-0">
                {renderCampaignCard(camp, i, true)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium Filter Pills & Advanced Toggle */}
      <div className="flex flex-col mb-12 bg-white/50 backdrop-blur-md p-4 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex gap-3 overflow-x-auto hide-scrollbar w-full lg:w-auto pb-2 lg:pb-0 px-4 -mx-4 lg:mx-0 lg:px-0 scroll-smooth">
            {filters.map((f, idx) => (
              <motion.button
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + idx * 0.05 }}
                key={f} onClick={() => setActiveFilter(f)}
                className={`px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${activeFilter === f
                  ? 'bg-gray-900 text-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] scale-105 border-transparent'
                  : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200 hover:text-gray-900 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                  }`}
              >
                {f}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 lg:flex-none px-6 py-3.5 rounded-2xl bg-white border border-gray-100 text-gray-900 text-[11px] font-black uppercase tracking-widest outline-none focus:border-[#EA580C] shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <option value="newest">Sort: Newest</option>
              <option value="budget">Sort: Highest Budget</option>
              <option value="match">Sort: Best Match</option>
            </select>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm ${showAdvancedFilters ? 'bg-[#eb4898] text-white shadow-[0_8px_20px_rgba(235,72,152,0.2)] border-transparent' : 'bg-white text-gray-700 border border-gray-100 hover:bg-gray-50 hover:-translate-y-0.5'}`}
            >
              <SlidersHorizontal size={14} /> Advanced
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-[24px] p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-10 mt-6">
                {/* Budget Slider */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-5">Minimum Budget (🪙{budgetRange.toLocaleString()})</label>
                  <input type="range" min="0" max="100000" step="5000" value={budgetRange} onChange={(e) => setBudgetRange(Number(e.target.value))} className="w-full accent-[#eb4898]" />
                  <div className="flex justify-between text-[11px] text-gray-400 mt-3 font-bold">
                    <span>🪙0</span>
                    <span>🪙100k+</span>
                  </div>
                </div>

                {/* Platforms */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-5">Required Platform</label>
                  <div className="flex gap-2">
                    {['All', 'Instagram', 'TikTok', 'YouTube'].map(p => (
                      <button key={p} onClick={() => setSelectedPlatform(p)} className={`px-4 py-2.5 rounded-xl text-[11px] font-bold transition-colors ${selectedPlatform === p ? 'bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20 shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 shadow-sm'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compensation Type */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-5">Compensation</label>
                  <div className="flex gap-2">
                    <button className="px-5 py-2.5 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">Paid Only</button>
                    <button className="px-5 py-2.5 rounded-xl text-[11px] font-bold bg-gray-50 text-gray-400 border border-gray-100 opacity-50 cursor-not-allowed">Product Only</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Premium Masonry / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCampaigns.map((camp, i) => renderCampaignCard(camp, i, false))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="col-span-full bg-white rounded-[40px] border border-dashed border-gray-200 p-16 flex flex-col items-center justify-center text-center shadow-sm mt-8">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-[24px] rotate-12 flex items-center justify-center mb-6 shadow-sm border border-gray-200">
            <Search size={40} className="text-gray-400 -rotate-12" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-3">No Campaigns Found</h3>
          <p className="text-gray-500 font-medium max-w-md leading-relaxed">We couldn't find any campaigns matching your advanced filters. Try broadening your criteria to discover more opportunities.</p>
        </div>
      )}

      {/* Quick View Modal Overlay */}
      <AnimatePresence>
        {selectedCampaign && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCampaign(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" />

            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/20">

              {/* Left Column: Visuals & Brand Info */}
              <div className="md:w-2/5 bg-gray-900 relative min-h-[300px]">
                <img src={getPlaceholderImage(selectedCampaign.niche || selectedCampaign.category)} className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>

                <div className="relative z-10 p-10 h-full flex flex-col justify-end">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl mb-4 shadow-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {selectedCampaign.brandId?.logo ? <img src={selectedCampaign.brandId.logo} className="w-full h-full object-cover" /> : <Building2 size={24} className="text-gray-900" />}
                      </div>
                      <div>
                        <h4 className="text-white text-lg font-black flex items-center gap-1.5">{selectedCampaign.brandId?.businessName || 'Premium Brand'} <CheckCircle size={16} className="text-blue-400" /></h4>
                        <p className="text-white/60 text-[12px] font-bold">Verified Spender • 12 Active Campaigns</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-white/80 text-[12px] font-medium border-t border-white/10 pt-4">
                      <span className="flex items-center gap-1.5"><Star size={14} className="text-yellow-400 fill-yellow-400" /> 4.9/5 Rating</span>
                      <span className="flex items-center gap-1.5"><Zap size={14} className="text-emerald-400" /> Replies in 2h</span>
                    </div>
                  </div>
                </div>

                {/* Close button for mobile */}
                <button onClick={() => setSelectedCampaign(null)} className="md:hidden absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                  <X size={20} />
                </button>
              </div>

              {/* Right Column: Campaign Details */}
              <div className="md:w-3/5 p-10 lg:p-14 bg-white flex flex-col relative">
                <button onClick={() => setSelectedCampaign(null)} className="hidden md:flex absolute top-8 right-8 w-12 h-12 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-full items-center justify-center text-gray-500 hover:text-gray-900 transition-all">
                  <X size={20} />
                </button>

                <div className="mb-6 inline-flex items-center gap-3">
                  <span className="bg-gradient-to-r from-[#eb4898]/10 to-purple-500/10 text-[#eb4898] border border-[#eb4898]/20 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">{calculateMatchScore(selectedCampaign)}% Match</span>
                  <span className="bg-gray-50 text-gray-600 border border-gray-200 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">{selectedCampaign.niche || 'Any Niche'}</span>
                </div>

                <h2 className="text-4xl lg:text-5xl font-display font-black text-gray-900 leading-[1.1] mb-6">{selectedCampaign.title}</h2>
                <div className="text-3xl font-black text-gray-900 flex items-center gap-3 mb-10 pb-8 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center"><Wallet size={24} className="text-emerald-500" /></div> 
                  🪙{selectedCampaign.budget?.toLocaleString()} <span className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2">Fixed Rate</span>
                </div>

                <div className="space-y-10 flex-1">
                  <div>
                    <h3 className="text-[13px] font-black uppercase tracking-[0.15em] text-gray-400 mb-4">Campaign Overview</h3>
                    <p className="text-[15px] text-gray-600 leading-relaxed font-medium">{selectedCampaign.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-5 rounded-[24px] border border-gray-100">
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Platform Required</h3>
                      <p className="font-bold text-gray-900 flex items-center gap-2 text-[15px]">
                        {selectedCampaign.title?.toLowerCase().includes('tiktok') ? 'TikTok' : (selectedCampaign.title?.toLowerCase().includes('youtube') ? 'YouTube' : 'Instagram')}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-[24px] border border-gray-100">
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Expected Timeline</h3>
                      <p className="font-bold text-gray-900 flex items-center gap-2 text-[15px]">
                        <Calendar size={18} className="text-[#EA580C]" /> 14 Days to Post
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[13px] font-black uppercase tracking-[0.15em] text-gray-400 mb-4 flex items-center justify-between">
                      Required Deliverables
                      <span className="text-[10px] text-[#eb4898] bg-[#eb4898]/10 px-3 py-1 rounded-lg border border-[#eb4898]/20">Mandatory</span>
                    </h3>
                    <ul className="space-y-3 bg-gray-50/50 border border-gray-100 rounded-[24px] p-6 shadow-sm">
                      {['1x Dedicated Video Post (30-60s)', 'Usage rights for 30 days', 'Link in bio for 48 hours'].map((req, i) => (
                        <li key={i} className="flex items-start gap-4">
                          <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                            <Check size={14} strokeWidth={3} />
                          </div>
                          <span className="text-[14px] font-bold text-gray-700 leading-relaxed">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <button
                    onClick={async () => {
                      await onApply(selectedCampaign._id);
                      setSelectedCampaign(null);
                      if (setActiveTab) setActiveTab('applications');
                      else navigate('/creator-dashboard?tab=applications');
                    }}
                    className="w-full bg-gradient-to-r from-[#EA580C] to-[#eb4898] text-white text-[15px] font-black uppercase tracking-[0.15em] py-6 rounded-[20px] hover:scale-[1.02] transition-all shadow-[0_15px_40px_rgba(234,88,12,0.2)] hover:shadow-[0_20px_50px_rgba(235,72,152,0.3)] flex items-center justify-center gap-3"
                  >
                    Submit Application <ArrowUpRight size={20} />
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default CreatorDiscover;
