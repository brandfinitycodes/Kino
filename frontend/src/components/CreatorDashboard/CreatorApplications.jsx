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


const CreatorApplications = ({ applications, deals, onConfirm, onNudge, onWithdraw, setActiveTab }) => {
  // Kanban view mode removed, grid view is active by default
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [toastMessage, setToastMessage] = useState(null);

  const handleNudge = (e, appId) => {
    e.preventDefault();
    if (onNudge) onNudge(appId);
  };

  const handleWithdraw = (e, appId) => {
    e.preventDefault();
    if (onWithdraw) onWithdraw(appId);
  };

  const totalApps = applications.length;
  const acceptedApps = applications.filter(a => ['accepted', 'confirmed_by_creator'].includes(a.status));
  const pendingApps = applications.filter(a => a.status === 'pending');
  const rejectedApps = applications.filter(a => a.status === 'rejected');

  const winRate = totalApps > 0 ? Math.round((acceptedApps.length / totalApps) * 100) : 0;
  const pipelineValue = pendingApps.reduce((acc, a) => acc + (a.campaignId?.budget || 0), 0);

  let filtered = [...applications];
  if (filterStatus !== 'All') {
    const map = { 'Pending': 'pending', 'Accepted': 'accepted', 'Rejected': 'rejected' };
    filtered = filtered.filter(a => a.status === map[filterStatus] || (filterStatus === 'Accepted' && a.status === 'confirmed_by_creator'));
  }

  filtered.sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortOrder === 'budget_high') return (b.campaignId?.budget || 0) - (a.campaignId?.budget || 0);
    return 0;
  });

  const renderAppCard = (app, isBoard = false) => {
    const isPending = app.status === 'pending';
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        key={app._id}
        className={`group relative bg-white rounded-[24px] p-2 hover:bg-white transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] border border-gray-100 flex flex-col ${isBoard ? 'w-full mb-4' : 'h-full hover:-translate-y-1'}`}
      >
        <div className={`relative w-full rounded-[20px] overflow-hidden mb-3 bg-gray-100 ${isBoard ? 'h-36' : 'h-48'}`}>
          <img src={getPlaceholderImage(app.campaignId?.niche || app.campaignId?.category)} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>

          <div className="absolute top-3 right-3 z-10 flex gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg overflow-hidden">
              {app.campaignId?.brandId?.logo ? <img src={app.campaignId.brandId.logo} className="w-full h-full object-cover" /> : <Building size={14} className="text-white drop-shadow-md" />}
            </div>
          </div>

          <div className="absolute bottom-3 left-3 z-10">
            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest backdrop-blur-md flex items-center gap-1.5 shadow-sm ${
              app.status === 'accepted' || app.status === 'confirmed_by_creator' ? 'bg-emerald-500 text-white border border-emerald-400' :
              app.status === 'rejected' ? 'bg-[#eb4898] text-white border border-[#eb4898]' :
              'bg-[#EA580C] text-white border border-[#EA580C]'
              }`}>
              {app.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="px-3 pb-3 flex flex-col flex-1">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h4 className="text-[15px] font-black text-gray-900 tracking-tight line-clamp-1 group-hover:text-[#EA580C] transition-colors">{app.campaignId?.title}</h4>
          </div>

          <div className="flex items-center gap-2 mb-5">
            <span className="bg-gray-50 px-2 py-1 rounded-md text-[10px] font-bold text-gray-500 border border-gray-100">{new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
            <span className="text-[11px] font-bold text-gray-600 truncate flex items-center gap-1"><CheckCircle size={10} className="text-blue-500"/> {app.campaignId?.brandId?.businessName || 'Premium Brand'}</span>
          </div>

          <div className="mt-auto flex flex-col gap-2 pt-2 border-t border-gray-50">
            {(app.status === "accepted" || app.status === "confirmed_by_creator") && !deals.some(d => (d.applicationId?._id || d.applicationId)?.toString() === app._id?.toString()) && (
              <button
                onClick={() => onConfirm(app._id, app.status)}
                className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white text-[11px] font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
              >
                {app.status === "confirmed_by_creator" ? "Retry Deal" : "Accept & Start Deal"} <ArrowUpRight size={14} />
              </button>
            )}
            {(app.status === "accepted" || app.status === "confirmed_by_creator") && deals.some(d => (d.applicationId?._id || d.applicationId)?.toString() === app._id?.toString()) && (
              <button
                onClick={() => setActiveTab && setActiveTab('deals')}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-[11px] font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                View Active Deal <ArrowUpRight size={14} />
              </button>
            )}

            {isPending && (
              <div className="flex gap-2">
                <button onClick={(e) => handleNudge(e, app._id)} className="flex-1 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-indigo-600 border border-indigo-100 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5">
                  <Bell size={12} className="animate-pulse" /> Nudge Brand
                </button>
                <button onClick={(e) => handleWithdraw(e, app._id)} className="w-12 flex items-center justify-center bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-100 hover:border-red-100 rounded-xl transition-colors">
                  <X size={14} />
                </button>
              </div>
            )}

            <Link to={`/campaigns/${app.campaignId?._id}`} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-colors text-center border border-gray-100 hover:border-gray-200">
              Review Campaign Brief
            </Link>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div {...ANIMATION_VARIANTS} className="pb-24 pt-4 px-4 md:px-0 relative z-10">
      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white px-6 py-3 rounded-2xl text-[13px] font-bold shadow-2xl flex items-center gap-3 border border-gray-700">
            <CheckCircle size={18} className="text-emerald-400" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Light Header */}
      <div className="mb-6 p-8 sm:p-12 rounded-[32px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-white relative overflow-hidden group shadow-[0_20px_50px_rgba(79,70,229,0.05)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-200/50 to-indigo-200/50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-1000 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-200/50 to-cyan-200/50 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center md:text-left">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/60 border border-white backdrop-blur-md mb-4 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Application Hub</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-display font-black leading-[1.1] tracking-tight mb-4 text-gray-900">
              Pipeline <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Manager</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-gray-600 font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
              Track your sent proposals, nudge brands, and kickstart your next big collaborations.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Colorful Success Metrics Banner */}
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100/50 rounded-[24px] p-6 flex items-center justify-between shadow-[0_10px_30px_rgba(59,130,246,0.05)] hover:-translate-y-1 transition-transform">
          <div>
            <p className="text-[11px] font-black text-blue-800/60 uppercase tracking-widest mb-1">Active Proposals</p>
            <h4 className="text-3xl font-black text-gray-900">{pendingApps.length}</h4>
          </div>
          <div className="w-14 h-14 rounded-[16px] bg-white flex items-center justify-center text-blue-500 shadow-sm border border-blue-50"><Folder size={24} /></div>
        </div>
        <div className="flex-1 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50 rounded-[24px] p-6 flex items-center justify-between shadow-[0_10px_30px_rgba(16,185,129,0.05)] hover:-translate-y-1 transition-transform">
          <div>
            <p className="text-[11px] font-black text-emerald-800/60 uppercase tracking-widest mb-1">Win Rate</p>
            <h4 className="text-3xl font-black text-gray-900">{winRate}%</h4>
          </div>
          <div className="w-14 h-14 rounded-[16px] bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-50"><CheckCircle size={24} /></div>
        </div>
        <div className="flex-1 bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100/50 rounded-[24px] p-6 flex items-center justify-between shadow-[0_10px_30px_rgba(168,85,247,0.05)] hover:-translate-y-1 transition-transform">
          <div>
            <p className="text-[11px] font-black text-purple-800/60 uppercase tracking-widest mb-1">Pipeline Value</p>
            <h4 className="text-3xl font-black text-gray-900">🪙{pipelineValue.toLocaleString()}</h4>
          </div>
          <div className="w-14 h-14 rounded-[16px] bg-white flex items-center justify-center text-purple-500 shadow-sm border border-purple-50"><TrendingUp size={24} /></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white/60 backdrop-blur-md p-3 rounded-[24px] shadow-sm border border-gray-100">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar pb-1.5 pt-0.5 px-3 -mx-3 sm:mx-0 sm:px-0 scroll-smooth">
          {['All', 'Pending', 'Accepted', 'Rejected'].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)} className={`px-5 py-2.5 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all whitespace-nowrap shadow-sm ${filterStatus === f ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-100'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex w-full sm:w-auto items-center">
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="w-full sm:w-auto bg-white border border-gray-100 shadow-sm text-gray-700 text-[11px] font-black uppercase tracking-widest rounded-xl px-5 py-2.5 outline-none cursor-pointer hover:bg-gray-50 transition-colors">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="budget_high">Highest Budget</option>
          </select>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-dashed border-gray-200 p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-50 to-amber-50 rounded-[24px] rotate-6 flex items-center justify-center mb-6 shadow-[0_10px_20px_rgba(245,158,11,0.1)] border border-orange-100">
            <Folder size={40} className="text-orange-400 -rotate-6" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-3">Empty Pipeline</h3>
          <p className="text-gray-500 font-medium max-w-sm mb-8 leading-relaxed">You haven't applied to any campaigns yet. Explore the marketplace to find exciting brand deals.</p>
          <button onClick={() => setActiveTab('discover')} className="bg-gradient-to-r from-[#EA580C] to-[#F59E0B] text-white text-[13px] font-black uppercase tracking-widest px-10 py-5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Explore Marketplace
          </button>
        </div>
      ) : (
        <>
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map(app => renderAppCard(app, false))}
          </motion.div>
        </>
      )}
    </motion.div>
  );
};


export default CreatorApplications;
