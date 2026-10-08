import React, { useState, useMemo } from 'react';
import axios from '../utils/axios';
import BrandCard from '../components/BrandCard';
import { useAuth } from '../context/AuthContext';
import { Search, Briefcase, Zap, ShieldCheck, Sparkles, SlidersHorizontal, Filter, Home, Wallet, User, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreatorBottomNav from '../components/CreatorBottomNav';
import BrandBottomNav from '../components/BrandBottomNav';
import { useInfiniteQuery } from '@tanstack/react-query';

const INDUSTRIES = ['All', 'Tech', 'Fashion', 'Beauty', 'Food', 'Travel', 'Fitness', 'Gaming', 'Finance', 'Other'];

const BrandListing = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['brands', searchTerm, industryFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get('/brands', {
        params: { page: pageParam, limit: 50, search: searchTerm, industry: industryFilter }
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    }
  });

  const brands = useMemo(() => {
    return data?.pages.flatMap(page => page.data || []) || [];
  }, [data]);

  const totalItems = data?.pages[0]?.totalItems || 0;
  const loading = status === 'pending';

  const filtered = useMemo(() => {
    if (!brands.length) return [];
    return brands.filter(b => {
      if (user && (b.userId?._id === user._id || b.userId === user._id)) {
        return false;
      }
      return true;
    });
  }, [brands, user]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-16">

        {/* Cinematic Header Console */}
        <div className="relative p-8 sm:p-12 lg:p-16 rounded-[2.5rem] sm:rounded-[3.5rem] bg-indigo-950 text-white overflow-hidden shadow-2xl mb-8 sm:mb-16 animate-reveal-up group">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#EA580C]/20 blur-3xl rounded-full pointer-events-none group-hover:bg-[#EA580C]/30 transition-colors duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none group-hover:bg-indigo-600/30 transition-colors duration-1000"></div>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/30 backdrop-blur-sm">Brand Directory</span>
                <Sparkles size={16} className="text-white/60 animate-pulse" />
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black font-display mb-6 tracking-tighter leading-none text-white">
                Brand <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-[#EA580C]">Partnerships</span>
              </h1>
              <p className="hidden sm:block text-white/70 text-lg font-medium leading-relaxed max-w-lg">
                Discover leading brands seeking high-impact creators for their next major campaign.
              </p>
            </div>

            <div className="hidden sm:flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl shrink-0 text-center sm:text-right">
              <div>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Active Brands</p>
                <p className="text-5xl font-black text-white tracking-tighter">{totalItems}</p>
              </div>
              <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center text-indigo-400 border border-white/10 shadow-inner">
                <Briefcase size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Console */}
        <div className="sticky top-20 z-30 mb-8 sm:mb-16">
          <div className="p-2 sm:p-4 rounded-[1rem] sm:rounded-[2rem] bg-white border border-gray-200 shadow-xl shadow-black/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 transition-all duration-500">
            <div className="relative grow group">
              <Search className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search by brand name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-16 pr-3 sm:pr-6 py-2 sm:py-5 bg-gray-50 border border-gray-100 rounded-[10px] sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all font-bold text-[12px] sm:text-sm tracking-tight text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="relative flex-1 sm:flex-none">
              <SlidersHorizontal className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full sm:w-64 pl-8 sm:pl-14 pr-8 sm:pr-12 py-2 sm:py-5 bg-gray-50 border border-gray-100 rounded-[10px] sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 font-black text-[10px] uppercase tracking-widest text-gray-900 appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                {INDUSTRIES.map(n => <option key={n} value={n} className="font-bold">{n === 'All' ? 'All Industries' : n}</option>)}
              </select>
              <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <Filter size={12} />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="h-[400px] rounded-[2.5rem] bg-gray-200 animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {filtered.map((brand, idx) => (
                <div key={brand._id} className={`animate-reveal-up opacity-0 stagger-${(idx % 4) + 1}`}>
                  <BrandCard brand={brand} />
                </div>
              ))}
            </div>
            {hasNextPage && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-8 py-4 rounded-2xl bg-white border border-gray-200 text-gray-900 font-black text-[10px] uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isFetchingNextPage ? <><Loader2 size={16} className="animate-spin" /> Loading...</> : 'Load More Brands'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 sm:py-32 rounded-[3rem] bg-white border-2 border-dashed border-gray-200 flex flex-col items-center text-center gap-6 animate-reveal-up mx-4 sm:mx-0">
            <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 shadow-sm">
              <Briefcase size={48} />
            </div>
            <div className="px-4">
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter mb-2">No Brands Found</h3>
              <p className="text-gray-500 font-medium">No brands match your current search parameters. Try expanding your criteria.</p>
            </div>
            <button
              onClick={() => { setSearchTerm(''); setIndustryFilter('All'); }}
              className="mt-4 px-8 py-4 rounded-2xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-[#EA580C] hover:text-white transition-all shadow-xl"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      {user?.role === 'creator' ? (
        <CreatorBottomNav activeTab="brands" />
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

export default BrandListing;
