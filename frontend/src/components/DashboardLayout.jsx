import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Camera, ShieldCheck, Copy, CheckCircle, TrendingUp, Star, Bell, Home, Briefcase, Plus, Users, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ sidebarItems, activeTab, setActiveTab, children, brandProfile, creatorProfile, wallet }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const adminRoles = ['superadmin', 'admin', 'moderator', 'support'];
  const isAdminRole = user && adminRoles.includes(user.role);
  const logoPath = isAdminRole ? '/admin-dashboard' : '/';

  // Close sidebar on route/tab change for mobile and reset scroll position to top
  useEffect(() => {
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);

    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);

    return () => clearTimeout(timer);
  }, [activeTab]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFC] text-gray-900 relative">
      {/* Global Decorative Backgrounds */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-100/40 via-purple-100/40 to-pink-100/40 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-orange-100/40 to-rose-100/40 rounded-full blur-[100px] translate-y-1/4 translate-x-1/4 pointer-events-none z-0"></div>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden transition-all duration-500"
        />
      )}

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 left-0 w-full bg-white z-40 border-b border-gray-100 flex items-center justify-between px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <Link to={logoPath} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-sm shadow-orange-500/20">K</div>
          <span className="font-black text-[17px] text-gray-900 tracking-tight lowercase">kino</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer">
            <Bell size={20} className="text-gray-600" />
            <div className="absolute -top-1 -right-1 w-[14px] h-[14px] bg-red-500 rounded-full flex items-center justify-center text-[8px] font-black text-white border-2 border-white">4</div>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-gray-100 overflow-hidden shadow-sm">
            <img src={brandProfile?.logo || creatorProfile?.profilePicture || "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=400&auto=format&fit=crop"} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky md:top-[104px] md:my-6 left-0 h-full md:h-[calc(100vh-128px)] md:ml-6 w-[320px] bg-white/60 backdrop-blur-2xl border border-white p-6 sm:p-8 flex flex-col gap-2 z-50 md:z-30 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:translate-x-0 rounded-r-[40px] md:rounded-[40px] shadow-[0_20px_80px_rgba(0,0,0,0.06)] overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Mobile Close Button */}
        <div className="md:hidden flex justify-end mb-4">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2.5 text-gray-400 hover:text-red-500 bg-white/80 border border-white rounded-[16px] active:scale-95 transition-all shadow-sm"
          >
            <X size={18} />
          </button>
        </div>

        {brandProfile ? (
          <div className="mb-6 mt-4 md:mt-0 flex flex-col gap-3 w-full">
            <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 border border-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col items-center text-center group relative overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1">
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>

              {/* Refined Brand Logo */}
              <div className="relative w-20 h-20 rounded-[24px] overflow-hidden group/img cursor-pointer bg-white shadow-md border-2 border-white mb-4 flex-shrink-0 z-10">
                <img
                  src={brandProfile.logo || "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=400&auto=format&fit=crop"}
                  alt="Brand Image"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                />
                <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-300">
                  <Camera size={18} className="text-white drop-shadow-lg" />
                </div>
                <div className="absolute -bottom-1 -right-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white shadow-md z-20">
                  {(() => {
                    let score = 0;
                    if (brandProfile.businessName) score += 20;
                    if (brandProfile.website) score += 20;
                    if (brandProfile.description) score += 20;
                    if (brandProfile.location) score += 20;
                    if (brandProfile.logo) score += 20;
                    return score;
                  })()}%
                </div>
              </div>

              {/* Brand Text and Info */}
              <div className="flex flex-col items-center relative z-10 w-full">
                <h2 className="text-gray-900 font-display font-black text-[18px] tracking-tight leading-tight mb-1 truncate w-full group-hover:text-indigo-600 transition-colors">
                  {brandProfile.businessName || 'Brand Console'}
                </h2>
                
                {/* KYC status badge */}
                <div className="mb-3 flex items-center gap-1.5 justify-center select-none">
                  {user?.kycStatus === 'APPROVED' ? (
                    <span className="text-[9px] text-green-600 font-black uppercase tracking-wider bg-green-50 px-2.5 py-1 rounded-full border border-green-100 flex items-center gap-1">🟢 Verified</span>
                  ) : user?.kycStatus === 'PENDING' || user?.kycStatus === 'UNDER_REVIEW' ? (
                    <span className="text-[9px] text-blue-600 font-black uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1">🟡 Reviewing</span>
                  ) : user?.kycStatus === 'REJECTED' ? (
                    <span className="text-[9px] text-red-600 font-black uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-full border border-red-100 flex items-center gap-1">🔴 Rejected</span>
                  ) : (
                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 flex items-center gap-1">⚪ Unverified</span>
                  )}
                </div>

                <div className="mb-4">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] bg-gray-100/80 px-3 py-1.5 rounded-lg border border-white shadow-sm">Workspace</span>
                </div>

                <Link
                  to={`/brands/${brandProfile._id}`}
                  className="w-full py-3 bg-gradient-to-r from-gray-900 to-black text-white hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] text-[11px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 group/link transition-all duration-300 active:scale-95 border border-gray-800"
                >
                  View Profile <TrendingUp size={14} className="text-gray-400 group-hover/link:text-white group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-all" />
                </Link>
              </div>
            </div>
          </div>
        ) : creatorProfile ? (
          <div className="mb-8 mt-8 md:mt-0 flex flex-col items-center text-center bg-white/80 backdrop-blur-xl p-8 rounded-[40px] border border-white shadow-[0_15px_40px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_25px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex-shrink-0">
            {/* Glowing orb background */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-400/10 via-rose-400/10 to-pink-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>

            <div className="relative mb-5 z-10">
              <div className="w-24 h-24 rounded-full border-[4px] border-white shadow-lg overflow-hidden flex-shrink-0 bg-gray-50 relative">
                {creatorProfile.profilePicture ? (
                  <img src={creatorProfile.profilePicture} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-black text-gray-400">
                    {creatorProfile.name?.substring(0, 2)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-full p-2 border-[3px] border-white shadow-md z-20">
                <ShieldCheck size={14} strokeWidth={3} />
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center w-full mb-6">
              <h2 className="text-[22px] font-display font-black text-gray-900 tracking-tight truncate w-full mb-2">
                {creatorProfile.name || 'Creator Dashboard'}
              </h2>
              <div className="flex flex-col items-center gap-2">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.25em] bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100 shadow-sm flex items-center gap-1.5">
                  <Star size={10} fill="currentColor" /> Level 2 Seller
                </p>
                {/* KYC status badge */}
                <div className="mt-1 select-none">
                  {user?.kycStatus === 'APPROVED' ? (
                    <span className="text-[9px] text-green-600 font-black uppercase tracking-wider bg-green-50 px-2.5 py-1 rounded-full border border-green-100 flex items-center gap-1">🟢 Verified</span>
                  ) : user?.kycStatus === 'PENDING' || user?.kycStatus === 'UNDER_REVIEW' ? (
                    <span className="text-[9px] text-blue-600 font-black uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1">🟡 Reviewing</span>
                  ) : user?.kycStatus === 'REJECTED' ? (
                    <span className="text-[9px] text-red-600 font-black uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-full border border-red-100 flex items-center gap-1">🔴 Rejected</span>
                  ) : (
                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 flex items-center gap-1">⚪ Unverified</span>
                  )}
                </div>
              </div>
            </div>

            <button onClick={() => {
              navigator.clipboard.writeText(`https://influencerhub.app/creators/${creatorProfile._id}`);
            }} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:shadow-[0_15px_30px_rgba(249,115,22,0.3)] text-[11px] font-black uppercase tracking-widest rounded-[16px] flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 group/btn relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-[150%] group-hover/btn:translate-x-[150%] transition-transform duration-700"></div>
              <Copy size={16} className="group-hover/btn:scale-110 transition-transform z-10 relative" /> <span className="z-10 relative">Copy Media Kit</span>
            </button>
          </div>
        ) : (
          <div className="mb-8 sm:mb-10 px-2 sm:px-4 mt-8 md:mt-0 relative z-10">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Corporate Hub</span>
            <h2 className="text-[13px] font-display font-extrabold text-gray-900 uppercase tracking-[0.2em] mt-1">Navigation</h2>
          </div>
        )}

        <nav className="flex flex-col gap-2 relative z-10 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false); // Close sidebar on selection for better mobile UX
              }}
              className={`flex items-center gap-4 px-5 py-4 rounded-[20px] font-black text-[11px] sm:text-xs uppercase tracking-widest transition-all duration-300 group relative overflow-hidden border ${activeTab === item.id
                ? 'text-white border-transparent shadow-[0_10px_30px_rgba(225,29,72,0.3)] scale-[1.02]'
                : 'text-gray-500 bg-white/40 border-white hover:bg-white hover:text-gray-900 hover:shadow-[0_5px_15px_rgba(0,0,0,0.03)] hover:scale-[1.01]'
                }`}
            >
              {/* Active Gradient Background */}
              {activeTab === item.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500 bg-[length:200%_auto] animate-gradient z-0"></div>
              )}

              <div className={`relative z-10 transition-transform duration-300 ${activeTab === item.id ? 'scale-110 text-white drop-shadow-md' : 'group-hover:scale-110 group-hover:text-rose-500'}`}>
                {item.icon}
              </div>
              <span className="truncate flex-1 text-left relative z-10 tracking-[0.15em]">{item.label}</span>

              {/* Notification Badge */}
              {item.count > 0 && (
                <span className={`relative z-10 px-2.5 py-1 rounded-xl text-[10px] font-black shadow-sm flex items-center justify-center min-w-[28px] ${activeTab === item.id ? 'bg-white/20 text-white backdrop-blur-md border border-white/30' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                  {item.count}
                </span>
              )}

              {activeTab === item.id && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full z-10 shadow-[0_0_15px_rgba(255,255,255,1)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Widget */}
        {brandProfile ? (
          <div className="mt-auto p-6 rounded-[32px] bg-gradient-to-br from-gray-900 to-black border border-gray-800 shadow-[0_20px_40px_rgba(0,0,0,0.2)] hidden md:flex flex-col relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/40 transition-colors duration-700"></div>

            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 rounded-[14px] bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner border border-indigo-500/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <CheckCircle size={18} className="drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              </div>
              <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Pro Tip</p>
            </div>

            <p className="text-[13px] font-medium text-gray-300 leading-relaxed relative z-10">
              Collaborate with creators who match your brand voice for <strong className="text-white">2x higher engagement</strong> and ROI.
            </p>
          </div>
        ) : creatorProfile && (
          <div className="hidden"></div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 p-4 sm:p-6 md:p-8 lg:p-12 pb-28 md:pb-12 overflow-x-hidden relative z-10 hide-scrollbar">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -15, filter: 'blur(5px)' }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 24
          }}
          className="w-full max-w-[1400px] mx-auto"
        >
          {/* KYC Status banner */}
          {user?.role !== 'superadmin' && user?.role !== 'admin' && user?.role !== 'moderator' && user?.role !== 'support' && user?.kycStatus !== 'APPROVED' && (
            <div className={`mb-6 p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm backdrop-blur-md animate-reveal-up ${
              user?.kycStatus === 'PENDING' || user?.kycStatus === 'UNDER_REVIEW'
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-700'
                : user?.kycStatus === 'REJECTED' || user?.kycStatus === 'EXPIRED'
                  ? 'bg-red-500/10 border-red-500/20 text-red-700'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-700'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                  user?.kycStatus === 'PENDING' || user?.kycStatus === 'UNDER_REVIEW'
                    ? 'bg-blue-500'
                    : user?.kycStatus === 'REJECTED' || user?.kycStatus === 'EXPIRED'
                      ? 'bg-red-500'
                      : 'bg-amber-500'
                }`} />
                <p className="text-xs font-bold font-display uppercase tracking-wide leading-relaxed">
                  {user?.kycStatus === 'PENDING' || user?.kycStatus === 'UNDER_REVIEW'
                    ? '🟡 Verification Under Review. Your documents are being verified. Estimated review time is 24 hours.'
                    : user?.kycStatus === 'REJECTED'
                      ? '🔴 Verification Failed. Your identity verification was rejected. Please review settings and resubmit.'
                      : user?.kycStatus === 'EXPIRED'
                        ? '🔴 Verification Expired. Please resubmit identity papers.'
                        : '⚪ Verification Required. Complete your KYC verification to unlock deals, chat rooms, and secure payouts.'}
                </p>
              </div>
              <Link 
                to={user?.kycStatus === 'PENDING' || user?.kycStatus === 'UNDER_REVIEW' ? (user?.role === 'creator' ? '/creator-dashboard' : '/brand-dashboard') : '/aadhaar-verification'}
                className="px-5 py-2.5 bg-black text-white hover:bg-gray-800 text-[10px] font-black uppercase tracking-widest rounded-xl transition-transform active:scale-95 border border-black shadow-md flex-shrink-0"
              >
                {user?.kycStatus === 'PENDING' || user?.kycStatus === 'UNDER_REVIEW'
                  ? 'View Details'
                  : user?.kycStatus === 'REJECTED' || user?.kycStatus === 'EXPIRED'
                    ? 'Resubmit KYC'
                    : 'Verify Now'}
              </Link>
            </div>
          )}
          {children}
        </motion.div>
      </main>

      {/* Premium 5-tab Sticky Bottom Nav for Mobile Dashboard */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 flex justify-between items-end px-2 py-2 pb-[calc(10px+env(safe-area-inset-bottom))] z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.06)]">
        {(brandProfile
          ? [
            { id: 'overview', label: 'Dashboard', icon: <Home size={22} strokeWidth={2.5} /> },
            { id: 'campaigns', label: 'Campaigns', icon: <Briefcase size={22} strokeWidth={2.5} /> },
            { id: 'create', label: 'Create', icon: <Plus size={26} strokeWidth={3} /> },
            { id: 'browse', label: 'Creators', icon: <Users size={22} strokeWidth={2.5} /> },
            { id: 'wallet', label: 'Wallet', icon: <Wallet size={22} strokeWidth={2.5} /> }
          ]
          : sidebarItems
        ).map((item) => {
          const isActive = activeTab === item.id;
          const isMainAction = item.id === 'create';

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 relative group active:scale-95 transition-transform ${isMainAction ? '-translate-y-4' : ''}`}
            >
              {isMainAction ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-[#ea580c] rounded-2xl blur shadow-[0_10px_30px_rgba(234,88,12,0.6)] opacity-50"></div>
                  <div className="relative p-[14px] rounded-[20px] bg-gradient-to-tr from-[#ea580c] to-[#f97316] text-white shadow-[0_8px_20px_rgba(234,88,12,0.4)] border-4 border-white z-10 flex items-center justify-center transition-all duration-300">
                    {item.icon}
                  </div>
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-black tracking-widest text-[#ea580c] uppercase">
                    {item.label}
                  </span>
                </div>
              ) : (
                <>
                  <div className={`relative p-1 rounded-full transition-all duration-300 ${isActive ? 'text-[#ea580c] scale-110' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-[9px] font-black tracking-widest uppercase transition-colors duration-300 ${isActive ? 'text-[#ea580c]' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardLayout;
