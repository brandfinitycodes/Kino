import React, { useState, useEffect, lazy, Suspense } from 'react';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Search, Wallet, Save, CircleDollarSign, Plus, LayoutDashboard, Heart, Bell, Home, User, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import BrandBottomNav from '../components/BrandBottomNav';
import ChatOverlay from '../components/ChatOverlay';
import KycRequiredModal from '../components/KycRequiredModal';
import CompleteProfileModal from '../components/CompleteProfileModal';

// Modular Views
import BrandOverview from '../components/BrandDashboard/BrandOverview';
import BrandBrowseCreators from '../components/BrandDashboard/BrandBrowseCreators';
import BrandCampaigns from '../components/BrandDashboard/BrandCampaigns';
import BrandDeals from '../components/BrandDashboard/BrandDeals';
import BrandWallet from '../components/BrandDashboard/BrandWallet';
import BrandProfileEdit from '../components/BrandDashboard/BrandProfileEdit';
import BrandCreateCampaign from '../components/BrandDashboard/BrandCreateCampaign';

const BrandDashboard = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();

  // App State
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'overview';
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
    navigate(`/brand-dashboard?tab=${tab}`);
  };
  const [profile, setProfile] = useState({
    businessName: '', website: '', description: '',
    ownerName: '', location: '', businessType: 'Online', industry: '', operatingFrom: '',
    preferences: { targetGender: 'Both', targetAgeGroup: 'Any', targetLocality: 'Anywhere', brandPriority: 'Reach' }
  });
  const [campaigns, setCampaigns] = useState([]);
  const [deals, setDeals] = useState([]);
  const [allCreators, setAllCreators] = useState([]);
  const [newCampaign, setNewCampaign] = useState({ title: '', description: '', budget: '', requirements: '', niche: 'Tech', location: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Dashboard UI States
  const [createStep, setCreateStep] = useState(1);
  const [activeChatDeal, setActiveChatDeal] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [kycModalMessage, setKycModalMessage] = useState('');
  const [completeProfileOpen, setCompleteProfileOpen] = useState(false);
  const [hasShownKycPrompt, setHasShownKycPrompt] = useState(false);

  // Feature specific states
  const [chartTab, setChartTab] = useState('MONTHLY');
  const [dealPage, setDealPage] = useState(1);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [browseFilter, setBrowseFilter] = useState('All');
  const [browseSearch, setBrowseSearch] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('Active');
  const [campaignSearch, setCampaignSearch] = useState('');
  const [dealFilter, setDealFilter] = useState('All History');

  // Real-time Dates
  const now = new Date();
  const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(now);

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([
        axios.get('/brands/me'),
        axios.get('/campaigns/mine'),
        axios.get('/creators'),
        axios.get('/deals/user'),
        axios.get('/notifications').catch(() => ({ data: [] })),
        axios.get('/wishlists/count').catch(() => ({ data: { count: 0 } })),
        axios.get('/wallet/my-wallet').catch(() => ({ data: { balance: 0 } })),
        axios.get('/wallet/transactions').catch(() => ({ data: [] }))
      ]);

      if (results[0].status === 'fulfilled') {
        setProfile(results[0].value.data || profile);
        if (results[0].value.data?.logo) {
          setUser(prev => prev ? { ...prev, logo: results[0].value.data.logo, name: results[0].value.data.businessName } : prev);
        }
      }
      if (results[1].status === 'fulfilled') setCampaigns(results[1].value.data);
      if (results[2].status === 'fulfilled') {
        const cData = results[2].value.data;
        setAllCreators(Array.isArray(cData) ? cData : (cData?.data || []));
      }
      if (results[3].status === 'fulfilled') {
        setDeals(results[3].value.data || []);
      }
      if (results[4].status === 'fulfilled' && results[4].value?.data) {
        const unreads = results[4].value.data.filter(n => !n.read);
        setHasUnread(unreads.length > 0);
        setUnreadCount(unreads.length);
      }
      if (results[5].status === 'fulfilled' && results[5].value?.data) {
        setWishlistCount(results[5].value.data.count);
      }
      if (results[6].status === 'fulfilled') {
        setWallet(results[6].value.data);
      }
      if (results[7].status === 'fulfilled') {
        setTransactions(results[7].value.data || []);
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

  const isProfileIncomplete = user && (
    !profile.businessName || profile.businessName.startsWith('Brand-') || !profile.logo
  );

  useEffect(() => {
    if (!user) return;

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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/brands/profile', profile);
      setProfile(res.data);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile.', 'error');
    }
  };

  const handlePostCampaign = async (e) => {
    e.preventDefault();
    if (user?.kycStatus !== 'APPROVED') {
      setKycModalMessage("Identity verification is required before creating campaigns. Complete KYC to continue.");
      setKycModalOpen(true);
      return;
    }
    try {
      const formatted = {
        ...newCampaign,
        description: newCampaign.description 
          ? `${newCampaign.description}\n\nPreferred Location: ${newCampaign.location}`
          : `Preferred Location: ${newCampaign.location}`,
        requirements: newCampaign.requirements.split(',').map(r => r.trim())
      };
      await axios.post('/campaigns', formatted);
      const res = await axios.get('/campaigns/mine');
      setCampaigns(res.data);
      setNewCampaign({ title: '', description: '', budget: '', requirements: '', niche: 'Tech', location: '' });
      showToast('Campaign launched successfully!', 'success');
      handleTabChange('campaigns');
    } catch (err) {
      showToast('Error posting campaign.', 'error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  );

  // --- REAL-TIME DASHBOARD CALCULATIONS ---
  const totalBudgetSpent = deals.filter(d => d.paymentDetails?.status === 'released').reduce((acc, d) => acc + (d.budget || 0), 0);
  const milestoneCoins = deals.filter(d => d.paymentDetails?.status === 'funds_secured_held').reduce((acc, d) => acc + (d.budget || 0), 0);

  // Dynamic Chart Data from real Brand database records
  const generateBrandChartData = () => {
    const events = [];

    deals.forEach(d => {
      const amount = d.budget || d.paymentAmount || 0;
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

  const chartData = generateBrandChartData();
  const maxEarnings = Math.max(...chartData.map(d => d.earnings)) || 1;

  const activeDeals = deals.filter(d => ['in_progress', 'in_review', 'revision_requested'].includes(d.status));
  const pendingReviewDeals = deals.filter(d => d.status === 'in_review');
  const completedDeals = deals.filter(d => d.status === 'completed');
  const deliverableCounts = { review: pendingReviewDeals.length, drafts: deals.filter(d => d.status === 'in_progress').length, revisions: deals.filter(d => d.status === 'revision_requested').length, approved: completedDeals.length, total: deals.length || 1 };
  const totalDealsChart = deliverableCounts.total;

  const sidebarItems = [
    { id: 'overview', label: 'Profile Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'browse', label: 'Browse Creators', icon: <Search size={20} /> },
    { id: 'campaigns', label: 'Our Campaigns', icon: <Briefcase size={20} /> },
    { id: 'deals', label: 'Active Deals', icon: <CircleDollarSign size={20} /> },
    { id: 'wallet', label: 'Financial Wallet', icon: <Wallet size={20} /> },
    { id: 'create', label: 'Create New Campaign', icon: <Plus size={20} /> },
    { id: 'edit', label: 'Edit Profile', icon: <Save size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-gray-900 font-sans overflow-x-hidden relative">
      {/* Global Decorative Backgrounds */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-100/40 via-purple-100/40 to-pink-100/40 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-orange-100/40 to-rose-100/40 rounded-full blur-[100px] translate-y-1/4 translate-x-1/4 pointer-events-none z-0"></div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 z-50">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2.5 mb-8 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20">K</div>
            <span className="font-black text-[22px] tracking-tight lowercase">kino</span>
          </Link>

          <nav className="flex flex-col gap-2">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === item.id ? 'bg-[#4F46E5] text-white shadow-md shadow-[#4F46E5]/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <img src={profile?.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.businessName || 'Brand'}`} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-gray-900 truncate">{profile?.businessName || 'Brand Console'}</span>
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
            {wishlistCount > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-[#eb4898] text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">{wishlistCount}</span>}
          </Link>
          <Link to="/notifications" className="relative p-2 text-gray-500 hover:text-[#4f46e5] hover:bg-gray-50 rounded-xl transition-all">
            <Bell size={20} className={hasUnread ? "animate-pulse text-[#4f46e5]" : ""} />
            {hasUnread && <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">{unreadCount}</span>}
          </Link>
          <div className="relative">
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-9 h-9 rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:border-gray-300 transition-all flex-shrink-0 active:scale-95 flex items-center justify-center focus:outline-none">
              {profile?.logo ? <img src={profile.logo} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{profile?.businessName?.substring(0, 2).toUpperCase() || 'BR'}</div>}
            </button>
            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileOpen(false)} />
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 w-[220px] bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 text-left">
                    <div className="px-4 py-3.5 border-b border-gray-100/60 bg-gray-50/30">
                      <p className="text-[14px] font-bold text-gray-900 tracking-tight truncate">{profile?.businessName || 'Brand Console'}</p>
                      <p className="text-[11px] font-bold text-gray-400 truncate tracking-wide">{user?.email}</p>
                    </div>
                    <div className="p-1 flex flex-col gap-0.5">
                      <button onClick={() => { handleTabChange('overview'); setIsProfileOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-[13px] font-bold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Home size={14} /> Dashboard</button>
                      <button onClick={() => { handleTabChange('edit'); setIsProfileOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-[13px] font-bold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><User size={14} /> Edit Profile</button>
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

      {/* MAIN CONTENT AREA */}
      <main className="w-full flex-1 md:pl-64 pt-[68px] md:pt-0 pb-24 md:pb-8 px-4 md:px-8 relative z-10 flex flex-col">
        <div className="w-full max-w-[1200px] mx-auto md:mt-8">

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
          {activeTab === 'overview' && <BrandOverview profile={profile} user={user} deals={deals} campaigns={campaigns} activeTab={activeTab} setActiveTab={handleTabChange} chartTab={chartTab} setChartTab={setChartTab} chartData={chartData} maxEarnings={maxEarnings} hoveredBar={hoveredBar} setHoveredBar={setHoveredBar} currentMonth={currentMonth} now={now} totalBudgetSpent={totalBudgetSpent} milestoneCoins={milestoneCoins} activeDeals={activeDeals} deliverableCounts={deliverableCounts} totalDealsChart={totalDealsChart} transactions={transactions} />}
          {activeTab === 'browse' && <BrandBrowseCreators allCreators={allCreators} browseFilter={browseFilter} setBrowseFilter={setBrowseFilter} browseSearch={browseSearch} setBrowseSearch={setBrowseSearch} />}
          {activeTab === 'campaigns' && <BrandCampaigns campaigns={campaigns} campaignFilter={campaignFilter} setCampaignFilter={setCampaignFilter} campaignSearch={campaignSearch} setCampaignSearch={setCampaignSearch} setActiveTab={handleTabChange} deals={deals} />}
          {activeTab === 'deals' && <BrandDeals profile={profile} user={user} deals={deals} dealFilter={dealFilter} setDealFilter={setDealFilter} dealPage={dealPage} setDealPage={setDealPage} setActiveChatDeal={setActiveChatDeal} onUpdateDeal={fetchData} showToast={showToast} />}
          {activeTab === 'wallet' && <BrandWallet profile={profile} deals={deals} totalBudgetSpent={totalBudgetSpent} milestoneCoins={milestoneCoins} wallet={wallet} transactions={transactions} onUpdateWallet={fetchData} showToast={showToast} />}
          {activeTab === 'edit' && <BrandProfileEdit profile={profile} setProfile={setProfile} handleProfileUpdate={handleProfileUpdate} />}
          {activeTab === 'create' && <BrandCreateCampaign newCampaign={newCampaign} setNewCampaign={setNewCampaign} handlePostCampaign={handlePostCampaign} createStep={createStep} setCreateStep={setCreateStep} setActiveTab={handleTabChange} />}
        </div>

        {/* Chat Overlay for Deal messages */}
        {activeChatDeal && (
          <ChatOverlay deal={activeChatDeal} currentUser={user} onClose={() => setActiveChatDeal(null)} />
        )}
      </main>

      {/* Bottom Navigation for Mobile */}
      <BrandBottomNav activeTab={activeTab} setActiveTab={handleTabChange} />
    </div>
  );
};

export default BrandDashboard;
