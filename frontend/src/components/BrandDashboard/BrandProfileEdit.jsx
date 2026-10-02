import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, Clock, CheckCircle, Search, Save, Settings, X, Heart, ShieldCheck, Mail, Building, MapPin, Map, Link as LinkIcon, User, FileText, ArrowRight, Check, AlertCircle, ChevronRight, Activity, TrendingUp, CircleDollarSign, ExternalLink, Filter, Briefcase, Eye, Lock, Edit3, Quote, Download, MessageCircle, MoreVertical, PlusCircle, LayoutDashboard, Share2, Filter as FilterIcon, Search as SearchIcon, Copy, Link2, Download as DownloadIcon, Zap, Target, SlidersHorizontal, MessageSquare, Star, Flag, ChevronDown, UploadCloud, Rocket, Info, MoreHorizontal, DollarSign } from 'lucide-react';
import Odometer from 'react-odometerjs';
import 'odometer/themes/odometer-theme-default.css';

const BrandProfileEdit = (props) => {
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
      
          <div className="flex flex-col animate-reveal-up bg-white rounded-[20px] border border-gray-200 shadow-sm overflow-hidden mb-24 md:mb-8">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 bg-gray-50/50">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-gray-900 leading-tight">Edit Brand Profile</h2>
                  <p className="text-[13px] text-gray-400 font-medium">Update your brand identity and targeting preferences.</p>
                </div>
              </div>
              <button onClick={() => setActiveTab('overview')} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form Content */}
            <form className="p-4 sm:p-6 flex flex-col gap-6" onSubmit={handleProfileUpdate}>
              {/* Single Column Form */}
              <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-gray-800">Brand Name <span className="text-red-500">*</span></label>
                    <input required type="text" defaultValue={profile.businessName || 'agroMilkMaster'} placeholder="e.g. Acme Corp" className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-gray-400 transition-colors placeholder:text-gray-400" />
                  </div>
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-[12px] font-bold text-gray-800">Business Type <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input required type="text" placeholder="Search type" className="w-full bg-white border border-gray-200 rounded-[10px] pl-10 pr-4 py-3 text-[13px] text-gray-900 outline-none focus:border-gray-400 transition-colors placeholder:text-gray-400" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-[12px] font-bold text-gray-800">Location <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input required type="text" placeholder="Search location" className="w-full bg-white border border-gray-200 rounded-[10px] pl-10 pr-4 py-3 text-[13px] text-gray-900 outline-none focus:border-gray-400 transition-colors placeholder:text-gray-400" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-[12px] font-bold text-gray-800">Target Audience</label>
                    <div className="relative">
                      <select defaultValue="" className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-gray-400 transition-colors appearance-none placeholder:text-gray-400">
                        <option value="" disabled>Select Audience</option>
                        <option>Gen Z (18-24)</option>
                        <option>Millennials (25-34)</option>
                        <option>Gen X (35-54)</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
              </div>

              {/* Upload Area */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[12px] font-bold text-gray-800">Brand Logo / Guidelines</label>
                <div className="w-full border border-dashed border-gray-300 rounded-[12px] bg-white flex flex-col items-center justify-center py-8 gap-1 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 mb-1">
                    <UploadCloud size={20} />
                  </div>
                  <p className="text-[13px] font-bold text-gray-800">Tap to upload files</p>
                  <p className="text-[10px] text-gray-400 mb-3">txt, docx, pdf, jpeg, png - Up to 50MB</p>
                  <button type="button" onClick={() => showToast('File browser opened.', 'success')} className="px-4 py-2 bg-white border border-gray-200 rounded-[8px] text-[11px] font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
                    Browse files
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-[13px] font-bold text-gray-800">Brand Narrative</label>
                <textarea placeholder="Describe your brand narrative here!" className="w-full bg-white border border-gray-200 rounded-[12px] px-4 py-3 text-[14px] text-gray-900 outline-none focus:border-gray-400 transition-colors min-h-[120px] resize-none placeholder:text-gray-400" />
              </div>

              {/* Brand Guardrails */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[12px] font-bold text-gray-800">"Will Not Sponsor" Guardrails</label>
                <input type="text" placeholder="e.g. Gambling, Alcohol, Political (Comma separated)" className="w-full bg-[#fff5f5] border border-red-100/50 rounded-[10px] px-4 py-3 text-[13px] text-red-500 outline-none focus:border-red-300 transition-colors placeholder:text-red-300" />
                <p className="text-[9px] text-gray-400">Specify content themes you refuse to sponsor to pre-filter creators.</p>
              </div>

              {/* Security & Access */}
              <div className="flex flex-col gap-4 mt-6 p-6 rounded-[24px] bg-gray-50 border border-gray-200">
                <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2"><Lock size={16} /> Security & Access</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold text-gray-600">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-2.5 text-[14px] text-gray-900 outline-none focus:border-gray-400 transition-colors" />
                  </div>
                  <div className="hidden sm:block"></div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold text-gray-600">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-2.5 text-[14px] text-gray-900 outline-none focus:border-gray-400 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold text-gray-600">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-2.5 text-[14px] text-gray-900 outline-none focus:border-gray-400 transition-colors" />
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-[16px] bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900">Two-Factor Authentication (2FA)</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Protect your brand wallet with an extra layer of security.</p>
                  </div>
                  <button type="button" onClick={() => showToast('2FA settings toggled.', 'success')} className="relative w-10 h-5 rounded-full transition-colors duration-300 bg-gray-300 cursor-pointer flex items-center px-0.5">
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </button>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex flex-col gap-3 mt-4 pt-4 sm:pt-6 sm:border-t sm:border-gray-100 pb-8 sm:pb-0">
                <button type="button" onClick={() => showToast('Changes saved!', 'success')} className="w-full px-6 py-3.5 rounded-[12px] bg-[#EA580C] text-white text-[13px] font-bold hover:bg-[#C2410C] transition-colors shadow-sm text-center">
                  Save Changes
                </button>
                <button type="button" className="w-full px-6 py-3.5 rounded-[12px] bg-white border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm text-center">
                  Reset Data
                </button>
              </div>
            </form>
          </div>
        

        {/* PAGE 7: BRAND WALLET */}
        
    </>
  );
};

export default BrandProfileEdit;
