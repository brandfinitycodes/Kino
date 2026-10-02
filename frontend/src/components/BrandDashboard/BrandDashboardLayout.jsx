import React, { useState, useEffect, useRef } from 'react';
import BrandOverview from './BrandOverview';
import BrandBrowseCreators from './BrandBrowseCreators';
import BrandCampaigns from './BrandCampaigns';
import BrandDeals from './BrandDeals';
import BrandCreateCampaign from './BrandCreateCampaign';
import BrandProfileEdit from './BrandProfileEdit';
import BrandWallet from './BrandWallet';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Building, Lock, ChevronDown, Bell, CheckCircle, Search, Edit3, 
  MapPin, Plus, TrendingUp, Clock, Calendar, Check, ExternalLink, 
  ArrowRight, Heart, Share2, MessageSquare, Briefcase, FileText, Download, Quote, UserPlus, Star, LayoutDashboard, Wallet, DollarSign, UploadCloud, Flag, X, AlertCircle, Megaphone, Info, CircleDollarSign, Save,
  Users, Target, ArrowUpRight, Camera, MoreHorizontal, Activity, Eye, Play, Home, User, LogOut, SlidersHorizontal, ShieldCheck, Rocket
} from 'lucide-react';
import CampaignCard from '../components/CampaignCard';
import DealManager from '../components/DealManager';
import WalletOverview from '../components/WalletOverview';
import BrandBottomNav from './BrandBottomNav';
import ChatOverlay from './ChatOverlay';

export const ScrollAnimatedBrandAvatar = ({ profile, logoUrl }) => {
  const { scrollY } = useScroll();
  const yOffset = useTransform(scrollY, [0, 150], [0, -100]);
  const xOffset = useTransform(scrollY, [0, 150], [0, 120]);
  const scale = useTransform(scrollY, [0, 150], [1, 0.4]);
  const opacity = useTransform(scrollY, [120, 150], [1, 0]);

  return (
    <div className="relative mb-4 h-[76px] w-[76px] mx-auto z-50">
      <motion.div
        style={{ y: yOffset, x: xOffset, scale, opacity, transformOrigin: "center" }}
        className="fixed md:absolute top-auto left-auto w-[76px] h-[76px] rounded-full border-[2.5px] border-[#eb4898] flex items-center justify-center bg-white shadow-[0_10px_40px_rgba(235,72,152,0.4)] overflow-hidden"
      >
        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
      </motion.div>
    </div>
  );
};

const Odometer = ({ value, duration = 1200, prefix = "", suffix = "" }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const end = typeof value === 'number' ? value : parseFloat(value) || 0;
    if (end === 0) {
      setCurrent(0);
      return;
    }

    const hasDecimal = end % 1 !== 0;
    const decimalPlaces = hasDecimal ? String(end).split('.')[1]?.length || 0 : 0;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      const easeOutQuad = progress * (2 - progress);
      const nextValue = parseFloat((easeOutQuad * end).toFixed(decimalPlaces));

      setCurrent(nextValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrent(end);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const hasDecimal = current % 1 !== 0;
  const decimalPlaces = hasDecimal ? String(current).split('.')[1]?.length || 0 : 0;

  return (
    <span>
      {prefix}
      {current.toLocaleString(undefined, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      })}
      {suffix}
    </span>
  );
};

const MobileBrandDashboard = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryTab = new URLSearchParams(location.search).get('tab');
  const activeTab = queryTab || 'overview';
  const setActiveTab = (tabId) => {
    navigate(`/brand-dashboard?tab=${tabId}`);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTab]);
  const [profile, setProfile] = useState({
    businessName: '', website: '', description: '',
    ownerName: '', location: '', businessType: 'Online', industry: '', operatingFrom: '',
    preferences: { targetGender: 'Both', targetAgeGroup: 'Any', targetLocality: 'Anywhere', brandPriority: 'Reach' }
  });
  const [campaigns, setCampaigns] = useState([]);
  const [deals, setDeals] = useState([]);
  const [allCreators, setAllCreators] = useState([]);
  const [newCampaign, setNewCampaign] = useState({ title: '', description: '', budget: '', requirements: '', niche: 'Tech' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filterType, setFilterType] = useState('action_required'); // Default to action required
  const [createStep, setCreateStep] = useState(1);
  const [selectedCreatorForModal, setSelectedCreatorForModal] = useState(null);
  const [activeChatDeal, setActiveChatDeal] = useState(null);

  // Mobile layout badge states
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Dashboard UI States
  const [chartTab, setChartTab] = useState('MONTHLY');
  const [dealPage, setDealPage] = useState(1);
  const [hoveredBar, setHoveredBar] = useState(null);

  // UI Filter States
  const [browseFilter, setBrowseFilter] = useState('All');
  const [browseSearch, setBrowseSearch] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('All');
  const [campaignSearch, setCampaignSearch] = useState('');
  const [dealFilter, setDealFilter] = useState('All History');

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([
        axios.get('/brands/me'),
        axios.get('/campaigns/mine'),
        axios.get('/creators'),
        axios.get('/deals/user'),
        axios.get('/notifications').catch(() => ({ data: [] })),
        axios.get('/wishlists/count').catch(() => ({ data: { count: 0 } }))
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
        const fetchedDeals = results[3].value.data;
        setDeals(fetchedDeals || []);
      }
      if (results[4].status === 'fulfilled' && results[4].value?.data) {
        const unreads = results[4].value.data.filter(n => !n.read);
        setHasUnread(unreads.length > 0);
        setUnreadCount(unreads.length);
      }
      if (results[5].status === 'fulfilled' && results[5].value?.data) {
        setWishlistCount(results[5].value.data.count);
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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/brands/profile', profile);
      setProfile(res.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    }
  };

  const handlePostCampaign = async (e) => {
    e.preventDefault();
    try {
      const formatted = {
        ...newCampaign,
        requirements: newCampaign.requirements.split(',').map(r => r.trim())
      };
      await axios.post('/campaigns', formatted);
      const res = await axios.get('/campaigns/mine');
      setCampaigns(res.data);
      setNewCampaign({ title: '', description: '', budget: '', requirements: '', niche: 'Tech' });
      setMessage({ type: 'success', text: 'Campaign launched successfully!' });
      setActiveTab('campaigns');
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error posting campaign.' });
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Profile Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'browse', label: 'Browse Creators', icon: <Search size={20} /> },
    { id: 'campaigns', label: 'Our Campaigns', icon: <Briefcase size={20} /> },
    { id: 'deals', label: 'Active Deals', icon: <CircleDollarSign size={20} /> },
    { id: 'wallet', label: 'Financial Wallet', icon: <Wallet size={20} /> },
    { id: 'create', label: 'Create New Campaign', icon: <Plus size={20} /> },
    { id: 'edit', label: 'Edit Profile', icon: <Save size={20} /> },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  );

  // --- REAL-TIME DASHBOARD CALCULATIONS ---
  // Financial Metrics
  const totalBudgetSpent = deals.filter(d => d.paymentDetails?.status === 'released').reduce((acc, d) => acc + (d.budget || 0), 0);

  // Dynamic chart data matching CreatorDashboard style based on chartTab
  let chartLabels = [];
  let chartDist = [];
  switch (chartTab) {
    case 'DAILY':
      chartLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      chartDist = [0.1, 0.15, 0.1, 0.2, 0.15, 0.25, 0.05];
      break;
    case 'WEEKLY':
      chartLabels = ['WK 1', 'WK 2', 'WK 3', 'WK 4'];
      chartDist = [0.2, 0.3, 0.15, 0.35];
      break;
    case 'YEARLY':
      chartLabels = ['2020', '2021', '2022', '2023', '2024'];
      chartDist = [0.1, 0.15, 0.2, 0.25, 0.3];
      break;
    case 'MONTHLY':
    default:
      chartLabels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      chartDist = [0.04, 0.08, 0.06, 0.03, 0.07, 0.15, 0.10, 0.05, 0.12, 0.08, 0.04, 0.18];
      break;
  }

  const chartData = chartLabels.map((name, i) => ({
    name,
    earnings: totalBudgetSpent === 0 ? 0 : Math.round((totalBudgetSpent || 25000) * chartDist[i])
  }));
  const maxEarnings = Math.max(...chartData.map(d => d.earnings)) || 1;

  const milestoneCoins = deals.filter(d => d.paymentDetails?.status === 'funds_secured_held').reduce((acc, d) => acc + (d.budget || 0), 0);
  const pendingPayouts = deals.filter(d => ['in_review', 'revision_requested', 'completed'].includes(d.status) && d.paymentDetails?.status === 'funds_secured_held').reduce((acc, d) => acc + (d.budget || 0), 0);

  // Pipeline & Deliverables
  const activeDeals = deals.filter(d => ['in_progress', 'in_review', 'revision_requested'].includes(d.status));
  const pendingReviewDeals = deals.filter(d => d.status === 'in_review');
  const completedDeals = deals.filter(d => d.status === 'completed');
  const totalContentPieces = deals.length;

  // Deliverables Status Counts
  const deliverableCounts = {
    review: pendingReviewDeals.length,
    drafts: deals.filter(d => d.status === 'in_progress').length,
    revisions: deals.filter(d => d.status === 'revision_requested').length,
    approved: completedDeals.length,
    total: deals.length || 1 // Avoid div by 0
  };

  // Unique Active Creators
  const uniqueCreatorIds = new Set();
  const activeCreators = [];
  activeDeals.forEach(d => {
    if (d.creatorId && d.creatorId._id && !uniqueCreatorIds.has(d.creatorId._id.toString())) {
      uniqueCreatorIds.add(d.creatorId._id.toString());
      activeCreators.push(d.creatorId);
    }
  });

  // Recent Transactions
  const recentTransactions = [...deals].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3);

  // Real-time Dates
  const now = new Date();
  const currentMonthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(now);
  const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(now);

  // Calculate stroke array for donut chart based on statuses
  const totalDealsChart = deliverableCounts.total;
  const reviewPct = (deliverableCounts.review / totalDealsChart) * 251.2;
  const draftPct = (deliverableCounts.drafts / totalDealsChart) * 251.2;
  const revisionPct = (deliverableCounts.revisions / totalDealsChart) * 251.2;
  const approvedPct = (deliverableCounts.approved / totalDealsChart) * 251.2;

  // New Data for ROW 3
  const pendingEscrowDeals = deals.filter(d => d.paymentDetails?.status === 'funds_secured_held');

  const campaignHealth = campaigns.map(camp => {
    const campDeals = deals.filter(d => (d.campaignId?._id || d.campaignId) === camp._id);
    const spent = campDeals.reduce((sum, d) => sum + (d.budget || 0), 0);
    const budget = camp.budget || 1;
    const utilPct = Math.min((spent / budget) * 100, 100);
    return { ...camp, spent, utilPct, activeCreatorsCount: campDeals.length };
  }).slice(0, 5);

  const liveActivity = [...deals].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5).map(d => {
    let title = "Update"; let desc = ""; let color = "bg-gray-500"; let icon = <Activity size={12} />;
    if (d.status === 'completed') { title = "Deal Completed"; desc = `${d.creatorId?.userId?.name || 'Creator'} finished ${d.campaignId?.title || 'deal'}`; color = "bg-emerald-500"; icon = <CheckCircle size={12} />; }
    else if (d.status === 'in_review') { title = "Draft Submitted"; desc = `${d.creatorId?.userId?.name || 'Creator'} submitted content`; color = "bg-purple-500"; icon = <Eye size={12} />; }
    else if (d.paymentDetails?.status === 'funds_secured_held') { title = "Milestone Coins"; desc = `Coins allocated for ${d.creatorId?.userId?.name || 'Creator'}`; color = "bg-[#EA580C]"; icon = <Lock size={12} />; }
    else { title = "Deal Updated"; desc = `${d.creatorId?.userId?.name || 'Creator'} deal updated`; color = "bg-[#EA580C]"; icon = <Briefcase size={12} />; }
    return { title, desc, color, icon, time: "Recently" };
  });

  const brandLogoUrl = profile.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.businessName || 'Brand'}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans overflow-x-hidden relative">
      {/* Global Decorative Backgrounds */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-100/40 via-purple-100/40 to-pink-100/40 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-orange-100/40 to-rose-100/40 rounded-full blur-[100px] translate-y-1/4 translate-x-1/4 pointer-events-none z-0"></div>

      {/* Mobile Top Header */}
      <header className="fixed top-0 left-0 right-0 w-full bg-white/95 backdrop-blur-xl z-40 border-b border-gray-100 flex items-center justify-between px-4 py-3.5 shadow-sm max-w-[500px] mx-auto">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
            <span className="text-white font-sans font-black text-xl tracking-tighter">K</span>
          </div>
          <span className="font-sans font-black text-[18px] text-gray-900 tracking-tight lowercase">kino</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/wishlist" className="relative p-2 text-gray-500 hover:text-pink-500 hover:bg-gray-50 rounded-xl transition-all">
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-[#eb4898] text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link to="/notifications" className="relative p-2 text-gray-500 hover:text-[#4f46e5] hover:bg-gray-50 rounded-xl transition-all">
            <Bell size={20} className={hasUnread ? "animate-pulse text-[#4f46e5]" : ""} />
            {hasUnread && (
              <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">
                {unreadCount}
              </span>
            )}
          </Link>
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:border-gray-300 transition-all flex-shrink-0 active:scale-95 flex items-center justify-center focus:outline-none"
            >
              {profile?.logo ? (
                <img src={profile.logo} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                  {profile?.businessName?.substring(0, 2).toUpperCase() || 'BR'}
                </div>
              )}
            </button>
            
            <AnimatePresence>
              {isProfileOpen && (
                <>
                  {/* Backdrop to close dropdown on click outside */}
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setIsProfileOpen(false)}
                  />
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 10, scale: 0.98 }} 
                    transition={{ duration: 0.15 }} 
                    className="absolute right-0 top-full mt-2 w-[220px] bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 text-left"
                  >
                    <div className="px-4 py-3.5 border-b border-gray-100/60 bg-gray-50/30">
                      <p className="text-[14px] font-bold text-gray-900 tracking-tight truncate">{profile?.businessName || 'Brand Console'}</p>
                      <p className="text-[11px] font-bold text-gray-400 truncate tracking-wide">{user?.email}</p>
                    </div>
                    <div className="p-1 flex flex-col gap-0.5">
                      <button 
                        onClick={() => { setActiveTab('overview'); setIsProfileOpen(false); }} 
                        className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-[13px] font-bold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <Home size={14} /> Dashboard
                      </button>
                      <button 
                        onClick={() => { setActiveTab('edit'); setIsProfileOpen(false); }} 
                        className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-[13px] font-bold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <User size={14} /> Edit Profile
                      </button>
                      <div className="h-px bg-gray-100/80 my-1 mx-2"></div>
                      <button 
                        onClick={() => { handleLogout(); setIsProfileOpen(false); }} 
                        className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-[13px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border-none"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[500px] mx-auto min-h-[calc(100vh-140px)] pt-[68px] pb-24 px-4 relative z-10 flex flex-col">
        <div className="w-full flex flex-col gap-6">
          <AnimatePresence>
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border ${message.type === 'success' ? 'bg-gray-900 text-white border-gray-800' : 'bg-red-500 text-white border-red-600'}`}
              >
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

          {/* VIEWS */}
          {activeTab === 'overview' && (
            <BrandOverview 
              profile={profile} setProfile={setProfile} user={user} deals={deals} campaigns={campaigns} 
              allCreators={allCreators} activeTab={activeTab} setActiveTab={setActiveTab} showToast={showToast}
              chartTab={chartTab} setChartTab={setChartTab} chartData={chartData} maxEarnings={maxEarnings} 
              hoveredBar={hoveredBar} setHoveredBar={setHoveredBar} currentMonth={currentMonth} now={now}
              totalBudgetSpent={totalBudgetSpent} milestoneCoins={milestoneCoins} activeDeals={activeDeals} 
              deliverableCounts={deliverableCounts} totalDealsChart={totalDealsChart}
              browseFilter={browseFilter} setBrowseFilter={setBrowseFilter} browseSearch={browseSearch} 
              setBrowseSearch={setBrowseSearch} handlePostCampaign={handlePostCampaign}
              newCampaign={newCampaign} setNewCampaign={setNewCampaign} createStep={createStep} setCreateStep={setCreateStep}
              handleProfileUpdate={handleProfileUpdate} campaignFilter={campaignFilter} setCampaignFilter={setCampaignFilter}
              campaignSearch={campaignSearch} setCampaignSearch={setCampaignSearch} dealFilter={dealFilter} 
              setDealFilter={setDealFilter} dealPage={dealPage} setDealPage={setDealPage}
              setActiveChatDeal={setActiveChatDeal} activeChatDeal={activeChatDeal} message={message}
            />
          )}

          {activeTab === 'browse' && (
            <BrandBrowseCreators 
              profile={profile} setProfile={setProfile} user={user} deals={deals} campaigns={campaigns} 
              allCreators={allCreators} activeTab={activeTab} setActiveTab={setActiveTab} showToast={showToast}
              chartTab={chartTab} setChartTab={setChartTab} chartData={chartData} maxEarnings={maxEarnings} 
              hoveredBar={hoveredBar} setHoveredBar={setHoveredBar} currentMonth={currentMonth} now={now}
              totalBudgetSpent={totalBudgetSpent} milestoneCoins={milestoneCoins} activeDeals={activeDeals} 
              deliverableCounts={deliverableCounts} totalDealsChart={totalDealsChart}
              browseFilter={browseFilter} setBrowseFilter={setBrowseFilter} browseSearch={browseSearch} 
              setBrowseSearch={setBrowseSearch} handlePostCampaign={handlePostCampaign}
              newCampaign={newCampaign} setNewCampaign={setNewCampaign} createStep={createStep} setCreateStep={setCreateStep}
              handleProfileUpdate={handleProfileUpdate} campaignFilter={campaignFilter} setCampaignFilter={setCampaignFilter}
              campaignSearch={campaignSearch} setCampaignSearch={setCampaignSearch} dealFilter={dealFilter} 
              setDealFilter={setDealFilter} dealPage={dealPage} setDealPage={setDealPage}
              setActiveChatDeal={setActiveChatDeal} activeChatDeal={activeChatDeal} message={message}
            />
          )}

          {activeTab === 'campaigns' && (
            <BrandCampaigns 
              profile={profile} setProfile={setProfile} user={user} deals={deals} campaigns={campaigns} 
              allCreators={allCreators} activeTab={activeTab} setActiveTab={setActiveTab} showToast={showToast}
              chartTab={chartTab} setChartTab={setChartTab} chartData={chartData} maxEarnings={maxEarnings} 
              hoveredBar={hoveredBar} setHoveredBar={setHoveredBar} currentMonth={currentMonth} now={now}
              totalBudgetSpent={totalBudgetSpent} milestoneCoins={milestoneCoins} activeDeals={activeDeals} 
              deliverableCounts={deliverableCounts} totalDealsChart={totalDealsChart}
              browseFilter={browseFilter} setBrowseFilter={setBrowseFilter} browseSearch={browseSearch} 
              setBrowseSearch={setBrowseSearch} handlePostCampaign={handlePostCampaign}
              newCampaign={newCampaign} setNewCampaign={setNewCampaign} createStep={createStep} setCreateStep={setCreateStep}
              handleProfileUpdate={handleProfileUpdate} campaignFilter={campaignFilter} setCampaignFilter={setCampaignFilter}
              campaignSearch={campaignSearch} setCampaignSearch={setCampaignSearch} dealFilter={dealFilter} 
              setDealFilter={setDealFilter} dealPage={dealPage} setDealPage={setDealPage}
              setActiveChatDeal={setActiveChatDeal} activeChatDeal={activeChatDeal} message={message}
            />
          )}

          {activeTab === 'deals' && (
            <BrandDeals 
              profile={profile} setProfile={setProfile} user={user} deals={deals} campaigns={campaigns} 
              allCreators={allCreators} activeTab={activeTab} setActiveTab={setActiveTab} showToast={showToast}
              chartTab={chartTab} setChartTab={setChartTab} chartData={chartData} maxEarnings={maxEarnings} 
              hoveredBar={hoveredBar} setHoveredBar={setHoveredBar} currentMonth={currentMonth} now={now}
              totalBudgetSpent={totalBudgetSpent} milestoneCoins={milestoneCoins} activeDeals={activeDeals} 
              deliverableCounts={deliverableCounts} totalDealsChart={totalDealsChart}
              browseFilter={browseFilter} setBrowseFilter={setBrowseFilter} browseSearch={browseSearch} 
              setBrowseSearch={setBrowseSearch} handlePostCampaign={handlePostCampaign}
              newCampaign={newCampaign} setNewCampaign={setNewCampaign} createStep={createStep} setCreateStep={setCreateStep}
              handleProfileUpdate={handleProfileUpdate} campaignFilter={campaignFilter} setCampaignFilter={setCampaignFilter}
              campaignSearch={campaignSearch} setCampaignSearch={setCampaignSearch} dealFilter={dealFilter} 
              setDealFilter={setDealFilter} dealPage={dealPage} setDealPage={setDealPage}
              setActiveChatDeal={setActiveChatDeal} activeChatDeal={activeChatDeal} message={message}
            />
          )}

          {activeTab === 'create' && (
            <BrandCreateCampaign 
              profile={profile} setProfile={setProfile} user={user} deals={deals} campaigns={campaigns} 
              allCreators={allCreators} activeTab={activeTab} setActiveTab={setActiveTab} showToast={showToast}
              chartTab={chartTab} setChartTab={setChartTab} chartData={chartData} maxEarnings={maxEarnings} 
              hoveredBar={hoveredBar} setHoveredBar={setHoveredBar} currentMonth={currentMonth} now={now}
              totalBudgetSpent={totalBudgetSpent} milestoneCoins={milestoneCoins} activeDeals={activeDeals} 
              deliverableCounts={deliverableCounts} totalDealsChart={totalDealsChart}
              browseFilter={browseFilter} setBrowseFilter={setBrowseFilter} browseSearch={browseSearch} 
              setBrowseSearch={setBrowseSearch} handlePostCampaign={handlePostCampaign}
              newCampaign={newCampaign} setNewCampaign={setNewCampaign} createStep={createStep} setCreateStep={setCreateStep}
              handleProfileUpdate={handleProfileUpdate} campaignFilter={campaignFilter} setCampaignFilter={setCampaignFilter}
              campaignSearch={campaignSearch} setCampaignSearch={setCampaignSearch} dealFilter={dealFilter} 
              setDealFilter={setDealFilter} dealPage={dealPage} setDealPage={setDealPage}
              setActiveChatDeal={setActiveChatDeal} activeChatDeal={activeChatDeal} message={message}
            />
          )}

          {activeTab === 'edit' && (
            <BrandProfileEdit 
              profile={profile} setProfile={setProfile} user={user} deals={deals} campaigns={campaigns} 
              allCreators={allCreators} activeTab={activeTab} setActiveTab={setActiveTab} showToast={showToast}
              chartTab={chartTab} setChartTab={setChartTab} chartData={chartData} maxEarnings={maxEarnings} 
              hoveredBar={hoveredBar} setHoveredBar={setHoveredBar} currentMonth={currentMonth} now={now}
              totalBudgetSpent={totalBudgetSpent} milestoneCoins={milestoneCoins} activeDeals={activeDeals} 
              deliverableCounts={deliverableCounts} totalDealsChart={totalDealsChart}
              browseFilter={browseFilter} setBrowseFilter={setBrowseFilter} browseSearch={browseSearch} 
              setBrowseSearch={setBrowseSearch} handlePostCampaign={handlePostCampaign}
              newCampaign={newCampaign} setNewCampaign={setNewCampaign} createStep={createStep} setCreateStep={setCreateStep}
              handleProfileUpdate={handleProfileUpdate} campaignFilter={campaignFilter} setCampaignFilter={setCampaignFilter}
              campaignSearch={campaignSearch} setCampaignSearch={setCampaignSearch} dealFilter={dealFilter} 
              setDealFilter={setDealFilter} dealPage={dealPage} setDealPage={setDealPage}
              setActiveChatDeal={setActiveChatDeal} activeChatDeal={activeChatDeal} message={message}
            />
          )}

          {activeTab === 'wallet' && (
            <BrandWallet 
              profile={profile} setProfile={setProfile} user={user} deals={deals} campaigns={campaigns} 
              allCreators={allCreators} activeTab={activeTab} setActiveTab={setActiveTab} showToast={showToast}
              chartTab={chartTab} setChartTab={setChartTab} chartData={chartData} maxEarnings={maxEarnings} 
              hoveredBar={hoveredBar} setHoveredBar={setHoveredBar} currentMonth={currentMonth} now={now}
              totalBudgetSpent={totalBudgetSpent} milestoneCoins={milestoneCoins} activeDeals={activeDeals} 
              deliverableCounts={deliverableCounts} totalDealsChart={totalDealsChart}
              browseFilter={browseFilter} setBrowseFilter={setBrowseFilter} browseSearch={browseSearch} 
              setBrowseSearch={setBrowseSearch} handlePostCampaign={handlePostCampaign}
              newCampaign={newCampaign} setNewCampaign={setNewCampaign} createStep={createStep} setCreateStep={setCreateStep}
              handleProfileUpdate={handleProfileUpdate} campaignFilter={campaignFilter} setCampaignFilter={setCampaignFilter}
              campaignSearch={campaignSearch} setCampaignSearch={setCampaignSearch} dealFilter={dealFilter} 
              setDealFilter={setDealFilter} dealPage={dealPage} setDealPage={setDealPage}
              setActiveChatDeal={setActiveChatDeal} activeChatDeal={activeChatDeal} message={message}
            />
          )}
        </div>

        {/* Chat Overlay for Deal messages */}
        {activeChatDeal && (
          <ChatOverlay 
            deal={activeChatDeal} 
            currentUser={user} 
            onClose={() => setActiveChatDeal(null)} 
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BrandBottomNav activeTab={activeTab} />
    </div>
  );
};

export default MobileBrandDashboard;
