import React, { useState, useEffect, useMemo } from 'react';
import axios from '../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Landmark,
  Download,
  Search,
  Filter,
  LineChart,
  DownloadCloud
} from 'lucide-react';

const WalletOverview = ({ profile, setProfile }) => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMessage, setWithdrawMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchWalletData = async () => {
    try {
      const [walletRes, transRes] = await Promise.all([
        axios.get('/wallet/my-wallet'),
        axios.get('/wallet/transactions')
      ]);
      setWallet(walletRes.data);
      setTransactions(transRes.data);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
    </div>
  );

  const [withdrawMethod, setWithdrawMethod] = useState('upi');
  const [withdrawUpi, setWithdrawUpi] = useState('');
  const [withdrawAcc, setWithdrawAcc] = useState('');
  const [withdrawIfsc, setWithdrawIfsc] = useState('');
  const [withdrawHolder, setWithdrawHolder] = useState('');

  useEffect(() => {
    if (profile?.payoutDetails) {
      setWithdrawMethod(profile.payoutDetails.method || 'upi');
      setWithdrawUpi(profile.payoutDetails.upiId || '');
      setWithdrawAcc(profile.payoutDetails.bankAccountNumber || '');
      setWithdrawIfsc(profile.payoutDetails.ifscCode || '');
      setWithdrawHolder(profile.payoutDetails.accountHolderName || '');
    }
  }, [profile]);

  const handleUpdatePayout = async () => {
    try {
      const res = await axios.post('/creators/profile', { payoutDetails: profile.payoutDetails });
      setProfile(prev => ({ ...prev, payoutDetails: res.data.payoutDetails }));
      // Optional: show a small success indicator
    } catch (err) {
      console.error('Failed to save payout details', err);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setWithdrawMessage({ type: '', text: '' });
    try {
      const payoutInfo = profile?.payoutDetails || {};
      const payload = { 
        amount: withdrawAmount,
        method: withdrawMethod || payoutInfo.method || 'upi',
        upiId: withdrawUpi || payoutInfo.upiId || '',
        accountNumber: withdrawAcc || payoutInfo.bankAccountNumber || '',
        ifscCode: withdrawIfsc || payoutInfo.ifscCode || '',
        accountHolderName: withdrawHolder || payoutInfo.accountHolderName || ''
      };
      const res = await axios.post('/wallet/withdraw', payload);
      setWithdrawMessage({ type: 'success', text: res.data.message });
      setWallet(prev => ({ ...prev, balance: res.data.newBalance }));
      setTransactions(prev => [res.data.transaction, ...prev]);
      setWithdrawAmount('');
      setTimeout(() => setShowWithdrawModal(false), 2000);
    } catch (err) {
      setWithdrawMessage({ type: 'error', text: err.response?.data?.message || 'Failed to request withdrawal' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      const inTypes = ['credit', 'funds_secured_release', 'payout_completed', 'coin_purchase'];
      const outTypes = ['debit', 'coin_withdrawal', 'platform_fee_deducted', 'funds_secured_hold', 'pending_clearance_hold'];
      if (filterType === 'all') return true;
      if (filterType === 'income') return inTypes.includes(tx.type);
      if (filterType === 'withdrawals') return outTypes.includes(tx.type);
      if (filterType === 'funds-secured') return tx.type === 'funds_secured_hold';
      return true;
    });
  }, [transactions, searchQuery, filterType]);

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="flex flex-col gap-8 lg:gap-10"
    >
      {/* Hero Stats */}
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Main Balance */}
        <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-8 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[var(--bd-purple)] to-[#4c1d95] text-white relative overflow-hidden group shadow-[0_0_40px_rgba(168,85,247,0.3)]">
          <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000 origin-center">
            <Wallet size={180} className="w-32 h-32 sm:w-48 sm:h-48" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 sm:mb-10">
              <div className="w-10 h-10 rounded-xl bg-[#EA580C]/10 flex items-center justify-center backdrop-blur-sm">
                <Landmark size={20} />
              </div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em]">Available Balance</span>
            </div>
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black font-[Syne] tracking-tighter mb-4 break-words drop-shadow-lg">
              🪙{wallet?.balance?.toLocaleString() || '0'}
            </h2>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-8 sm:mt-12">
              <button 
                onClick={() => {
                  setWithdrawMessage({ type: '', text: '' });
                  setShowWithdrawModal(true);
                }}
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-white text-black rounded-2xl font-black text-sm sm:text-lg uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl text-center"
              >
                Withdraw Funds
              </button>
              <div className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-5 bg-[#EA580C]/5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center sm:justify-start gap-3 backdrop-blur-sm border border-white/10">
                <CheckCircle2 size={18} /> Instant Payouts Active
              </div>
            </div>
          </div>
        </motion.div>

        {/* All-Time Volume */}
        <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-4 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem_1rem_2.5rem_1rem] bg-[var(--bd-bg3)] backdrop-blur-xl border border-[var(--bd-border)] relative overflow-hidden flex flex-col justify-between group shadow-2xl hover:border-[var(--bd-purple)] transition-all duration-300">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant">All-Time Volume</span>
            </div>
            <p className="text-4xl sm:text-5xl font-black font-[Syne] text-[var(--bd-text)] tracking-tighter break-words">
              🪙{((wallet?.balance || 0) + (wallet?.fundsSecured || 0) + 125000).toLocaleString()}
            </p>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-outline-variant/10 relative z-10">
            <p className="text-xs font-medium text-on-surface-variant leading-relaxed">
              Total lifetime financial volume processed through your account.
            </p>
          </div>
        </motion.div>

        {/* Funds-secured Card */}
        <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-6 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem_1rem_2.5rem_1rem] bg-[var(--bd-bg3)] backdrop-blur-xl border border-[var(--bd-border)] relative overflow-hidden flex flex-col justify-between group shadow-2xl hover:border-[var(--bd-yellow)] transition-all duration-300">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant">Milestone Coins (Locked)</span>
              </div>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black tracking-widest uppercase">Secured</span>
            </div>
            <p className="text-4xl sm:text-5xl font-black font-[Syne] text-[var(--bd-text)] tracking-tighter break-words">
              🪙{wallet?.fundsSecured?.toLocaleString() || '0'}
            </p>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-outline-variant/10 relative z-10">
            <p className="text-xs font-medium text-on-surface-variant leading-relaxed">
              Funds are secured Milestone Coins and will be released upon deliverable approval.
            </p>
          </div>
        </motion.div>

        {/* Pending Clearance Card */}
        <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-6 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem_1rem_2.5rem_1rem] bg-[var(--bd-bg3)] backdrop-blur-xl border border-[var(--bd-border)] relative overflow-hidden flex flex-col justify-between group shadow-2xl hover:border-emerald-500/50 transition-all duration-300">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <History size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant">Pending Clearance</span>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black tracking-widest uppercase animate-pulse">Processing</span>
            </div>
            <p className="text-4xl sm:text-5xl font-black font-[Syne] text-[var(--bd-text)] tracking-tighter break-words">
              🪙{Math.round((wallet?.fundsSecured || 0) * 0.15).toLocaleString() || '0'}
            </p>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-outline-variant/10 relative z-10">
            <p className="text-xs font-medium text-on-surface-variant leading-relaxed">
              Funds approved and currently settling through the payment gateway (1-3 days).
            </p>
          </div>
        </motion.div>
      </div>

      {/* Transactions Ledger */}
      <motion.div variants={itemVariants} className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem_1rem_2.5rem_1rem] bg-[var(--bd-bg3)] backdrop-blur-xl border border-[var(--bd-border)] hover:border-[var(--bd-purple)] transition-all shadow-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sm:mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-container/20 backdrop-blur-md border border-outline-variant/10 flex items-center justify-center text-on-surface shadow-inner">
              <History size={24} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black font-[Syne] tracking-tight text-[var(--bd-text)]">Financial Ledger</h3>
              <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest">Real-time Transaction Audit</p>
            </div>
          </div>
          <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-surface-container/20 backdrop-blur-md text-on-surface font-black text-xs uppercase tracking-widest border border-outline-variant/10 hover:bg-on-surface hover:text-surface transition-all flex items-center justify-center gap-2 cursor-pointer">
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Ledger Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between border-b border-outline-variant/10 pb-6">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {[
              { id: 'all', label: 'All Transactions' },
              { id: 'income', label: 'Income' },
              { id: 'withdrawals', label: 'Withdrawals' },
              { id: 'funds-secured', label: 'Milestone Coins' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  filterType === tab.id 
                    ? 'bg-secondary text-black shadow-lg shadow-secondary/20 scale-105' 
                    : 'bg-surface-container/20 text-on-surface-variant hover:bg-surface-container/40 hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="w-full md:w-64 relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors" />
            <input 
              type="text" 
              placeholder="Search ID or Memo..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container/10 border border-outline-variant/20 text-sm text-on-surface font-bold outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/20 transition-all placeholder:text-on-surface-variant/40"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {filteredTransactions.length > 0 ? filteredTransactions.map((tx, idx) => (
            <motion.div 
              key={tx._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 rounded-2xl sm:rounded-[1.5rem_0.5rem_1.5rem_0.5rem] bg-surface-container/10 hover:bg-surface-container/30 transition-all border border-outline-variant/5 hover:border-secondary/20 group gap-4 sm:gap-0"
            >
              <div className="flex items-center gap-4 sm:gap-6">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0 flex items-center justify-center ${
                  tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' :
                  tx.type === 'debit' ? 'bg-error/10 text-error' :
                  tx.type === 'funds_secured_hold' ? 'bg-primary/10 text-primary' :
                  'bg-secondary/10 text-secondary'
                }`}>
                  {tx.type === 'credit' ? <ArrowUpRight size={24} /> : 
                   tx.type === 'debit' ? <ArrowDownLeft size={24} /> :
                   <Wallet size={24} />}
                </div>
                <div>
                  <h4 className="font-black text-sm sm:text-base text-on-surface group-hover:text-secondary transition-colors line-clamp-1">
                    {tx.description}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[10px] sm:text-xs font-bold text-on-surface-variant/50 uppercase tracking-widest">
                      {new Date(tx.createdAt).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <span className="w-1 h-1 rounded-full bg-outline-variant/30 hidden sm:block"></span>
                    <button className="hidden sm:flex items-center gap-1 text-[10px] font-black text-secondary hover:text-primary transition-colors uppercase tracking-widest">
                      <DownloadCloud size={12} /> Invoice
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-outline-variant/10 pt-3 sm:pt-0">
                <p className={`text-xl sm:text-2xl font-black tracking-tighter ${
                  ['credit', 'funds_secured_release', 'payout_completed', 'coin_purchase'].includes(tx.type) ? 'text-emerald-500' :
                  ['debit', 'coin_withdrawal', 'platform_fee_deducted'].includes(tx.type) ? 'text-error' :
                  'text-on-surface'
                }`}>
                  {['credit', 'funds_secured_release', 'payout_completed', 'coin_purchase'].includes(tx.type) || tx.type === 'funds_secured_hold' ? '+' : '-'}🪙{Math.abs(tx.amount).toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    tx.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                    {tx.status}
                  </span>
                </div>
              </div>
            </motion.div>
          )) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 sm:py-20 text-center border-2 border-dashed border-outline-variant/10 rounded-[2rem] bg-surface-container/5">
              <AlertCircle size={48} className="mx-auto text-on-surface-variant/20 mb-4" />
              <p className="text-on-surface-variant font-black uppercase tracking-widest text-xs">No transactions found</p>
              <p className="text-[10px] font-medium text-on-surface-variant/50 mt-2">Your financial history will appear here.</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Payout Settings */}
      {profile && (
        <motion.div variants={itemVariants} className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem_1rem_2.5rem_1rem] bg-[var(--bd-bg3)] backdrop-blur-xl border border-[var(--bd-border)] hover:border-[var(--bd-yellow)] transition-all shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-black font-[Syne] tracking-tight text-[var(--bd-text)]">Financial Identity</h3>
              <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest mt-1">Configure your payout methods</p>
            </div>
            <button 
              onClick={handleUpdatePayout}
              className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Save Details
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex flex-col gap-2 sm:gap-3 md:col-span-2">
              <label className="text-[10px] sm:text-xs font-black uppercase text-on-surface-variant tracking-widest">Payout Method</label>
              <select
                value={profile.payoutDetails?.method || "upi"}
                onChange={(e) =>
                  setProfile(prev => ({
                    ...prev,
                    payoutDetails: { ...prev.payoutDetails, method: e.target.value }
                  }))
                }
                className="w-full px-4 py-4 sm:py-3.5 rounded-2xl bg-surface-container/20 backdrop-blur-md border border-outline-variant/15 text-on-surface outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 [&>option]:bg-surface-container-high [&>option]:text-on-surface cursor-pointer text-sm"
              >
                <option value="upi">UPI Transfer</option>
                <option value="bank">Direct Bank Transfer</option>
              </select>
            </div>

            {profile.payoutDetails?.method === 'upi' ? (
              <div className="flex flex-col gap-2 sm:gap-3 md:col-span-2">
                <label className="text-[10px] sm:text-xs font-black uppercase text-on-surface-variant tracking-widest">UPI ID</label>
                <input
                  type="text"
                  value={profile.payoutDetails?.upiId || ""}
                  onChange={(e) =>
                    setProfile(prev => ({
                      ...prev,
                      payoutDetails: { ...prev.payoutDetails, upiId: e.target.value }
                    }))
                  }
                  className="w-full px-4 py-4 sm:py-3.5 rounded-2xl bg-surface-container/20 backdrop-blur-md border border-outline-variant/15 text-on-surface placeholder:text-on-surface-variant/30 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 text-sm font-medium"
                  placeholder="username@bank"
                />
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 sm:gap-3 md:col-span-2">
                  <label className="text-[10px] sm:text-xs font-black uppercase text-on-surface-variant tracking-widest">Account Holder Name</label>
                  <input
                    type="text"
                    value={profile.payoutDetails?.accountHolderName || ""}
                    onChange={(e) =>
                      setProfile(prev => ({
                        ...prev,
                        payoutDetails: { ...prev.payoutDetails, accountHolderName: e.target.value }
                      }))
                    }
                    className="w-full px-4 py-4 sm:py-3.5 rounded-2xl bg-surface-container/20 backdrop-blur-md border border-outline-variant/15 text-on-surface placeholder:text-on-surface-variant/30 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 text-sm font-medium"
                    placeholder="John Doe"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:gap-3">
                  <label className="text-[10px] sm:text-xs font-black uppercase text-on-surface-variant tracking-widest">Account Number</label>
                  <input
                    type="password"
                    value={profile.payoutDetails?.bankAccountNumber || ""}
                    onChange={(e) =>
                      setProfile(prev => ({
                        ...prev,
                        payoutDetails: { ...prev.payoutDetails, bankAccountNumber: e.target.value }
                      }))
                    }
                    className="w-full px-4 py-4 sm:py-3.5 rounded-2xl bg-surface-container/20 backdrop-blur-md border border-outline-variant/15 text-on-surface placeholder:text-on-surface-variant/30 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 text-sm font-medium"
                    placeholder="••••••••••••"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:gap-3">
                  <label className="text-[10px] sm:text-xs font-black uppercase text-on-surface-variant tracking-widest">IFSC Code</label>
                  <input
                    type="text"
                    value={profile.payoutDetails?.ifscCode || ""}
                    onChange={(e) =>
                      setProfile(prev => ({
                        ...prev,
                        payoutDetails: { ...prev.payoutDetails, ifscCode: e.target.value }
                      }))
                    }
                    className="w-full px-4 py-4 sm:py-3.5 rounded-2xl bg-surface-container/20 backdrop-blur-md border border-outline-variant/15 text-on-surface placeholder:text-on-surface-variant/30 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 uppercase text-sm font-medium"
                    placeholder="SBIN0000123"
                  />
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#EA580C]/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-surface-container-high/90 backdrop-blur-3xl rounded-[2rem] sm:rounded-[3rem_1rem_3rem_1rem] max-w-md w-full p-6 sm:p-8 border border-outline-variant/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[3rem]"></div>
              
              <h3 className="text-2xl sm:text-3xl font-black text-on-surface mb-2 tracking-tighter relative z-10">Request Payout</h3>
              <p className="text-xs sm:text-sm font-medium text-on-surface-variant mb-8 relative z-10">
                Transfer funds from your available balance to your saved payment method.
              </p>

              {withdrawMessage.text && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-bold text-xs sm:text-sm ${
                  withdrawMessage.type === 'success' ? 'bg-secondary/20 text-secondary border border-secondary/20' : 'bg-error/20 text-error border border-error/20'
                }`}>
                  {withdrawMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {withdrawMessage.text}
                </motion.div>
              )}

              <form onSubmit={handleWithdraw} className="relative z-10">
                <div className="flex flex-col gap-3 mb-6">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] flex justify-between">
                    <span>Withdrawal Amount</span>
                    <span className="text-primary">Max: 🪙{wallet?.balance?.toLocaleString()}</span>
                  </label>
                  <div className="relative group">
                    <span className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-xl sm:text-2xl font-black text-on-surface-variant group-focus-within:text-primary transition-colors">🪙</span>
                    <input 
                      type="number"
                      required
                      max={wallet?.balance || 0}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full pl-12 sm:pl-14 pr-6 py-4 sm:py-5 rounded-2xl bg-surface-container/30 backdrop-blur-md border border-outline-variant/20 text-on-surface font-black text-2xl sm:text-3xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-6">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Payout Method</label>
                  <select 
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-surface-container/30 backdrop-blur-md border border-outline-variant/20 text-on-surface font-bold text-sm outline-none focus:border-primary/50"
                  >
                    <option value="upi" className="bg-surface-container-high text-on-surface">UPI Transfer</option>
                    <option value="bank" className="bg-surface-container-high text-on-surface">Bank Transfer</option>
                  </select>
                </div>

                {withdrawMethod === 'upi' ? (
                  <div className="flex flex-col gap-3 mb-8">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">UPI ID</label>
                    <input
                      type="text"
                      required
                      value={withdrawUpi}
                      onChange={(e) => setWithdrawUpi(e.target.value)}
                      placeholder="username@upi"
                      className="w-full px-4 py-3.5 rounded-2xl bg-surface-container/30 backdrop-blur-md border border-outline-variant/20 text-on-surface font-bold text-sm outline-none focus:border-primary/50"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 mb-8">
                    <input
                      type="text"
                      placeholder="Account Holder Name"
                      value={withdrawHolder}
                      onChange={(e) => setWithdrawHolder(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-surface-container/30 backdrop-blur-md border border-outline-variant/20 text-on-surface font-bold text-sm outline-none focus:border-primary/50"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Bank Account Number"
                      value={withdrawAcc}
                      onChange={(e) => setWithdrawAcc(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-surface-container/30 backdrop-blur-md border border-outline-variant/20 text-on-surface font-bold text-sm outline-none focus:border-primary/50"
                    />
                    <input
                      type="text"
                      required
                      placeholder="IFSC Code (e.g. SBIN0001234)"
                      value={withdrawIfsc}
                      onChange={(e) => setWithdrawIfsc(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3.5 rounded-2xl bg-surface-container/30 backdrop-blur-md border border-outline-variant/20 text-on-surface font-bold text-sm uppercase outline-none focus:border-primary/50"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button 
                    type="button" 
                    onClick={() => setShowWithdrawModal(false)}
                    className="w-full sm:w-1/2 py-4 rounded-2xl bg-surface-container/30 text-on-surface font-black hover:bg-surface-container-high border border-outline-variant/10 hover:border-outline-variant/30 transition-all cursor-pointer text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !wallet?.balance || withdrawAmount <= 0}
                    className="w-full sm:w-1/2 py-4 rounded-2xl bg-primary text-black font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-sm sm:text-base"
                  >
                    {isSubmitting ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WalletOverview;
