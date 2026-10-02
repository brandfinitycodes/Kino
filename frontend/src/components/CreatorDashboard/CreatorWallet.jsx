import React, { useState, useEffect, useRef } from "react";
import axios from "../../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  User, Compass, Briefcase, Wallet, Settings, Bell,
  ExternalLink, ShieldCheck, Clock, TrendingUp, Building,
  Upload, Search, SlidersHorizontal, CheckCircle, AlertTriangle,
  Receipt, Download, ChevronLeft, ChevronRight, X, Building2, LayoutDashboard,
  Folder, ArrowUpRight, Edit3, ChevronDown, Film, UploadCloud,
  LogOut, Users, Check, Plus, Trash2, MessageCircle, MessageSquare, MapPin, Gauge, Star, Quote, FileText, Copy,
  LayoutGrid, Columns, Bookmark, Zap, Lock, ShieldAlert, AlertCircle,
  Calendar, FileSignature, Video, Filter
} from "lucide-react";
import ChatOverlay from "../ChatOverlay";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAuth } from "../../context/AuthContext";

export const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;
  let score = 0;
  if (profile.bio) score += 15;
  if (profile.niche && profile.niche !== 'Other') score += 15;
  if (profile.profilePicture) score += 15;
  if (profile.instagramProfile?.connected) score += 20;
  if (profile.expertise && profile.expertise.length > 0) score += 15;
  if (profile.pricing?.basic?.price > 0 || profile.pricing?.standard?.price > 0 || profile.pricing?.premium?.price > 0) score += 10;
  if (profile.payoutDetails?.isComplete || profile.payoutDetails?.upiId || profile.payoutDetails?.bankAccountNumber) score += 10;
  return score;
};

export 
const getPlaceholderImage = (niche) => {
  const map = {
    'Tech': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    'Fashion': 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80',
    'Gaming': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    'Lifestyle': 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=400&q=80',
    'Food': 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=400&q=80',
    'Travel': 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=400&q=80',
    'Beauty': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    'Other': 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=400&q=80'
  };
  return map[niche] || map['Other'];
};

const ANIMATION_VARIANTS = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.25, ease: "easeOut" }
};


const CreatorWallet = ({ wallet, transactions, onWithdraw }) => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawCoins, setWithdrawCoins] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState('');
  const [withdrawalSuccess, setWithdrawalSuccess] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawalError('');
    setWithdrawalSuccess('');

    const coinsNum = Number(withdrawCoins);
    if (!coinsNum || coinsNum <= 0) {
      setWithdrawalError('Please enter a valid coin amount.');
      return;
    }
    if (wallet?.balance && coinsNum > wallet.balance) {
      setWithdrawalError(`Entered amount exceeds your available balance (🪙${wallet.balance.toLocaleString()}).`);
      return;
    }

    if (payoutMethod === 'upi' && !upiId.trim()) {
      setWithdrawalError('Please enter a valid UPI ID (e.g. name@upi).');
      return;
    }

    if (payoutMethod === 'bank' && (!accountNumber.trim() || !ifscCode.trim())) {
      setWithdrawalError('Please enter both Bank Account Number and IFSC Code.');
      return;
    }

    setIsSubmittingWithdrawal(true);
    try {
      const res = await axios.post('/wallet/withdraw', {
        amount: coinsNum,
        method: payoutMethod,
        upiId,
        accountNumber,
        ifscCode,
        accountHolderName
      });

      setWithdrawalSuccess(res.data?.message || 'Withdrawal request submitted successfully!');
      if (onWithdraw) await onWithdraw();

      setTimeout(() => {
        setShowWithdrawModal(false);
        setWithdrawalSuccess('');
        setWithdrawCoins('');
      }, 2000);
    } catch (err) {
      setWithdrawalError(err.response?.data?.message || 'Failed to submit withdrawal request.');
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  return (
    <motion.div {...ANIMATION_VARIANTS} className="pb-24 pt-4 px-4 md:px-0 relative z-10">

      {/* Premium Fintech Header */}
      <div className="mb-8 relative rounded-[32px] overflow-hidden bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-100/60 to-teal-100/60 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-100/60 to-indigo-100/60 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        
        <div className="relative z-10 p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Financial Hub</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Wallet</span>
            </h1>
            <p className="text-gray-500 font-medium max-w-md">
              Manage your earnings, request payouts, and view your complete financial history.
            </p>
          </div>
          
          <div className="flex gap-4 self-stretch md:self-auto">
             <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/50 flex-1 md:min-w-[120px] flex flex-col justify-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="text-3xl font-black text-gray-900 mb-1">{(wallet?.balance + wallet?.fundsSecured)?.toLocaleString() || '0'} 🪙</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Pipeline</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Available Balance Card - Light Emerald Gradient */}
        <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50 rounded-[32px] p-8 sm:p-10 text-gray-900 relative overflow-hidden shadow-[0_20px_50px_rgba(16,185,129,0.05)] hover:-translate-y-1 transition-transform duration-500">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-emerald-500/20 transition-colors duration-1000 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center backdrop-blur-md border border-white/50">
                  <Wallet size={18} className="text-emerald-600" />
                </div>
                <span className="text-[12px] font-bold uppercase tracking-widest text-emerald-800/60">Available Balance</span>
              </div>
              <div className="px-3 py-1 bg-white/60 border border-white/50 rounded-lg backdrop-blur-sm">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Ready for Payout</span>
              </div>
            </div>

            <div className="text-5xl sm:text-7xl font-black tracking-tighter mb-10 text-gray-900">
              {(wallet?.balance)?.toLocaleString() || '0'} 🪙
            </div>

            <div className="mt-auto">
              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={!wallet?.balance}
                className="w-full bg-emerald-600 text-white font-bold uppercase tracking-widest text-[12px] px-8 py-4 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                Withdraw to Bank <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Funds-secured Card - Glassy Amber */}
        <div className="group bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100/50 rounded-[32px] p-8 sm:p-10 relative overflow-hidden shadow-[0_20px_40px_rgba(245,158,11,0.05)] hover:-translate-y-1 transition-transform duration-500">
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/4 group-hover:bg-amber-500/20 transition-colors duration-1000 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center backdrop-blur-md border border-white/50">
                  <Clock size={18} className="text-amber-600" />
                </div>
                <span className="text-[12px] font-bold uppercase tracking-widest text-amber-800/60">Milestone Coins (Locked)</span>
              </div>
              <div className="px-3 py-1 bg-white/60 border border-white/50 rounded-lg backdrop-blur-sm">
                 <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck size={12}/> Secured</span>
              </div>
            </div>

            <div className="text-5xl sm:text-7xl font-black tracking-tighter mb-10 text-gray-900">
              {(wallet?.fundsSecured)?.toLocaleString() || '0'} 🪙
            </div>

            <p className="text-[13px] text-amber-900/60 leading-relaxed mt-auto font-medium max-w-xs">
              Funds are safely secured Milestone Coins. They will move to your available balance once brand deliverables are approved.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.04)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-blue-50/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4 relative z-10">
          <div>
            <h3 className="text-gray-900 font-black text-2xl tracking-tight mb-1">Transaction Ledger</h3>
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Real-time Financial Audit</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex bg-gray-100/50 p-1 rounded-xl">
              <button onClick={() => setActiveFilter('all')} className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${activeFilter === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>All</button>
              <button onClick={() => setActiveFilter('credit')} className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${activeFilter === 'credit' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>In</button>
              <button onClick={() => setActiveFilter('debit')} className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${activeFilter === 'debit' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Out</button>
            </div>
            <button className="text-white font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 border border-gray-900 transition-all shadow-sm bg-gray-900 px-5 py-2.5 rounded-xl">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {(() => {
          const inTypes = ['credit', 'funds_secured_release', 'payout_completed', 'coin_purchase'];
          const outTypes = ['debit', 'coin_withdrawal', 'platform_fee_deducted', 'funds_secured_hold', 'pending_clearance_hold'];
          const filteredTransactions = activeFilter === 'all' 
            ? transactions 
            : activeFilter === 'credit'
              ? transactions?.filter(t => inTypes.includes(t.type))
              : transactions?.filter(t => outTypes.includes(t.type)) || [];
          return filteredTransactions.length > 0 ? (
          <div className="relative z-10 overflow-x-auto pb-4 hide-scrollbar">
            <table className="w-full min-w-[600px] text-left border-collapse">
              <thead>
                <tr>
                  <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Description</th>
                  <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Date</th>
                  <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Status</th>
                  <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group/row cursor-default">
                    <td className="py-5 pr-4 flex items-center gap-4">
                      <div className={`w-10 h-10 shrink-0 rounded-[12px] flex items-center justify-center bg-white shadow-sm border border-gray-100 group-hover/row:scale-110 transition-transform ${inTypes.includes(tx.type) ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {inTypes.includes(tx.type) ? <TrendingUp size={16} strokeWidth={2.5} /> : <Receipt size={16} strokeWidth={2.5} />}
                      </div>
                      <span className="text-[14px] font-bold text-gray-900 leading-tight">{tx.description}</span>
                    </td>
                    <td className="py-5 pr-4">
                      <span className="text-[12px] text-gray-500 font-medium">{new Date(tx.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </td>
                    <td className="py-5 pr-4 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm ${tx.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-5 text-right">
                      <span className={`text-[16px] font-black tracking-tight ${inTypes.includes(tx.type) ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {inTypes.includes(tx.type) ? '+' : '-'} {Math.abs(tx.amount)} 🪙
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-gray-200 rounded-[24px] bg-gray-50/50 relative z-10 hover:bg-gray-50 hover:border-gray-300 transition-colors">
            <div className="w-16 h-16 rounded-[16px] border border-gray-100 flex items-center justify-center bg-white shadow-sm text-gray-400 mb-2">
              <Receipt size={24} />
            </div>
            <div>
              <p className="text-gray-900 font-black text-[14px] uppercase tracking-widest mb-1">No Transactions Yet</p>
              <p className="text-gray-500 text-[13px] max-w-xs mx-auto font-medium leading-relaxed">Complete campaigns and request payouts to build your financial history.</p>
            </div>
          </div>
          );
        })()}
      </div>

      {/* WITHDRAWAL MODAL */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-reveal-up">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 relative text-left"
            >
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                  <Wallet size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Withdraw Funds</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">5% Platform Fee Applies</p>
                </div>
              </div>

              {withdrawalError && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-red-500" />
                  <span>{withdrawalError}</span>
                </div>
              )}

              {withdrawalSuccess && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle size={16} className="shrink-0 text-emerald-600" />
                  <span>{withdrawalSuccess}</span>
                </div>
              )}

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Available Balance</span>
                  <span className="text-lg font-black text-emerald-700">🪙{(wallet?.balance)?.toLocaleString() || '0'}</span>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-600 block mb-1">
                    Coins to Withdraw
                  </label>
                  <div className="relative">
                    <input 
                      type="number"
                      min="1"
                      max={wallet?.balance || 0}
                      value={withdrawCoins}
                      onChange={(e) => setWithdrawCoins(e.target.value)}
                      placeholder="Enter coin amount (e.g. 1000)"
                      className="w-full pl-4 pr-16 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black text-gray-900 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                    <button 
                      type="button" 
                      onClick={() => setWithdrawCoins(wallet?.balance || 0)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-600 block mb-2">
                    Payout Destination
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('upi')}
                      className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${payoutMethod === 'upi' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      UPI ID
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('bank')}
                      className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${payoutMethod === 'bank' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      Bank Account
                    </button>
                  </div>
                </div>

                {payoutMethod === 'upi' ? (
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-600 block mb-1">
                      UPI ID
                    </label>
                    <input 
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. name@upi or 9876543210@ybl"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-600 block mb-1">
                        Account Holder Name
                      </label>
                      <input 
                        type="text"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        placeholder="Full Name as on Bank Account"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-600 block mb-1">
                          Account Number
                        </label>
                        <input 
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="Bank Account Number"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-600 block mb-1">
                          IFSC Code
                        </label>
                        <input 
                          type="text"
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                          placeholder="SBIN0001234"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white transition-all uppercase"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(() => {
                  const gross = Number(withdrawCoins) || 0;
                  const fee = Math.round(gross * 0.05);
                  const net = Math.max(0, gross - fee);

                  return (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 text-xs space-y-2">
                      <div className="flex justify-between text-gray-600 font-medium">
                        <span>Withdrawal Amount:</span>
                        <span className="font-bold text-gray-900">🪙{gross.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-amber-700 font-medium">
                        <span>Platform Fee (5%):</span>
                        <span className="font-bold text-amber-800">-🪙{fee.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200/80 flex justify-between text-emerald-900 font-black text-sm">
                        <span>Net Bank / UPI Deposit:</span>
                        <span className="text-emerald-600 font-black">₹{net.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="pt-2 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmittingWithdrawal || !withdrawCoins || Number(withdrawCoins) <= 0}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmittingWithdrawal ? 'Requesting...' : 'Confirm Withdrawal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CreatorWallet;
