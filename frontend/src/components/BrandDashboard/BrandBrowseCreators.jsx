import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Link as LinkIcon, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const BrandBrowseCreators = (props) => {
  const { 
    allCreators = [], 
    profile, 
    browseFilter, 
    setBrowseFilter, 
    browseSearch, 
    setBrowseSearch 
  } = props;
  
  const [browseSort, setBrowseSort] = useState('Highest Match Score');

  return (
    <>
      <div className="flex flex-col animate-reveal-up">
        {/* Search Section */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm shadow-black/5">
              <Search className="text-gray-400" size={20} />
              <input type="text" placeholder="Search creators by name or niche..." value={browseSearch} onChange={(e) => setBrowseSearch(e.target.value)} className="bg-transparent border-none outline-none text-gray-900 font-bold w-full placeholder:text-gray-400 text-sm" />
            </div>
            <Link to="/creators" className="bg-[#3b82f6] text-white font-black uppercase tracking-widest text-[10px] px-6 py-4 rounded-[10px] flex items-center justify-center gap-2 hover:bg-[#EA580C] transition-colors shrink-0 shadow-sm shadow-blue-500/20">
              Advanced Marketplace →
            </Link>
          </div>
          {/* Inline Filter Tags & Sort */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-400 mr-2 uppercase tracking-widest">Filters:</span>
              {['All', 'Tech', 'VFX', 'Lifestyle', 'Video Editing'].map(tag => (
                <button key={tag} onClick={() => setBrowseFilter(tag)} className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border ${browseFilter === tag ? 'bg-[#EA580C] text-white border-gray-900 shadow-[0_0_15px_rgba(234,88,12,0.3)]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'}`}>
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort:</span>
              <select value={browseSort} onChange={(e) => setBrowseSort(e.target.value)} className="bg-transparent text-[11px] font-bold text-gray-900 outline-none cursor-pointer">
                <option>Highest Match Score</option>
                <option>Highest Followers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Top Picks Carousel */}
        <div className="mb-10 relative">
          <div className="flex items-center gap-2 mb-4">
            <Star className="text-amber-400 fill-amber-400" size={16} />
            <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">Top Creators for Your Brand</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
            {allCreators.length === 0 ? (
              <div className="text-xs text-gray-400 font-bold">No creators available.</div>
            ) : (
              [...allCreators]
                .map(c => {
                  let match = 70;
                  if (c.niche === profile?.industry) match += 20;
                  if (c.niche === profile?.preferences?.targetLocality) match += 5;
                  return { ...c, matchScore: Math.min(99, match + (Math.random() * 5 | 0)) };
                })
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, 5)
                .map(tc => (
                  <Link to={`/creators/${tc._id}`} key={tc._id} className="snap-start shrink-0 w-[200px] bg-gradient-to-br from-gray-900 to-black text-white p-4 rounded-[20px] shadow-xl relative overflow-hidden group border border-white/10 cursor-pointer block">
                    <div className="absolute top-[-20%] right-[-20%] w-24 h-24 bg-[#EA580C]/40 rounded-full blur-[30px] group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10 flex flex-col items-center text-center gap-3">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-[#EA580C] overflow-hidden bg-white shadow-[0_0_15px_rgba(234,88,12,0.5)]">
                          <img src={tc.instagramProfile?.profilePicture || tc.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tc.name}&backgroundColor=f0f0f0`} alt={tc.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-2 border-gray-900">{tc.matchScore}%</div>
                      </div>
                      <div>
                        <h4 className="font-bold text-[13px]">{tc.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Highly Recommended</p>
                      </div>
                    </div>
                  </Link>
                ))
            )}
          </div>
        </div>

        {/* Creator Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 md:pb-0">
          {allCreators.length === 0 ? (
            <div className="col-span-full bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-sm w-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-blue-50 text-[#3b82f6] rounded-full flex items-center justify-center mb-4">
                <Search size={28} />
              </div>
              <h4 className="text-lg font-black text-gray-900 mb-1">No creators registered yet</h4>
              <p className="text-sm text-gray-500 max-w-sm">Please check back later or modify your search criteria.</p>
            </div>
          ) : (
            allCreators.filter(c => {
              const search = (browseSearch || '').toLowerCase();
              const nameMatch = c.name ? String(c.name).toLowerCase().includes(search) : false;
              const bioMatch = c.bio ? String(c.bio).toLowerCase().includes(search) : false;
              const matchSearch = search === '' ? true : (nameMatch || bioMatch);
              
              const matchFilter = browseFilter === 'All' || c.niche === browseFilter || (c.expertise && c.expertise.includes(browseFilter));
              return matchSearch && matchFilter;
            }).sort((a, b) => {
              if (browseSort === 'Highest Match Score') {
                const matchA = a.niche === profile?.industry ? 1 : 0;
                const matchB = b.niche === profile?.industry ? 1 : 0;
                return matchB - matchA;
              }
              if (browseSort === 'Highest Followers') {
                const fA = a.instagramProfile?.connected ? Number(a.instagramProfile.followers) : Number(a.followerCount || 0);
                const fB = b.instagramProfile?.connected ? Number(b.instagramProfile.followers) : Number(b.followerCount || 0);
                return fB - fA;
              }
              return 0;
            }).map((creator) => {
              const hasInstagram = creator.instagramProfile?.connected;
              const igFollowers = Number(creator.instagramProfile?.followers) || 0;
              const manualFollowers = Number(creator.followerCount) || 0;
              const activeFollowers = hasInstagram ? igFollowers : manualFollowers;
              const followersFormatted = activeFollowers > 0 ? `${(activeFollowers / 1000).toFixed(1)}k` : '0k';
              
              return (
                <div key={creator._id} className="bg-white rounded-[32px] overflow-hidden flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 group hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 relative">
                  {/* Cover Image with Gradient */}
                  <div className="w-full aspect-[21/9] relative bg-gray-200 overflow-hidden">
                    <img 
                      src={creator.instagramProfile?.profilePicture || creator.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.name}&backgroundColor=f0f0f0`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 opacity-60"></div>
                  </div>

                  {/* Profile Section */}
                  <div className="px-6 pb-6 flex-1 flex flex-col bg-white relative z-10 pt-4">
                    {/* Avatar & Stats */}
                    <div className="flex items-end justify-between mb-6">
                      <div className="w-[84px] h-[84px] rounded-[24px] border-4 border-white overflow-hidden bg-gray-100 -mt-12 relative z-20 shrink-0 shadow-lg">
                        <img 
                          src={creator.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.name}&backgroundColor=f0f0f0`} 
                          alt={creator.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>

                      <div className="flex gap-4 sm:gap-6 text-center pb-1">
                        <div className="flex flex-col items-center">
                          <p className="font-black text-gray-900 text-[17px] leading-none">{followersFormatted}</p>
                          <p className="text-[11px] text-gray-500 font-bold mt-1">Followers</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <p className="font-black text-gray-900 text-[17px] leading-none">
                            {hasInstagram ? `${creator.instagramProfile.engagementRate}%` : 'N/A'}
                          </p>
                          <p className="text-[11px] text-gray-500 font-bold mt-1">ER</p>
                        </div>
                      </div>
                    </div>

                    {/* Name and Niche */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-black text-xl text-gray-900 flex items-center gap-1.5 leading-none mb-1.5">
                          {creator.name}
                          {hasInstagram && (
                            <svg className="w-4 h-4 text-[#3b82f6]" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z" />
                            </svg>
                          )}
                        </h4>
                        <p className="text-[13px] text-gray-500 font-medium">
                          {creator.niche || 'General Niche'}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-[13px] text-gray-600 leading-[1.6] font-medium mb-6 flex-1">
                      {creator.bio || 'This creator hasn\'t written a bio yet.'}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-auto">
                      <Link to={`/creators/${creator._id}`} className="flex-1 py-2.5 rounded-[12px] bg-[#3b82f6] hover:bg-[#EA580C] text-white font-bold transition-all flex items-center justify-center text-[13.5px] text-center">
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default BrandBrowseCreators;
