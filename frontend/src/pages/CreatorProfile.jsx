import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  User, 
  MapPin, 
  ExternalLink, 
  Zap, 
  ShieldCheck, 
  Play, 
  FileVideo, 
  X,
  Check,
  TrendingUp,
  MessageCircle,
  Briefcase,
  Sparkles,
  Building2,
  Calendar,
  Award,
  Clock,
  Lock,
  CheckCircle
} from 'lucide-react';
const getVideoSrc = (url) => {
  if (!url) return '';
  if (url.includes('ik.imagekit.io') && !/\.(mp4|webm|mov|mkv|m4v)($|\?)/i.test(url) && !url.endsWith('/ik-video.mp4')) {
    return url.replace(/\/?$/, '/ik-video.mp4');
  }
  return url;
};

const CreatorProfile = () => {
  const { id } = useParams();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('background');
  const { user } = useAuth();
  const navigate = useNavigate();
  const packagesScrollRef = useRef(null);

  const handleHireMeClick = () => {
    setActiveTab('services');
    setTimeout(() => {
      packagesScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (creator && packagesScrollRef.current) {
      const timer = setTimeout(() => {
        const container = packagesScrollRef.current;
        if (container && container.children && container.children.length > 1) {
          const middleCard = container.children[1];
          if (middleCard) {
            container.scrollLeft = middleCard.offsetLeft - (container.clientWidth / 2) + (middleCard.clickedWidth / 2 || middleCard.clientWidth / 2);
          }
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [creator]);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const res = await axios.get(`/creators/${id}`);
        setCreator(res.data);
      } catch (err) {
        console.error('Failed to fetch creator', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCreator();
  }, [id]);

  const handlePackageCheckout = async (tier) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'brand') {
      setMessage({ type: 'error', text: 'Only brands can purchase packages.' });
      return;
    }

    setCheckoutLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axios.post('/deals/package-checkout', {
        creatorId: creator._id,
        packageTier: tier
      });
      const dealId = res.data._id;
      await axios.post(`/deals/${dealId}/pay`);
      navigate('/brand-dashboard');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Checkout failed.' });
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
  );

  if (!creator) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-400">
      <User size={64} className="mb-6 opacity-20" />
      <p className="text-xl font-black font-display tracking-tight text-gray-900">Talent Not Found</p>
      <Link to="/creators" className="mt-8 text-[#EA580C] font-black uppercase text-xs tracking-widest hover:underline">Return to Talent Pool</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FCFAF7] text-gray-900 pb-20 font-sans relative overflow-x-hidden">
      {/* Decorative backdrop glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-amber-300/20 to-orange-400/0 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-0 w-[450px] h-[450px] bg-gradient-to-tr from-orange-300/10 to-amber-200/0 rounded-full blur-[100px] pointer-events-none z-0" />

      <Link
        to="/creators"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-gray-600 hover:text-orange-600 font-bold text-[11px] uppercase tracking-widest shadow-sm transition-all hover:scale-105"
      >
        <ChevronLeft size={16} /> Back
      </Link>

      {/* Top Section: Banner + Profile Info */}
      <div className="relative mb-12">
        {/* Soft Banner with Background Image */}
        <div className="w-full h-40 sm:h-56 bg-gray-100 overflow-hidden relative border-b border-orange-100/30">
          {/* Background Image */}
          <img 
            src={creator.coverImage || "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop"} 
            alt="Banner Background" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          {/* Gradient Overlay for the soft feel */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50/70 via-orange-100/60 to-yellow-50/70 mix-blend-overlay"></div>
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-orange-200/40 rounded-full blur-[100px] -translate-y-1/2"></div>
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-amber-300/30 rounded-full blur-[80px] -translate-y-1/2"></div>
        </div>

        {/* Profile Content Card with Orange Accent Border & Premium Background */}
        <div className="max-w-6xl mx-auto px-4 sm:px-8 -mt-20 sm:-mt-28 relative z-10 w-full">
          <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-6 sm:p-8 border border-orange-100 shadow-[0_24px_50px_rgba(251,146,60,0.06)] flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              {/* Avatar Squircle */}
              <div className="relative shrink-0">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-[2.5rem] bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden flex items-center justify-center relative z-10 p-1.5 border border-orange-50">
                  <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-gray-50">
                    {creator.profilePicture ? (
                      <img src={creator.profilePicture} alt={creator.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={64} className="text-gray-300 w-full h-full p-8" />
                    )}
                  </div>
                </div>
              </div>

              {/* Identity & Buttons */}
              <div className="text-center md:text-left mb-2">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 leading-none tracking-tight">{creator.name}</h1>
                  <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1 shadow-sm">
                    PRO <Zap size={10} fill="currentColor" />
                  </span>
                </div>
                <p className="text-[15px] font-medium text-gray-600 mb-5 leading-tight">
                  {creator.niche || 'Interface and Brand Designer'}<br/>
                  based in {creator.location || 'San Antonio'}
                </p>
                
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <button 
                    onClick={handleHireMeClick}
                    className="px-6 py-2.5 bg-[#EA580C] hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/10 active:scale-95 transition-all cursor-pointer"
                  >
                    Hire Me
                  </button>
                </div>
              </div>
            </div>

            {/* Badges & Metrics */}
            <div className="flex flex-col items-center md:items-end gap-6 md:mb-2">
              {/* Badges */}
              <div className="flex gap-2">
                {/* Approximating jagged badges with rotated squares */}
                <div className="w-8 h-8 flex items-center justify-center bg-[#FF6B00] rounded-lg rotate-6 shadow-sm text-white font-bold text-[10px]">
                  <svg className="w-4 h-4 -rotate-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <div className="w-8 h-8 flex items-center justify-center bg-[#F97316] rounded-lg -rotate-3 shadow-sm text-white font-bold text-[10px]">
                  <svg className="w-4 h-4 rotate-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                </div>
                <div className="w-8 h-8 flex items-center justify-center bg-[#F59E0B] rounded-lg rotate-12 shadow-sm text-white font-bold text-[10px]">
                  <svg className="w-4 h-4 -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="flex gap-8 sm:gap-10">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[12px] font-bold text-gray-500 mb-1">Followers</span>
                  <span className="text-2xl font-bold text-gray-900 tracking-tight">
                    {creator.followerCount >= 1000 ? (creator.followerCount / 1000).toFixed(1) + 'K' : creator.followerCount || '2,985'}
                  </span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[12px] font-bold text-gray-500 mb-1">Engagement</span>
                  <span className="text-2xl font-bold text-gray-900 tracking-tight">
                    {creator.instagramProfile?.connected ? `${creator.instagramProfile.engagementRate}%` : '132'}
                  </span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[12px] font-bold text-gray-500 mb-1">Deals Done</span>
                  {creator.platformStats?.completedDealsCount > 0 ? (
                    <span className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
                      {creator.platformStats.completedDealsCount}
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-black bg-emerald-50 text-emerald-600 border border-emerald-100">
                        Verified
                      </span>
                    </span>
                  ) : (
                    <span className="text-sm font-black text-orange-600 tracking-tight flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/60 mt-1">
                      🌱 New Talent
                    </span>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Trust & Performance Statistics Matrix (Work in Numbers) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            {
              title: (creator.platformStats?.completedDealsCount || 0) > 0 ? 'Deals Completed' : 'Platform Milestone',
              value: (creator.platformStats?.completedDealsCount || 0) > 0 ? `${creator.platformStats.completedDealsCount} Done` : '0 / 1 Deals',
              icon: <Award size={18} strokeWidth={2.5} />,
              bottomLabel: (creator.platformStats?.completedDealsCount || 0) > 0 ? '100% Brand Approved' : '🌱 Ready for 1st Deal',
              progress: (creator.platformStats?.completedDealsCount || 0) > 0 ? 100 : 25,
              grad: (creator.platformStats?.completedDealsCount || 0) > 0 ? 'from-emerald-400 to-teal-500' : 'from-orange-400 to-amber-500',
              bgText: (creator.platformStats?.completedDealsCount || 0) > 0 ? 'text-emerald-500' : 'text-orange-500',
              shadow: (creator.platformStats?.completedDealsCount || 0) > 0 ? 'shadow-emerald-500/20' : 'shadow-orange-500/20'
            },
            {
              title: 'Turnaround Rate',
              value: (creator.platformStats?.completedDealsCount || 0) > 0 ? '100% On-Time' : '24–48h Delivery',
              icon: <Zap size={18} strokeWidth={2.5} />,
              bottomLabel: (creator.platformStats?.completedDealsCount || 0) > 0 ? 'Fulfillment Track Record' : '⚡ Fast Delivery Promise',
              progress: 100,
              grad: 'from-blue-400 to-indigo-500',
              bgText: 'text-blue-500',
              shadow: 'shadow-blue-500/20'
            },
            {
              title: 'Response Speed',
              value: '< 2 Hours',
              icon: <Clock size={18} strokeWidth={2.5} />,
              bottomLabel: '98% Fast Reply Rate',
              progress: 98,
              grad: 'from-pink-400 to-rose-500',
              bgText: 'text-pink-500',
              shadow: 'shadow-pink-500/20'
            },
            {
              title: 'Escrow Protection',
              value: '100% Safe',
              icon: <ShieldCheck size={18} strokeWidth={2.5} />,
              bottomLabel: '🛡️ Zero Risk for Brands',
              progress: 100,
              grad: 'from-emerald-400 to-teal-500',
              bgText: 'text-emerald-500',
              shadow: 'shadow-emerald-500/20'
            }
          ].map((card, i) => (
            <div 
              key={i} 
              className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-[28px] p-4 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-orange-100/70 flex flex-col hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)] transition-all duration-300 overflow-hidden relative group"
            >
              <div className={`absolute -right-6 -bottom-6 opacity-[0.04] ${card.bgText} transform group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500`}>
                {card.icon}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 mb-3 relative z-10">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${card.grad} shadow-md sm:shadow-lg ${card.shadow} shrink-0`}>
                  {card.icon}
                </div>
                <span className="text-[10px] sm:text-[12px] font-black uppercase tracking-wider text-gray-400 truncate">{card.title}</span>
              </div>

              <div className="mb-3 sm:mb-4 relative z-10">
                <span className="text-xl sm:text-2xl lg:text-3xl font-display font-black text-gray-900 tracking-tight leading-none block truncate">{card.value}</span>
              </div>

              <div className="mt-auto relative z-10">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{card.bottomLabel}</span>
                  <span className="text-[9px] sm:text-[10px] font-black text-gray-900 ml-1 shrink-0">{card.progress}%</span>
                </div>

                <div className="flex gap-1 h-1.5">
                  {[1, 2, 3, 4, 5].map(segment => {
                    const segmentThreshold = segment * 20;
                    const isFilled = card.progress >= segmentThreshold || (card.progress > segmentThreshold - 20 && card.progress > 0);
                    const isPartial = isFilled && card.progress < segmentThreshold;
                    return (
                      <div key={segment} className={`flex-1 rounded-full transition-all duration-700 ${isFilled ? `bg-gradient-to-r ${card.grad}` : 'bg-gray-100'} ${isPartial ? 'opacity-60' : 'opacity-100'}`}></div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Layout 2 Columns */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Skills */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-orange-100">
            <h3 className="text-sm font-black text-gray-900 mb-5">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {creator.niche && <span className="px-3.5 py-1.5 rounded-xl border border-orange-100 text-orange-600 bg-orange-50/50 text-[11px] font-bold tracking-wide">{creator.niche}</span>}
              {creator.expertise?.map((skill, idx) => (
                <span key={idx} className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-600 bg-gray-50/50 text-[11px] font-bold tracking-wide">{skill}</span>
              ))}
              <span className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-600 bg-gray-50/50 text-[11px] font-bold tracking-wide">Brand Collaborations</span>
            </div>
          </div>

          {/* Verifications */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-orange-100">
            <h3 className="text-sm font-black text-gray-900 mb-5">Verifications</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-3 text-gray-600 font-bold"><ShieldCheck size={18} className="text-orange-500"/> Identity Verified</span>
                {creator.kycStatus === 'APPROVED' ? <Check size={18} className="text-emerald-500"/> : <span className="text-[10px] font-black uppercase px-2 py-1 bg-gray-100 text-gray-400 rounded-md">Pending</span>}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-3 text-gray-600 font-bold"><ExternalLink size={18} className="text-orange-500"/> Instagram Connected</span>
                {creator.instagramProfile?.connected ? <Check size={18} className="text-emerald-500"/> : <span className="text-[10px] font-black uppercase px-2 py-1 bg-gray-100 text-gray-400 rounded-md">Pending</span>}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-3 text-gray-600 font-bold"><MessageCircle size={18} className="text-orange-500"/> Fast Responder</span>
                <Check size={18} className="text-emerald-500"/>
              </div>
            </div>
          </div>

          {/* Proficiency / Stats */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-orange-100">
            <h3 className="text-sm font-black text-gray-900 mb-6">Proficiency</h3>
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  <span>Response Rate</span>
                  <span className="text-orange-600">98%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  <span>Completion Rate</span>
                  <span className="text-amber-600">100%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  <span>Client Satisfaction</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Content */}
        <div className="lg:col-span-8 flex flex-col">
          {/* Tabs */}
          <div className="flex items-center gap-6 sm:gap-8 border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
            <button 
              onClick={() => setActiveTab('background')}
              className={`text-[13px] font-black pb-4 border-b-2 tracking-wide transition-all whitespace-nowrap ${activeTab === 'background' ? 'text-orange-600 border-orange-600' : 'text-gray-400 border-transparent hover:text-gray-900'}`}
            >
              Background
            </button>
            <button 
              onClick={() => setActiveTab('verifiedWork')}
              className={`text-[13px] font-black pb-4 border-b-2 tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'verifiedWork' ? 'text-orange-600 border-orange-600' : 'text-gray-400 border-transparent hover:text-gray-900'}`}
            >
              Verified Work
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                (creator.verifiedWork?.length || 0) > 0 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {(creator.verifiedWork?.length || 0) > 0 ? creator.verifiedWork.length : 'New'}
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('services')}
              className={`text-[13px] font-black pb-4 border-b-2 tracking-wide whitespace-nowrap transition-all ${activeTab === 'services' ? 'text-orange-600 border-orange-600' : 'text-gray-400 border-transparent hover:text-gray-900'}`}
            >
              Service Architectures
            </button>
            <button 
              onClick={() => setActiveTab('portfolio')}
              className={`text-[13px] font-black pb-4 border-b-2 tracking-wide transition-all whitespace-nowrap ${activeTab === 'portfolio' ? 'text-orange-600 border-orange-600' : 'text-gray-400 border-transparent hover:text-gray-900'}`}
            >
              Portfolio
            </button>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-orange-100 flex flex-col gap-12">
            
            {/* About Me */}
            {activeTab === 'background' && (
              <div className="flex flex-col gap-10">
                <div>
                  <h2 className="text-lg font-black text-gray-900 mb-4">About Me</h2>
                  <p className="text-[14px] text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                    {creator.bio || 'I have a very Good command in content creation, influencer marketing, and brand storytelling. I have:\n\n• Ability to provide services to the customers to meet their needs.\n• Ability to work independently as well as a team member.\n• Ability to work under pressure.\n• Dependable, Highly-Organized, Self-Motivated, and Responsible.'}
                  </p>
                </div>
                
                {creator.portfolioVideos?.length > 0 && (
                  <div className="border-t border-gray-100 pt-8">
                    <h3 className="text-base font-black text-gray-900 mb-6">Featured Work</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {creator.portfolioVideos.slice(0, 2).map((video, idx) => (
                        <div 
                          key={idx} 
                          className="group relative rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden aspect-square cursor-pointer transition-all hover:border-orange-200"
                          onClick={() => setSelectedVideo(video)}
                        >
                          <video 
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
                            muted 
                            loop 
                            playsInline 
                            onMouseOver={e => e.target.play()} 
                            onMouseOut={e => {
                              e.target.pause();
                              e.target.currentTime = 0;
                            }}
                          >
                            <source src={getVideoSrc(video.url)} type="video/mp4" />
                          </video>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-all"></div>
                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <h4 className="font-black text-[15px] truncate drop-shadow-md">{video.title}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Verified Work on Kino */}
            {activeTab === 'verifiedWork' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <ShieldCheck className="text-emerald-500" size={22} />
                      Verified Platform Collaborations
                    </h2>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Real deliverables completed and approved by brands on Kino.
                    </p>
                  </div>
                  {creator.verifiedWork?.length > 0 && (
                    <span className="self-start sm:self-auto px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                      {creator.verifiedWork.length} Deals Completed
                    </span>
                  )}
                </div>

                {creator.verifiedWork && creator.verifiedWork.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {creator.verifiedWork.map((deal, idx) => (
                      <div 
                        key={deal._id || idx}
                        className="p-5 rounded-2xl bg-white border border-gray-100 hover:border-orange-200 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                            {deal.brandLogo ? (
                              <img src={deal.brandLogo} alt={deal.brandName} className="w-full h-full object-cover" />
                            ) : (
                              <Building2 size={20} className="text-orange-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[11px] font-black uppercase text-orange-600 tracking-wider">
                                {deal.brandName}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-[10px] font-bold text-gray-400">
                                {deal.completedAt ? new Date(deal.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified Delivery'}
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-gray-900 truncate max-w-md">
                              {deal.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-none border-gray-100 pt-3 sm:pt-0 shrink-0">
                          <span className="text-sm font-black text-gray-900 bg-orange-50/60 border border-orange-100 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs">
                            <span className="text-[#EA580C]">🪙</span> {deal.budget?.toLocaleString()}
                          </span>
                          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                            <CheckCircle size={13} className="text-emerald-500" /> Verified Delivery
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* New Creator Friendly Onboarding State */
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-gradient-to-b from-orange-50/50 via-amber-50/20 to-white rounded-3xl border border-dashed border-orange-200">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4">
                      <Sparkles size={28} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#EA580C] bg-orange-100/70 px-3 py-1 rounded-full mb-2">
                      🌱 Rising Creator • New on Kino
                    </span>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Ready for First Collaboration</h3>
                    <p className="text-xs text-gray-500 font-medium max-w-md leading-relaxed mb-6">
                      This creator is new on Kino and ready to deliver top-tier content. Be the first brand to collaborate with them and kickstart their verified track record!
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={handleHireMeClick}
                        className="px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                      >
                        <Briefcase size={14} /> Hire This Creator
                      </button>
                      <button
                        onClick={() => setActiveTab('portfolio')}
                        className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest shadow-xs transition-all cursor-pointer"
                      >
                        View Sample Portfolio
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Experience (Packages) */}
            {activeTab === 'services' && (
              <div ref={packagesScrollRef} className="scroll-mt-24">
                <h2 className="text-lg font-black text-gray-900 mb-6">Service Architectures</h2>
                
                {message.text && (
                  <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${message.type === 'error' ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-emerald-50 text-emerald-500 border border-emerald-200'}`}>
                    {message.text}
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {['basic', 'standard', 'premium'].map((tier) => {
                    const pkg = creator.pricing?.[tier];
                    const actualPrice = pkg?.price;
                    const isAvailable = actualPrice > 0;
                    const titleMap = { basic: 'Base Package', standard: 'Pro Package', premium: 'Enterprise Package' };
                    
                    if (!isAvailable) return null;

                    return (
                      <div key={tier} className="group bg-white rounded-2xl p-6 border border-gray-100 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center hover:border-orange-200 transition-all">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${tier === 'standard' ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors'}`}>
                            <Briefcase size={20} />
                          </div>
                          <div>
                            <h4 className="text-[15px] font-black text-gray-900 mb-1">{titleMap[tier]}</h4>
                            <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-2">Delivery: {pkg?.deliveryDays || 3} Days</p>
                            <p className="text-[13px] text-gray-500 font-medium max-w-md line-clamp-2 leading-relaxed">{pkg?.description || 'Custom content creation package with revisions and analytics reporting.'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-none border-gray-50">
                          <span className="text-2xl font-black text-gray-900">🪙{actualPrice.toLocaleString()}</span>
                          <button 
                            onClick={() => handlePackageCheckout(tier)}
                            disabled={checkoutLoading || !isAvailable}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-orange-50 text-orange-600 font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all disabled:opacity-50"
                          >
                            {checkoutLoading ? 'Processing...' : 'Select Package'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {activeTab === 'portfolio' && creator.portfolioVideos?.length > 0 && (
              <div>
                <h2 className="text-lg font-black text-gray-900 mb-6">Portfolio</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {creator.portfolioVideos.map((video, idx) => (
                    <div 
                      key={idx} 
                      className="group relative rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden aspect-square cursor-pointer transition-all hover:border-orange-200"
                      onClick={() => setSelectedVideo(video)}
                    >
                      <video 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
                        muted 
                        loop 
                        playsInline 
                        onMouseOver={e => e.target.play()} 
                        onMouseOut={e => {
                          e.target.pause();
                          e.target.currentTime = 0;
                        }}
                      >
                        <source src={getVideoSrc(video.url)} type="video/mp4" />
                      </video>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-all"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h4 className="font-black text-[15px] truncate drop-shadow-md">{video.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Full Screen Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-reveal-up">
          <div 
            className="absolute inset-0 bg-gray-900/95 backdrop-blur-2xl"
            onClick={() => setSelectedVideo(null)}
          />
          
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-gray-800">
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
            
            <video 
              className="w-full h-full" 
              controls 
              autoPlay
            >
              <source src={getVideoSrc(selectedVideo.url)} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent pointer-events-none">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                {selectedVideo.title}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorProfile;
