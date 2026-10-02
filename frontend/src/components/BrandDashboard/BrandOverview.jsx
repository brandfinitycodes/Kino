import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, Clock, CheckCircle, Search, Save, Settings, X, Heart, ShieldCheck, Mail, Building, MapPin, Map, Link as LinkIcon, User, FileText, ArrowRight, Check, AlertCircle, ChevronRight, Activity, TrendingUp, CircleDollarSign, ExternalLink, Filter, Briefcase, Eye, Lock, Edit3, Quote, Download, MessageCircle, MoreVertical, PlusCircle, LayoutDashboard, Share2, Filter as FilterIcon, Search as SearchIcon, Copy, Link2, Download as DownloadIcon, Zap, Target, SlidersHorizontal, MessageSquare, Star, Flag, ChevronDown, UploadCloud, Rocket, Info, MoreHorizontal, DollarSign } from 'lucide-react';
import Odometer from 'react-odometerjs';
import 'odometer/themes/odometer-theme-default.css';

const BrandOverview = (props) => {
  const { 
    profile, setProfile, user, deals = [], campaigns = [], allCreators = [], activeTab, setActiveTab, showToast,
    chartTab, setChartTab, chartData = [], maxEarnings = 1, hoveredBar, setHoveredBar, currentMonth, now = new Date(),
    totalBudgetSpent = 0, milestoneCoins = 0, activeDeals = [], deliverableCounts = { approved: 0, revisions: 0, drafts: 0, review: 0, total: 1 }, totalDealsChart = 1,
    browseFilter, setBrowseFilter, browseSearch, setBrowseSearch, handlePostCampaign,
    newCampaign, setNewCampaign, createStep, setCreateStep, handleProfileUpdate,
    campaignFilter, setCampaignFilter, campaignSearch, setCampaignSearch,
    dealFilter, setDealFilter, dealPage, setDealPage, setActiveChatDeal, activeChatDeal,
    message, transactions = []
  } = props;

  const liveActivity = [
    { title: "Campaign Launched", desc: "Summer Sale Promo went live", time: "2h ago", icon: <Activity size={14} />, color: "bg-[#EA580C]" },
    { title: "Creator Accepted", desc: "New creator joined the campaign", time: "5h ago", icon: <User size={14} />, color: "bg-blue-500" },
    { title: "Milestone Coins", desc: "Coins allocated for campaign", time: "1d ago", icon: <Lock size={14} />, color: "bg-emerald-500" }
  ];

  return (
    <>
      <motion.div
        initial="hidden" animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        className="flex flex-col relative z-10"
      >
        {/* Header/Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 tracking-tight">Dashboard</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
              <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                Hello {profile.businessName || 'Brand'} <span className="text-xl">👋</span>
              </p>
              {(() => {
                let score = 0;
                if (profile.businessName) score += 20;
                if (profile.website) score += 20;
                if (profile.description) score += 20;
                if (profile.location) score += 20;
                if (profile.logo) score += 20;
                return (
                  <span className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-500/10 to-pink-500/10 text-[#EA580C] border border-[#EA580C]/25 rounded-full text-[10px] font-black tracking-widest uppercase">
                    Profile Completion: {score}%
                  </span>
                );
              })()}
            </div>
          </div>
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-[11px] font-bold shadow-sm hover:bg-gray-50 transition-all">
                <span className="w-3 h-3 rounded-full border border-gray-400 flex items-center justify-center text-[6px] text-gray-600">Y</span>
                Filters
              </button>
              <button onClick={() => setActiveTab('create')} className="flex items-center gap-2 px-4 py-2 bg-[#EA580C] text-white rounded-full text-[11px] font-bold shadow-lg shadow-[#EA580C]/20 hover:scale-105 transition-transform">
                <Plus size={14} /> Add New
              </button>
            </div>
            <div className="text-[10px] font-medium text-gray-400 text-right leading-tight">
              {currentMonth}<br/>{now.getFullYear()}
            </div>
          </div>
        </div>

        {/* OVERVIEW (BRAND ANALYTICS) */}
        <div className="flex flex-col relative z-10 pb-24 bg-gray-50/50 rounded-[32px] p-2 animate-reveal-up">
          {/* ROW 1 (TOP): 4 Premium Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            {[
              { title: 'Total Spent', value: `🪙${totalBudgetSpent.toLocaleString()}`, iconColor: 'text-[#EA580C]', iconBg: 'bg-[#EA580C]/10', icon: <Wallet size={24} />, onClick: () => setActiveTab('wallet') },
              { title: 'Milestone Coins', value: `🪙${milestoneCoins.toLocaleString()}`, iconColor: 'text-indigo-500', iconBg: 'bg-indigo-500/10', icon: <Clock size={24} />, onClick: () => setActiveTab('wallet') },
              { title: 'Active Deals', value: activeDeals.length, iconColor: 'text-[#eb4898]', iconBg: 'bg-[#eb4898]/10', icon: <Briefcase size={24} />, select: 'Monthly', onClick: () => setActiveTab('deals') },
              { title: 'Campaigns', value: campaigns.length, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10', icon: <CheckCircle size={24} />, onClick: () => setActiveTab('campaigns') }
            ].map((card, i) => (
              <div key={i} onClick={card.onClick} className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 flex flex-col justify-between h-36 sm:h-44 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-gray-100 transition-all duration-500 cursor-pointer group">
                <div className="flex justify-between items-start relative z-10">
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                    {React.cloneElement(card.icon, { size: 18 })}
                  </div>
                  {card.select && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                      {card.select}
                    </span>
                  )}
                </div>
                <div className="relative z-10 flex flex-col gap-1 mt-auto">
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">{card.title}</span>
                  <span className="text-xl sm:text-4xl font-display font-black text-gray-900 tracking-tighter">{card.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ROW 2 (BELOW MATRIX CARDS): High-Level Analytics */}
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {/* Left: Total Spend Area Chart */}
            <div className="flex-1 bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
              <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row justify-between items-start mb-8 relative z-10 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Total Spend</h3>
                    <span className="flex items-center gap-1 bg-green-50 text-green-500 border border-green-100 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest">
                      <TrendingUp size={10} /> +14%
                    </span>
                  </div>
                  <div className="flex items-end gap-3 mb-1">
                    <h2 className="text-5xl font-display font-black text-gray-900 tracking-tighter">
                      <span className="text-[#EA580C] mr-1">🪙</span><Odometer value={totalBudgetSpent} duration={2000} />
                    </h2>
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">All-time Spending</span>

                  <div className="mt-8 flex items-center gap-4">
                    <div>
                      <h4 className="text-2xl font-display font-black text-gray-900 tracking-tight">🪙{milestoneCoins.toLocaleString()}</h4>
                      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Funds-secured Held</span>
                    </div>
                    <div className="h-10 w-px bg-gray-100"></div>
                    <button onClick={() => setActiveTab('wallet')} className="flex items-center gap-2 bg-[#EA580C] hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_8px_25px_rgba(234,88,12,0.4)] hover:shadow-[0_8px_25px_rgba(79,70,229,0.4)] active:scale-95">
                      <Wallet size={14} /> Wallet
                    </button>
                  </div>
                </div>

                {/* Chart Tabs */}
                <div className="flex flex-col items-start sm:items-end gap-4">
                  <div className="flex bg-gray-50/50 p-1 rounded-xl border border-gray-100 shadow-inner">
                    {['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].map(tab => (
                      <button key={tab} onClick={() => setChartTab(tab)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest transition-all ${chartTab === tab ? 'bg-[#EA580C] text-white shadow-md' : 'text-gray-400 hover:text-gray-900'}`}>
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* DYNAMIC AREA CHART */}
              <div className="h-[280px] w-full mt-4 flex items-end justify-between gap-1 sm:gap-2 relative z-10 group/chart">
                <div className="absolute inset-0 pointer-events-none border-b border-gray-100">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="absolute w-full border-t border-gray-100/50 flex items-start" style={{ bottom: `${i * 33.33}%` }}>
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest -mt-4 ml-1">
                        🪙{(maxEarnings * (i / 3)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  ))}
                </div>

                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path 
                    d={`M5,100 ${chartData.map((d, i) => {
                      const x = 5 + (i / Math.max(1, chartData.length - 1)) * 90;
                      const y = 100 - (((d.earnings || 0) / maxEarnings) * 100);
                      return `L${x},${y}`;
                    }).join(' ')} L95,100 Z`}
                    fill="url(#gradientEarnings)"
                    className="transition-all duration-1000 ease-in-out opacity-40 group-hover/chart:opacity-60"
                  />
                  <path 
                    d={`M ${chartData.map((d, i) => {
                      const x = 5 + (i / Math.max(1, chartData.length - 1)) * 90;
                      const y = 100 - (((d.earnings || 0) / maxEarnings) * 100);
                      return `${x},${y}`;
                    }).join(' L ')}`}
                    fill="none"
                    stroke="#EA580C"
                    strokeWidth="3"
                    className="transition-all duration-1000 ease-in-out drop-shadow-md"
                  />
                  <defs>
                    <linearGradient id="gradientEarnings" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#EA580C" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>

                {chartData.map((d, i) => {
                  const heightPct = ((d.earnings || 0) / maxEarnings) * 100;
                  const isHovered = hoveredBar === i;
                  const xPos = 5 + (i / Math.max(1, chartData.length - 1)) * 90;
                  return (
                    <div 
                      key={i} 
                      className="absolute bottom-0 flex flex-col justify-end items-center h-full cursor-pointer z-10"
                      style={{ left: `calc(${xPos}% - 30px)`, width: '60px' }}
                      onMouseEnter={() => setHoveredBar && setHoveredBar(i)}
                      onMouseLeave={() => setHoveredBar && setHoveredBar(null)}
                    >
                      <div className="w-full h-full relative group/bar flex justify-center">
                        <div className={`absolute bottom-0 w-8 bg-orange-50/50 transition-all duration-300 rounded-t-xl ${isHovered ? 'h-full opacity-100' : 'h-0 opacity-0'}`}></div>
                        <div 
                          className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-[#EA580C] rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(234,88,12,0.5)] ${isHovered ? 'opacity-100 scale-125' : 'opacity-0 scale-50'}`}
                          style={{ bottom: `calc(${heightPct}% - 6px)` }}
                        ></div>
                      </div>
                      <span className={`text-[9px] font-black uppercase mt-3 tracking-widest transition-colors ${isHovered ? 'text-[#EA580C]' : 'text-gray-400'}`}>
                        {d.name}
                      </span>
                      
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute bottom-[100%] left-1/2 -translate-x-1/2 mb-4 bg-gray-900 text-white p-3 rounded-xl shadow-2xl flex flex-col items-center pointer-events-none z-50 min-w-[100px]"
                          >
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{d.name}</span>
                            <span className="text-sm font-black text-white">🪙{(d.earnings || 0).toLocaleString()}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Donut Chart Block */}
            <div className="col-span-1 bg-white rounded-[32px] p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 group lg:w-[360px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#EA580C]/5 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none z-0"></div>
              
              <div className="w-full flex justify-between items-center mb-8 relative z-10">
                <h3 className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Campaign Stats</h3>
                <span className="flex items-center gap-1 bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest">
                  TOTAL {totalDealsChart}
                </span>
              </div>

              <div className="relative w-56 h-56 mb-8 group-hover:scale-105 transition-transform duration-500 z-10">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-display font-black text-gray-900 tracking-tighter">{deliverableCounts.approved}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Active</span>
                </div>
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-xl">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset={251.2 - ((deliverableCounts.approved / totalDealsChart) * 251.2)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset={251.2 - ((deliverableCounts.revisions / totalDealsChart) * 251.2)} transform={`rotate(${360 * (deliverableCounts.approved / totalDealsChart)} 50 50)`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eb4898" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset={251.2 - (((deliverableCounts.drafts + deliverableCounts.review) / totalDealsChart) * 251.2)} transform={`rotate(${360 * ((deliverableCounts.approved + deliverableCounts.revisions) / totalDealsChart)} 50 50)`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>
              </div>

              <div className="flex justify-between w-full mt-auto gap-2 relative z-10">
                <div className="flex-1 flex flex-col items-center bg-blue-50/50 rounded-2xl p-3 border border-blue-100/50 hover:bg-blue-50 hover:shadow-sm transition-all cursor-default">
                  <span className="font-black text-blue-500 text-xl mb-1">{totalDealsChart > 0 ? Math.round((deliverableCounts.approved / totalDealsChart) * 100) : 0}%</span>
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Active</span>
                </div>
                <div className="flex-1 flex flex-col items-center bg-orange-50/50 rounded-2xl p-3 border border-orange-100/50 hover:bg-orange-50 hover:shadow-sm transition-all cursor-default">
                  <span className="font-black text-orange-500 text-xl mb-1">{totalDealsChart > 0 ? Math.round((deliverableCounts.revisions / totalDealsChart) * 100) : 0}%</span>
                  <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Completed</span>
                </div>
                <div className="flex-1 flex flex-col items-center bg-pink-50/50 rounded-2xl p-3 border border-pink-100/50 hover:bg-pink-50 hover:shadow-sm transition-all cursor-default">
                  <span className="font-black text-[#eb4898] text-xl mb-1">{totalDealsChart > 0 ? Math.round(((deliverableCounts.drafts + deliverableCounts.review) / totalDealsChart) * 100) : 0}%</span>
                  <span className="text-[9px] font-black text-[#eb4898]/60 uppercase tracking-widest">Drafts</span>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 3: Target Demographics */}
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            <div className="lg:w-2/3 bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col relative overflow-hidden group">
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h3 className="font-black text-gray-900 text-lg tracking-tight">Target Demographics</h3>
                  <p className="text-xs font-medium text-gray-400 mt-1">Aggregated data across all active campaigns</p>
                </div>
                <button className="text-[10px] font-bold text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-[#EA580C] hover:text-white transition-colors uppercase tracking-widest">Connect API</button>
              </div>

              <div className="flex flex-col sm:flex-row gap-8 items-center justify-between h-full relative z-10">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-28 h-28">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="15" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eb4898" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset="100.48" strokeLinecap="round" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset="150.72" transform="rotate(144 50 50)" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-black text-gray-900">100%</div>
                  </div>
                  <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#eb4898]"></div> Female 60%</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#EA580C]"></div> Male 40%</span>
                  </div>
                </div>

                <div className="flex-1 w-full h-32 flex items-end justify-between gap-2 px-4 border-l border-gray-100">
                  {[{ label: '13-17', val: 10 }, { label: '18-24', val: 45 }, { label: '25-34', val: 30 }, { label: '35+', val: 15 }].map(age => (
                    <div key={age.label} className="flex flex-col items-center flex-1 h-full justify-end group/bar cursor-default">
                      <div className="w-full max-w-[24px] bg-gray-100 rounded-t-md h-full relative flex items-end overflow-hidden">
                        <div style={{ height: `${age.val}%` }} className="w-full bg-[#EA580C]/80 group-hover/bar:bg-[#EA580C] transition-colors rounded-t-md"></div>
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 mt-2">{age.label}</span>
                    </div>
                  ))}
                </div>

                <div className="w-full sm:w-48 flex flex-col gap-3 pl-4 border-l border-gray-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1"><MapPin size={12} /> Top Cities</span>
                  {[{ city: 'Mumbai', val: '32%' }, { city: 'New York', val: '18%' }, { city: 'London', val: '12%' }].map(loc => (
                    <div key={loc.city} className="flex justify-between items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                      <span className="text-[11px] font-bold text-gray-700">{loc.city}</span>
                      <span className="text-[11px] font-black text-[#EA580C]">{loc.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:w-1/3 bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col relative overflow-hidden group">
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="font-black text-gray-900 text-lg tracking-tight">Timeline</h3>
                <span className="bg-gray-50 text-gray-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100">Upcoming</span>
              </div>
              <div className="flex flex-col gap-4 relative z-10 flex-1 justify-center items-center text-center">
                <Clock className="w-8 h-8 text-gray-300 mb-1" />
                <p className="text-xs font-bold text-gray-400">No upcoming campaign milestones due today.</p>
              </div>
            </div>
          </div>

          {/* ROW 4: Detailed Analytics & Action Center */}
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            <div className="lg:w-[350px] bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col relative overflow-hidden group hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#EA580C]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-[#EA580C]/10 transition-colors"></div>
              <div className="flex justify-between items-center mb-8 relative z-10">
                <h3 className="text-gray-900 font-black text-lg tracking-tight">Activity Feed</h3>
                <button className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:underline">View All</button>
              </div>
              <div className="flex flex-col gap-6 relative z-10">
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gray-100 z-0"></div>

                {liveActivity.length === 0 ? (
                  <p className="text-xs font-bold text-gray-400 text-center mt-4">No recent activity.</p>
                ) : liveActivity.map((act, i) => (
                  <div key={i} className="flex gap-4 relative z-10 group/act">
                    <div className={`w-8 h-8 rounded-full ${act.color} text-white flex items-center justify-center shrink-0 border-4 border-white shadow-sm transition-transform group-hover/act:scale-110`}>
                      {act.icon}
                    </div>
                    <div className="flex flex-col justify-center pt-1 pb-2">
                      <span className="text-[11px] font-black text-gray-900 tracking-wide">{act.title}</span>
                      <span className="text-[10px] font-bold text-gray-500 leading-snug mt-0.5">{act.desc}</span>
                      <span className="text-[9px] font-black text-gray-300 mt-1 uppercase">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col overflow-hidden relative group hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h3 className="text-gray-900 font-black text-lg tracking-tight">Active Contracts</h3>
                  <p className="text-[11px] font-medium text-gray-400 mt-1">Manage your ongoing creator collaborations</p>
                </div>
                <button onClick={() => setActiveTab('deals')} className="flex items-center gap-2 bg-[#EA580C] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-[#C2410C] transition-colors">
                  <LayoutDashboard size={14} /> Open CRM
                </button>
              </div>

              <div className="overflow-x-auto relative z-10 h-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] w-[20%]">Deal ID</th>
                      <th className="pb-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] w-[40%]">Creator</th>
                      <th className="pb-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] w-[20%]">Payout</th>
                      <th className="pb-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-right w-[20%]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {deals.filter(d => d.status !== 'completed').length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-xs font-bold text-gray-400">
                          No active contracts. Hire creators to begin collaborations.
                        </td>
                      </tr>
                    ) : (
                      deals.filter(d => d.status !== 'completed').slice(0, 4).map((d) => (
                        <tr key={d._id} className="hover:bg-gray-50/50 transition-colors group/row cursor-pointer" onClick={() => setActiveTab('deals')}>
                          <td className="py-5 pr-4">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                              #{d._id.substring(d._id.length - 6).toUpperCase()}
                            </span>
                          </td>
                          <td className="py-5 pr-4">
                            <span className="text-[13px] font-black text-gray-900 block truncate">{d.campaignId?.title || 'Direct Collaboration'}</span>
                            <span className="text-[10px] font-bold text-gray-400 mt-0.5 block">{d.creatorId?.name || 'Creator'}</span>
                          </td>
                          <td className="py-5 pr-4">
                            <span className="text-[13px] font-black text-emerald-600 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100">🪙{(d.budget || 0).toLocaleString()}</span>
                          </td>
                          <td className="py-5 text-right">
                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${d.status === 'in_review' ? 'bg-blue-50 text-[#EA580C] border border-blue-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                              {d.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ROW 5: Top Performing Creators */}
          <div className="mb-6">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-gray-900 font-black text-lg tracking-tight">Top Performing Creators</h3>
                <p className="text-[11px] font-medium text-gray-400 mt-1">Creators driving the highest ROI on your campaigns</p>
              </div>
              <button onClick={() => setActiveTab('browse')} className="flex items-center gap-2 bg-white border border-gray-200 text-[#EA580C] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-colors">
                <Edit3 size={14} /> Hire More
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {deals.filter(d => d.status === 'completed').length === 0 ? (
                <div className="col-span-full bg-white rounded-[24px] p-8 text-center border border-gray-100 flex flex-col items-center justify-center w-full">
                  <Star className="text-gray-300 mb-2" size={24} />
                  <p className="text-sm font-bold text-gray-500">No completed collaborations yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Creators will be ranked here based on campaign performance after deals complete.</p>
                </div>
              ) : (
                (() => {
                  const completed = deals.filter(d => d.status === 'completed' && d.creatorId);
                  const creatorMap = {};
                  completed.forEach(d => {
                    const name = d.creatorId.name || 'Unknown';
                    if (!creatorMap[name]) {
                      creatorMap[name] = { name, count: 0, budget: 0, niche: d.creatorId.niche || 'Niche' };
                    }
                    creatorMap[name].count += 1;
                    creatorMap[name].budget += d.budget || 0;
                  });
                  return Object.values(creatorMap).slice(0, 3).map((cr, cIdx) => (
                    <div key={cIdx} className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-3 py-1 rounded-md">{cr.niche}</span>
                      </div>
                      <h4 className="font-display font-black text-2xl text-gray-900 mb-1">{cr.name}</h4>
                      <p className="text-[12px] font-medium text-gray-500 mb-6 flex-1">Delivered high-performance campaigns and content deliverables.</p>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-700"><CheckCircle size={14} className="text-[#eb4898]" /> {cr.count} Campaigns Completed</div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-700"><CheckCircle size={14} className="text-blue-500" /> 🪙{cr.budget.toLocaleString()} Total Spent</div>
                      </div>
                    </div>
                  ));
                })()
              )}
            </div>
          </div>

          {/* ROW 6: Brand Reputation & Export Report */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-gray-900 font-black text-lg tracking-tight">Brand Reputation</h3>
                  <p className="text-[11px] font-medium text-gray-400 mt-1">What creators are saying about working with you</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-2 text-4xl font-display font-black text-gray-900">4.9 <Star size={24} className="fill-amber-400 text-amber-400" /></div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">From 36 Reviews</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {deals.filter(d => d.status === 'completed').length === 0 ? (
                  <div className="col-span-full bg-white p-8 rounded-[32px] text-center border border-gray-100 w-full">
                    <Quote className="mx-auto text-gray-200 mb-3" size={32} />
                    <p className="text-sm font-bold text-gray-500">No reviews received yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Complete deals with creators to build your platform reputation score.</p>
                  </div>
                ) : (
                  deals.filter(d => d.status === 'completed' && d.creatorId).slice(0, 3).map((d) => (
                    <div key={d._id} className="bg-white p-8 rounded-[32px] relative group hover:-translate-y-2 transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-gray-100 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#EA580C] to-[#BE123C] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Quote className="absolute top-6 right-6 text-gray-100 group-hover:text-orange-50 transition-colors" size={40} />
                      <div className="flex text-amber-400 mb-6 gap-1 relative z-10">
                        {[...Array(5)].map((_, idx) => <Star key={idx} size={14} fill="currentColor" />)}
                      </div>
                      <p className="text-[14px] font-medium text-gray-600 leading-relaxed relative z-10 min-h-[80px]">"Delivered amazing high quality results, quick turnarounds and highly professional communication during the collaboration."</p>
                      <div className="mt-8 flex items-center gap-4 relative z-10 pt-6 border-t border-gray-50">
                        <div className="w-10 h-10 bg-[#EA580C] text-white rounded-full flex items-center justify-center font-black text-[12px] shadow-sm ring-4 ring-orange-50">
                          {(d.creatorId.name || 'CR').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-gray-900 leading-none">{d.creatorId.name || 'Verified Creator'}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">Verified Creator</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Export Banner */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-[32px] p-8 sm:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.2)] flex flex-col sm:flex-row items-center justify-between relative overflow-hidden group border border-gray-800">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#EA580C]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-[#EA580C]/30 transition-colors duration-700"></div>
              <div className="relative z-10 flex flex-col items-start gap-3 max-w-xl">
                <span className="bg-[#EA580C]/10 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-black text-[#EA580C] uppercase tracking-widest border border-[#EA580C]/20">
                  <FileText size={12} /> Shareable Report
                </span>
                <h3 className="font-display font-black text-white text-3xl tracking-tight">Export Professional Brand Report</h3>
                <p className="text-gray-400 font-medium text-[13px] leading-relaxed">Instantly generate a beautiful PDF containing your latest active campaigns, spend analytics, and brand reputation to send directly to your team.</p>
              </div>
              <button onClick={() => showToast && showToast('Generating Brand Report...', 'success')} className="mt-6 sm:mt-0 relative z-10 flex items-center gap-2 bg-[#EA580C] text-white hover:bg-[#C2410C] px-8 py-4 rounded-xl text-[12px] font-black uppercase tracking-widest shadow-[0_8px_25px_rgba(234,88,12,0.4)] hover:shadow-[0_15px_35px_rgba(234,88,12,0.5)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto justify-center">
                <Download size={16} strokeWidth={2.5} /> Generate PDF
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default BrandOverview;
