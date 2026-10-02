import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, Clock, CheckCircle, Search, Save, Settings, X, Heart, ShieldCheck, Mail, Building, MapPin, Map, Link as LinkIcon, User, FileText, ArrowRight, Check, AlertCircle, ChevronRight, Activity, TrendingUp, CircleDollarSign, ExternalLink, Filter, Briefcase, Eye, Lock, Edit3, Quote, Download, MessageCircle, MoreVertical, PlusCircle, LayoutDashboard, Share2, Filter as FilterIcon, Search as SearchIcon, Copy, Link2, Download as DownloadIcon, Zap, Target, SlidersHorizontal, MessageSquare, Star, Flag, ChevronDown, UploadCloud, Rocket, Info, MoreHorizontal, DollarSign } from 'lucide-react';
import Odometer from 'react-odometerjs';
import 'odometer/themes/odometer-theme-default.css';

const BrandCreateCampaign = (props) => {
  const { 
    profile, setProfile, user, deals, campaigns, allCreators, activeTab, setActiveTab, showToast,
    chartTab, setChartTab, chartData, maxEarnings, hoveredBar, setHoveredBar, currentMonth, now,
    totalBudgetSpent, milestoneCoins, activeDeals, deliverableCounts, totalDealsChart,
    browseFilter, setBrowseFilter, browseSearch, setBrowseSearch, handlePostCampaign,
    newCampaign, setNewCampaign, createStep, setCreateStep, handleProfileUpdate,
    campaignFilter, setCampaignFilter, campaignSearch, setCampaignSearch,
    dealFilter, setDealFilter, dealPage, setDealPage, setActiveChatDeal, activeChatDeal,
    message
  } = props;

  return (
    <>
      
          <div className="flex flex-col animate-reveal-up bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-24 md:mb-8 text-left">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
              <div>
                <h2 className="text-[20px] font-black text-gray-900 tracking-tight">Campaign Architect</h2>
                <p className="text-[12px] text-gray-400 font-bold mt-0.5">Design and broadcast your campaign to premium creators.</p>
              </div>
              <button onClick={() => { setActiveTab('overview'); setCreateStep(1); }} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white">
                <X size={18} />
              </button>
            </div>

            {/* Form Content */}
            <form className="p-5 flex flex-col gap-8 min-h-[400px]" onSubmit={handlePostCampaign}>

              {/* SECTION 1: BASICS */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1 pb-3 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#EA580C] flex items-center justify-center border border-orange-100"><Flag size={12} /></div>
                  <h3 className="font-black text-[13px] uppercase tracking-wider text-gray-900">Campaign Basics</h3>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-black text-gray-600">Campaign Title <span className="text-[#EA580C] font-bold">*</span></label>
                    <input required type="text" placeholder="e.g. Summer Tech Review" value={newCampaign.title} onChange={e => setNewCampaign({ ...newCampaign, title: e.target.value })} className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-gray-400 hover:border-gray-300 transition-all placeholder:text-gray-400" />
                  </div>
                  
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-[12px] font-black text-gray-600">Content Niche <span className="text-[#EA580C] font-bold">*</span></label>
                    <div className="relative">
                      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select required value={newCampaign.niche} onChange={e => setNewCampaign({ ...newCampaign, niche: e.target.value })} className="w-full bg-white border border-gray-200 shadow-sm rounded-xl pl-10 pr-4 py-3 text-[13px] text-gray-900 outline-none focus:border-gray-400 hover:border-gray-300 transition-all appearance-none cursor-pointer">
                        <option value="Tech">Technology & Gadgets</option>
                        <option value="Food">Food & Beverage</option>
                        <option value="Lifestyle">Lifestyle & Fashion</option>
                        <option value="Travel">Travel & Tourism</option>
                        <option value="Beauty">Beauty & Cosmetics</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-455 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-black text-gray-600">Preferred Location <span className="text-[#EA580C] font-bold">*</span></label>
                    <input required type="text" placeholder="e.g. Remote, Mumbai, New York" value={newCampaign.location || ''} onChange={e => setNewCampaign({ ...newCampaign, location: e.target.value })} className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-gray-400 hover:border-gray-300 transition-all placeholder:text-gray-400" />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DELIVERABLES */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1 pb-3 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#EA580C] flex items-center justify-center border border-orange-100"><CircleDollarSign size={12} /></div>
                  <h3 className="font-black text-[13px] uppercase tracking-wider text-gray-900">Deliverables & Budget</h3>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-[12px] font-black text-gray-600">Campaign Budget (🪙) <span className="text-[#EA580C] font-bold">*</span></label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[13px]">🪙</span>
                      <input required type="number" placeholder="50000" value={newCampaign.budget} onChange={e => setNewCampaign({ ...newCampaign, budget: e.target.value })} className="w-full bg-white border border-gray-200 shadow-sm rounded-xl pl-8 pr-4 py-3 text-[13px] text-gray-900 outline-none focus:border-gray-400 hover:border-gray-300 transition-all placeholder:text-gray-400" />
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1.5 mt-2 uppercase tracking-wide">
                      <ShieldCheck size={12} /> FUNDS-SECURED PROTECTION AVAILABLE
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-black text-gray-600">Deliverables Required <span className="text-[#EA580C] font-bold">*</span></label>
                    <input required type="text" placeholder="e.g. 2 Reels, 1 Story" value={newCampaign.requirements} onChange={e => setNewCampaign({ ...newCampaign, requirements: e.target.value })} className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-gray-400 hover:border-gray-300 transition-all placeholder:text-gray-400" />
                  </div>
                </div>
              </div>

              {/* SECTION 3: BRIEF & MOODBOARD */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mb-1 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#EA580C] flex items-center justify-center border border-orange-100"><Edit3 size={12} /></div>
                    <h3 className="font-black text-[13px] uppercase tracking-wider text-gray-900">Brief & Moodboard</h3>
                  </div>
                  <button type="button" onClick={() => {
                    const title = newCampaign.title || '';
                    const niche = newCampaign.niche || '';
                    const budget = newCampaign.budget || '';
                    const reqs = newCampaign.requirements || '';
                    const loc = newCampaign.location || '';
                    
                    if (!title.trim() || !niche.trim() || !budget || !reqs.trim() || !loc.trim()) {
                      showToast('Please fill in all campaign fields (Title, Niche, Budget, Deliverables, and Preferred Location) first.', 'error');
                      return;
                    }
                    
                    const mergedString = `Title: ${title}, Niche: ${niche}, Budget: 🪙${budget}, Deliverables Required: ${reqs}, Preferred Location: ${loc}`;
                    const prompt = `generate the 30-35 words professional desciption for this  ${mergedString}`;
                    window.open(`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`, '_blank');
                  }} className="flex items-center bg-gradient-to-r from-purple-600 to-pink-500 text-white px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:shadow-lg transition-all active:scale-95">
                    GENERATE WITH PROMPT
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <textarea required placeholder="Describe the creative direction, key talking points, and expectations." value={newCampaign.description} onChange={e => setNewCampaign({ ...newCampaign, description: e.target.value })} className="w-full bg-white border border-gray-200 shadow-sm rounded-xl p-4 text-[13px] text-gray-900 outline-none focus:border-gray-400 hover:border-gray-300 transition-all min-h-[140px] resize-none placeholder:text-gray-400" />
                </div>
              </div>

              {/* Broadcast Button */}
              <div className="mt-4 pb-6">
                <button type="submit" className="w-full py-4 rounded-xl bg-black hover:bg-slate-900 text-white text-[12px] font-black transition-all duration-300 shadow-md hover:shadow-lg uppercase tracking-widest flex items-center justify-center gap-2.5 active:scale-95">
                  <Rocket size={16} /> Broadcast Campaign
                </button>
              </div>
            </form>
          </div>
        

        {/* PAGE 6: EDIT PROFILE */}
        
    </>
  );
};

export default BrandCreateCampaign;
