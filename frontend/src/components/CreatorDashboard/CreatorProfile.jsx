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

export const ANIMATION_VARIANTS = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.25, ease: "easeOut" }
};

export const ScrollAnimatedAvatar = ({ profile }) => {
  const { scrollY } = useScroll();

  const yOffset = useTransform(scrollY, [0, 150], [0, -100]);
  const xOffset = useTransform(scrollY, [0, 150], [0, 120]);
  const scale = useTransform(scrollY, [0, 150], [1, 0.4]);
  const opacity = useTransform(scrollY, [120, 150], [1, 0]);

  return (
    <div className="relative mb-4 h-[76px] w-[76px] mx-auto z-50">
      <motion.div
        style={{ y: yOffset, x: xOffset, scale, opacity, transformOrigin: "center" }}
        className="fixed md:absolute top-auto left-auto w-[76px] h-[76px] rounded-full border-[2.5px] border-[var(--bd-yellow2)] flex items-center justify-center bg-[var(--bd-bg3)] text-[var(--bd-text)] font-bold text-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
      >
        <div className="w-full h-full rounded-full overflow-hidden">
          {profile.profilePicture ? <img src={profile.profilePicture} alt="Avatar" className="w-full h-full object-cover" /> : (profile.name?.substring(0, 2).toUpperCase() || "CR")}
        </div>
        <div className="absolute -bottom-1 -right-2 bg-[rgba(217,242,74,0.15)] text-[var(--bd-yellow2)] border border-[rgba(217,242,74,0.3)] text-[10px] font-bold px-2 py-0.5 rounded-full">
          {calculateProfileCompletion(profile)}%
        </div>
      </motion.div>
    </div>
  );
};

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

const CreatorProfile = ({ profile, deals = [], campaigns = [], applications = [], transactions = [], setActiveTab }) => {
  if (!profile) return null;
  const activeDeals = deals.filter(d => ['pending_payment', 'in_progress', 'revision_requested', 'in_review', 'pending_clearance'].includes(d.status));
  const completedDeals = deals.filter(d => d.status === 'completed');
  const totalEarned = deals.filter(d => d.paymentDetails?.status === 'released' || d.status === 'completed').reduce((acc, d) => acc + (d.paymentAmount || d.applicationId?.campaignId?.budget || d.budget || 0), 0);
  const pendingEarnings = activeDeals.filter(d => d.status !== 'pending_payment').reduce((acc, d) => acc + (d.paymentAmount || d.applicationId?.campaignId?.budget || d.budget || 0), 0);

  const [chartTab, setChartTab] = useState('MONTHLY');
  const [copied, setCopied] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);

  // Success Rate calculations
  const totalApps = applications.length || 1;
  const acceptedApps = applications.filter(a => ['accepted', 'confirmed_by_creator'].includes(a.status)).length;
  const pendingApps = applications.filter(a => a.status === 'pending').length;
  const rejectedApps = applications.filter(a => a.status === 'rejected').length;

  // Generate Dynamic Chart Data from real MongoDB documents (deals & transactions)
  const generateChartData = () => {
    const events = [];

    deals.forEach(d => {
      const amount = d.paymentAmount || d.applicationId?.campaignId?.budget || d.budget || 0;
      const rawDate = d.paymentDetails?.releasedAt || d.updatedAt || d.createdAt;
      if (amount > 0 && rawDate) {
        events.push({ amount: Number(amount), date: new Date(rawDate) });
      }
    });

    (transactions || []).forEach(t => {
      if (t.amount && t.createdAt) {
        events.push({ amount: Math.abs(Number(t.amount)), date: new Date(t.createdAt) });
      }
    });

    const now = new Date();

    if (chartTab === 'DAILY') {
      const currentDayOfWeek = now.getDay();
      const distanceToMon = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - distanceToMon);
      monday.setHours(0, 0, 0, 0);

      const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      return days.map((dayName, idx) => {
        const dayDate = new Date(monday);
        dayDate.setDate(monday.getDate() + idx);
        const daySum = events
          .filter(e => e.date.toDateString() === dayDate.toDateString())
          .reduce((sum, e) => sum + e.amount, 0);
        return { name: dayName, earnings: daySum };
      });
    }

    if (chartTab === 'WEEKLY') {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const monthEvents = events.filter(e => e.date.getMonth() === currentMonth && e.date.getFullYear() === currentYear);

      const weeks = [
        { name: 'WK 1', minDay: 1, maxDay: 7 },
        { name: 'WK 2', minDay: 8, maxDay: 14 },
        { name: 'WK 3', minDay: 15, maxDay: 21 },
        { name: 'WK 4', minDay: 22, maxDay: 31 }
      ];

      return weeks.map(w => {
        const weekSum = monthEvents
          .filter(e => e.date.getDate() >= w.minDay && e.date.getDate() <= w.maxDay)
          .reduce((sum, e) => sum + e.amount, 0);
        return { name: w.name, earnings: weekSum };
      });
    }

    if (chartTab === 'YEARLY') {
      const startYear = now.getFullYear() - 4;
      const years = Array.from({ length: 5 }, (_, i) => (startYear + i).toString());

      return years.map(yr => {
        const yrSum = events
          .filter(e => e.date.getFullYear() === Number(yr))
          .reduce((sum, e) => sum + e.amount, 0);
        return { name: yr, earnings: yrSum };
      });
    }

    // Default: MONTHLY (JAN to DEC for current year)
    const currentYear = now.getFullYear();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months.map((monthName, monthIdx) => {
      const monthSum = events
        .filter(e => e.date.getMonth() === monthIdx && e.date.getFullYear() === currentYear)
        .reduce((sum, e) => sum + e.amount, 0);
      return { name: monthName, earnings: monthSum };
    });
  };

  const chartData = generateChartData();
  const maxEarnings = Math.max(...chartData.map(d => d.earnings), 1);

  return (
    <motion.div id="profile-dashboard-content" {...ANIMATION_VARIANTS} className="flex flex-col relative z-10 pb-24 gap-8">
      {/* Mobile-only Creator Profile Summary Card */}
      <div className="md:hidden bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border border-white shadow-[0_15px_40px_rgba(0,0,0,0.03)] flex flex-col items-center text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-rose-400/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full border-[3px] border-white shadow-md overflow-hidden bg-gray-50 flex items-center justify-center">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-black text-gray-400 bg-gray-100">
                {profile.name?.substring(0, 2).toUpperCase() || 'CR'}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-full p-1.5 border-2 border-white shadow-sm">
            <ShieldCheck size={12} strokeWidth={3} />
          </div>
        </div>

        <h2 className="text-[20px] font-display font-black text-gray-900 tracking-tight mb-1 truncate w-full">
          {profile.name}
        </h2>
        
        <div className="flex flex-wrap justify-center gap-2 mb-5">
          <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-100/50">
            ★ Level 2 Seller
          </span>
          {profile.niche && (
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100/50">
              {profile.niche}
            </span>
          )}
        </div>

        <div className="flex gap-3 w-full">
          <Link
            to={`/creators/${profile._id}`}
            className="flex-1 py-3 bg-gradient-to-r from-[#EA580C] to-[#eb4898] hover:shadow-lg text-white text-[11px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
          >
            <User size={14} /> View Profile
          </Link>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/creators/${profile._id}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className={`flex-1 py-3 border text-[11px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm ${copied ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-800'}`}
          >
            <Copy size={14} /> {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* ROW 1 (TOP): 4 Premium Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Earned', value: `🪙${totalEarned.toLocaleString()}`, icon: <Wallet size={18} strokeWidth={2.5} />, trend: '+28%', trendUp: true, bottomLabel: 'All-time revenue', progress: 100, grad: 'from-emerald-400 to-teal-500', bgText: 'text-emerald-500', shadow: 'shadow-emerald-500/20', onClick: () => setActiveTab('wallet') },
          { title: 'Pending Funds', value: `🪙${pendingEarnings.toLocaleString()}`, icon: <Clock size={18} strokeWidth={2.5} />, trend: '+12%', trendUp: true, bottomLabel: 'Milestone Coins', progress: 45, grad: 'from-orange-400 to-amber-500', bgText: 'text-orange-500', shadow: 'shadow-orange-500/20', onClick: () => setActiveTab('wallet') },
          { title: 'Active Deals', value: activeDeals.length, icon: <Briefcase size={18} strokeWidth={2.5} />, trend: '+5%', trendUp: true, bottomLabel: 'This month', progress: 60, grad: 'from-blue-400 to-indigo-500', bgText: 'text-blue-500', shadow: 'shadow-blue-500/20', onClick: () => setActiveTab('deals') },
          { title: 'Applications', value: applications.length, icon: <Check size={18} strokeWidth={2.5} />, trend: '-2%', trendUp: false, bottomLabel: 'Conversion rate', progress: 30, grad: 'from-pink-400 to-rose-500', bgText: 'text-pink-500', shadow: 'shadow-pink-500/20', onClick: () => setActiveTab('applications') }
        ].map((card, i) => (
          <motion.div key={i} onClick={card.onClick} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-white flex flex-col hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 overflow-hidden relative group cursor-pointer">
            <div className={`absolute -right-6 -bottom-6 opacity-[0.03] ${card.bgText} transform group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700`}>
              {card.icon}
            </div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${card.grad} shadow-lg ${card.shadow}`}>
                {card.icon}
              </div>
              <span className="text-[13px] font-black uppercase tracking-widest text-gray-400">{card.title}</span>
            </div>

            <div className="flex items-end gap-3 mb-8 relative z-10">
              <span className="text-4xl font-display font-black text-gray-900 tracking-tighter leading-none">{card.value}</span>
              <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg mb-1 shadow-sm ${card.trendUp ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {card.trend}
              </span>
            </div>

            <div className="mt-auto relative z-10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{card.bottomLabel}</span>
                <span className="text-[11px] font-black text-gray-900">{card.progress}%</span>
              </div>

              <div className="flex gap-1.5 h-2">
                {[1, 2, 3, 4, 5].map(segment => {
                  const segmentThreshold = segment * 20;
                  const isFilled = card.progress >= segmentThreshold || (card.progress > segmentThreshold - 20 && card.progress > 0);
                  const isPartial = isFilled && card.progress < segmentThreshold;
                  return (
                    <div key={segment} className={`flex-1 rounded-full transition-all duration-1000 ${isFilled ? `bg-gradient-to-r ${card.grad}` : 'bg-gray-100'} ${isPartial ? 'opacity-60' : 'opacity-100'}`}></div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ROW 2 (BELOW MATRIX CARDS): High-Level Analytics & Donut */}
      <div className="flex flex-col lg:flex-row gap-8 mb-6">
        {/* Left: Earnings Area Chart */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex-1 bg-white/80 backdrop-blur-xl rounded-[40px] p-8 sm:p-10 shadow-[0_15px_50px_rgba(0,0,0,0.04)] border border-white flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/40 to-rose-200/40 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-1000 pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row justify-between items-start mb-10 relative z-10 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-gray-500 font-black text-[11px] uppercase tracking-[0.2em]">Total Earnings</h3>
                <span className="flex items-center gap-1 bg-emerald-100/50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-black tracking-widest shadow-sm">
                  <TrendingUp size={12} strokeWidth={3} /> +28%
                </span>
              </div>
              <div className="flex items-end gap-3 mb-2">
                <h2 className="text-5xl sm:text-6xl font-display font-black text-gray-900 tracking-tighter">
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#EA580C] to-[#eb4898] mr-1">🪙</span>{totalEarned.toLocaleString()}
                </h2>
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">All-time Revenue</span>

              <div className="mt-8 flex items-center gap-6">
                <div>
                  <h4 className="text-3xl font-display font-black text-gray-900 tracking-tight">🪙{pendingEarnings.toLocaleString()}</h4>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending / Funds-secured</span>
                </div>
                <div className="h-12 w-px bg-gray-200"></div>
                <button onClick={() => setActiveTab('wallet')} className="flex items-center gap-2 bg-gradient-to-r from-[#EA580C] to-[#eb4898] hover:scale-105 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all shadow-md hover:shadow-lg active:scale-95">
                  <Wallet size={16} /> Open Wallet
                </button>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-4 mt-2 sm:mt-0">
              <div className="flex bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
                {['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setChartTab(tab)}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-[0.15em] transition-all ${chartTab === tab ? 'bg-white text-[#EA580C] shadow-sm border border-gray-100/50' : 'text-gray-400 hover:text-gray-900'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative w-full h-64 mt-auto z-10 pt-4 pb-6 pl-12 pr-4 flex bg-white/40 rounded-[32px] border border-white">
            {chartData.every(d => d.earnings === 0) && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-[3px] text-center rounded-[32px]">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No Earnings Analytics Available</p>
                <p className="text-[10px] text-gray-400 font-semibold mt-1 max-w-xs">Apply to campaigns and start partnerships to populate this chart.</p>
              </div>
            )}
            <div className="absolute left-0 top-4 bottom-6 flex flex-col justify-between text-[11px] font-bold text-gray-400 pr-4 text-right w-12">
              {[5, 4, 3, 2, 1, 0].map(step => (
                <span key={step}>{maxEarnings >= 1000 ? (maxEarnings * (step / 5) / 1000).toFixed(1) + 'K' : Math.round(maxEarnings * (step / 5))}</span>
              ))}
            </div>

            <div className="absolute left-12 right-4 top-4 bottom-6 flex flex-col justify-between pointer-events-none">
              {[5, 4, 3, 2, 1, 0].map(step => (
                <div key={step} className="w-full h-px bg-gray-100/80"></div>
              ))}
            </div>

            <div className="relative w-full h-full flex justify-between items-end gap-2 sm:gap-4 z-10 pl-2 pr-2">
              {chartData.map((data, index) => {
                const heightPct = maxEarnings > 0 ? (data.earnings / maxEarnings) * 100 : 0;
                const isHovered = hoveredBar === index;

                return (
                  <div
                    key={index}
                    className="relative flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {isHovered && (
                      <div
                        className="absolute right-1/2 border-t-2 border-[#eb4898]/30 pointer-events-none z-0"
                        style={{ width: '200vw', bottom: `${heightPct}%` }}
                      >
                        <div className="absolute -right-1.5 -top-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#eb4898] shadow-sm"></div>
                      </div>
                    )}

                    <div className="absolute bottom-0 w-full h-full rounded-2xl opacity-30 transition-opacity group-hover:opacity-50" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(234, 88, 12, 0.1) 4px, rgba(234, 88, 12, 0.1) 8px)' }}></div>

                    <div
                      className={`relative w-full max-w-[40px] rounded-2xl bg-gradient-to-t from-[#EA580C] to-[#eb4898] flex items-end justify-center pb-3 transition-all duration-500 z-10 ${isHovered ? 'shadow-[0_10px_30px_rgba(235,72,152,0.4)] brightness-110 scale-x-110' : ''}`}
                      style={{ height: `${Math.max(8, heightPct)}%`, minHeight: '32px' }}
                    >
                      <span className="text-[10px] font-black text-white">{Math.round(heightPct)}%</span>
                    </div>

                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.9 }}
                          className="absolute bg-white text-gray-900 border border-gray-100 rounded-xl px-4 py-2 shadow-xl z-50 text-center whitespace-nowrap pointer-events-none"
                          style={{ bottom: `calc(${heightPct}% + 16px)` }}
                        >
                          <p className="font-black text-[14px]">🪙{data.earnings >= 1000 ? (data.earnings / 1000).toFixed(1) + 'K' : data.earnings}</p>
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-gray-100 transform rotate-45"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <span className={`absolute -bottom-7 text-[10px] font-black transition-colors ${isHovered ? 'text-[#eb4898]' : 'text-gray-400'}`}>
                      {data.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Right: Applications Success Donut */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="lg:w-[400px] bg-white/80 backdrop-blur-xl rounded-[40px] p-8 sm:p-10 shadow-[0_15px_50px_rgba(0,0,0,0.04)] border border-white flex flex-col items-center justify-between relative overflow-hidden group hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-500">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none z-0"></div>

          <div className="w-full flex justify-between items-center mb-8 relative z-10">
            <h3 className="text-gray-500 font-black text-[11px] uppercase tracking-[0.2em]">Application Stats</h3>
            <span className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm text-gray-900 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest">
              TOTAL {totalApps}
            </span>
          </div>

          <div className="relative w-64 h-64 mb-8 group-hover:scale-105 transition-transform duration-700 z-10">
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-full m-8 border border-white shadow-sm">
              <span className="text-6xl font-display font-black text-gray-900 tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-blue-500 to-indigo-600">{acceptedApps}</span>
              <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest mt-1">Accepted</span>
            </div>
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-2xl">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="12" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#blue-grad)" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 - ((acceptedApps / totalApps) * 251.2)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#orange-grad)" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 - ((pendingApps / totalApps) * 251.2)} transform={`rotate(${360 * (acceptedApps / totalApps)} 50 50)`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#pink-grad)" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 - ((rejectedApps / totalApps) * 251.2)} transform={`rotate(${360 * ((acceptedApps + pendingApps) / totalApps)} 50 50)`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
              <defs>
                <linearGradient id="blue-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#6366f1" /></linearGradient>
                <linearGradient id="orange-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fb923c" /><stop offset="100%" stopColor="#ea580c" /></linearGradient>
                <linearGradient id="pink-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f472b6" /><stop offset="100%" stopColor="#eb4898" /></linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex justify-between w-full mt-auto gap-3 relative z-10">
            <div className="flex-1 flex flex-col items-center bg-white border border-gray-100 rounded-3xl p-4 hover:shadow-md transition-all cursor-default group/stat">
              <span className="font-black text-blue-500 text-2xl mb-1 group-hover/stat:scale-110 transition-transform">{totalApps > 0 ? Math.round((acceptedApps / totalApps) * 100) : 0}%</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accepted</span>
            </div>
            <div className="flex-1 flex flex-col items-center bg-white border border-gray-100 rounded-3xl p-4 hover:shadow-md transition-all cursor-default group/stat">
              <span className="font-black text-orange-500 text-2xl mb-1 group-hover/stat:scale-110 transition-transform">{totalApps > 0 ? Math.round((pendingApps / totalApps) * 100) : 0}%</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending</span>
            </div>
            <div className="flex-1 flex flex-col items-center bg-white border border-gray-100 rounded-3xl p-4 hover:shadow-md transition-all cursor-default group/stat">
              <span className="font-black text-[#eb4898] text-2xl mb-1 group-hover/stat:scale-110 transition-transform">{totalApps > 0 ? Math.round((rejectedApps / totalApps) * 100) : 0}%</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rejected</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ROW 3: Audience Insights & Timeline */}
      <div className="flex flex-col lg:flex-row gap-8">
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="lg:w-2/3 bg-white/80 backdrop-blur-xl rounded-[40px] p-8 sm:p-10 border border-white shadow-[0_15px_50px_rgba(0,0,0,0.04)] flex flex-col relative overflow-hidden group">
          <div className="flex justify-between items-center mb-10 relative z-10">
            <div>
              <h3 className="font-display font-black text-gray-900 text-3xl tracking-tight">Audience Demographics</h3>
              <p className="text-sm font-medium text-gray-400 mt-2">
                {profile.instagramProfile?.connected ? 'Real-time Instagram Graph API insights' : 'Verified social analytics integration'}
              </p>
            </div>
            {profile.instagramProfile?.connected && (
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl uppercase tracking-widest shadow-sm">
                ● Live Connected
              </span>
            )}
          </div>

          <div className={`flex flex-col sm:flex-row gap-10 items-center justify-between h-full relative z-10 ${!profile.instagramProfile?.connected ? 'blur-sm select-none pointer-events-none opacity-20' : ''}`}>
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-36 h-36 group-hover:scale-105 transition-transform duration-700">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-xl">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="14" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#pink-grad)" strokeWidth="14" strokeDasharray="251.2" strokeDashoffset={251.2 - ((profile.instagramProfile?.audienceGenders?.female || 58) / 100 * 251.2)} strokeLinecap="round" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#blue-grad)" strokeWidth="14" strokeDasharray="251.2" strokeDashoffset={251.2 - ((profile.instagramProfile?.audienceGenders?.male || 38) / 100 * 251.2)} transform={`rotate(${3.6 * (profile.instagramProfile?.audienceGenders?.female || 58)} 50 50)`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-full m-4 shadow-sm border border-white">
                  <span className="font-display font-black text-3xl text-gray-900 tracking-tighter">100%</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total</span>
                </div>
              </div>
              <div className="flex gap-6 text-[11px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2 bg-pink-50 text-pink-600 px-3 py-1.5 rounded-lg border border-pink-100 shadow-sm"><div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"></div> F {profile.instagramProfile?.audienceGenders?.female || 0}%</span>
                <span className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div> M {profile.instagramProfile?.audienceGenders?.male || 0}%</span>
              </div>
            </div>

            <div className="flex-1 w-full h-40 flex items-end justify-between gap-3 px-6 sm:border-l border-gray-100">
              {[{ label: '13-17', val: profile.instagramProfile?.connected ? 12 : 0 }, { label: '18-24', val: profile.instagramProfile?.connected ? 48 : 0 }, { label: '25-34', val: profile.instagramProfile?.connected ? 28 : 0 }, { label: '35+', val: profile.instagramProfile?.connected ? 12 : 0 }].map(age => (
                <div key={age.label} className="flex flex-col items-center flex-1 h-full justify-end group/bar cursor-default">
                  <div className="w-full max-w-[32px] bg-gray-50 rounded-t-xl h-full relative flex items-end overflow-hidden border border-gray-100 border-b-0">
                    <div style={{ height: `${age.val}%` }} className="w-full bg-gradient-to-t from-orange-400 to-orange-300 group-hover/bar:brightness-110 transition-all rounded-t-xl shadow-[0_0_15px_rgba(234,88,12,0.3)]"></div>
                  </div>
                  <span className="text-[11px] font-black text-gray-500 mt-3">{age.label}</span>
                </div>
              ))}
            </div>

            <div className="w-full sm:w-64 flex flex-col gap-4 pl-6 sm:border-l border-gray-100">
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2"><MapPin size={14} className="text-[#EA580C]" /> Top Locations</span>
              {(profile.instagramProfile?.audienceCountries || [{ country: 'No Data', percentage: 0 }]).map(loc => (
                <div key={loc.country} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[13px] font-bold text-gray-800">{loc.country}</span>
                    <span className="text-[12px] font-black text-blue-500">{loc.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" style={{ width: `${loc.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!profile.instagramProfile?.connected && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-white/20 backdrop-blur-[6px] text-center">
              <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-3xl flex items-center justify-center text-white shadow-lg mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
              <h4 className="font-display font-black text-xl text-gray-900 tracking-tight mb-2">Instagram Analytics Locked</h4>
              <p className="text-xs text-gray-500 font-semibold max-w-sm mb-6 leading-relaxed">
                Connect your Instagram Creator or Business account in Settings to unlock real-time demographics, engagement metrics, and verified posts insights.
              </p>
              <button 
                onClick={() => setActiveTab('settings')}
                className="px-6 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] hover:shadow-lg transition-all active:scale-95 shadow-md border-none cursor-pointer"
              >
                Connect Instagram Account
              </button>
            </div>
          )}
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="lg:w-1/3 bg-white/80 backdrop-blur-xl rounded-[40px] p-8 sm:p-10 border border-white shadow-[0_15px_50px_rgba(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:scale-125 transition-transform duration-1000"></div>

          <div className="flex justify-between items-center mb-10 relative z-10">
            <h3 className="font-display font-black text-gray-900 text-3xl tracking-tight">Timeline</h3>
            <span className="bg-white text-indigo-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">Next 7 Days</span>
          </div>

          <div className="flex flex-col gap-0 relative z-10">
            <div className="py-8 text-center">
              <Clock className="w-8 h-8 text-indigo-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-500">No upcoming tasks.</p>
              <p className="text-xs text-gray-400 mt-1">Accept collaborations to populate your timeline.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ROW 4: Activity */}
      <div className="flex flex-col lg:flex-row gap-8">
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="lg:w-1/3 bg-white/80 backdrop-blur-xl rounded-[40px] p-8 sm:p-10 border border-white shadow-[0_15px_50px_rgba(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:scale-125 transition-transform duration-1000"></div>

          <div className="flex justify-between items-center mb-10 relative z-10">
            <h3 className="font-display font-black text-gray-900 text-3xl tracking-tight">Activity</h3>
            <button onClick={() => setActiveTab('applications')} className="text-[11px] font-black text-orange-600 bg-orange-50 px-4 py-2 rounded-xl hover:bg-orange-500 hover:text-white transition-colors shadow-sm uppercase tracking-[0.15em] border border-orange-100">View All</button>
          </div>
          <div className="flex flex-col gap-6 relative z-10">
            {applications.slice(0, 5).map((app, i) => (
              <div key={i} onClick={() => setActiveTab('applications')} className="flex gap-5 group/item cursor-pointer bg-white p-4 rounded-3xl border border-gray-100 shadow-[0_5px_15px_rgba(0,0,0,0.02)] hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="flex flex-col items-center justify-center">
                  <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center shrink-0 border-2 border-white shadow-sm z-10 transition-transform group-hover/item:scale-110 group-hover/item:-rotate-6 ${app.status === 'accepted' ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600' : app.status === 'rejected' ? 'bg-gradient-to-br from-pink-50 to-pink-100 text-[#eb4898]' : 'bg-gradient-to-br from-orange-50 to-orange-100 text-[#EA580C]'}`}>
                    <ShieldCheck size={20} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-[15px] font-bold text-gray-900 group-hover/item:text-[#EA580C] transition-colors line-clamp-1">{app.campaignId?.title || 'Campaign Application'}</h4>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[12px] font-bold text-gray-500">{app.campaignId?.brandId?.businessName || 'Brand'}</span>
                    <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full ${app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : app.status === 'rejected' ? 'bg-pink-100 text-pink-700' : 'bg-orange-100 text-orange-700'}`}>
                      {app.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {applications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                  <Folder size={32} className="text-gray-300" />
                </div>
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">No Activity Yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreatorProfile;
