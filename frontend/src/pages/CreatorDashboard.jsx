/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { User, Compass, Briefcase, Wallet, Settings, Folder, Home, Bell, Heart, LogOut, LayoutDashboard, CheckCircle, AlertCircle, Star, Zap } from "lucide-react";

// Modular Views
import CreatorProfile from '../components/CreatorDashboard/CreatorProfile';
import CreatorApplications from '../components/CreatorDashboard/CreatorApplications';
import CreatorDeals from '../components/CreatorDashboard/CreatorDeals';
import CreatorWallet from '../components/CreatorDashboard/CreatorWallet';
import CreatorDiscover from '../components/CreatorDashboard/CreatorDiscover';
import CreatorSettings from '../components/CreatorDashboard/CreatorSettings';

import CreatorBottomNav from "../components/CreatorBottomNav";
import KycRequiredModal from "../components/KycRequiredModal";
import CompleteProfileModal from "../components/CompleteProfileModal";

const CreatorDashboard = () => {
  const { user, setUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // App State
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'discover';
  });

  // Sync state when URL changes (e.g. from BottomNav)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Wrapper for setActiveTab to also update URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/creator-dashboard?tab=${tab}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [deals, setDeals] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Badge states for Top Header
  const [wishlistCount, setWishlistCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [kycModalMessage, setKycModalMessage] = useState("");
  const [completeProfileOpen, setCompleteProfileOpen] = useState(false);
  const [hasShownKycPrompt, setHasShownKycPrompt] = useState(false);

  const fetchData = async () => {
    try {
      const [profRes, appsRes, campRes, dealsRes, wallRes, transRes, notifRes, wishRes] = await Promise.all([
        axios.get("/creators/me").catch((err) => { console.error(err); return { data: null }; }),
        axios.get("/applications/creator").catch((err) => { console.error(err); return { data: [] }; }),
        axios.get("/campaigns?match=true").catch((err) => { console.error(err); return { data: [] }; }),
        axios.get("/deals/user").catch((err) => { console.error(err); return { data: [] }; }),
        axios.get("/wallet/my-wallet").catch(() => ({ data: null })),
        axios.get("/wallet/transactions").catch(() => ({ data: [] })),
        axios.get("/notifications").catch(() => ({ data: [] })),
        axios.get("/wishlists/count").catch(() => ({ data: { count: 0 } }))
      ]);
      if (profRes.data) {
        setProfile(profRes.data);
        if (profRes.data.profilePicture) {
          setUser(prev => prev ? { ...prev, profilePicture: profRes.data.profilePicture, name: profRes.data.name } : prev);
        }
      }
      setApplications(Array.isArray(appsRes.data) ? appsRes.data : []);
      setCampaigns(Array.isArray(campRes.data?.data) ? campRes.data.data : Array.isArray(campRes.data) ? campRes.data : []);
      setDeals(Array.isArray(dealsRes.data) ? dealsRes.data : []);
      if (wallRes && wallRes.data) setWallet(wallRes.data);
      if (transRes && transRes.data) setTransactions(transRes.data);

      if (notifRes && notifRes.data) {
        const unreads = notifRes.data.filter(n => !n.read);
        setHasUnread(unreads.length > 0);
        setUnreadCount(unreads.length);
      }
      if (wishRes && wishRes.data) {
        setWishlistCount(wishRes.data.count);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Poll for notification & wishlist changes every 30s
  useEffect(() => {
    if (user) {
      const interval = setInterval(async () => {
        try {
          const [notifRes, wishRes] = await Promise.all([
            axios.get("/notifications").catch(() => ({ data: [] })),
            axios.get("/wishlists/count").catch(() => ({ data: { count: 0 } }))
          ]);
          if (notifRes && notifRes.data) {
            const unreads = notifRes.data.filter(n => !n.read);
            setHasUnread(unreads.length > 0);
            setUnreadCount(unreads.length);
          }
          if (wishRes && wishRes.data) {
            setWishlistCount(wishRes.data.count);
          }
        } catch (err) {
          console.error(err);
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const isProfileIncomplete = user && profile && (
    !profile.name || profile.name.startsWith('Creator-') || !profile.profilePicture
  );

  useEffect(() => {
    if (!user || !profile) return;

    if (isProfileIncomplete) {
      if (sessionStorage.getItem('profileSetupSkipped') !== 'true') {
        setCompleteProfileOpen(true);
      }
    } else if (
      user.kycStatus !== 'APPROVED' && 
      user.kycStatus !== 'PENDING' && 
      user.kycStatus !== 'UNDER_REVIEW' &&
      !hasShownKycPrompt
    ) {
      let msg = "Identity verification is required to unlock all platform capabilities. Complete KYC to continue.";
      if (user.kycStatus === 'REJECTED') {
        msg = "Your verification was rejected. Please resubmit verification documents to continue.";
      }
      setKycModalMessage(msg);
      setKycModalOpen(true);
      setHasShownKycPrompt(true);
    }
  }, [user, profile, hasShownKycPrompt]);

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleApply = async (campaignId) => {
    if (user?.kycStatus !== 'APPROVED') {
      setKycModalMessage("Identity verification is required before applying to campaigns. Complete KYC to continue.");
      setKycModalOpen(true);
      return;
    }
    try {
      await axios.post("/applications", { campaignId, message: "Applied via Marketplace" });
      showToast("Application submitted successfully!");
      await fetchData();
      handleTabChange('applications');
    } catch (err) {
      showToast(err.response?.data?.message || "Error applying for campaign", 'error');
    }
  };

  const confirmApplication = async (appId, currentStatus) => {
    if (user?.kycStatus !== 'APPROVED') {
      setKycModalMessage("Identity verification is required before accepting deals or starting contracts. Complete KYC to continue.");
      setKycModalOpen(true);
      return;
    }
    try {
      if (currentStatus !== "confirmed_by_creator") {
        await axios.put(`/applications/${appId}/status`, { status: "confirmed_by_creator" });
      }
      try {
        await axios.post("/deals", { applicationId: appId });
      } catch (dealErr) {
        console.log("Deal already exists or handled:", dealErr.response?.data?.message);
      }
      await fetchData();
      showToast("Application confirmed! Deal started.");
      handleTabChange("deals");
    } catch (err) {
      showToast(err.response?.data?.message || "Error confirming application.", 'error');
    }
  };

  const handleProfileSave = async (updatedProfile) => {
    try {
      const res = await axios.post("/creators/profile", updatedProfile);
      setProfile(res.data);
      showToast("Profile saved successfully!");
    } catch (err) {
      showToast("Error saving profile", 'error');
    }
  };

  const handleAvatarUpload = async (e) => {
    if (!e.target.files[0]) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("profilePicture", e.target.files[0]);
    try {
      const res = await axios.post("/creators/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setProfile((prev) => ({ ...prev, profilePicture: res.data.profilePicture }));
      setUser(prev => prev ? { ...prev, profilePicture: res.data.profilePicture } : prev);
      showToast("Avatar updated!");
    } catch (err) {
      showToast("Avatar upload failed.", 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleWithdrawRequest = async () => {
    // Refresh wallet and transaction data after withdrawal
    await fetchData();
  };

  const handleNudgeApplication = async (appId) => {
    if (user?.kycStatus !== 'APPROVED') {
      setKycModalMessage("Identity verification is required before sending reminders or nudges to brands. Complete KYC to continue.");
      setKycModalOpen(true);
      return;
    }
    try {
      await axios.post(`/applications/${appId}/nudge`);
      showToast("Nudge sent to brand successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Error sending nudge.", 'error');
    }
  };

  const handleWithdrawApplication = async (appId) => {
    try {
      await axios.delete(`/applications/${appId}/withdraw`);
      showToast("Application withdrawn.");
      fetchData(); // Refresh list
    } catch (err) {
      showToast(err.response?.data?.message || "Error withdrawing application.", 'error');
    }
  };

  const sidebarItems = [
    { id: 'discover', label: 'Discover', icon: <Compass size={20} /> },
    { id: 'profile', label: 'Profile View', icon: <LayoutDashboard size={20} /> },
    { id: 'applications', label: 'Applications', icon: <Folder size={20} />, count: applications.filter(a => a.status === 'accepted' || a.status === 'confirmed_by_creator').length },
    { id: 'deals', label: 'Deals', icon: <Briefcase size={20} />, count: deals.filter(d => d.status === 'in_progress' || d.status === 'revision_requested').length },
    { id: 'wallet', label: 'Wallet', icon: <Wallet size={20} /> },
    { id: 'settings', label: 'Settings', icon: <User size={20} /> }
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-[#4F46E5] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[var(--bd-bg)] text-[var(--bd-text)] font-sans overflow-x-hidden relative">
      {/* Global Decorative Backgrounds */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-100/40 via-purple-100/40 to-pink-100/40 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-orange-100/40 to-rose-100/40 rounded-full blur-[100px] translate-y-1/4 translate-x-1/4 pointer-events-none z-0"></div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 bg-white/80 backdrop-blur-xl border-r border-gray-100 z-50 shadow-[0_4px_40px_rgba(0,0,0,0.03)]">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2.5 mb-6 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20">K</div>
            <span className="font-black text-[22px] tracking-tight text-gray-900 lowercase">kino</span>
          </Link>

          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-indigo-700 text-white shadow-lg shadow-[#4F46E5]/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
            
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-1 relative z-10">Welcome Back,</p>
            <h3 className="text-[18px] font-display font-black tracking-tight truncate relative z-10">{profile?.name || 'Creator'}</h3>
            
            <div className="mt-4 flex items-center gap-2 relative z-10">
               <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1 shadow-sm"><Star size={10} className="text-yellow-400 fill-yellow-400 drop-shadow-md"/> Pro</span>
               <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-md border border-white/5 flex items-center gap-1 text-white/90">Lvl 2</span>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all relative ${activeTab === item.id ? 'bg-[#4F46E5] text-white shadow-md shadow-[#4F46E5]/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                {item.icon}
                {item.label}
                {item.count > 0 && (
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === item.id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-[#4F46E5]'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
              {profile?.profilePicture ? (
                <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-black text-gray-400 bg-gray-100">
                  {profile?.name?.substring(0, 2).toUpperCase() || 'CR'}
                </div>
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-gray-900 truncate">{profile?.name || 'Creator'}</span>
              <span className="text-[10px] font-bold text-gray-400 truncate">{user?.email}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden fixed top-0 left-0 right-0 w-full bg-white/95 backdrop-blur-xl z-40 border-b border-gray-100 flex items-center justify-between px-4 py-3.5 shadow-sm max-w-[500px] mx-auto">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-orange-500/20">
            <span className="text-white font-sans font-black text-xl tracking-tighter">K</span>
          </div>
          <span className="font-sans font-black text-[18px] text-gray-900 tracking-tight lowercase">kino</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/wishlist" className="relative p-2 text-gray-500 hover:text-pink-500 hover:bg-gray-50 rounded-xl transition-all">
            <Heart size={20} />
            {wishlistCount > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-pink-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">{wishlistCount}</span>}
          </Link>
          <Link to="/notifications" className="relative p-2 text-gray-500 hover:text-[#4f46e5] hover:bg-gray-50 rounded-xl transition-all">
            <Bell size={20} className={hasUnread ? "animate-pulse text-[#4f46e5]" : ""} />
            {hasUnread && <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">{unreadCount}</span>}
          </Link>
          <div className="relative">
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-9 h-9 rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:border-gray-300 transition-all flex-shrink-0 active:scale-95 flex items-center justify-center focus:outline-none bg-gray-50">
              {profile?.profilePicture ? <img src={profile.profilePicture} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">{profile?.name?.substring(0, 2).toUpperCase() || 'CR'}</div>}
            </button>
            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileOpen(false)} />
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 w-[220px] bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 text-left">
                    <div className="px-4 py-3.5 border-b border-gray-100/60 bg-gray-50/30">
                      <p className="text-[14px] font-bold text-gray-900 tracking-tight truncate">{profile?.name || 'Creator Dashboard'}</p>
                      <p className="text-[11px] font-bold text-gray-400 truncate tracking-wide">{user?.email}</p>
                    </div>
                    <div className="p-1 flex flex-col gap-0.5">
                      <button onClick={() => { handleTabChange('profile'); setIsProfileOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-[13px] font-bold text-gray-600 hover:text-[#4F46E5] hover:bg-indigo-50 rounded-xl transition-all"><Compass size={14} /> Dashboard</button>
                      <button onClick={() => { handleTabChange('settings'); setIsProfileOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-[13px] font-bold text-gray-600 hover:text-[#4F46E5] hover:bg-indigo-50 rounded-xl transition-all"><Settings size={14} /> Edit Profile</button>
                      <div className="h-px bg-gray-100/80 my-1 mx-2"></div>
                      <button onClick={() => { handleLogout(); setIsProfileOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-[13px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border-none"><LogOut size={14} /> Logout</button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="w-full flex-1 md:pl-64 pt-[68px] md:pt-0 pb-24 md:pb-8 px-4 md:px-8 relative z-10 flex flex-col">
        <div className="w-full max-w-[1200px] mx-auto md:mt-8">
          
          {/* TOAST MESSAGES */}
          <AnimatePresence>
            {message.text && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed top-24 md:top-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border ${message.type === 'success' ? 'bg-gray-900 text-white border-gray-800' : 'bg-red-500 text-white border-red-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/20 text-white'}`}>
                  {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                </div>
                <div>
                  <p className="text-[13px] font-bold">{message.type === 'success' ? 'Success' : 'Error'}</p>
                  <p className={`text-[11px] ${message.type === 'success' ? 'text-gray-400' : 'text-white/80'}`}>{message.text}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isProfileIncomplete && (
            <div className="mb-6 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-700 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm backdrop-blur-md animate-reveal-up">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-xs font-bold font-display uppercase tracking-wide leading-relaxed">
                  ⚠️ Profile Incomplete: Please upload an avatar/logo and set a custom name to unlock all platform capabilities.
                </p>
              </div>
              <button 
                onClick={() => setCompleteProfileOpen(true)}
                className="px-5 py-2.5 bg-black text-white hover:bg-gray-800 text-[10px] font-black uppercase tracking-widest rounded-xl transition-transform active:scale-95 border border-black shadow-md flex-shrink-0"
              >
                Complete Profile
              </button>
            </div>
          )}

          <KycRequiredModal isOpen={kycModalOpen} onClose={() => setKycModalOpen(false)} message={kycModalMessage} kycStatus={user?.kycStatus} />

          <CompleteProfileModal 
            isOpen={completeProfileOpen} 
            onClose={() => {
              sessionStorage.setItem('profileSetupSkipped', 'true');
              setCompleteProfileOpen(false);
            }} 
            user={user}
            initialProfile={profile}
            onComplete={() => {
              setCompleteProfileOpen(false);
              fetchData();
            }}
          />

          {/* DYNAMIC VIEWS */}
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && <CreatorProfile key="profile" profile={profile} deals={deals} campaigns={campaigns} applications={applications} transactions={transactions} setActiveTab={handleTabChange} />}
            {activeTab === 'applications' && <CreatorApplications key="applications" applications={applications} deals={deals} onConfirm={confirmApplication} onNudge={handleNudgeApplication} onWithdraw={handleWithdrawApplication} setActiveTab={handleTabChange} />}
            {activeTab === 'deals' && <CreatorDeals key="deals" deals={deals} user={user} onUpdateDeal={fetchData} />}
            {activeTab === 'wallet' && <CreatorWallet key="wallet" wallet={wallet} transactions={transactions} onWithdraw={handleWithdrawRequest} />}
            {activeTab === 'discover' && <CreatorDiscover key="discover" campaigns={campaigns} applications={applications} profile={profile} onApply={handleApply} setActiveTab={handleTabChange} />}
            {activeTab === 'settings' && <CreatorSettings key="settings" profile={profile} onSave={handleProfileSave} onUploadAvatar={handleAvatarUpload} isUploading={isUploading} onLogout={handleLogout} />}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden">
        <CreatorBottomNav activeTab={activeTab} />
      </div>
    </div>
  );
};

export default CreatorDashboard;
