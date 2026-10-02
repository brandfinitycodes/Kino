import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, Clock, Sparkles, Heart, Compass, Users, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import CreatorBottomNav from '../components/CreatorBottomNav';
import BrandBottomNav from '../components/BrandBottomNav';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(notifications.filter(n => !n.read).map(n => axios.put(`/notifications/${n._id}/read`)));
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-100/40 via-purple-100/40 to-pink-100/40 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>
      <div className="w-16 h-16 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin relative z-10"></div>
      <p className="text-gray-500 font-bold uppercase tracking-widest text-[12px] mt-6 relative z-10">Crunching your alerts...</p>
    </div>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F8FAFC] relative overflow-hidden flex justify-center py-12 px-4 sm:px-8">
      {/* Global Decorative Backgrounds */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-100/40 via-purple-100/40 to-pink-100/40 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-emerald-100/30 to-teal-100/30 rounded-full blur-[100px] translate-y-1/4 translate-x-1/4 pointer-events-none z-0"></div>

      <div className="w-full max-w-4xl relative z-10">
        
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-all font-black text-[11px] uppercase tracking-widest w-fit bg-white/50 px-5 py-3 rounded-[16px] backdrop-blur-md shadow-[0_5px_15px_rgba(0,0,0,0.02)] border border-white hover:bg-white hover:shadow-md hover:-translate-y-0.5 mb-6">
          <ArrowLeft size={16} /> Back
        </button>
        
        {/* Header Section */}
        <div className="bg-white/60 backdrop-blur-2xl rounded-[40px] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-white mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-[0_10px_25px_rgba(99,102,241,0.4)] transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 border border-white/20">
              <Bell size={28} className="drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-[32px] font-black font-display text-gray-900 tracking-tight leading-none mb-1">Notifications</h1>
              <p className="text-[13px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                Stay updated <Sparkles size={14} className="text-purple-400"/>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-[16px] text-[11px] font-black text-gray-600 uppercase tracking-widest shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:text-indigo-600 transition-all flex items-center gap-2"
              >
                <Check size={14} /> Mark All Read
              </button>
            )}
            <div className={`px-6 py-3 rounded-[16px] text-[12px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2 border ${unreadCount > 0 ? 'bg-gradient-to-r from-rose-500 to-[#eb4898] text-white border-transparent shadow-[0_8px_20px_rgba(244,63,94,0.3)]' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
              {unreadCount} Unread
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex flex-col gap-5 relative z-10">
          <AnimatePresence>
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <motion.div
                  key={n._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`group relative p-5 sm:p-6 rounded-[32px] border transition-all duration-500 flex flex-col sm:flex-row items-start gap-5 sm:gap-6 backdrop-blur-xl ${n.read
                      ? 'bg-white/60 border-white shadow-[0_5px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:bg-white'
                      : 'bg-white/90 border-indigo-100 shadow-[0_10px_30px_rgba(99,102,241,0.08)] hover:shadow-[0_15px_40px_rgba(99,102,241,0.15)] hover:-translate-y-1'
                    }`}
                >
                  {!n.read && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                  )}

                  <div className={`shrink-0 w-14 h-14 rounded-[20px] flex items-center justify-center border shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${n.read ? 'bg-gray-50 border-gray-100 text-gray-400' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 text-indigo-600'}`}>
                    <Bell size={24} className={!n.read ? "drop-shadow-sm" : ""} />
                  </div>

                  <div className="flex-1 min-w-0 w-full flex flex-col justify-center">
                    <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-3 mb-3">
                      <p className={`text-[15px] leading-relaxed pr-4 flex-1 ${n.read ? 'text-gray-600 font-medium' : 'text-gray-900 font-bold'}`}>
                        {n.message}
                      </p>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 whitespace-nowrap shrink-0 flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 w-fit">
                        <Clock size={12}/> {formatDate(n.createdAt)}
                      </span>
                    </div>

                    {!n.read && (
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => markAsRead(n._id)}
                          className="flex items-center gap-2 text-indigo-600 text-[11px] font-black bg-indigo-50 hover:bg-indigo-600 hover:text-white px-5 py-2.5 rounded-xl transition-all uppercase tracking-widest shadow-sm hover:shadow-[0_5px_15px_rgba(99,102,241,0.3)]"
                        >
                          <Check size={14} strokeWidth={3} /> Mark as Read
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 px-4 bg-white/60 backdrop-blur-2xl border border-white rounded-[40px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[32px] shadow-sm border border-emerald-100 flex items-center justify-center mb-8 text-emerald-500 group-hover:-translate-y-2 group-hover:rotate-6 transition-all duration-500">
                  <Check size={40} className="drop-shadow-sm" strokeWidth={3} />
                </div>
                <h3 className="text-3xl font-black font-display text-gray-900 mb-3 tracking-tight">You're all caught up!</h3>
                <p className="text-[15px] text-gray-500 font-medium">No new notifications at the moment. Take a breather!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {user?.role === 'creator' ? (
        <CreatorBottomNav activeTab="" />
      ) : user?.role === 'brand' ? (
        <BrandBottomNav activeTab="" />
      ) : (
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 flex justify-around px-2 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
          {[
            { id: 'board', label: 'Board', icon: Heart, path: '/wishlist' },
            { id: 'campaigns', label: 'Campaigns', icon: Compass, path: '/campaigns' },
            { id: 'creators', label: 'Creators', icon: Users, path: '/creators' },
            { id: 'alerts', label: 'Alerts', icon: Bell, active: true }
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

export default Notifications;
