import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, Clock, CheckCircle, Search, Save, Settings, X, Heart, ShieldCheck, Mail, Building, MapPin, Map, Link as LinkIcon, User, FileText, ArrowRight, Check, AlertCircle, ChevronRight, Activity, TrendingUp, CircleDollarSign, ExternalLink, Filter, Briefcase, Eye, Lock, Edit3, Quote, Download, MessageCircle, MoreVertical, PlusCircle, LayoutDashboard, Share2, Filter as FilterIcon, Search as SearchIcon, Copy, Link2, Download as DownloadIcon, Zap, Target, SlidersHorizontal, MessageSquare, Star, Flag, ChevronDown, UploadCloud, Rocket, Info, MoreHorizontal, DollarSign } from 'lucide-react';
import Odometer from 'react-odometerjs';
import 'odometer/themes/odometer-theme-default.css';

const BrandCampaigns = (props) => {
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
      <div className="flex flex-col animate-reveal-up pb-24 md:pb-8 text-left">
        {/* Search and filter settings */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl p-3.5 shadow-sm shadow-black/5 mb-6">
          <Search className="text-gray-400 shrink-0" size={18} />
          <input 
            type="text" 
            placeholder="Search campaigns..." 
            value={campaignSearch} 
            onChange={(e) => setCampaignSearch(e.target.value)} 
            className="bg-transparent border-none outline-none text-gray-900 font-semibold w-full placeholder:text-gray-400 text-sm" 
          />
          <button className="p-1 text-gray-500 hover:text-gray-900 border-l border-gray-100 pl-3">
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Inline Toggle Filters */}
        <div className="flex border-b border-gray-100 mb-6 w-full">
          {['All', 'Active', 'Drafts'].map(f => {
            const isActive = campaignFilter === f;
            return (
              <button 
                key={f} 
                onClick={() => setCampaignFilter(f)} 
                className={`flex-1 pb-3.5 text-center text-sm font-black uppercase tracking-wider relative transition-colors ${
                  isActive ? 'text-gray-900 font-bold' : 'text-gray-400 hover:text-gray-650'
                }`}
              >
                {f}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA580C]"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* New Campaign Button */}
        <button 
          onClick={() => setActiveTab('create')} 
          className="w-full py-4 rounded-2xl bg-[#EA580C] hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 mb-6 active:scale-95 transition-all"
        >
          <Plus size={16} strokeWidth={3} /> New Campaign
        </button>

        {/* Campaign Cards List */}
        <div className="flex flex-col gap-5">
          {campaigns.filter(c => {
            if (campaignFilter === 'All') return true;
            if (campaignFilter === 'Active') return c.status !== 'Drafts';
            if (campaignFilter === 'Drafts') return c.status === 'Drafts';
            return true;
          }).filter(c => 
            c.title?.toLowerCase().includes(campaignSearch.toLowerCase()) || 
            c.niche?.toLowerCase().includes(campaignSearch.toLowerCase())
          ).map((camp) => {
            const isDraft = camp.status === 'Drafts';
            const budgetValue = camp.budget || 12500;
            
            return (
              <div key={camp._id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-md">
                {/* Tags row */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded bg-gray-50 text-gray-500 border border-gray-200 text-[9px] font-black uppercase tracking-wider">
                      {camp.niche || 'TECH'}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black uppercase tracking-wider">
                      1 CREATOR
                    </span>
                    <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider ${
                      isDraft 
                        ? 'bg-gray-100 text-gray-500 border border-gray-250' 
                        : 'bg-orange-50 text-orange-650 border border-orange-100'
                    }`}>
                      {isDraft ? 'DRAFT' : 'ACTIVE'}
                    </span>
                  </div>
                  <span className="font-black text-gray-900 text-lg">
                    🪙{budgetValue.toLocaleString()}
                  </span>
                </div>

                {/* Campaign Title & Bio */}
                <div>
                  <h4 className="font-black text-gray-900 text-base leading-tight tracking-tight">
                    {camp.title}
                  </h4>
                  <p className="text-gray-500 text-xs font-medium mt-2 leading-relaxed">
                    {camp.description || 'Promoting our flagship high-performance hardware lineup to tech enthusiasts.'}
                  </p>
                </div>

                {/* Requirements / Deliverables */}
                {camp.requirements && camp.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {camp.requirements.map((req, rIdx) => (
                      <span key={rIdx} className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-600 border border-gray-150 text-[10px] font-medium">
                        {req}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                {isDraft ? (
                  <button 
                    onClick={() => { setNewCampaign({ title: camp.title, description: camp.description, budget: camp.budget, requirements: camp.requirements?.join(', ') || '', niche: camp.niche || 'Tech' }); setActiveTab('create'); }}
                    className="w-full py-3.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 mt-2 transition-colors"
                  >
                    <Edit3 size={14} /> Edit Draft
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Link 
                      to={`/campaigns/${camp._id}`}
                      className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all text-center animate-reveal-up"
                    >
                      View & Applications <ArrowRight size={14} className="rotate-[-45deg]" />
                    </Link>
                    <button 
                      onClick={() => setActiveTab('deals')}
                      className="flex-1 py-3.5 bg-white border border-gray-250 hover:bg-gray-50 hover:border-gray-300 text-gray-700 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                    >
                      Analyze Brief
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {campaigns.length === 0 && (
            <div className="bg-white rounded-[24px] p-12 border border-gray-150 text-center opacity-60">
              <Briefcase size={36} className="text-gray-355 mx-auto mb-3" />
              <p className="font-black text-gray-950 uppercase tracking-widest text-xs">No Campaigns Found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BrandCampaigns;
