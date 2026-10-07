import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LogIn, UserPlus, Bell, Compass, Users, User, Menu, X, ChevronDown, Heart, Search, Command, Plus, ShieldCheck, Sparkles, Briefcase, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../utils/axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasUnread, setHasUnread] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [adminStats, setAdminStats] = useState(null);

  const adminRoles = ['superadmin', 'admin', 'moderator', 'support'];
  const isAdminRole = user && adminRoles.includes(user.role);
  const dashboardPath = user ? (isAdminRole ? '/admin-dashboard' : (user.role === 'creator' ? '/creator-dashboard' : '/brand-dashboard')) : '/';
  const logoPath = isAdminRole ? '/admin-dashboard' : '/';
  const isDashboardRoute = location.pathname.includes('-dashboard');

  useEffect(() => {
    if (user) {
      const checkNotifications = async () => {
        try {
          const res = await axios.get('/notifications');
          const unreads = res.data.filter(n => !n.read);
          setHasUnread(unreads.length > 0);
          setUnreadCount(unreads.length);
        } catch (err) {
          console.error(err);
        }
      };

      const checkWishlistCount = async () => {
        try {
          if (user.role !== 'admin') {
            const res = await axios.get('/wishlists/count');
            setWishlistCount(res.data.count);
          }
        } catch (err) {
          console.error(err);
        }
      };

      const checkAdminStats = async () => {
        try {
          if (user.role === 'admin') {
            const res = await axios.get('/admin/stats');
            setAdminStats(res.data);
          }
        } catch (err) {
          console.error(err);
        }
      };

      checkNotifications();
      checkWishlistCount();
      checkAdminStats();

      const interval = setInterval(() => {
        checkNotifications();
        checkWishlistCount();
        checkAdminStats();
      }, 30000); // Poll every 30s for live admin badges

      const handleWishlistUpdated = () => checkWishlistCount();
      window.addEventListener('wishlist-updated', handleWishlistUpdated);

      return () => {
        clearInterval(interval);
        window.removeEventListener('wishlist-updated', handleWishlistUpdated);
      };
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`sticky top-0 z-[100] w-full h-20 bg-white/85 backdrop-blur-xl border-b border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex items-center justify-between px-6 md:px-10 transition-all ${isDashboardRoute ? 'hidden md:flex' : ''}`}>
      {/* Mobile Hamburger Menu (left-most on mobile) */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="sm:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors mr-1 shrink-0"
      >
        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Brand Logo */}
      <div className="flex-1 flex items-center justify-start gap-3 sm:gap-4 shrink-0">
        <Link to={logoPath} className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center transition-transform group-hover:scale-105 shadow-md shadow-orange-500/20 shrink-0">
            <span className="text-white font-sans font-black text-xl sm:text-2xl tracking-tighter">K</span>
          </div>
          <span className="text-[22px] sm:text-[24px] font-display font-black text-gray-900 tracking-tight lowercase">
            kino
          </span>
        </Link>
        {user && isAdminRole && (
          <div className="flex items-center gap-2 select-none">
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-red-500 text-white rounded-full shadow-sm">
              Admin
            </span>
            <span className="hidden md:flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Online</span>
            </span>
          </div>
        )}
      </div>

      {/* Center Links */}
      {(!user || (!isAdminRole && user.role !== 'creator' && user.role !== 'brand')) && (
        <div className="hidden sm:flex flex-1 items-center justify-center gap-8">
          <Link to="/campaigns" className="text-[14px] font-bold text-gray-500 hover:text-gray-900 transition-colors">
            Campaigns
          </Link>
          <div className="relative" onMouseEnter={() => setActiveMenu('creators')} onMouseLeave={() => setActiveMenu(null)}>
            <Link to="/creators" className={`text-[14px] font-bold flex items-center gap-1 transition-colors ${location.pathname === '/creators' || activeMenu === 'creators' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
              Creators <ChevronDown size={14} className={`transition-transform duration-300 ${activeMenu === 'creators' ? 'rotate-180 text-gray-900' : 'text-gray-400'}`} />
            </Link>
            <AnimatePresence>
              {activeMenu === 'creators' && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.15 }} className="absolute top-[calc(100%+16px)] left-1/2 -translate-x-1/2 w-[340px] bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden p-2">
                  <Link to="/creators" onClick={() => setActiveMenu(null)} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"><Users size={20} className="text-indigo-600" /></div>
                    <div><h5 className="text-gray-900 font-bold text-[14px] mb-0.5 tracking-tight">Creator Directory</h5><p className="text-gray-500 text-[12px] font-medium leading-tight">Find top talent for your campaign.</p></div>
                  </Link>
                  <div className="h-px bg-gray-100 my-1 mx-2"></div>
                  <Link to="/register" onClick={() => setActiveMenu(null)} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"><UserPlus size={20} className="text-emerald-600" /></div>
                    <div><h5 className="text-gray-900 font-bold text-[14px] mb-0.5 tracking-tight">Join as Creator</h5><p className="text-gray-500 text-[12px] font-medium leading-tight">Monetize your audience effortlessly.</p></div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative" onMouseEnter={() => setActiveMenu('brands')} onMouseLeave={() => setActiveMenu(null)}>
            <Link to="/brands" className={`text-[14px] font-bold flex items-center gap-1 transition-colors ${location.pathname === '/brands' || activeMenu === 'brands' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
              Brands <ChevronDown size={14} className={`transition-transform duration-300 ${activeMenu === 'brands' ? 'rotate-180 text-gray-900' : 'text-gray-400'}`} />
            </Link>
            <AnimatePresence>
              {activeMenu === 'brands' && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.15 }} className="absolute top-[calc(100%+16px)] left-1/2 -translate-x-1/2 w-[340px] bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden p-2">
                  <Link to="/brands" onClick={() => setActiveMenu(null)} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"><Briefcase size={20} className="text-[#EA580C]" /></div>
                    <div><h5 className="text-gray-900 font-bold text-[14px] mb-0.5 tracking-tight">Brand Directory</h5><p className="text-gray-500 text-[12px] font-medium leading-tight">Explore exciting brand partnerships.</p></div>
                  </Link>
                  <div className="h-px bg-gray-100 my-1 mx-2"></div>
                  <Link to="/register" onClick={() => setActiveMenu(null)} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"><Building2 size={20} className="text-blue-600" /></div>
                    <div><h5 className="text-gray-900 font-bold text-[14px] mb-0.5 tracking-tight">Join as Brand</h5><p className="text-gray-500 text-[12px] font-medium leading-tight">Connect with high-impact creators.</p></div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {user && user.role === 'creator' && !isAdminRole && (
        <div className="hidden sm:flex flex-1 items-center justify-center gap-8">
          <Link to="/campaigns" className="text-[14px] font-bold text-gray-500 hover:text-gray-900 transition-colors">
            Campaigns
          </Link>
          <Link to="/brands" className={`text-[14px] font-bold transition-colors ${location.pathname === '/brands' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
            Brands
          </Link>
        </div>
      )}

      {user && user.role === 'brand' && !isAdminRole && (
        <div className="hidden sm:flex flex-1 items-center justify-center gap-8">
          <Link to="/campaigns" className="text-[14px] font-bold text-gray-500 hover:text-gray-900 transition-colors">
            Campaigns
          </Link>
          <Link to="/creators" className={`text-[14px] font-bold transition-colors ${location.pathname === '/creators' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
            Creators
          </Link>
        </div>
      )}

      {/* Right Actions */}
      <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3 md:gap-4">
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            {user.role !== 'admin' && (
              <Link to="/wishlist" className="flex relative w-10 h-10 items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-pink-500 hover:border-pink-200 hover:bg-pink-50 rounded-xl transition-all shadow-sm group">
                <Heart size={18} className="group-hover:scale-110 transition-transform group-hover:fill-pink-500/20" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-pink-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}
            <Link to="/notifications" className="flex relative w-10 h-10 items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-[#EA580C]/20 hover:bg-orange-50 rounded-xl transition-all shadow-sm group">
              <Bell size={18} className={`group-hover:scale-110 transition-transform ${hasUnread ? "animate-pulse text-[#EA580C]" : ""}`} />
              {hasUnread && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {unreadCount}
                </span>
              )}
            </Link>
            <div 
              className="relative ml-1"
              onMouseEnter={() => { if (window.innerWidth >= 640) setIsProfileOpen(true); }}
              onMouseLeave={() => { if (window.innerWidth >= 640) setIsProfileOpen(false); }}
            >
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-gray-200 hover:border-gray-300 shadow-sm overflow-hidden focus:outline-none transition-all hover:shadow-md relative z-[200]"
              >
                {user.profilePicture || user.logo ? (
                  <img
                    src={user.profilePicture || user.logo}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                  />
                ) : null}
                <User
                  size={18}
                  className="text-gray-400"
                  style={{ display: (user.profilePicture || user.logo) ? 'none' : 'block' }}
                />
              </button>
              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    {/* Backdrop to close dropdown on click outside on mobile */}
                    <div
                      className="fixed inset-0 z-[190] bg-transparent sm:hidden"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full pt-2 w-[220px] z-[200]"
                    >
                      <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] overflow-hidden">
                        <div className="px-4 py-3.5 border-b border-gray-100/60 bg-gray-50/30">
                          <p className="text-[14px] font-bold text-gray-900 tracking-tight truncate">{user.name || 'Profile'}</p>
                          <p className="text-[11px] font-bold text-gray-400 truncate tracking-wide">{user.email}</p>
                        </div>
                        <div className="p-1">
                          <Link to={dashboardPath} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-[13px] font-bold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                            <Compass size={14} /> Dashboard
                          </Link>
                          <div className="h-px bg-gray-100/80 my-1 mx-2"></div>
                          <button onClick={() => { handleLogout(); setIsProfileOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-[13px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                            <LogOut size={14} /> Logout
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-[14px] font-bold text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">Log in</Link>
            <Link to="/register" className="text-[13px] font-bold bg-gray-900 text-white hover:bg-black transition-all px-5 py-2 sm:py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5">Sign Up</Link>
          </div>
        )}
        {/* Mobile menu button disabled to match premium mockup layout */}
        <div className="sm:hidden w-1"></div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="sm:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-200 shadow-xl overflow-hidden z-[90]">
            <div className="flex flex-col p-4 gap-2">
              {(!user || !isAdminRole) && (
                <>
                  <Link to="/campaigns" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-gray-900 py-3 px-4 rounded-xl hover:bg-gray-50 flex items-center gap-3"><Sparkles size={16} /> Campaigns</Link>
                  {(!user || user.role === 'brand') && (
                    <Link to="/creators" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-gray-900 py-3 px-4 rounded-xl hover:bg-gray-50 flex items-center gap-3"><Users size={16} /> Creators</Link>
                  )}
                  {(!user || user.role === 'creator') && (
                    <Link to="/brands" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-gray-900 py-3 px-4 rounded-xl hover:bg-gray-50 flex items-center gap-3"><Briefcase size={16} /> Brands</Link>
                  )}
                </>
              )}

              {user ? (
                <>
                  <div className="h-px bg-gray-100 my-2 mx-4"></div>
                  <Link to={dashboardPath} onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-indigo-600 py-3 px-4 rounded-xl hover:bg-indigo-50 flex items-center gap-3"><Compass size={16} /> Dashboard</Link>
                  {!isAdminRole && (
                    <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-gray-900 py-3 px-4 rounded-xl hover:bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3"><Heart size={16} /> Wishlist</div>
                      {wishlistCount > 0 && <span className="bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full">{wishlistCount}</span>}
                    </Link>
                  )}
                  <Link to="/notifications" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-gray-900 py-3 px-4 rounded-xl hover:bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3"><Bell size={16} /> Notifications</div>
                    {hasUnread && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                  </Link>
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left text-sm font-bold text-red-500 py-3 px-4 rounded-xl hover:bg-red-50 flex items-center gap-3 mt-2"><LogOut size={16} /> Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-gray-900 py-3 px-4 rounded-xl hover:bg-gray-50 border-t border-gray-100 mt-2 flex items-center gap-3"><LogIn size={16} /> Log in</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Command Modal overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#EA580C]/60 backdrop-blur-sm flex items-start justify-center pt-32"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <Search size={18} className="text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search campaigns, creators..."
                  className="w-full bg-transparent border-none text-gray-900 outline-none placeholder:text-gray-400 text-sm font-medium"
                />
                <button onClick={() => setIsSearchOpen(false)} className="text-[10px] bg-gray-100 border border-gray-200 px-2 py-1 rounded text-gray-500 font-bold hover:text-black transition-colors">ESC</button>
              </div>
              <div className="p-4 py-12 text-center bg-gray-50">
                <p className="text-gray-400 font-medium text-sm">Start typing to search...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
