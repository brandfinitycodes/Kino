import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, Clock, CheckCircle, Search, Save, Settings, X, Heart, ShieldCheck, Mail, Building, MapPin, Map, Link as LinkIcon, User, FileText, ArrowRight, Check, AlertCircle, ChevronRight, Activity, TrendingUp, CircleDollarSign, ExternalLink, Filter, Briefcase, Eye, Lock, Edit3, Quote, Download, MessageCircle, MoreVertical, PlusCircle, LayoutDashboard, Share2, Filter as FilterIcon, Search as SearchIcon, Copy, Link2, Download as DownloadIcon, Zap, Target, SlidersHorizontal, MessageSquare, Star, Flag, ChevronDown, UploadCloud, Rocket, Info, MoreHorizontal, DollarSign } from 'lucide-react';
import Odometer from 'react-odometerjs';
import 'odometer/themes/odometer-theme-default.css';
import BuyCoinsModal from './BuyCoinsModal';

const BrandWallet = (props) => {
  const { 
    profile, setProfile, user, deals, campaigns, allCreators, activeTab, setActiveTab, showToast,
    chartTab, setChartTab, chartData, maxEarnings, hoveredBar, setHoveredBar, currentMonth, now,
    totalBudgetSpent, milestoneCoins, activeDeals, deliverableCounts, totalDealsChart,
    browseFilter, setBrowseFilter, browseSearch, setBrowseSearch, handlePostCampaign,
    newCampaign, setNewCampaign, createStep, setCreateStep, handleProfileUpdate,
    campaignFilter, setCampaignFilter, campaignSearch, setCampaignSearch,
    dealFilter, setDealFilter, dealPage, setDealPage, setActiveChatDeal, activeChatDeal,
    message, wallet, transactions, onUpdateWallet
  } = props;

  const [showBuyCoins, setShowBuyCoins] = useState(false);

  return (
    <>
      <div className="flex flex-col animate-reveal-up pb-24 md:pb-0 gap-4 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Balance Card */}
          <div className="bg-[#EA580C] rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-emerald-500/20 transition-colors pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#eb4898]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 group-hover:bg-[#eb4898]/20 transition-colors pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-white/80 font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-2">
                  <Wallet size={14} /> Available Balance
                </h3>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors">
                  <Info size={12} />
                </div>
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight drop-shadow-md">{(wallet?.balance || 0).toLocaleString()} 🪙</h1>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-2">Ready to Deploy</p>
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setShowBuyCoins(true)} className="flex-1 bg-white text-[#EA580C] font-black uppercase text-[12px] tracking-widest py-3.5 rounded-[12px] hover:bg-gray-50 transition-colors shadow-lg">
                  Add Funds
                </button>
                <button className="w-12 h-12 flex items-center justify-center bg-white/10 border border-white/20 text-white rounded-[12px] hover:bg-white/20 transition-colors backdrop-blur-md">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Funds-secured Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-500 font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-2">
                  <Lock size={14} /> Funds Milestone Coins
                </h3>
              </div>
              <div>
                <h1 className="text-3xl font-display font-black text-gray-900 tracking-tight">{milestoneCoins.toLocaleString()} 🪙</h1>
                <p className="text-gray-400 text-[10px] font-black uppercase mt-1 tracking-widest">Secured for Active Deals</p>
              </div>
              <div className="mt-6">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-[#10b981] rounded-full" style={{ width: `${(milestoneCoins / (totalBudgetSpent || 1)) * 100}%` }}></div>
                </div>
                <div className="flex justify-between items-center mt-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  <span>0%</span>
                  <span>100% Locked</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Spend Chart */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-[15px] text-gray-900 tracking-tight">Cash Flow Analytics</h3>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Spend vs Deposits over 6 months</p>
            </div>
            <button className="text-gray-400 hover:text-gray-900 transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="h-[200px] flex items-end justify-between gap-2 px-2">
            {(() => {
              const months = [];
              for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                months.push(d);
              }
              
              return months.map((monthDate, i) => {
                const monthIdx = monthDate.getMonth();
                const yearIdx = monthDate.getFullYear();
                
                const monthTxs = transactions.filter(t => {
                  const tDate = new Date(t.createdAt);
                  return tDate.getMonth() === monthIdx && tDate.getFullYear() === yearIdx;
                });
                
                const spend = monthTxs.filter(t => t.type === 'debit' || t.type === 'coin_withdrawal').reduce((acc, t) => acc + Math.abs(t.amount), 0);
                const deposit = monthTxs.filter(t => t.type === 'credit' || t.type === 'coin_purchase').reduce((acc, t) => acc + Math.abs(t.amount), 0);
                const maxVal = Math.max(spend, deposit, 1000); // 1000 minimum scale
                
                const spendHeight = (spend / maxVal) * 100;
                const depositHeight = (deposit / maxVal) * 100;

                return (
                  <div key={i} className="flex-1 flex flex-col justify-end items-center gap-3 group/bar cursor-pointer">
                    <div className="w-full max-w-[40px] bg-gray-100 rounded-t-xl overflow-hidden relative" style={{ height: '100%' }}>
                      <div className="absolute bottom-0 left-0 right-0 bg-[#3b82f6] transition-all duration-500 group-hover/bar:bg-[#EA580C] rounded-t-xl" style={{ height: `${spendHeight}%` }}></div>
                      <div className="absolute bottom-0 left-0 right-0 bg-emerald-400 opacity-60 transition-all duration-500 rounded-t-xl" style={{ height: `${depositHeight}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {monthDate.toLocaleString('default', { month: 'short' })}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-[15px] text-gray-900 tracking-tight">Recent Transactions</h3>
            <button className="text-[#3b82f6] text-[11px] font-bold uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="flex flex-col gap-3">
            {transactions.map((tx, i) => (
              <div key={tx._id || i} className="bg-white rounded-[16px] p-4 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${(tx.type === 'credit' || tx.type === 'coin_purchase') ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-400'}`}>
                    <DollarSign size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-gray-900 leading-tight">{tx.description || ((tx.type === 'credit' || tx.type === 'coin_purchase') ? 'Deposit' : 'Payment')}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(tx.createdAt).toLocaleDateString()}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${tx.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[14px] font-black ${(tx.type === 'credit' || tx.type === 'coin_purchase') ? 'text-emerald-500' : 'text-gray-900'}`}>
                    {(tx.type === 'credit' || tx.type === 'coin_purchase') ? '+' : '-'} {Math.abs(tx.amount).toLocaleString()} 🪙
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); showToast('Downloading PDF Invoice...', 'success'); }} className="text-gray-300 hover:text-[#3b82f6] transition-colors" title="Download Invoice">
                    <Download size={12} />
                  </button>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="bg-white rounded-[16px] p-8 shadow-sm border border-gray-100 text-center text-sm font-bold text-gray-400">
                No transactions found.
              </div>
            )}
          </div>
        </div>
      </div>

      <BuyCoinsModal 
        isOpen={showBuyCoins} 
        onClose={() => setShowBuyCoins(false)} 
        onSuccess={(coins, newBalance) => {
          showToast(`Successfully purchased ${coins} Coins!`, 'success');
          if (wallet) {
            wallet.balance = newBalance;
          }
          if (onUpdateWallet) {
            onUpdateWallet();
          }
        }}
      />
    </>
  );
};

export default BrandWallet;