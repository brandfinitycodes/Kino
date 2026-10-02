import React, { useState } from 'react';
import axios from '../../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, Clock, CheckCircle, Search, Save, Settings, X, Heart, ShieldCheck, Mail, Building, MapPin, Map, Link as LinkIcon, User, FileText, ArrowRight, Check, AlertCircle, ChevronRight, Activity, TrendingUp, CircleDollarSign, ExternalLink, Filter, Briefcase, Eye, Lock, Edit3, Quote, Download, MessageCircle, MoreVertical, PlusCircle, LayoutDashboard, Share2, Filter as FilterIcon, Search as SearchIcon, Copy, Link2, Download as DownloadIcon, Zap, Target, SlidersHorizontal, MessageSquare, Star, Flag, ChevronDown, UploadCloud, Rocket, Info, MoreHorizontal, DollarSign, ChevronLeft } from 'lucide-react';
import DealManager from '../DealManager';

import Odometer from 'react-odometerjs';
import 'odometer/themes/odometer-theme-default.css';

const BrandDeals = (props) => {
  const { 
    profile, setProfile, user, deals, campaigns, allCreators, activeTab, setActiveTab, showToast,
    chartTab, setChartTab, chartData, maxEarnings, hoveredBar, setHoveredBar, currentMonth, now,
    totalBudgetSpent, milestoneCoins, activeDeals, deliverableCounts, totalDealsChart,
    browseFilter, setBrowseFilter, browseSearch, setBrowseSearch, handlePostCampaign,
    newCampaign, setNewCampaign, createStep, setCreateStep, handleProfileUpdate,
    campaignFilter, setCampaignFilter, campaignSearch, setCampaignSearch,
    dealFilter, setDealFilter, dealPage, setDealPage, setActiveChatDeal, activeChatDeal,
    message, onUpdateDeal
  } = props;

  const [selectedDeal, setSelectedDeal] = useState(null);

  const [assetsLinks, setAssetsLinks] = useState({});

  const handleFundDeal = async (dealId, budget) => {
    try {
      const link = assetsLinks[dealId] || '';
      await axios.post(`/deals/${dealId}/pay`, { brandAssetsUrl: link });
      if (showToast) showToast('Payment secured! Deal is now in progress.', 'success');
      if (onUpdateDeal) onUpdateDeal();
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || 'Failed to fund deal. Please check your wallet balance.', 'error');
    }
  };

  // Keep selectedDeal in sync with updated list
  const currentSelectedDeal = selectedDeal ? deals.find(d => d._id === selectedDeal._id) : null;

  if (selectedDeal) {
    return (
      <div className="flex flex-col gap-4 text-left animate-reveal-up w-full">
        <button 
          onClick={() => setSelectedDeal(null)} 
          className="self-start px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-black uppercase tracking-widest rounded-xl transition-colors mb-4 flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
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
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col animate-reveal-up pb-24 md:pb-8 text-left">
        {/* Filter Navigation */}
        <div className="flex items-center justify-between border-b border-gray-200 mb-6 pb-1">
          <div className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar">
            {['All Deals', 'Action Required', 'In Progress', 'Completed'].map(f => {
              const isActive = dealFilter === f || (f === 'All Deals' && dealFilter === 'All History');
              return (
                <button
                  key={f}
                  onClick={() => setDealFilter(f)}
                  className={`pb-3 text-[13px] sm:text-[14px] font-black transition-all relative uppercase tracking-wider whitespace-nowrap ${isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {f}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA580C]"></div>
                  )}
                </button>
              );
            })}
          </div>
          <button className="p-2 text-gray-500 hover:text-gray-900 shrink-0">
            <SlidersHorizontal size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {(() => {
            const sortedDeals = [...deals].sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0));
            const filteredDeals = sortedDeals.filter(d => {
              if (!dealFilter || dealFilter === 'All Deals' || dealFilter === 'All History' || dealFilter === 'All') return true;
              if (dealFilter === 'Action Required') return ['pending_payment', 'in_review', 'revision_requested'].includes(d.status);
              if (dealFilter === 'In Progress') return d.status === 'in_progress';
              if (dealFilter === 'Completed') return d.status === 'completed';
              if (dealFilter === 'Campaigns') return !!d.campaignId;
              return true;
            });

            if (filteredDeals.length === 0) {
              return (
                <div className="bg-white rounded-[24px] p-12 text-center border border-gray-100 shadow-sm">
                  <div className="w-16 h-16 bg-orange-50 text-[#EA580C] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase size={28} />
                  </div>
                  <h4 className="text-lg font-black text-gray-900 mb-1">No deals found</h4>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">You don't have any deals matching the "{dealFilter || 'selected'}" filter criteria.</p>
                </div>
              );
            }

            return filteredDeals.map((d) => {
              const isCompleted = d.status === 'completed';
              const isPendingPayment = d.status === 'pending_payment';
              const isPackageDeal = d.originType === 'package' || (!d.campaignId && !d.applicationId?.campaignId);
              const dealTypeLabel = isPackageDeal ? 'Package Order' : 'Campaign Deal';
              
              const budget = d.budget || d.campaignId?.budget || d.applicationId?.campaignId?.budget || 5000;
              const creatorName = d.creatorId?.userId?.name || d.applicationId?.creatorId?.userId?.name || d.applicationId?.creatorId?.name || 'Creator';
              const dealTitle = isPackageDeal 
                ? `${d.packageTier ? d.packageTier.charAt(0).toUpperCase() + d.packageTier.slice(1) : 'Custom'} Tier Package Order`
                : (d.campaignId?.title || d.applicationId?.campaignId?.title || d.title || 'Campaign Deal');

            if (isPendingPayment) {
              return (
                <div key={d._id} className="bg-white rounded-2xl border-2 border-amber-300 p-5 flex flex-col shadow-md relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                        <Clock size={12} className="animate-spin text-amber-700" /> Action Required: Payment Needed
                      </span>
                      <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider ${isPackageDeal ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                        {dealTypeLabel}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-black text-gray-900 text-xl">🪙{budget.toLocaleString()}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 mt-1">
                        Payment Pending
                      </span>
                    </div>
                  </div>

                  {/* Title & Info */}
                  <h4 className="font-black text-gray-900 text-xl tracking-tight leading-tight">{dealTitle}</h4>
                  <p className="text-gray-500 text-xs font-bold mt-1 tracking-wide">Creator: @{creatorName}</p>

                  {/* Payment Prompt Banner */}
                  <div className="my-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs font-medium text-amber-900 leading-relaxed flex items-start gap-3 shadow-sm">
                    <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black block uppercase tracking-wider text-[10px] text-amber-800 mb-0.5">Pay First to Start Deal</span>
                      Please allocate <strong>🪙{budget.toLocaleString()} Milestone Coins</strong> into escrow so creator @{creatorName} can safely begin work on deliverables.
                    </div>
                  </div>

                  {/* Brand Assets & Video Data Drive Link Input */}
                  <div className="mb-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5 flex items-center justify-between">
                      <span>Requirements & Video Assets Drive Link</span>
                      <span className="text-gray-400 font-normal text-[9px]">Optional / Recommended</span>
                    </label>
                    <div className="relative">
                      <LinkIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input 
                        type="url"
                        value={assetsLinks[d._id] !== undefined ? assetsLinks[d._id] : (d.brandAssetsUrl || '')}
                        onChange={(e) => setAssetsLinks({ ...assetsLinks, [d._id]: e.target.value })}
                        placeholder="https://drive.google.com/drive/folders/... (Requirements & raw video files)"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-[#EA580C] focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setActiveChatDeal(d)} className="py-3.5 px-4 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                      <MessageSquare size={14} /> Chat
                    </button>
                    <button 
                      onClick={() => handleFundDeal(d._id, budget)}
                      className="flex-1 py-3.5 bg-gradient-to-r from-[#EA580C] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Wallet size={14} /> Pay 🪙{budget.toLocaleString()} & Start Deal
                    </button>
                    <button onClick={() => setSelectedDeal(d)} className="py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all">
                      Details
                    </button>
                  </div>
                </div>
              );
            }

            if (isCompleted) {
              return (
                <div key={d._id} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col shadow-sm relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                        Completed
                      </span>
                      <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider ${isPackageDeal ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                        {dealTypeLabel}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-gray-900 text-lg">🪙{budget.toLocaleString()}</span>
                      <span className="text-[9px] text-gray-400 font-bold block mt-0.5 uppercase tracking-widest">
                        RELEASED {new Date(d.updatedAt || d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Title & Info */}
                  <h4 className="font-black text-gray-900 text-lg tracking-tight leading-tight">{dealTitle}</h4>
                  <p className="text-gray-500 text-xs font-bold mt-1 tracking-wide">Creator: @{creatorName}</p>

                  <div className="h-px bg-gray-100 my-4"></div>

                  {/* Completed Details box */}
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">Deal Completed Successfully</h5>
                        <p className="text-emerald-700/60 text-xs font-bold mt-0.5">Content approved and payment released.</p>
                      </div>
                    </div>
                  </div>

                  {/* Main Button */}
                  <button onClick={() => setSelectedDeal(d)} className="w-full py-3.5 bg-white border border-gray-250 hover:bg-gray-50 hover:border-gray-300 text-gray-700 rounded-xl text-xs font-black uppercase tracking-widest mt-4 transition-all shadow-sm">
                    View Final Assets
                  </button>
                </div>
              );
            } else {
              // In Progress style
              const stepIndex = d.status === 'in_review' ? 2 : d.status === 'revision_requested' ? 1 : 1;
              const isReview = d.status === 'in_review';

              return (
                <div key={d._id} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col shadow-sm relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#EA580C]"></div>
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-widest">
                        {d.status === 'in_review' ? 'In Review' : d.status === 'revision_requested' ? 'Revision Needed' : 'In Progress'}
                      </span>
                      <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider ${isPackageDeal ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                        {dealTypeLabel}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-black text-gray-900 text-lg">🪙{budget.toLocaleString()}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 mt-1">
                        <Lock size={10} /> Funds-secured Held
                      </span>
                    </div>
                  </div>

                  {/* Title & Info */}
                  <h4 className="font-black text-gray-900 text-lg tracking-tight leading-tight">{dealTitle}</h4>
                  <p className="text-gray-500 text-xs font-bold mt-1 tracking-wide">Creator: @{creatorName}</p>

                  {/* Timeline progress line */}
                  <div className="relative my-8 px-4">
                    {/* Progress Bar Line background */}
                    <div className="absolute top-1.5 left-8 right-8 h-0.5 bg-gray-100 rounded-full z-0">
                      {/* Active part of the line */}
                      <div 
                        className="h-full bg-[#EA580C]" 
                        style={{ width: stepIndex === 1 ? '33%' : stepIndex === 2 ? '66%' : '0%' }}
                      ></div>
                    </div>

                    {/* Four Dots */}
                    <div className="flex justify-between relative z-10">
                      {['Funded', 'Working', 'Review', 'Finalized'].map((label, idx) => {
                        const isPassed = stepIndex >= idx;
                        return (
                          <div key={label} className="flex flex-col items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 ${isPassed ? 'bg-[#EA580C] border-[#EA580C]' : 'bg-white border-gray-200'} shadow-[0_0_0_4px_white]`}></div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isPassed ? 'text-[#EA580C]' : 'text-gray-300'}`}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setActiveChatDeal(d)} className="flex-1 py-3.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-700 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                      <MessageSquare size={14} /> Open Chat
                    </button>
                    <button onClick={() => setSelectedDeal(d)} className="flex-1 py-3.5 bg-[#EA580C] hover:bg-[#c2410c] text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md shadow-orange-500/20">
                      {isReview ? 'Review Assets' : 'Manage Deal'}
                    </button>
                  </div>
                </div>
              );
            }
          });
        })()}
        </div>
      </div>
    </>
  );
};

export default BrandDeals;
