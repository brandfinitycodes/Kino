import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Briefcase, CircleDollarSign, Wallet, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

const BrandBottomNav = ({ activeTab }) => {
  const { user } = useAuth();
  const location = useLocation();

  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);
  const [hasActiveDeals, setHasActiveDeals] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'brand') return;

    const fetchCounts = async () => {
      try {
        const [notifRes, wishRes, dealsRes] = await Promise.all([
          axios.get("/notifications").catch(() => ({ data: [] })),
          axios.get("/wishlists/count").catch(() => ({ data: { count: 0 } })),
          axios.get("/deals/user").catch(() => ({ data: [] }))
        ]);

        if (notifRes?.data) {
          const unreads = notifRes.data.filter(n => !n.read);
          setHasUnread(unreads.length > 0);
          setUnreadCount(unreads.length);
        }
        if (wishRes?.data) {
          setWishlistCount(wishRes.data.count);
        }
        if (dealsRes?.data) {
          setHasActiveDeals(dealsRes.data.some(d => d.status === 'in_progress'));
        }
      } catch (err) {
        console.error("Error fetching brand bottom nav counts:", err);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user || user.role !== 'brand') return null;

  // Infer active tab ID
  const currentTab = activeTab || new URLSearchParams(location.search).get('tab') || (location.pathname === '/brand-dashboard' ? 'overview' : '');

  const TABS = [
    { id: 'overview', icon: Home, label: 'Home', path: '/brand-dashboard?tab=overview' },
    { id: 'browse', icon: Search, label: 'Browse', path: '/brand-dashboard?tab=browse' },
    { id: 'campaigns', icon: Briefcase, label: 'Campaigns', path: '/brand-dashboard?tab=campaigns' },
    { id: 'deals', icon: CircleDollarSign, label: 'Deals', path: '/brand-dashboard?tab=deals', hasIndicator: hasActiveDeals },
    { id: 'wallet', icon: Wallet, label: 'Wallet', path: '/brand-dashboard?tab=wallet' },
    { id: 'edit', icon: User, label: 'Profile', path: '/brand-dashboard?tab=edit' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 flex justify-around px-2 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] z-50 max-w-[500px] sm:max-w-none sm:justify-center sm:gap-12 mx-auto shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
      {TABS.map(tab => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <Link
            key={tab.id}
            to={tab.path}
            className="flex flex-col items-center gap-1 min-w-[65px] relative group active:scale-95 transition-transform"
          >
            <div className={`relative p-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-[#4f46e5] text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)]' : 'text-gray-400 group-hover:text-gray-600'}`}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {tab.hasIndicator && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#eb4898] border-2 border-white" />
              )}
              {tab.id === 'browse' && wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-[#eb4898] text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-black tracking-wide transition-colors duration-300 ${isActive ? 'text-[#4f46e5]' : 'text-gray-400'}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BrandBottomNav;
