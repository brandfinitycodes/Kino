import React, { useState, useEffect, useMemo } from 'react';
import axios from '../utils/axios';
import CampaignCard from '../components/CampaignCard';
import { Search, Filter, Rocket, Sparkles, SlidersHorizontal, MapPin, Grid, Bell, ArrowDownUp, Home, Briefcase, Wallet, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import CreatorBottomNav from '../components/CreatorBottomNav';
import BrandBottomNav from '../components/BrandBottomNav';

const NICHES = ['All', 'Tech', 'Lifestyle', 'Fashion', 'Food', 'Travel', 'Gaming', 'Beauty', 'Finance', 'Health', 'Other'];
const STATUSES = ['active', 'inactive', 'All'];

const CampaignListing = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [nicheFilter, setNicheFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('active');
  const [minBudget, setMinBudget] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/campaigns', {
          params: { page, limit: 12, search: searchTerm, niche: nicheFilter, status: statusFilter, minBudget, sortBy }
        });
        const responseData = res.data.data || res.data || [];
        if (page === 1) {
          setCampaigns(responseData);
        } else {
          setCampaigns(prev => [...(prev || []), ...responseData]);
        }
        setTotalPages(res.data.totalPages);
        setTotalItems(res.data.totalItems);
      } catch (err) {
        console.error('Failed to fetch campaigns', err);
      } finally {
        setLoading(false);
      }
    };
    const timeoutId = setTimeout(fetchCampaigns, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, nicheFilter, statusFilter, minBudget, sortBy, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, nicheFilter, statusFilter, minBudget, sortBy]);

  const recommendedCampaigns = useMemo(() => {
    if (!campaigns || !campaigns.length) return [];
    return [...campaigns]
      .filter(c => c.niche === (user?.niche || 'Tech'))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  }, [campaigns, user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-20">
        <div className="relative p-6 sm:p-12 lg:p-16 rounded-[32px] overflow-hidden shadow-2xl mb-12 sm:mb-20 animate-reveal-up">
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-[#eb4898]">
            <img
              src="/laptops.jpg"
              className="w-full h-full object-cover mix-blend-overlay opacity-50"
              alt="Discovery Console Background"
            />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-10 text-white">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em] border border-white/30 backdrop-blur-md">Marketplace</span>
                <Sparkles size={16} className="text-[#00FFcc] animate-pulse" />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black font-display mb-4 sm:mb-6 tracking-tighter leading-none">
                Discovery <br /><span className="text-[#00FFcc]">Console</span>
              </h1>
              <p className="hidden sm:block text-white/80 text-lg font-medium leading-relaxed max-w-lg">
                Navigate through our curated ecosystem of high-impact brand missions and creative opportunities.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-4 sm:gap-6 p-5 sm:p-8 rounded-[24px] bg-white/10 backdrop-blur-md border border-white/20 shadow-xl shrink-0">
              <div className="text-right">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Global Active Missions</p>
                <p className="text-4xl font-black text-white tracking-tighter">{totalItems}</p>
              </div>
              <div className="w-14 h-14 rounded-[16px] bg-[#00FFcc]/20 flex items-center justify-center text-[#00FFcc] border border-[#00FFcc]/30">
                <Rocket size={28} />
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-24 z-30 mb-8 px-4 md:px-0">
          <div className="p-2 sm:p-4 rounded-[1rem] sm:rounded-[24px] bg-white border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-2 sm:gap-4 transition-all duration-500">
            {/* Top Row: Search & Niche & Status */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 sm:gap-4">
              <div className="relative grow group">
                <Search className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EA580C] transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Search missions, brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-14 pr-3 sm:pr-6 py-2 sm:py-4 bg-gray-50 border border-transparent rounded-[10px] sm:rounded-[16px] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#EA580C] focus:bg-white transition-all font-bold text-[12px] sm:text-[14px] text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div className="flex flex-row gap-2 sm:gap-4 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none">
                  <SlidersHorizontal className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  <select
                    value={nicheFilter}
                    onChange={(e) => setNicheFilter(e.target.value)}
                    className="w-full lg:w-44 pl-8 sm:pl-12 pr-6 sm:pr-10 py-2 sm:py-4 bg-gray-50 border border-transparent rounded-[10px] sm:rounded-[16px] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#EA580C] focus:bg-white font-bold text-[10px] sm:text-[12px] uppercase tracking-wider text-gray-900 appearance-none cursor-pointer transition-all"
                  >
                    {NICHES.map(n => <option key={n} value={n} className="text-gray-900 font-medium">{n === 'All' ? 'All Domains' : n}</option>)}
                  </select>
                  <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Filter size={12} />
                  </div>
                </div>

                <div className="relative flex-1 lg:flex-none">
                  <Filter className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full lg:w-44 pl-8 sm:pl-12 pr-6 sm:pr-10 py-2 sm:py-4 bg-gray-50 border border-transparent rounded-[10px] sm:rounded-[16px] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#EA580C] focus:bg-white font-bold text-[10px] sm:text-[12px] uppercase tracking-wider text-gray-900 appearance-none cursor-pointer transition-all"
                  >
                    {STATUSES.map(s => <option key={s} value={s} className="text-gray-900 font-medium">{s === 'All' ? 'All Levels' : s}</option>)}
                  </select>
                  <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Filter size={12} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Advanced Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pt-2 sm:pt-4 border-t border-gray-100 gap-2 sm:gap-4">
              <div className="flex flex-row flex-wrap items-center gap-2 sm:gap-4 w-full lg:w-auto">
                {/* Budget Min Filter */}
                <div className="relative flex-1 sm:flex-none min-w-[100px]">
                  <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px] sm:text-[12px]">🪙</span>
                  <input
                    type="number"
                    placeholder="Min Budget"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    className="w-full sm:w-36 pl-6 sm:pl-8 pr-3 sm:pr-4 py-2 sm:py-3 bg-gray-50 border border-transparent rounded-[8px] sm:rounded-[12px] focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-[#EA580C] focus:bg-white transition-all font-bold text-[10px] sm:text-[12px] text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                {/* Sort By Filter */}
                <div className="relative flex-1 sm:flex-none min-w-[120px]">
                  <ArrowDownUp className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-44 pl-7 sm:pl-10 pr-6 sm:pr-8 py-2 sm:py-3 bg-gray-50 border border-transparent rounded-[8px] sm:rounded-[12px] focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-[#EA580C] focus:bg-white font-bold text-[10px] sm:text-[12px] text-gray-900 appearance-none cursor-pointer transition-all"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="highest_budget">High Budget</option>
                  </select>
                </div>

                <button onClick={() => showToast('Search alert saved!')} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-[12px] font-black text-indigo-600 bg-indigo-50 rounded-[8px] sm:rounded-[12px] hover:bg-indigo-100 transition-colors uppercase tracking-widest shrink-0">
                  <Bell size={12} /> <span className="hidden sm:inline">Save Search</span><span className="sm:hidden">Save</span>
                </button>
              </div>

              {/* View Toggle */}
              <div className="flex bg-gray-50 p-1 rounded-[8px] sm:rounded-[12px] border border-gray-100 shrink-0 self-stretch sm:self-end lg:self-auto w-full lg:w-auto">
                <button onClick={() => setViewMode('grid')} className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-[6px] sm:rounded-[8px] text-[10px] sm:text-[12px] font-black uppercase tracking-wider transition-all ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  <Grid size={12} /> Grid
                </button>
                <button onClick={() => setViewMode('map')} className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-[6px] sm:rounded-[8px] text-[10px] sm:text-[12px] font-black uppercase tracking-wider transition-all ${viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  <MapPin size={12} /> Map
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended For You Section */}
        {!loading && recommendedCampaigns.length > 0 && viewMode === 'grid' && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6 px-4 md:px-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
                <Sparkles size={18} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Recommended for You</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto pb-4 px-4 md:px-0 snap-x">
              {recommendedCampaigns.map(campaign => (
                <div key={`rec-${campaign._id}`} className="snap-start min-w-[300px]">
                  <CampaignCard campaign={campaign} />
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-10">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-96 rounded-[32px] bg-white border border-gray-100 shadow-sm animate-pulse"></div>
            ))}
          </div>
        ) : viewMode === 'map' ? (
          <div className="h-[600px] w-full rounded-[32px] bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden group cursor-not-allowed">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center text-[#EA580C] mb-6 relative z-10 group-hover:scale-110 transition-transform duration-500">
              <MapPin size={32} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2 relative z-10">Interactive Map View</h3>
            <p className="text-gray-500 font-medium max-w-md mx-auto relative z-10">
              Location-based filtering is currently in development. Soon you'll be able to explore brand missions and events directly in your city!
            </p>
            <button onClick={() => setViewMode('grid')} className="mt-8 px-8 py-3 rounded-xl bg-gray-900 text-white font-black text-[12px] uppercase tracking-widest hover:bg-[#EA580C] transition-all relative z-10">
              Return to Grid
            </button>
          </div>
        ) : campaigns.length > 0 ? (
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-6 px-4 md:px-0">All Available Missions ({campaigns.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-10">
              {campaigns.map((campaign, idx) => (
                <div key={campaign._id} className={`animate-reveal-up opacity-0 stagger-${(idx % 4) + 1}`}>
                  <CampaignCard campaign={campaign} />
                </div>
              ))}
            </div>
            {page < totalPages && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={loading}
                  className="px-8 py-4 rounded-2xl bg-white border border-gray-200 text-gray-900 font-black text-[10px] uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Loading...</> : 'Load More Missions'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-32 rounded-[32px] bg-white border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center text-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              <Search size={48} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">No Parameters Matched</h3>
              <p className="text-gray-500 font-medium max-w-sm mx-auto">Try adjusting your filters or search keywords to explore different missions.</p>
            </div>
            <button
              onClick={() => { setSearchTerm(''); setNicheFilter('All'); setStatusFilter('All'); setMinBudget(''); }}
              className="mt-4 px-8 py-4 rounded-[16px] bg-gray-900 text-white font-black text-[12px] uppercase tracking-widest hover:bg-[#EA580C] hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] transition-all"
            >
              Reset Console
            </button>
          </div>
        )}

        {/* Global Toast */}
        {toast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-reveal-up flex items-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-[16px] shadow-2xl border border-gray-800">
            <div className="w-8 h-8 rounded-full bg-[#EA580C]/20 text-[#EA580C] flex items-center justify-center">
              <Bell size={16} />
            </div>
            <p className="text-[13px] font-bold">{toast}</p>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      {user?.role === 'creator' ? (
        <CreatorBottomNav activeTab="discover" />
      ) : user?.role === 'brand' ? (
        <BrandBottomNav activeTab="" />
      ) : (
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 flex justify-around px-2 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
          {[
            { id: 'discover', label: 'Home', icon: Home, active: true },
            { id: 'deals', label: 'Deals', icon: Briefcase, path: '/creator-dashboard?tab=deals' },
            { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/creator-dashboard?tab=wallet' },
            { id: 'settings', label: 'Profile', icon: User, path: '/creator-dashboard?tab=settings' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = tab.active;

            return tab.path ? (
              <Link
                key={tab.id}
                to={tab.path}
                className="flex flex-col items-center gap-1 min-w-[65px] relative group active:scale-95 transition-transform"
              >
                <div className={`relative p-2.5 rounded-full transition-all duration-300 text-gray-400 group-hover:text-gray-600`}>
                  <Icon size={20} strokeWidth={2} />
                </div>
                <span className="text-[10px] font-black tracking-wide text-gray-400">
                  {tab.label}
                </span>
              </Link>
            ) : (
              <button
                key={tab.id}
                className="flex flex-col items-center gap-1 min-w-[65px] relative group active:scale-95 transition-transform"
              >
                <div className="relative p-2.5 rounded-full bg-[#ea580c] text-white shadow-[0_8px_20px_rgba(234,88,12,0.3)]">
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black tracking-wide text-[#ea580c]">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default CampaignListing;

