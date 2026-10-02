import React, { useState } from "react";
import axios from "../../utils/axios";
import { motion } from "framer-motion";
import {
  Briefcase, Clock, CheckCircle, AlertCircle,
  ChevronLeft, LayoutDashboard, Edit3,
  MessageSquare, Calendar, ChevronDown, ExternalLink
} from "lucide-react";
import ChatOverlay from "../ChatOverlay";
import DealManager from "../DealManager";

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

const CreatorDeals = ({ deals, user, onUpdateDeal }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeChatDeal, setActiveChatDeal] = useState(null);
  const [viewMode, setViewMode] = useState('feed');
  const [selectedDeal, setSelectedDeal] = useState(null);

  const filters = [
    { id: 'all', label: 'All Deals' },
    { id: 'action', label: 'Action Required' },
    { id: 'prog', label: 'In Progress' },
    { id: 'awaiting', label: 'Awaiting Payment' },
    { id: 'done', label: 'Completed' }
  ];

  const sortedDeals = [...deals].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const filteredDeals = sortedDeals.filter(d => {
    const isCreatorAction = d.status === 'in_progress' || d.status === 'revision_requested';
    if (activeFilter === 'action') return isCreatorAction;
    if (activeFilter === 'prog') return ['in_progress', 'in_review', 'revision_requested'].includes(d.status);
    if (activeFilter === 'awaiting') return d.status === 'pending_payment';
    if (activeFilter === 'done') return d.status === 'completed';
    return true;
  });

  // Keep selectedDeal in sync with refreshed list
  const currentSelectedDeal = selectedDeal ? deals.find(d => d._id === selectedDeal._id) : null;

  // If a deal is selected, render the full DealManager
  if (selectedDeal) {
    return (
      <motion.div {...ANIMATION_VARIANTS} className="pb-24 pt-4 px-4 md:px-0 relative z-10">
        <button
          onClick={() => setSelectedDeal(null)}
          className="mb-6 px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-black uppercase tracking-widest rounded-xl transition-colors flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
        >
          <ChevronLeft size={16} /> Back to Deals
        </button>
        <DealManager
          deal={currentSelectedDeal || selectedDeal}
          user={user}
          onUpdate={() => {
            if (onUpdateDeal) onUpdateDeal();
          }}
        />
      </motion.div>
    );
  }

  const badgeText = {
    'pending_payment': 'AWAITING PAYMENT',
    'in_progress': 'IN PROGRESS',
    'in_review': 'PENDING REVIEW',
    'revision_requested': 'REVISION NEEDED',
    'pending_clearance': 'APPROVED / CLEARING',
    'completed': 'COMPLETED',
    'disputed': 'DISPUTED'
  };
  const badgeBg = {
    'pending_payment': 'bg-amber-500 text-white',
    'in_progress': 'bg-orange-500 text-white',
    'in_review': 'bg-blue-500 text-white',
    'revision_requested': 'bg-red-600 text-white',
    'pending_clearance': 'bg-teal-600 text-white',
    'completed': 'bg-emerald-500 text-white',
    'disputed': 'bg-rose-700 text-white'
  };

  return (
    <motion.div {...ANIMATION_VARIANTS} className="pb-24 pt-4 px-4 md:px-0 relative z-10">

      {/* Dynamic Header */}
      <div className="mb-8 relative rounded-[32px] overflow-hidden bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-100/60 to-rose-100/60 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-100/60 to-indigo-100/60 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        
        <div className="relative z-10 p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-100 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Collaboration Hub</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">Brand Deals</span>
            </h1>
            <p className="text-gray-500 font-medium max-w-md">
              Manage your ongoing brand partnerships, track deliverables, and submit your work all in one place.
            </p>
          </div>
          
          <div className="flex gap-4 self-stretch md:self-auto w-full md:w-auto">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 flex-1 md:w-44 flex flex-col items-start shadow-sm relative overflow-hidden group/card hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#9A3412] mb-4 border border-orange-100">
                <Briefcase size={20} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Deals</span>
              <div className="text-3xl font-black text-gray-900 mb-1">{deals.length.toString().padStart(2, '0')}</div>
              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">📈 Active</span>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-gray-100 flex-1 md:w-44 flex flex-col items-start shadow-sm relative overflow-hidden group/card hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mb-4 border border-red-100">
                <AlertCircle size={20} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Action Needed</span>
              <div className="text-3xl font-black text-gray-900 mb-1">
                {(deals.filter(d => d.status === 'in_progress' || d.status === 'revision_requested').length).toString().padStart(2, '0')}
              </div>
              <span className="text-[10px] font-bold text-gray-400">Pending submission</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle + Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6 bg-white/70 backdrop-blur-xl p-3 rounded-[28px] border border-white shadow-[0_15px_40px_rgba(0,0,0,0.04)] relative z-20">
        <div className="flex gap-2 w-full lg:w-auto p-1.5 bg-gray-100/50 rounded-2xl border border-white/50 shadow-inner">
          <button onClick={() => setViewMode('feed')} className={`px-8 py-3 rounded-[14px] text-[12px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center sm:justify-start gap-2 flex-1 sm:flex-none ${viewMode === 'feed' ? 'bg-white text-gray-900 shadow-[0_5px_20px_rgba(0,0,0,0.08)] scale-[1.02]' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>
            <LayoutDashboard size={16} /> Grid Feed
          </button>
          <button onClick={() => setViewMode('calendar')} className={`px-8 py-3 rounded-[14px] text-[12px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center sm:justify-start gap-2 flex-1 sm:flex-none ${viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-[0_5px_20px_rgba(0,0,0,0.08)] scale-[1.02]' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>
            <Calendar size={16} /> Calendar
          </button>
        </div>
        
        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto hide-scrollbar px-2 py-1">
          {filters.map(f => (
            <button 
              key={f.id} 
              onClick={() => setActiveFilter(f.id)} 
              className={`px-5 py-2.5 rounded-full text-[12px] font-bold transition-all duration-300 whitespace-nowrap border ${activeFilter === f.id ? 'bg-[#7c2d12] text-white border-transparent shadow-md hover:scale-105' : 'bg-white border-gray-200 text-gray-650 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'feed' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mx-auto pb-8 min-h-[500px]">
          {filteredDeals.length > 0 ? filteredDeals.map((deal) => {
            const actionReq = deal.status === 'in_progress' || deal.status === 'revision_requested';
            
            const startsDate = new Date(deal.createdAt || Date.now());
            startsDate.setDate(startsDate.getDate() + 15);
            const formattedStarts = `Starts ${startsDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
            const budgetStr = `🪙${(deal.budget || deal.applicationId?.campaignId?.budget || 0).toLocaleString()}`;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                key={deal._id}
                onClick={() => setSelectedDeal(deal)}
                className="group relative rounded-[32px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between overflow-hidden p-3 cursor-pointer"
              >
                {/* Cover Image Header */}
                <div className="relative h-48 w-full rounded-[24px] overflow-hidden bg-gray-100 mb-4 shrink-0">
                  <img 
                    src={deal.applicationId?.campaignId?.coverImage || getPlaceholderImage(deal.applicationId?.campaignId?.niche || 'Other')} 
                    alt={deal.applicationId?.campaignId?.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md ${badgeBg[deal.status] || 'bg-gray-500 text-white'}`}>
                    {badgeText[deal.status] || deal.status?.replace(/_/g, ' ')?.toUpperCase()}
                  </div>
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-60"></div>
                </div>

                {/* Body Content */}
                <div className="px-2 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Subtitle */}
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#ea580c] block mb-1">
                      {deal.originType === 'package' || (!deal.campaignId && !deal.applicationId?.campaignId) ? 'PACKAGE ORDER' : 'CAMPAIGN DEAL'} • #{deal._id.slice(-4).toUpperCase()}
                    </span>
                    {/* Title */}
                    <h4 className="text-[18px] font-black text-gray-900 tracking-tight leading-snug line-clamp-2 mb-4 group-hover:text-[#ea580c] transition-colors">
                      {deal.originType === 'package' || (!deal.campaignId && !deal.applicationId?.campaignId)
                        ? `${deal.packageTier ? deal.packageTier.charAt(0).toUpperCase() + deal.packageTier.slice(1) : 'Custom'} Tier Package Order`
                        : (deal.campaignId?.title || deal.applicationId?.campaignId?.title || deal.title || 'Campaign Deal')}
                    </h4>
                  </div>

                  {/* Stats Row */}
                  <div className="flex justify-between items-center py-3 border-t border-b border-gray-100/80 mb-4">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Calendar size={14} />
                      <span className="text-[11px] font-bold">{formattedStarts}</span>
                    </div>
                    <span className="text-[16px] font-black text-gray-900">{budgetStr}</span>
                  </div>

                  {/* Brand Assets Drive Link Badge */}
                  {(() => {
                    const reqUrl = deal.brandAssetsUrl || deal.requirementsUrl || deal.applicationId?.campaignId?.requirementsLink;
                    if (!reqUrl) return null;
                    return (
                      <a 
                        href={reqUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="mb-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 text-[11px] font-black uppercase tracking-wider flex items-center justify-between hover:bg-amber-100 transition-colors shadow-sm cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <ExternalLink size={14} className="text-[#EA580C]" />
                          <span>Brand Requirements & Raw Video Assets</span>
                        </span>
                        <span className="text-[#EA580C] font-black bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-[10px] shadow-2xs">
                          Open Drive ↗
                        </span>
                      </a>
                    );
                  })()}

                  {/* Action buttons */}
                  <div className="flex items-center gap-3 w-full">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDeal(deal);
                      }}
                      className={`flex-1 py-3.5 text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-2xl hover:scale-[1.02] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                        actionReq
                          ? 'bg-[#7c2d12] hover:bg-[#9a3412]'
                          : deal.status === 'pending_payment'
                          ? 'bg-amber-500 hover:bg-amber-600'
                          : deal.status === 'in_review'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : deal.status === 'completed'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-gray-700 hover:bg-gray-800'
                      }`}
                    >
                      {actionReq
                        ? <><Edit3 size={14} /> Submit Deliverable</>
                        : deal.status === 'pending_payment'
                        ? <><Clock size={14} /> Awaiting Brand Payment</>
                        : deal.status === 'in_review'
                        ? <><Clock size={14} /> In Review</>
                        : deal.status === 'completed'
                        ? <><CheckCircle size={14} /> View Deal</>
                        : <><Briefcase size={14} /> Manage Deal</>}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveChatDeal(deal);
                      }}
                      className="p-3.5 rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm shrink-0 flex items-center justify-center cursor-pointer"
                    >
                      <MessageSquare size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          }) : (
            <div className="col-span-full bg-white/50 backdrop-blur-xl border border-white rounded-[40px] flex flex-col items-center justify-center py-24 shadow-[0_15px_40px_rgba(0,0,0,0.03)]">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 rounded-[24px] rotate-12 flex items-center justify-center mb-8 shadow-sm border border-white">
                <Briefcase size={40} className="text-gray-400 -rotate-12" />
              </div>
              <span className="text-3xl font-black text-gray-900 tracking-tight mb-3">No Active Deals</span>
              <p className="text-gray-500 font-medium text-[15px]">You don't have any deals matching this filter yet.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-12 rounded-[40px] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.04)] min-h-[600px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-200/40 via-purple-200/40 to-fuchsia-200/40 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-200/40 to-teal-200/40 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />

          {/* Calendar Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 relative z-10 bg-white/50 backdrop-blur-md p-4 rounded-[24px] border border-white shadow-sm">
            <div className="flex items-center gap-6">
              <div className="flex gap-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 hover:border-gray-300 hover:shadow-md text-gray-500 transition-all hover:text-gray-900 hover:-translate-x-0.5">
                   <ChevronDown size={18} className="rotate-90"/>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 hover:border-gray-300 hover:shadow-md text-gray-500 transition-all hover:text-gray-900 hover:translate-x-0.5">
                   <ChevronDown size={18} className="-rotate-90"/>
                </button>
              </div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">June <span className="text-gray-300">2026</span></h2>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-xl bg-emerald-50/80 backdrop-blur-md text-emerald-700 text-[12px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" /> {deals.filter(d => d.status === 'completed').length} Completed
              </span>
              <span className="px-4 py-2 rounded-xl bg-orange-50/80 backdrop-blur-md text-orange-700 text-[12px] font-black uppercase tracking-widest border border-orange-100 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-pulse" /> {deals.filter(d => d.status === 'in_progress' || d.status === 'revision_requested').length} Pending
              </span>
              <span className="px-4 py-2 rounded-xl bg-blue-50/80 backdrop-blur-md text-blue-700 text-[12px] font-black uppercase tracking-widest border border-blue-100 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" /> {deals.filter(d => d.status === 'in_review').length} In Review
              </span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-3 sm:gap-4 relative z-10">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="text-center font-black text-gray-400 text-[10px] sm:text-[12px] uppercase tracking-[0.2em] pb-2 border-b border-gray-100 mb-2">{day.slice(0, 3)}</div>
            ))}
            
            <div className="min-h-[120px] sm:min-h-[140px] rounded-[24px] bg-white/20 border border-white/40 p-3 hidden sm:block backdrop-blur-sm"></div>

            {Array.from({ length: 30 }).map((_, i) => {
              const dayNum = i + 1;
              const isToday = dayNum === new Date().getDate();

              const hasDraft = dayNum % 7 === 3 && deals.length > 0;
              const hasPost = dayNum % 8 === 5 && deals.length > 1;
              const hasReview = dayNum % 12 === 2 && deals.length > 2;

              return (
                <div key={i} className={`min-h-[100px] sm:min-h-[140px] rounded-[24px] p-3 sm:p-4 relative group transition-all duration-300 flex flex-col gap-2 ${isToday ? 'bg-gradient-to-br from-orange-50 to-rose-50 border-2 border-orange-200 shadow-[0_10px_30px_rgba(249,115,22,0.15)] scale-[1.02] z-10' : 'border border-gray-100/50 hover:border-gray-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] bg-white/60 backdrop-blur-md hover:-translate-y-1'}`}>
                  
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[14px] sm:text-[16px] font-black ${isToday ? 'text-white bg-gradient-to-r from-orange-500 to-rose-500 w-8 h-8 rounded-full flex items-center justify-center shadow-md' : 'text-gray-400 group-hover:text-gray-900'} transition-colors`}>
                      {dayNum}
                    </span>
                    <div className="flex gap-1 sm:hidden">
                      {hasDraft && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" />}
                      {hasPost && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />}
                      {hasReview && <div className="w-2 h-2 rounded-full bg-purple-500 shadow-sm" />}
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col gap-2 overflow-y-auto hide-scrollbar">
                    {hasDraft && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 text-[10px] font-bold px-2.5 py-2 rounded-xl line-clamp-1 leading-tight shadow-sm cursor-pointer hover:scale-[1.05] hover:from-blue-500 hover:to-indigo-600 hover:text-white transition-all duration-300 relative overflow-hidden group/pill">
                        <div className="absolute top-0 right-0 w-8 h-full bg-white/20 skew-x-12 -translate-x-12 group-hover/pill:translate-x-4 transition-transform duration-500"></div>
                        <span className="opacity-70 mr-1 font-black">DRAFT:</span>
                        {deals[0]?.applicationId?.campaignId?.title || 'Video Content'}
                      </div>
                    )}
                    {hasPost && (
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-2 rounded-xl line-clamp-1 leading-tight shadow-sm cursor-pointer hover:scale-[1.05] hover:from-emerald-500 hover:to-teal-600 hover:text-white transition-all duration-300 relative overflow-hidden group/pill">
                        <div className="absolute top-0 right-0 w-8 h-full bg-white/20 skew-x-12 -translate-x-12 group-hover/pill:translate-x-4 transition-transform duration-500"></div>
                        <span className="opacity-70 mr-1 font-black">POST:</span>
                        {deals[1]?.applicationId?.campaignId?.title || 'Story Post'}
                      </div>
                    )}
                    {hasReview && (
                      <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-200 text-purple-700 text-[10px] font-bold px-2.5 py-2 rounded-xl line-clamp-1 leading-tight shadow-sm cursor-pointer hover:scale-[1.05] hover:from-purple-500 hover:to-fuchsia-600 hover:text-white transition-all duration-300 relative overflow-hidden group/pill">
                        <div className="absolute top-0 right-0 w-8 h-full bg-white/20 skew-x-12 -translate-x-12 group-hover/pill:translate-x-4 transition-transform duration-500"></div>
                        <span className="opacity-70 mr-1 font-black">REVIEW:</span>
                        {deals[2]?.applicationId?.campaignId?.title || 'Feedback'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeChatDeal && (
        <ChatOverlay
          deal={activeChatDeal}
          currentUser={user}
          onClose={() => setActiveChatDeal(null)}
        />
      )}
    </motion.div>
  );
};

export default CreatorDeals;
