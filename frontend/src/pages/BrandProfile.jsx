import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import CreatorBottomNav from '../components/CreatorBottomNav';
import BrandBottomNav from '../components/BrandBottomNav';
import {
  ChevronLeft,
  Building2,
  Globe,
  ShieldCheck,
  ExternalLink,
  MapPin,
  Target,
  Users,
  Zap,
  ArrowRight,
  Utensils,
  Cpu,
  Tag,
  Sparkles,
  Search,
  HelpCircle,
  Bell
} from 'lucide-react';

const getNicheIcon = (niche) => {
  const n = (niche || '').toLowerCase();
  if (n.includes('food') || n.includes('restaurant')) return <Utensils className="text-orange-500 w-5 h-5" />;
  if (n.includes('tech') || n.includes('gadget') || n.includes('gaming')) return <Cpu className="text-blue-500 w-5 h-5" />;
  if (n.includes('fashion') || n.includes('lifestyle') || n.includes('beauty') || n.includes('style')) return <Tag className="text-pink-500 w-5 h-5" />;
  return <Sparkles className="text-indigo-500 w-5 h-5" />;
};

const getNicheBg = (niche) => {
  const n = (niche || '').toLowerCase();
  if (n.includes('food') || n.includes('restaurant')) return 'bg-orange-50';
  if (n.includes('tech') || n.includes('gadget') || n.includes('gaming')) return 'bg-blue-50';
  if (n.includes('fashion') || n.includes('lifestyle') || n.includes('beauty') || n.includes('style')) return 'bg-pink-50';
  return 'bg-indigo-50';
};

const BrandProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        const [brandRes, campaignsRes] = await Promise.all([
          axios.get(`/brands/${id}`),
          axios.get(`/campaigns?brandId=${id}&limit=100&status=All`)
        ]);
        setProfile(brandRes.data);

        const rawCampaigns = Array.isArray(campaignsRes.data?.data)
          ? campaignsRes.data.data
          : (Array.isArray(campaignsRes.data) ? campaignsRes.data : []);

        const brandProfileId = brandRes.data?._id ? String(brandRes.data._id) : String(id);
        const brandUserId = brandRes.data?.userId?._id 
          ? String(brandRes.data.userId._id) 
          : (brandRes.data?.userId ? String(brandRes.data.userId) : '');

        const filteredCampaigns = rawCampaigns.filter(c => {
          const cBrandId = String(c.brandId?._id || c.brandId || '');
          return cBrandId === brandProfileId || cBrandId === brandUserId;
        });

        setCampaigns(filteredCampaigns);
      } catch (err) {
        console.error('Failed to fetch brand profile intelligence', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrandData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-400">
      <Building2 size={64} className="mb-6 opacity-20" />
      <p className="text-xl font-black font-display tracking-tight">Brand Identity Not Found</p>
      <Link to="/" className="mt-8 text-orange-500 font-black uppercase text-xs tracking-widest hover:underline">Return to Hub</Link>
    </div>
  );

  const brandInitial = profile.businessName ? profile.businessName[0].toUpperCase() : 'B';

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans pb-24 relative overflow-x-hidden">
        {/* Global Decorative Backgrounds */}
        <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-indigo-100/40 via-purple-100/40 to-pink-100/40 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>
        <div className="fixed bottom-0 right-0 w-[300px] h-[300px] bg-gradient-to-tl from-orange-100/40 to-rose-100/40 rounded-full blur-[100px] translate-y-1/4 translate-x-1/4 pointer-events-none z-0"></div>

        {/* Back Link */}
        <div className="w-full max-w-[500px] mx-auto pt-6 px-4 relative z-10 flex items-center justify-start">
          <Link to="/brands" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#EA580C] transition-colors">
            <ChevronLeft size={18} />
            <span>Back to Brands</span>
          </Link>
        </div>

        {/* Main Content Area */}
        <main className="w-full max-w-[500px] mx-auto pt-2 px-4 relative z-10 flex flex-col gap-6 text-center">
          {/* Logo circular card */}
          <div className="bg-white rounded-[2rem] border border-gray-150 p-8 shadow-sm flex flex-col items-center relative overflow-hidden mt-4">
            <div className="w-24 h-24 rounded-2xl bg-white border border-gray-100 flex items-center justify-center relative p-3 shadow-md mb-6">
              {profile.logo ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img src={profile.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <span className="text-4xl font-black text-[#EA580C]">{brandInitial}</span>
              )}
              <span className="absolute bottom-[-10px] px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-wider rounded-full shadow-sm">
                VERIFIED
              </span>
            </div>

            <span className="text-[10px] font-black text-[#EA580C] uppercase tracking-[0.25em] mb-1">Brand Profile</span>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-4">
              {profile.businessName}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={11} /> Verified Partner
              </span>
              <span className="px-3.5 py-1 bg-orange-50 text-orange-600 border border-orange-150 rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                <MapPin size={11} /> {profile.location || 'Not Specified'}
              </span>
              <span className="px-3.5 py-1 bg-gray-50 text-gray-500 border border-gray-200 rounded-xl font-black text-[9px] uppercase tracking-wider">
                {profile.businessType || 'Not Specified'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex w-full gap-3">
              <a href="#missions-list" className="flex-1 py-3.5 bg-[#EA580C] hover:bg-orange-600 text-white font-black text-[12px] uppercase tracking-widest rounded-xl transition-all shadow-[0_8px_25px_rgba(234,88,12,0.3)] active:scale-95 text-center">
                Explore Missions
              </a>
              <button className="p-3 bg-white hover:bg-gray-55 border border-gray-200 text-gray-500 hover:text-gray-950 rounded-xl transition-colors shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
              </button>
            </div>
          </div>

          {/* Stats card row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-[1.5rem] border border-gray-150 py-4 px-2 flex flex-col items-center justify-center shadow-sm">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider mb-1">Est. Payouts</span>
              <span className="text-sm font-black text-gray-955">{(() => { const completed = campaigns.length > 0 ? Math.floor(campaigns.reduce((s, c) => s + (c.budget || 0), 0) / 1000) : 0; return completed > 0 ? `🪙${completed}K+` : '🪙0'; })()}</span>
            </div>
            <div className="bg-white rounded-[1.5rem] border-2 border-[#EA580C] py-4 px-2 flex flex-col items-center justify-center shadow-sm">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider mb-1">Active Missions</span>
              <span className="text-lg font-black text-[#EA580C]">{campaigns.length}</span>
              <span className="text-[8px] font-black text-[#EA580C] uppercase mt-0.5">Milestone Coins</span>
            </div>
            <div className="bg-white rounded-[1.5rem] border border-gray-150 py-4 px-2 flex flex-col items-center justify-center shadow-sm">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider mb-1">Operating</span>
              <span className="text-lg font-black text-gray-955">{profile.operatingFrom || '—'}</span>
              <span className="text-[8px] font-black text-gray-400 uppercase mt-0.5">Years</span>
            </div>
          </div>

          {/* Pitch description */}
          <div className="bg-white rounded-[1.5rem] border border-gray-150 p-6 text-left shadow-sm mt-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">About the Brand</h3>
            <p className="text-gray-600 text-sm leading-relaxed font-medium">
              {profile.description || 'No description provided yet. Complete your profile to add a description.'}
            </p>
          </div>

          {/* Active Missions section */}
          <div id="missions-list" className="flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-black text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#EA580C] rounded-full"></span>
                Active Missions
              </h2>
              <span className="text-[9px] font-black text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-xl">
                {campaigns.length} Live
              </span>
            </div>

            <div className="flex flex-col gap-3.5">
              {campaigns.length > 0 ? (
                campaigns.map((c) => {
                  const niche = c.niche || 'Lifestyle';
                  const appliedCount = c.applicants?.length || 0;
                  return (
                    <div key={c._id} className="bg-white p-5 rounded-[2rem] border border-gray-150 shadow-sm flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${getNicheBg(niche)} flex items-center justify-center shadow-inner`}>
                            {getNicheIcon(niche)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">
                                {niche}
                              </span>
                              <span className="text-[8px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                {appliedCount} Applied
                              </span>
                            </div>
                            <h4 className="font-black text-gray-950 text-[15px] mt-1 leading-tight">{c.title}</h4>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                        <div>
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Budget</span>
                          <span className="text-[18px] font-black text-gray-955">🪙{c.budget?.toLocaleString()}</span>
                        </div>
                        <Link to={`/campaigns/${c._id}`} className="px-5 py-2 bg-gray-50 hover:bg-orange-55 border border-gray-200 hover:border-orange-200 text-gray-700 hover:text-orange-600 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-1">
                          Analyze <ArrowRight size={10} />
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white py-12 px-6 rounded-[2rem] border border-gray-150 text-center flex flex-col items-center gap-3">
                  <Zap size={24} className="text-gray-300" />
                  <p className="font-black text-gray-955 text-sm">No Active Missions</p>
                  <p className="text-gray-400 text-xs max-w-[240px] leading-relaxed">This brand doesn't currently have any live public campaigns.</p>
                </div>
              )}
            </div>
          </div>

          {/* Target Intelligence Card */}
          <div className="bg-white rounded-[2rem] border border-gray-150 p-6 shadow-sm text-left">
            <h3 className="text-[16px] font-black tracking-tight text-gray-900 flex items-center justify-between mb-6">
              Target Intelligence
              <Target size={16} className="text-pink-500" />
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center border border-gray-100 shadow-sm"><Users size={14} /></div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Target Age</p>
                  <span className="text-xs font-black text-gray-900">{profile.preferences?.targetAgeGroup || 'Not Set'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-50 text-[#eb4898] flex items-center justify-center border border-gray-100 shadow-sm"><Users size={14} /></div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Gender</p>
                  <span className="text-xs font-black text-gray-900">{profile.preferences?.targetGender || 'Not Set'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-50 text-[#EA580C] flex items-center justify-center border border-gray-100 shadow-sm"><MapPin size={14} /></div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Locality</p>
                  <span className="text-xs font-black text-gray-900">{profile.preferences?.targetLocality || profile.location || 'Not Set'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-50 text-blue-505 flex items-center justify-center border border-gray-100 shadow-sm"><Zap size={14} className="text-blue-500" /></div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Primary Goal</p>
                  <span className="text-xs font-black text-gray-900">{profile.preferences?.brandPriority || 'Not Set'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center pt-5 border-t border-gray-100 mt-2">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="8" fill="transparent" />
                  {campaigns.length > 0 && <circle cx="50" cy="50" r="40" stroke="#1E293B" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - Math.min(campaigns.length / 10, 1))} strokeLinecap="round" />}
                </svg>
                <span className="absolute text-lg font-black text-gray-900">{campaigns.length > 0 ? Math.min(campaigns.length * 10, 100) : 0}%</span>
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-3">Brand Activity Score</span>
            </div>
          </div>

          {/* Join the story Card */}
          <div className="bg-gradient-to-br from-[#EA580C] to-[#C2410C] rounded-[2rem] p-6 shadow-md relative overflow-hidden text-left mb-6 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            <h3 className="text-2xl font-black text-white mb-2 leading-tight">Join the<br />story</h3>
            <p className="text-orange-55 text-xs font-medium leading-relaxed mb-6">
              Apply to a mission and start a high-impact collaboration with this brand.
            </p>
            <Link to="/campaigns" className="w-full py-3.5 bg-white hover:bg-orange-50 text-[#EA580C] font-black text-xs uppercase tracking-widest transition-all rounded-full flex items-center justify-center gap-2 shadow group/btn">
              Explore Missions
              <span className="w-5 h-5 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-black group-hover/btn:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        {user?.role === 'creator' ? (
          <CreatorBottomNav activeTab="" />
        ) : user?.role === 'brand' ? (
          <BrandBottomNav activeTab="" />
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#0C0A09] font-sans pb-24">
      {/* Top Header/Breadcrumb Bar */}
      <div className="max-w-7xl mx-auto pt-8 px-6 sm:px-12 flex justify-between items-center">
        <Link
          to="/campaigns"
          className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-[0.25em] transition-all group"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Discovery
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 mt-10">

        {/* Main Grid: Header & Circular Logo Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">

          {/* Left: Brand Metadata & Pitch */}
          <div className="lg:col-span-8 space-y-6 text-left">
            <div className="flex items-center gap-2 text-[10px] font-black text-[#EA580C] uppercase tracking-[0.3em]">
              <span className="w-2 h-2 rounded-full bg-[#EA580C]"></span>
              Brand Profile
            </div>

            <h1 className="text-5xl sm:text-7xl font-black text-[#1C1917] tracking-tight leading-none">
              {profile.businessName}
            </h1>

            {/* Tags Group */}
            <div className="flex flex-wrap gap-2.5">
              <span className="px-3.5 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <ShieldCheck size={12} /> Verified Partner
              </span>
              <span className="px-3.5 py-1.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <MapPin size={12} /> {profile.location || 'Not Specified'}
              </span>
              <span className="px-3.5 py-1.5 bg-gray-50 text-gray-500 border border-gray-200 rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Building2 size={12} /> {profile.businessType || 'Not Specified'}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <a
                href="#discovery-console"
                className="px-8 py-3.5 bg-[#EA580C] text-white hover:bg-orange-600 font-black text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-[0_8px_25px_rgba(234,88,12,0.35)] active:scale-95 cursor-pointer"
              >
                Explore Missions
              </a>
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>

            {/* Four Metric Cards Row */}
            <div className="flex flex-wrap gap-5 mt-10 pt-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-3 text-center transition-transform hover:scale-105">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider mb-1 leading-tight">Est. Payouts</span>
                <span className="text-base sm:text-lg font-black text-gray-955">{(() => { const completed = campaigns.length > 0 ? Math.floor(campaigns.reduce((s, c) => s + (c.budget || 0), 0) / 1000) : 0; return completed > 0 ? `🪙${completed}K+` : '🪙0'; })()}</span>
              </div>
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.5rem] border border-orange-500 flex flex-col items-center justify-center p-3 text-center relative transition-transform hover:scale-105">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider mb-1 leading-tight">Active Missions</span>
                <span className="text-xl sm:text-2xl font-black text-orange-500">{campaigns.length}</span>
                <span className="text-[7px] font-bold text-orange-400 uppercase mt-0.5">Live Now</span>
              </div>
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.5rem] border border-gray-200 flex flex-col items-center justify-center p-3 text-center transition-transform hover:scale-105">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider mb-1 leading-tight">Operating</span>
                <span className="text-lg sm:text-xl font-black text-gray-955">{profile.operatingFrom || '—'}</span>
                <span className="text-[7px] font-bold text-gray-500 uppercase mt-0.5">Years</span>
              </div>
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.5rem] border border-gray-200 flex flex-col items-center justify-center p-3 text-center transition-transform hover:scale-105">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider mb-1 leading-tight">Target Age</span>
                <span className="text-xs sm:text-sm font-black text-gray-955">{profile.preferences?.targetAgeGroup || 'Not Set'}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8 bg-white border border-gray-150 rounded-[1.5rem] p-6 shadow-sm">
              <h3 className="text-[10px] font-black text-[#EA580C] uppercase tracking-widest mb-3">About the Brand</h3>
              <p className="text-gray-600 text-base leading-relaxed font-medium">
                {profile.description || 'No description provided yet. Complete your profile to add a description.'}
              </p>
            </div>
          </div>

          {/* Right: Square Large Logo Card */}
          <div className="lg:col-span-4 flex justify-center lg:justify-center">
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-[2rem] bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center relative p-6 transition-all duration-300 hover:scale-105 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none"></div>
              {profile.logo ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img src={profile.logo} alt="Logo" className="max-w-[70%] max-h-[70%] object-contain" />
                </div>
              ) : (
                <span className="text-8xl font-black text-[#EA580C] select-none">{brandInitial}</span>
              )}
              <span className="absolute bottom-6 px-4 py-1.5 bg-[#1E293B] text-white text-[9px] font-black uppercase tracking-wider rounded-full shadow-sm">
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Two Columns Main Workspace */}
        <div id="discovery-console" className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16 pt-16 border-t border-gray-100">

          {/* Left Column: Bento List of Active Missions */}
          <div className="lg:col-span-8 space-y-8 text-left">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black font-display text-gray-900 tracking-tight flex items-center gap-3">
                <span className="w-1.5 h-8 bg-[#EA580C] rounded-full"></span>
                Active Missions
              </h2>
              <span className="text-[9px] font-black text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-xl shadow-sm">
                {campaigns.length} Live
              </span>
            </div>

            <div className="space-y-4">
              {campaigns.length > 0 ? (
                campaigns.map((campaign) => {
                  const niche = campaign.niche || 'Lifestyle';
                  const deliverables = campaign.requirements && campaign.requirements.length > 0
                    ? campaign.requirements.slice(0, 2).join(' • ')
                    : 'No requirements specified';
                  const appliedCount = campaign.applicants?.length || 0;

                  return (
                    <div
                      key={campaign._id}
                      className="p-6 bg-white border border-gray-150 rounded-[2rem] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5"
                    >
                      {/* Left Block with Icon & Details */}
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${getNicheBg(niche)} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform`}>
                          {getNicheIcon(niche)}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-black font-display text-gray-900 text-base leading-tight group-hover:text-[#EA580C] transition-colors">
                            {campaign.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 pt-1 items-center">
                            <span className="text-[8px] font-black text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">
                              {niche}
                            </span>
                            <span className="text-[8px] font-bold text-gray-400">
                              {deliverables}
                            </span>
                            <span className="text-[8px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded uppercase tracking-wider">
                              {appliedCount} Applied
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Block with Budget & Button */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-none pt-4 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5 leading-none">Budget</span>
                          <span className="text-xl font-black text-gray-900">🪙{campaign.budget?.toLocaleString() || '0'}</span>
                        </div>
                        <Link
                          to={`/campaigns/${campaign._id}`}
                          className="px-6 py-2.5 bg-gray-50 group-hover:bg-orange-50 border border-gray-200 group-hover:border-orange-200 text-gray-700 group-hover:text-orange-600 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                        >
                          Analyze <ArrowRight size={10} />
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-16 rounded-[2rem] border-2 border-dashed border-gray-200 text-center flex flex-col items-center gap-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <Zap size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 font-black text-xl tracking-tight">No Active Missions</h3>
                  <p className="text-gray-500 font-medium text-sm max-w-md">This brand doesn't currently have any public missions available. Check back soon for new opportunities!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Target Intelligence & Join Story Widget */}
          <div className="lg:col-span-4 space-y-8 text-left">

            {/* Target Intelligence Card */}
            <div className="bg-white rounded-[2rem] border border-gray-150 p-8 shadow-sm relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <h3 className="text-lg font-black font-display tracking-tight text-gray-900 flex items-center justify-between mb-8">
                Target Intelligence
                <Target size={16} className="text-pink-500" />
              </h3>

              {/* Grid List */}
              <div className="space-y-4">
                <div className="flex items-center gap-3.5 group">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center group-hover:scale-105 transition-transform border border-gray-100">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Target Age</p>
                    <span className="text-sm font-black text-gray-900">{profile.preferences?.targetAgeGroup || 'Not Set'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 group">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center group-hover:scale-105 transition-transform border border-gray-100">
                    <Users size={16} className="text-[#eb4898]" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Gender</p>
                    <span className="text-sm font-black text-gray-900">{profile.preferences?.targetGender || 'Not Set'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 group">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center group-hover:scale-105 transition-transform border border-gray-100">
                    <MapPin size={16} className="text-[#EA580C]" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Locality / City</p>
                    <span className="text-sm font-black text-gray-900">{profile.preferences?.targetLocality || profile.location || 'Not Set'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 group">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center group-hover:scale-105 transition-transform border border-gray-100">
                    <Zap size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Primary Goal</p>
                    <span className="text-sm font-black text-gray-900">{profile.preferences?.brandPriority || 'Not Set'}</span>
                  </div>
                </div>
              </div>

              {/* SVG Circular Integrity Score Gauge */}
              <div className="flex flex-col items-center justify-center mt-8 pt-6 border-t border-gray-100">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="8" fill="transparent" />
                    {campaigns.length > 0 && <circle cx="50" cy="50" r="40" stroke="#1E293B" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - Math.min(campaigns.length / 10, 1))} strokeLinecap="round" />}
                  </svg>
                  <span className="absolute text-xl font-black text-gray-900">{campaigns.length > 0 ? Math.min(campaigns.length * 10, 100) : 0}%</span>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">Brand Activity Score</span>
              </div>
            </div>

            {/* "Join the Story" Premium Widget */}
            <div className="bg-gradient-to-br from-[#EA580C] to-[#C2410C] rounded-[2rem] p-8 shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

              <h3 className="text-3xl font-black font-display tracking-tight text-white mb-4">
                Join the <br />story
              </h3>

              <p className="text-orange-50 text-sm font-medium leading-relaxed mb-8">
                Apply to a mission and start a high-impact collaboration with this brand.
              </p>

              <Link
                to="/campaigns"
                className="w-full py-4 rounded-full bg-white hover:bg-orange-50 text-[#EA580C] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn shadow"
              >
                Explore Missions
                <span className="w-5 h-5 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-black group-hover/btn:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {user?.role === 'creator' ? (
        <CreatorBottomNav activeTab="" />
      ) : user?.role === 'brand' ? (
        <BrandBottomNav activeTab="" />
      ) : null}
    </div>
  );
};

export default BrandProfile;
