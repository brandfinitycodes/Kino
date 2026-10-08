import React, { useState, useEffect, useMemo } from 'react';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  Wallet,
  Users,
  TrendingUp,
  Briefcase,
  CheckCircle,
  XCircle,
  Search,
  Clock,
  AlertCircle,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Info,
  Check,
  X,
  Compass,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  Lock,
  ExternalLink,
  CreditCard
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import ClearanceQueue from '../components/AdminDashboard/ClearanceQueue';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');

  
  const queryClient = useQueryClient();
  
  // Data States (React Query)
  const { data: statsData } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await axios.get('/admin/stats');
      return res.data;
    },
    enabled: !!user
  });
  const stats = statsData || null;

  // Interaction/Filter/Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all'); // 'all', 'creator', 'brand'
  const [campaignStatusFilter, setCampaignStatusFilter] = useState('pending'); // 'pending', 'active', 'all'
  const [dealStatusFilter, setDealStatusFilter] = useState('all'); // 'all', 'disputed'
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('all'); // 'all', 'credit', 'debit', 'funds_secured_hold', 'funds_secured_release'
  const [kycStatusFilter, setKycStatusFilter] = useState('PENDING');

  // React Query infinite hooks
  const { data: usersData, fetchNextPage: fetchNextUsers, hasNextPage: hasNextUsers, isFetchingNextPage: isFetchingUsers } = useInfiniteQuery({
    queryKey: ['admin', 'users', searchQuery, userRoleFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get('/admin/users', { params: { page: pageParam, limit: 50, search: searchQuery, role: userRoleFilter === 'all' ? undefined : userRoleFilter } });
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
    enabled: !!user && (user.role === 'superadmin' || user.role === 'admin')
  });

  const { data: campaignsData, fetchNextPage: fetchNextCampaigns, hasNextPage: hasNextCampaigns, isFetchingNextPage: isFetchingCampaigns } = useInfiniteQuery({
    queryKey: ['admin', 'campaigns', searchQuery, campaignStatusFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get('/admin/campaigns', { params: { page: pageParam, limit: 50, search: searchQuery, status: campaignStatusFilter === 'all' ? undefined : campaignStatusFilter } });
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
    enabled: !!user && ['superadmin', 'admin', 'moderator'].includes(user.role)
  });

  const { data: dealsData, fetchNextPage: fetchNextDeals, hasNextPage: hasNextDeals, isFetchingNextPage: isFetchingDeals } = useInfiniteQuery({
    queryKey: ['admin', 'deals', searchQuery, dealStatusFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get('/admin/deals', { params: { page: pageParam, limit: 50, search: searchQuery, status: dealStatusFilter === 'all' ? undefined : dealStatusFilter } });
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
    enabled: !!user && ['superadmin', 'admin', 'support'].includes(user.role)
  });

  const { data: withdrawalsData, fetchNextPage: fetchNextWithdrawals, hasNextPage: hasNextWithdrawals, isFetchingNextPage: isFetchingWithdrawals } = useInfiniteQuery({
    queryKey: ['admin', 'withdrawals', searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get('/admin/withdrawals', { params: { page: pageParam, limit: 50, search: searchQuery } });
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
    enabled: !!user && ['superadmin', 'admin'].includes(user.role)
  });

  const { data: depositsData, fetchNextPage: fetchNextDeposits, hasNextPage: hasNextDeposits, isFetchingNextPage: isFetchingDeposits } = useInfiniteQuery({
    queryKey: ['admin', 'deposits', searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get('/admin/deposits', { params: { page: pageParam, limit: 50, search: searchQuery } });
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
    enabled: !!user && ['superadmin', 'admin'].includes(user.role)
  });

  const { data: transactionsData, fetchNextPage: fetchNextTransactions, hasNextPage: hasNextTransactions, isFetchingNextPage: isFetchingTransactions } = useInfiniteQuery({
    queryKey: ['admin', 'transactions', searchQuery, ledgerTypeFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get('/admin/transactions', { params: { page: pageParam, limit: 50, search: searchQuery, type: ledgerTypeFilter === 'all' ? undefined : ledgerTypeFilter } });
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
    enabled: !!user && ['superadmin', 'admin'].includes(user.role)
  });

  const { data: kycData, fetchNextPage: fetchNextKyc, hasNextPage: hasNextKyc, isFetchingNextPage: isFetchingKyc } = useInfiniteQuery({
    queryKey: ['admin', 'kyc', searchQuery, kycStatusFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get('/kyc/admin', { params: { page: pageParam, limit: 50, search: searchQuery, status: kycStatusFilter === 'all' ? undefined : kycStatusFilter } });
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
    enabled: !!user
  });

  const { data: auditLogsData, fetchNextPage: fetchNextAuditLogs, hasNextPage: hasNextAuditLogs, isFetchingNextPage: isFetchingAuditLogs } = useInfiniteQuery({
    queryKey: ['admin', 'audit-logs', searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get('/admin/audit-logs', { params: { page: pageParam, limit: 50, search: searchQuery } });
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
    enabled: !!user && user.role === 'superadmin'
  });

  const { data: socialMonitorData, fetchNextPage: fetchNextSocialMonitor, hasNextPage: hasNextSocialMonitor, isFetchingNextPage: isFetchingSocialMonitor } = useInfiniteQuery({
    queryKey: ['admin', 'social-monitor', searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get('/admin/social-monitor', { params: { page: pageParam, limit: 50, search: searchQuery } });
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
    enabled: !!user
  });
  
  const { data: clearanceData, fetchNextPage: fetchNextClearance, hasNextPage: hasNextClearance, isFetchingNextPage: isFetchingClearance } = useInfiniteQuery({
    queryKey: ['admin', 'clearance', searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get('/admin/clearance', { params: { page: pageParam, limit: 50, search: searchQuery } });
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
    enabled: !!user && ['superadmin', 'admin'].includes(user.role)
  });

  // Extract flat arrays (memoized to prevent heavy re-renders)
  const extractData = (p) => Array.isArray(p) ? p : (p.data || p.profiles || []);

  const filteredUsers = useMemo(() => {
    const raw = usersData?.pages.flatMap(p => extractData(p)) || [];
    return raw.filter(u => {
      const name = (u.profile?.name || u.profile?.businessName || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return (name.includes(query) || email.includes(query)) && (userRoleFilter === 'all' || u.role === userRoleFilter);
    });
  }, [usersData, searchQuery, userRoleFilter]);

  const filteredCampaigns = useMemo(() => {
    const raw = campaignsData?.pages.flatMap(p => extractData(p)) || [];
    return raw.filter(c => {
      const title = (c.title || '').toLowerCase();
      const brandName = (c.brandId?.businessName || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return (title.includes(query) || brandName.includes(query)) && (campaignStatusFilter === 'all' || c.status === campaignStatusFilter);
    });
  }, [campaignsData, searchQuery, campaignStatusFilter]);

  const filteredDeals = useMemo(() => {
    const raw = dealsData?.pages.flatMap(p => extractData(p)) || [];
    return raw.filter(d => {
      const brandName = (d.brandId?.businessName || d.applicationId?.campaignId?.brandId?.businessName || '').toLowerCase();
      const creatorName = (d.creatorId?.name || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return (brandName.includes(query) || creatorName.includes(query)) && (dealStatusFilter === 'all' || d.status === dealStatusFilter);
    });
  }, [dealsData, searchQuery, dealStatusFilter]);

  const filteredWithdrawals = useMemo(() => {
    const raw = withdrawalsData?.pages.flatMap(p => extractData(p)) || [];
    return raw.filter(w => {
      const query = searchQuery.toLowerCase();
      return (w.userId?.name || '').toLowerCase().includes(query) || (w.userId?.email || '').toLowerCase().includes(query);
    });
  }, [withdrawalsData, searchQuery]);

  const filteredDeposits = useMemo(() => {
    const raw = depositsData?.pages.flatMap(p => extractData(p)) || [];
    return raw.filter(d => {
      const query = searchQuery.toLowerCase();
      return (d.userId?.name || '').toLowerCase().includes(query) || (d.userId?.email || '').toLowerCase().includes(query) || (d.referenceId || '').toLowerCase().includes(query);
    });
  }, [depositsData, searchQuery]);

  const filteredTransactions = useMemo(() => {
    const raw = transactionsData?.pages.flatMap(p => extractData(p)) || [];
    return raw.filter(t => {
      const query = searchQuery.toLowerCase();
      return ((t.userId?.email || '').toLowerCase().includes(query) || (t.description || '').toLowerCase().includes(query)) && (ledgerTypeFilter === 'all' || t.type === ledgerTypeFilter);
    });
  }, [transactionsData, searchQuery, ledgerTypeFilter]);

  const filteredKycSubmissions = useMemo(() => {
    const raw = kycData?.pages.flatMap(p => extractData(p)) || [];
    return raw.filter(p => {
      const query = searchQuery.toLowerCase();
      return ((p.userId?.email || '').toLowerCase().includes(query) || (p.personalInfo?.fullName || '').toLowerCase().includes(query)) && (kycStatusFilter === 'all' || p.status === kycStatusFilter);
    });
  }, [kycData, searchQuery, kycStatusFilter]);

  const filteredAuditLogs = useMemo(() => {
    const raw = auditLogsData?.pages.flatMap(p => extractData(p)) || [];
    return raw.filter(log => {
      const query = searchQuery.toLowerCase();
      return (log.adminEmail || '').toLowerCase().includes(query) || (log.action || '').toLowerCase().includes(query);
    });
  }, [auditLogsData, searchQuery]);

  const filteredSocialMonitor = useMemo(() => {
    const raw = socialMonitorData?.pages.flatMap(p => extractData(p)) || [];
    return raw.filter(c => {
      const query = searchQuery.toLowerCase();
      return (c.name || '').toLowerCase().includes(query) || (c.instagramProfile?.username || '').toLowerCase().includes(query);
    });
  }, [socialMonitorData, searchQuery]);

  const clearanceQueueList = useMemo(() => {
    const raw = clearanceData?.pages.flatMap(p => extractData(p)) || [];
    return raw.filter(d => {
      const query = searchQuery.toLowerCase();
      return (d.brandId?.businessName || '').toLowerCase().includes(query);
    });
  }, [clearanceData, searchQuery]);

  // For compatibility with old sidebar counts which used non-filtered data (we can just use the flat list or totalItems)
  // But wait, the sidebar items use the lists. We'll provide mock lists with correct length.
  const users = filteredUsers;
  const campaigns = filteredCampaigns; // For counting pending campaigns
  const deals = filteredDeals;
  const withdrawals = filteredWithdrawals;
  const deposits = filteredDeposits;
  const kycSubmissions = filteredKycSubmissions;
  const kycStats = kycData?.pages[0]?.stats || null;

  const sidebarItems = [
    { id: 'stats', label: 'Overview', icon: <TrendingUp size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} />, badge: users?.length || 0 },
    { id: 'campaigns', label: 'Campaigns', icon: <Compass size={20} />, badge: campaigns?.filter(c => c.status === 'pending').length || 0 },
    { id: 'deals', label: 'Deals', icon: <Briefcase size={20} />, badge: deals?.filter(d => d.status === 'disputed').length || 0 },
    { id: 'withdrawals', label: 'Withdrawals', icon: <CreditCard size={20} />, badge: withdrawals?.length || 0 },
    { id: 'deposits', label: 'Deposits', icon: <Wallet size={20} />, badge: deposits?.filter(d => d.status === 'pending').length || 0 },
    { id: 'clearance', label: 'Clearance Queue', icon: <CheckCircle size={20} /> },
    { id: 'ledger', label: 'Ledger', icon: <Layers size={20} /> },
    { id: 'kyc', label: 'KYC Reviews', icon: <FileText size={20} />, badge: kycStats?.pending || 0 },
    { id: 'social-monitor', label: 'Social Monitor', icon: <ShieldAlert size={20} /> },
    { id: 'audit-logs', label: 'Audit Logs', icon: <Clock size={20} /> }
  ].filter(item => {
    if (['users', 'social-monitor'].includes(item.id) && user?.role === 'support') return false;
    if (['clearance', 'withdrawals', 'deposits', 'deals', 'audit-logs', 'social-monitor'].includes(item.id) && user?.role === 'moderator') return false;
    if (item.id === 'audit-logs' && user?.role !== 'superadmin') return false;
    return true;
  });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // KYC Review States
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [kycDocs, setKycDocs] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [activeDocUrl, setActiveDocUrl] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [kycRejectionReason, setKycRejectionReason] = useState('');

  const [toast, setToast] = useState('');
  const [confirmModal, setConfirmModal] = useState({ show: false, type: '', data: null });
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [utrRef, setUtrRef] = useState('');
  const [creatorSplitAmount, setCreatorSplitAmount] = useState(0);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleInspectKyc = async (profile) => {
    try {
      setActionLoading(true);
      const res = await axios.get(`/kyc/admin/${profile._id}`);
      setSelectedKyc(res.data.profile);
      setKycDocs(res.data.documents || []);
      setZoom(1);
      setRotation(0);
      if (res.data.documents && res.data.documents.length > 0) {
        setActiveDocUrl(res.data.documents[0].fileUrl);
      } else {
        setActiveDocUrl('');
      }
    } catch (err) {
      showToast('Failed to load KYC details.');
    } finally {
      setActionLoading(false);
    }
  };

  const refreshAllData = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin'] });
  };

  const handleApproveKyc = async (profileId) => {
    try {
      setActionLoading(true);
      const res = await axios.put('/kyc/admin/approve', { profileId });
      showToast(res.data.message || 'KYC approved successfully.');
      setSelectedKyc(null);
      await refreshAllData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve KYC.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectKyc = async (profileId, reason) => {
    if (!reason.trim()) {
      showToast('Please provide a rejection reason.');
      return;
    }
    try {
      setActionLoading(true);
      const res = await axios.put('/kyc/admin/reject', { profileId, rejectionReason: reason });
      showToast(res.data.message || 'KYC rejected.');
      setShowRejectModal(false);
      setKycRejectionReason('');
      setSelectedKyc(null);
      await refreshAllData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject KYC.');
    } finally {
      setActionLoading(false);
    }
  };

  // Close modals when switching dashboard tabs
  useEffect(() => {
    setSelectedKyc(null);
    setSelectedDetails(null);
    setConfirmModal({ show: false, type: '', data: null });
    setShowRejectModal(false);
    setKycRejectionReason('');
    setRejectionReason('');
    setZoom(1);
    setRotation(0);
  }, [activeTab]);

  // Action Triggers
  const handleToggleVerification = async (targetUser) => {
    try {
      setActionLoading(true);
      const res = await axios.post(`/admin/users/${targetUser._id}/verify`);
      showToast(res.data.message || 'User verification status updated.');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    } catch (err) {
      showToast(err.response?.data?.message || 'Verification update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSuspension = async (targetUser) => {
    try {
      setActionLoading(true);
      const res = await axios.post(`/admin/users/${targetUser._id}/suspend`);
      showToast(res.data.message || 'User suspension status updated.');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    } catch (err) {
      showToast(err.response?.data?.message || 'Suspension update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCampaignModeration = async (campaign, status, feedback = '') => {
    try {
      setActionLoading(true);
      const payload = { status };
      if (feedback) {
        payload.moderationFeedback = feedback;
      }
      const res = await axios.post(`/admin/campaigns/${campaign._id}/moderate`, payload);
      showToast(res.data.message || `Campaign status set to ${status}.`);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
    } catch (err) {
      showToast(err.response?.data?.message || 'Campaign moderation failed.');
    } finally {
      setActionLoading(false);
      setConfirmModal({ show: false, type: '', data: null });
      setRejectionReason('');
    }
  };

  const handleWithdrawalAction = async (withdrawal, action, referenceId = '') => {
    try {
      setActionLoading(true);
      let res;
      if (action === 'approve') {
        res = await axios.post(`/admin/withdrawals/${withdrawal._id}/approve`, { referenceId });
        showToast(res.data.message || 'Withdrawal approved.');
      } else {
        res = await axios.post(`/admin/withdrawals/${withdrawal._id}/reject`);
        showToast(res.data.message || 'Withdrawal rejected and funds refunded.');
      }
      await queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] });
    } catch (err) {
      showToast(err.response?.data?.message || 'Withdrawal action failed.');
    } finally {
      setActionLoading(false);
      setConfirmModal({ show: false, type: '', data: null });
      setUtrRef('');
    }
  };

  const handleDepositAction = async (deposit, action) => {
    try {
      setActionLoading(true);
      let res;
      if (action === 'approve') {
        res = await axios.post(`/admin/deposits/${deposit._id}/approve`);
        showToast(res.data.message || 'Deposit approved.');
      } else {
        res = await axios.post(`/admin/deposits/${deposit._id}/reject`);
        showToast(res.data.message || 'Deposit rejected.');
      }
      await queryClient.invalidateQueries({ queryKey: ['admin', 'deposits'] });
    } catch (err) {
      showToast(err.response?.data?.message || 'Deposit action failed.');
    } finally {
      setActionLoading(false);
      setConfirmModal({ show: false, type: '', data: null });
    }
  };

  const handleDisputeResolution = async (deal, action, creatorAmount = null, brandAmount = null) => {
    try {
      setActionLoading(true);
      const payload = { action };
      if (action === 'split') {
        payload.creatorAmount = creatorAmount;
        payload.brandAmount = brandAmount;
      }
      const res = await axios.post(`/admin/deals/${deal._id}/resolve`, payload);
      showToast(res.data.message || `Dispute resolved with action: ${action}.`);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'deals'] });
    } catch (err) {
      showToast(err.response?.data?.message || 'Dispute resolution failed.');
    } finally {
      setActionLoading(false);
      setConfirmModal({ show: false, type: '', data: null });
    }
  };

  const downloadLedgerCSV = () => {
    if (filteredTransactions.length === 0) {
      showToast('No transaction records to export.');
      return;
    }
    const headers = ['Transaction ID', 'Date', 'User Email', 'User Role', 'Type', 'Description', 'UTR Reference', 'Amount (INR)', 'Status'];
    const rows = filteredTransactions.map(t => [
      t._id,
      new Date(t.createdAt).toLocaleString(),
      t.userId?.email || 'N/A',
      t.userId?.role || 'N/A',
      t.type,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.referenceId || '',
      t.amount,
      t.status
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Ledger CSV download started.');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#EA580C]/20 border-t-[#EA580C] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <DashboardLayout
      user={user}
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white border border-gray-800 px-6 py-3.5 rounded-2xl text-[13px] font-bold shadow-2xl backdrop-blur-md animate-reveal-up flex items-center gap-3">
          <Info size={16} className="text-[#EA580C]" />
          {toast}
        </div>
      )}

      <div className="flex flex-col min-h-[calc(100vh-80px)] bg-gray-50 font-sans -m-4 sm:-m-6 md:-m-8 lg:-m-12 p-4 sm:p-6 md:p-8 lg:p-12 text-gray-900">

        {/* Tab Content Router */}
        <AnimatePresence mode="wait">

          {/* Tab 1: Console Overview */}
          {activeTab === 'stats' && (
            <motion.div key="stats" initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Console Management</span>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl sm:text-4xl font-black font-display text-gray-900 tracking-tight">System Statistics</h1>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                      user?.role === 'superadmin' ? 'bg-red-50 text-red-600 border-red-100' :
                      user?.role === 'admin' ? 'bg-[#EA580C]/10 text-[#EA580C] border-[#EA580C]/20' :
                      user?.role === 'moderator' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {user?.role ? user.role.replace('admin', ' Admin') : 'Staff'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Platform Volume */}
                {!(user?.role === 'moderator' || user?.role === 'support') ? (
                  <motion.div variants={itemVariants} className="p-6 sm:p-8 rounded-[2rem] bg-gradient-to-br from-[#EA580C] to-[#BE123C] text-white relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700"><TrendingUp size={140} /></div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] bg-white/10 px-3 py-1 rounded-full border border-white/20">All-Time Platform Volume</span>
                        <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight mt-6 mb-2">🪙{(stats?.totalVolume || 0).toLocaleString()}</h2>
                      </div>
                      <p className="text-[11px] text-white/80 font-medium">Accumulated deal flow processed transaction volume</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div variants={itemVariants} className="p-6 sm:p-8 rounded-[2rem] bg-white border border-gray-200 shadow-sm relative overflow-hidden group flex flex-col justify-between">
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">All-Time Platform Volume</span>
                        <Lock size={16} className="text-gray-400" />
                      </div>
                      <h2 className="text-2xl font-black font-display text-gray-450 tracking-tight flex items-center gap-2 mt-4"><Lock size={20} className="text-gray-400" /> Restricted</h2>
                      <p className="text-xs font-bold text-gray-400 mt-2">Platform volume metrics are restricted for your role.</p>
                    </div>
                  </motion.div>
                )}

                {/* Pending Payouts */}
                {!(user?.role === 'moderator' || user?.role === 'support') ? (
                  <motion.div variants={itemVariants} className="p-6 sm:p-8 rounded-[2rem] bg-white border border-gray-200 shadow-sm relative overflow-hidden group hover:border-[#EA580C] transition-all duration-300 flex flex-col justify-between">
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Pending Withdrawals</span>
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-black font-display text-gray-900 tracking-tight">🪙{(stats?.pendingWithdrawalsAmount || 0).toLocaleString()}</h2>
                      <p className="text-xs font-bold text-gray-500 mt-2">{stats?.pendingWithdrawalsCount || 0} creator payout requests awaiting settlement</p>
                    </div>
                    <button onClick={() => setActiveTab('withdrawals')} className="mt-6 w-full py-3 bg-gray-50 hover:bg-[#EA580C] hover:text-white border border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn">
                      Process Payouts <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div variants={itemVariants} className="p-6 sm:p-8 rounded-[2rem] bg-white border border-gray-200 shadow-sm relative overflow-hidden group flex flex-col justify-between">
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Pending Withdrawals</span>
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></span>
                      </div>
                      <h2 className="text-2xl font-black font-display text-gray-450 tracking-tight flex items-center gap-2 mt-4"><Lock size={20} className="text-gray-400" /> Restricted</h2>
                      <p className="text-xs font-bold text-gray-400 mt-2">Payout amounts are restricted for your role.</p>
                    </div>
                  </motion.div>
                )}

                {/* Platform Users */}
                <motion.div variants={itemVariants} className="p-6 sm:p-8 rounded-[2rem] bg-white border border-gray-200 shadow-sm relative overflow-hidden group hover:border-[#EA580C] transition-all flex flex-col justify-between">
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Active Directory</span>
                      <Users size={16} className="text-[#EA580C]" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black font-display text-gray-900 tracking-tight">{stats?.totalUsers || 0}</h2>
                    <div className="flex items-center gap-4 mt-3 text-xs font-bold text-gray-500">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#EA580C]" />{stats?.totalCreators || 0} Creators</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />{stats?.totalBrands || 0} Brands</span>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('users')} className="mt-6 w-full py-3 bg-gray-50 hover:bg-[#EA580C] hover:text-white border border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn">
                    Manage Users <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </motion.div>
              </div>

              {/* Moderation Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                <motion.div variants={itemVariants} className="p-6 sm:p-8 rounded-[2rem] bg-white border border-gray-200 shadow-sm flex items-center justify-between group hover:border-[#EA580C] transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                      <Compass size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Moderation Queue</span>
                      <h3 className="text-2xl font-black text-gray-900 mt-1">{campaigns.filter(c => c.status === 'pending').length} Pending Campaigns</h3>
                    </div>
                  </div>
                  <button onClick={() => { setCampaignStatusFilter('pending'); setActiveTab('campaigns'); }} className="px-5 py-2.5 bg-gray-900 hover:bg-[#EA580C] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">Review</button>
                </motion.div>

                <motion.div variants={itemVariants} className="p-6 sm:p-8 rounded-[2rem] bg-white border border-gray-200 shadow-sm flex items-center justify-between group hover:border-[#EA580C] transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-inner">
                      <ShieldAlert size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Arbitration</span>
                      <h3 className="text-2xl font-black text-gray-900 mt-1">{deals.filter(d => d.status === 'disputed').length} Disputed Deals</h3>
                    </div>
                  </div>
                  <button onClick={() => { setDealStatusFilter('disputed'); setActiveTab('deals'); }} className="px-5 py-2.5 bg-gray-900 hover:bg-[#EA580C] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">Arbitrate</button>
                </motion.div>
              </div>

              {/* platform health */}
              <motion.div variants={itemVariants} className="p-6 sm:p-8 rounded-[2rem] bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <h3 className="text-lg font-black text-gray-900">Platform Health & Status Logs</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-start gap-4">
                    <CheckCircle className="text-emerald-500 mt-0.5 shrink-0" size={16} />
                    <div>
                      <h4 className="text-xs font-black text-gray-900">Database & Core API Connected</h4>
                      <p className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-wider">System: Healthy · MongoDB Connected · Latency 14ms</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-start gap-4">
                    <Clock className="text-amber-500 mt-0.5 shrink-0" size={16} />
                    <div>
                      <h4 className="text-xs font-black text-gray-900">Payment Gateway Reconciled</h4>
                      <p className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-wider">Ledger status: Balanced · Reconciliations synced</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Tab 2: User Directory */}
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Console Management</span>
                  <h1 className="text-3xl sm:text-4xl font-black font-display text-gray-900 tracking-tight">User Directory</h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={userRoleFilter}
                    onChange={e => setUserRoleFilter(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-200 text-xs font-black uppercase tracking-widest outline-none bg-white focus:border-[#EA580C]/40"
                  >
                    <option value="all">All Roles</option>
                    <option value="creator">Creators</option>
                    <option value="brand">Brands</option>
                  </select>

                  <div className="w-full sm:w-64 relative group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EA580C]" />
                    <input
                      type="text"
                      placeholder="Search name, email..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-xs font-bold outline-none focus:border-[#EA580C]/50 focus:ring-4 focus:ring-[#EA580C]/5"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Profile</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Details</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Withdrawable Balance</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Locked Funds</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map(u => (
                          <tr key={u._id} className="hover:bg-gray-50/30 transition-all">
                            <td className="px-6 py-5.5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#EA580C]/10 border border-[#EA580C]/20 flex items-center justify-center font-display font-black text-[#EA580C] text-xs shrink-0 shadow-inner">
                                  {u.profile?.name ? u.profile.name.substring(0, 2).toUpperCase() : u.profile?.businessName ? u.profile.businessName.substring(0, 2).toUpperCase() : 'US'}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-[14px] font-black text-gray-900 tracking-tight">
                                      {u.profile?.name || u.profile?.businessName || 'New Account'}
                                    </h4>
                                    {u.isVerified && <ShieldCheck size={14} className="text-[#EA580C]" title="Verified Profile" />}
                                    {u.isSuspended && <ShieldAlert size={14} className="text-red-500" title="Suspended Account" />}
                                  </div>
                                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">{u.email}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5.5">
                              <div className="flex flex-col gap-1">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border self-start ${u.role === 'creator' ? 'bg-[#EA580C]/10 text-[#EA580C] border-[#EA580C]/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                  {u.role}
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold mt-1">Joined {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                            </td>

                            <td className="px-6 py-5.5">
                              <span className="text-[14px] font-black text-gray-900">
                                🪙{(u.wallet?.balance ?? 0).toLocaleString()}
                              </span>
                            </td>

                            <td className="px-6 py-5.5">
                              <span className="text-[14px] font-black text-gray-900">
                                🪙{(u.wallet?.fundsSecured ?? 0).toLocaleString()}
                              </span>
                            </td>

                            <td className="px-6 py-5.5">
                              <button
                                onClick={() => handleToggleVerification(u)}
                                disabled={actionLoading}
                                className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${u.isVerified ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'}`}
                              >
                                {u.isVerified ? 'Verified' : 'Verify Account'}
                              </button>
                            </td>

                            <td className="px-6 py-5.5 text-right">
                              <button
                                onClick={() => handleToggleSuspension(u)}
                                disabled={actionLoading}
                                className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ml-auto ${u.isSuspended ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' : 'bg-white text-gray-600 border-gray-200 hover:border-red-200 hover:text-red-500'}`}
                              >
                                {u.isSuspended ? <Unlock size={12} /> : <Lock size={12} />}
                                {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-20 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <Users size={32} className="text-gray-300 mb-4" />
                              <h3 className="text-gray-400 font-black uppercase tracking-widest text-xs">No users found</h3>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 3: Campaign Moderation */}
          {activeTab === 'campaigns' && (
            <motion.div key="campaigns" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Console Management</span>
                  <h1 className="text-3xl sm:text-4xl font-black font-display text-gray-900 tracking-tight">Campaign Moderation</h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={campaignStatusFilter}
                    onChange={e => setCampaignStatusFilter(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-200 text-xs font-black uppercase tracking-widest outline-none bg-white focus:border-[#EA580C]/40"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="active">Active Campaigns</option>
                    <option value="paused">Inactive / Paused</option>
                    <option value="all">All Campaigns</option>
                  </select>

                  <div className="w-full sm:w-64 relative group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EA580C]" />
                    <input
                      type="text"
                      placeholder="Search campaign, brand..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-xs font-bold outline-none focus:border-[#EA580C]/50 focus:ring-4 focus:ring-[#EA580C]/5"
                    />
                  </div>
                </div>
              </div>

              {/* Cards list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map(c => (
                    <div key={c._id} className="p-6 sm:p-8 rounded-[2rem] bg-white border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-[#EA580C] transition-all">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                              {c.brandId?.logo ? (
                                <img src={c.brandId.logo} className="w-full h-full object-cover" />
                              ) : (
                                <Briefcase size={16} className="text-gray-400" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider">{c.brandId?.businessName || 'Brand Profile'}</h4>
                              <p className="text-[10px] font-bold text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded border ${c.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              c.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                c.status === 'paused' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                  'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                            {c.status}
                          </span>
                        </div>

                        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2 group-hover:text-[#EA580C] transition-colors">{c.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium mb-4 line-clamp-3">{c.description}</p>

                        <div className="flex flex-wrap gap-2 mb-6">
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{c.niche}</span>
                          <span className="px-3 py-1 bg-[#EA580C]/15 text-[#EA580C] text-[10px] font-black uppercase tracking-widest rounded-lg">🪙{(c.budget || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-3 border-t border-gray-100 pt-4 mt-auto">
                        <button
                          onClick={() => setSelectedDetails({ type: 'campaign', data: c })}
                          className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                          View Details
                        </button>
                        {c.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleCampaignModeration(c, 'active')}
                              disabled={actionLoading}
                              className="px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center transition-all active:scale-95"
                              title="Approve Campaign"
                            >
                              <Check size={16} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => setConfirmModal({ show: true, type: 'rejectCampaign', data: c })}
                              disabled={actionLoading}
                              className="px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-all active:scale-95"
                              title="Reject Campaign"
                            >
                              <X size={16} strokeWidth={2.5} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-1 md:col-span-2 py-20 text-center bg-white border border-gray-200 rounded-[2rem]">
                    <Compass size={32} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-gray-400 font-black uppercase tracking-widest text-xs">No campaigns found</h3>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Tab 4: Deal Arbitration */}
          {activeTab === 'deals' && (
            <motion.div key="deals" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Console Management</span>
                  <h1 className="text-3xl sm:text-4xl font-black font-display text-gray-900 tracking-tight">Deal Arbitration Board</h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={dealStatusFilter}
                    onChange={e => setDealStatusFilter(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-200 text-xs font-black uppercase tracking-widest outline-none bg-white focus:border-[#EA580C]/40"
                  >
                    <option value="all">All Deals</option>
                    <option value="disputed">Disputed Deals</option>
                    <option value="pending_payment">Pending Payment</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="revision_requested">Revision Requested</option>
                    <option value="completed">Completed Deals</option>
                  </select>

                  <div className="w-full sm:w-64 relative group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EA580C]" />
                    <input
                      type="text"
                      placeholder="Search Deal ID, creator, brand..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-xs font-bold outline-none focus:border-[#EA580C]/50 focus:ring-4 focus:ring-[#EA580C]/5"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Deal details</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Participants</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Secured budget</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredDeals.length > 0 ? (
                        filteredDeals.map(d => (
                          <tr key={d._id} className="hover:bg-gray-50/30 transition-all">
                            <td className="px-6 py-5.5">
                              <div>
                                <h4 className="text-xs font-black text-gray-900 tracking-tight truncate w-48" title={d.originType === 'package' ? `Package Order (${d.packageTier})` : (d.applicationId?.campaignId?.title || `Deal #${d._id}`)}>
                                  {d.originType === 'package' ? `Package Order (${d.packageTier})` : (d.applicationId?.campaignId?.title || `Deal #${d._id}`)}
                                </h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: #{d._id.substring(d._id.length - 8)} · {d.originType}</p>
                              </div>
                            </td>

                            <td className="px-6 py-5.5">
                              <div className="flex flex-col gap-1 text-[11px] font-bold text-gray-500">
                                <span>🎨 <strong className="text-gray-900">{d.creatorId?.name || d.applicationId?.creatorId?.name || 'Unknown Creator'}</strong></span>
                                <span className="mt-0.5">💼 <strong className="text-gray-900">{d.brandId?.businessName || d.applicationId?.campaignId?.brandId?.businessName || 'Unknown Brand'}</strong></span>
                              </div>
                            </td>

                            <td className="px-6 py-5.5">
                              <div className="flex flex-col">
                                <span className="text-[14px] font-black text-gray-900">🪙{(d.budget || 0).toLocaleString()}</span>
                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider mt-0.5">Held: {d.paymentDetails?.status}</span>
                              </div>
                            </td>

                            <td className="px-6 py-5.5">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded border ${d.status === 'disputed' ? 'bg-red-50 text-red-500 border-red-100 animate-pulse' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                {d.status}
                              </span>
                            </td>

                            <td className="px-6 py-5.5 text-right">
                              {d.status === 'disputed' ? (
                                <button
                                  onClick={() => setSelectedDetails({ type: 'deal', data: d })}
                                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-red-500/10"
                                >
                                  Resolve Dispute
                                </button>
                              ) : (
                                <button
                                  onClick={() => setSelectedDetails({ type: 'deal', data: d })}
                                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                  Inspect Link
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-20 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <ShieldCheck size={32} className="text-gray-300 mb-4" />
                              <h3 className="text-gray-400 font-black uppercase tracking-widest text-xs">No disputes active</h3>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 5: Payout Approvals */}
          {activeTab === 'withdrawals' && (
            <motion.div key="withdrawals" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Console Management</span>
                  <h1 className="text-3xl sm:text-4xl font-black font-display text-gray-900 tracking-tight">Withdrawal Approvals</h1>
                </div>

                <div className="w-full sm:w-64 relative group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EA580C]" />
                  <input
                    type="text"
                    placeholder="Search creator, email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-xs font-bold outline-none focus:border-[#EA580C]/50 focus:ring-4 focus:ring-[#EA580C]/5"
                  />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Creator Profile</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payout details</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Request amount</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredWithdrawals.length > 0 ? (
                        filteredWithdrawals.map(w => (
                          <tr key={w._id} className="hover:bg-gray-50/30 transition-all">
                            <td className="px-6 py-5.5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-display font-black text-indigo-600 text-xs shrink-0 shadow-sm">
                                  {w.user?.name ? w.user.name.substring(0, 2).toUpperCase() : 'CR'}
                                </div>
                                <div>
                                  <h4 className="text-[14px] font-black text-gray-900 tracking-tight">{w.user?.name || 'Unknown Creator'}</h4>
                                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">{w.user?.email || 'N/A'}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5.5">
                              {w.user?.payoutDetails ? (
                                <div className="flex flex-col gap-1">
                                  <span className="text-[9px] font-black text-[#EA580C] uppercase tracking-widest bg-[#EA580C]/10 px-2.5 py-0.5 rounded border border-[#EA580C]/20 self-start">
                                    {w.user.payoutDetails.method === 'upi' ? 'UPI' : 'Bank Transfer'}
                                  </span>
                                  <button
                                    onClick={() => setSelectedDetails({ type: 'payout', data: w })}
                                    className="text-[11px] font-bold text-blue-500 hover:text-blue-600 hover:underline text-left mt-1"
                                  >
                                    Inspect Credentials
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 font-bold uppercase">No Details Set</span>
                              )}
                            </td>

                            <td className="px-6 py-5.5">
                              <div className="flex flex-col gap-0.5">
                                <div className="text-[12px] text-gray-400 font-bold uppercase tracking-wider">
                                  Gross: <span className="text-gray-900 font-black">🪙{(w.amount || 0).toLocaleString()}</span>
                                </div>
                                <div className="text-[11px] text-amber-600 font-bold">
                                  Fee (5%): 🪙{(w.platformFee || Math.round((w.amount || 0) * 0.05)).toLocaleString()}
                                </div>
                                <div className="text-[14px] text-emerald-600 font-black mt-0.5">
                                  Net Payout: ₹{(w.netPayout || ((w.amount || 0) - Math.round((w.amount || 0) * 0.05))).toLocaleString()}
                                </div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                  {new Date(w.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            </td>

                            <td className="px-6 py-5.5 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                <button
                                  onClick={() => setConfirmModal({ show: true, type: 'approveWithdrawal', data: w })}
                                  className="h-9 w-9 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-100 rounded-xl transition-all shadow-sm flex items-center justify-center active:scale-90"
                                >
                                  <Check size={16} strokeWidth={2.5} />
                                </button>
                                <button
                                  onClick={() => setConfirmModal({ show: true, type: 'rejectWithdrawal', data: w })}
                                  className="h-9 w-9 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 rounded-xl transition-all shadow-sm flex items-center justify-center active:scale-90"
                                >
                                  <X size={16} strokeWidth={2.5} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-20 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <Wallet size={32} className="text-gray-300 mb-4" />
                              <h3 className="text-gray-400 font-black uppercase tracking-widest text-xs">No pending payouts</h3>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 5.1: Deposit Requests */}
          {activeTab === 'deposits' && (
            <motion.div key="deposits" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Console Management</span>
                  <h1 className="text-3xl sm:text-4xl font-black font-display text-gray-900 tracking-tight">Deposit Requests</h1>
                </div>

                <div className="w-full sm:w-64 relative group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EA580C]" />
                  <input
                    type="text"
                    placeholder="Search brand, email, ref..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-xs font-bold outline-none focus:border-[#EA580C]/50 focus:ring-4 focus:ring-[#EA580C]/5"
                  />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Brand Profile</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Deposit Info</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Requested Amount</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredDeposits.length > 0 ? (
                        filteredDeposits.map(d => (
                          <tr key={d._id} className="hover:bg-gray-50/30 transition-all">
                            <td className="px-6 py-5.5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-display font-black text-blue-600 text-xs shrink-0 shadow-sm">
                                  {d.user?.name ? d.user.name.substring(0, 2).toUpperCase() : 'BR'}
                                </div>
                                <div>
                                  <h4 className="text-[14px] font-black text-gray-900 tracking-tight">{d.user?.name || 'Unknown Brand'}</h4>
                                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">{d.user?.email || 'N/A'}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5.5">
                              <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-bold text-gray-700">
                                  Ref: <span className="text-gray-900 font-black">{d.referenceId || 'N/A'}</span>
                                </span>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                  {new Date(d.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            </td>

                            <td className="px-6 py-5.5">
                              <span className="text-[14px] text-emerald-600 font-black">
                                🪙{(d.amount || 0).toLocaleString()}
                              </span>
                            </td>

                            <td className="px-6 py-5.5 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                <button
                                  onClick={() => setConfirmModal({ show: true, type: 'approveDeposit', data: d })}
                                  className="h-9 w-9 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-100 rounded-xl transition-all shadow-sm flex items-center justify-center active:scale-90"
                                >
                                  <Check size={16} strokeWidth={2.5} />
                                </button>
                                <button
                                  onClick={() => setConfirmModal({ show: true, type: 'rejectDeposit', data: d })}
                                  className="h-9 w-9 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 rounded-xl transition-all shadow-sm flex items-center justify-center active:scale-90"
                                >
                                  <X size={16} strokeWidth={2.5} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-20 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <CreditCard size={32} className="text-gray-300 mb-4" />
                              <h3 className="text-gray-400 font-black uppercase tracking-widest text-xs">No pending deposit requests</h3>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 5.5: Clearance Queue */}
          {activeTab === 'clearance' && (
            <motion.div key="clearance" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Console Management</span>
                  <h1 className="text-3xl sm:text-4xl font-black font-display text-gray-900 tracking-tight">Manual Payout Clearance</h1>
                </div>
              </div>
              <ClearanceQueue />
            </motion.div>
          )}

          {/* Tab 6: Financial Ledger */}
          {activeTab === 'ledger' && (
            <motion.div key="ledger" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Console Management</span>
                  <h1 className="text-3xl sm:text-4xl font-black font-display text-gray-900 tracking-tight">Financial Ledger</h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={downloadLedgerCSV}
                    className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 hover:scale-[1.02] active:scale-95"
                  >
                    <ArrowUpRight size={14} /> Download Ledger CSV
                  </button>

                  <select
                    value={ledgerTypeFilter}
                    onChange={e => setLedgerTypeFilter(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-200 text-xs font-black uppercase tracking-widest outline-none bg-white focus:border-[#EA580C]/40"
                  >
                    <option value="all">All Types</option>
                    <option value="credit">Credits</option>
                    <option value="debit">Debits</option>
                    <option value="funds_secured_hold">Payment Holds</option>
                    <option value="funds_secured_release">Payment Releases</option>
                  </select>

                  <div className="w-full sm:w-64 relative group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EA580C]" />
                    <input
                      type="text"
                      placeholder="Search description, email..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-xs font-bold outline-none focus:border-[#EA580C]/50 focus:ring-4 focus:ring-[#EA580C]/5"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction details</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Account email</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map(t => (
                          <tr key={t._id} className="hover:bg-gray-50/30 transition-all">
                            <td className="px-6 py-5.5">
                              <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${t.type === 'credit' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    t.type === 'debit' ? 'bg-red-50 text-red-500 border-red-100' :
                                      t.type === 'funds_secured_hold' ? 'bg-indigo-50 text-indigo-500 border-indigo-100' :
                                        'bg-purple-50 text-purple-500 border-purple-100'
                                  }`}>
                                  {t.type === 'credit' ? <ArrowUpRight size={18} /> :
                                    t.type === 'debit' ? <ArrowDownLeft size={18} /> :
                                      <Layers size={18} />}
                                </div>
                                <div>
                                  <h4 className="text-xs font-black text-gray-900 tracking-tight leading-relaxed">{t.description}</h4>
                                  {t.referenceId && (
                                    <p className="text-[10px] font-black text-[#EA580C] uppercase tracking-wider mt-0.5">
                                      UTR Ref: {t.referenceId}
                                    </p>
                                  )}
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    {new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5.5">
                              <div>
                                <span className="text-xs font-bold text-gray-900">{t.userId?.email || 'N/A'}</span>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t.userId?.role || 'N/A'}</p>
                              </div>
                            </td>

                            <td className="px-6 py-5.5">
                              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded border bg-gray-50 text-gray-500 border-gray-200">
                                {t.type.replace('_', ' ')}
                              </span>
                            </td>

                            <td className="px-6 py-5.5 text-right">
                              <div className="flex flex-col items-end">
                                <span className={`text-[15px] font-black tracking-tight ${t.amount < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                  {t.amount > 0 ? '+' : ''}🪙{(t.amount || 0).toLocaleString()}
                                </span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Status: {t.status}</span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-20 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <FileText size={32} className="text-gray-300 mb-4" />
                              <h3 className="text-gray-400 font-black uppercase tracking-widest text-xs">No transactions recorded</h3>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 7: KYC Submissions */}
          {activeTab === 'kyc' && (
            <motion.div key="kyc" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Console Management</span>
                  <h1 className="text-3xl sm:text-4xl font-black font-display text-gray-900 tracking-tight">KYC Submissions</h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={kycStatusFilter}
                    onChange={e => setKycStatusFilter(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-200 text-xs font-black uppercase tracking-widest outline-none bg-white focus:border-[#EA580C]/40"
                  >
                    <option value="all">All Statuses</option>
                    <option value="PENDING">Pending Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>

                  <div className="w-full sm:w-64 relative group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EA580C]" />
                    <input
                      type="text"
                      placeholder="Search name, email, verification id..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-xs font-bold outline-none focus:border-[#EA580C]/50 focus:ring-4 focus:ring-[#EA580C]/5"
                    />
                  </div>
                </div>
              </div>

              {kycStats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Submissions</span>
                    <h3 className="text-xl font-black text-gray-900 mt-1">{kycStats.totalSubmissions}</h3>
                  </div>
                  <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Pending</span>
                    <h3 className="text-xl font-black text-gray-900 mt-1">{kycStats.pendingReviews}</h3>
                  </div>
                  <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Approved</span>
                    <h3 className="text-xl font-black text-gray-900 mt-1">{kycStats.approved}</h3>
                  </div>
                  <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider">Rejected</span>
                    <h3 className="text-xl font-black text-gray-900 mt-1">{kycStats.rejected}</h3>
                  </div>
                  <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-center col-span-2 md:col-span-1">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">Approval Rate</span>
                    <h3 className="text-xl font-black text-gray-900 mt-1">{kycStats.approvalRate}%</h3>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Profile</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification ID</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Submitted Date</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredKycSubmissions.length > 0 ? (
                        filteredKycSubmissions.map(p => (
                          <tr key={p._id} className="hover:bg-gray-50/30 transition-all">
                            <td className="px-6 py-5.5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#EA580C]/10 border border-[#EA580C]/20 flex items-center justify-center font-display font-black text-[#EA580C] text-xs shrink-0 shadow-inner">
                                  {p.personalInfo?.fullName ? p.personalInfo.fullName.substring(0, 2).toUpperCase() : p.personalInfo?.companyName ? p.personalInfo.companyName.substring(0, 2).toUpperCase() : 'KY'}
                                </div>
                                <div>
                                  <h4 className="text-[14px] font-black text-gray-900 tracking-tight">
                                    {p.personalInfo?.fullName || p.personalInfo?.companyName || 'Not Submitted'}
                                  </h4>
                                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">{p.userId?.email} · <span className="uppercase text-[9px] px-1.5 py-0.5 rounded border bg-gray-50 border-gray-200">{p.userType}</span></p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5.5">
                              <span className="text-xs font-bold text-gray-900 font-mono select-all">
                                {p.verificationId || 'N/A'}
                              </span>
                            </td>

                            <td className="px-6 py-5.5">
                              <span className="text-xs font-bold text-gray-500">
                                {p.submittedAt ? new Date(p.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                              </span>
                            </td>

                            <td className="px-6 py-5.5">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded border ${
                                p.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                p.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                'bg-red-50 text-red-500 border-red-100'
                              }`}>
                                {p.status}
                              </span>
                            </td>

                            <td className="px-6 py-5.5 text-right">
                              <button
                                onClick={() => handleInspectKyc(p)}
                                className="px-4 py-2 bg-gray-900 hover:bg-[#EA580C] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                              >
                                Review Submission
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-20 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <ShieldCheck size={32} className="text-gray-300 mb-4" />
                              <h3 className="text-gray-400 font-black uppercase tracking-widest text-xs">No KYC submissions found</h3>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 8: Social Monitor */}
          {activeTab === 'social-monitor' && (
            <motion.div key="social-monitor" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Console Management</span>
                  <h1 className="text-3xl sm:text-4xl font-black font-display text-gray-900 tracking-tight">Social Connection Monitor</h1>
                </div>

                <div className="w-full sm:w-64 relative group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EA580C]" />
                  <input
                    type="text"
                    placeholder="Search handle, creator..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-xs font-bold outline-none focus:border-[#EA580C]/50 focus:ring-4 focus:ring-[#EA580C]/5"
                  />
                </div>
              </div>

              {/* Grid / Table */}
              <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Creator</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">IG Sync Status</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Instagram Handle</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Followers</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Engagement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredSocialMonitor.length > 0 ? (
                        filteredSocialMonitor.map(c => (
                          <tr key={c._id} className="hover:bg-gray-50/30 transition-all">
                            <td className="px-6 py-5.5">
                              <div className="flex items-center gap-3">
                                {c.instagramProfile?.profilePicture ? (
                                  <img src={c.instagramProfile.profilePicture} alt="" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-[#EA580C]/10 border border-[#EA580C]/20 flex items-center justify-center font-display font-black text-[#EA580C] text-xs shrink-0 shadow-inner">
                                    {c.name ? c.name.substring(0, 2).toUpperCase() : 'IG'}
                                  </div>
                                )}
                                <div>
                                  <h4 className="text-[14px] font-black text-gray-900 tracking-tight">{c.name || 'New Creator'}</h4>
                                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">{c.userId?.email || 'N/A'}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5.5">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded border ${
                                c.instagramProfile?.connected ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-200'
                              }`}>
                                {c.instagramProfile?.connected ? 'CONNECTED' : 'DISCONNECTED'}
                              </span>
                            </td>

                            <td className="px-6 py-5.5">
                              <span className="text-xs font-bold text-gray-900 font-mono select-all">
                                {c.instagramProfile?.username 
                                  ? `@${c.instagramProfile.username}` 
                                  : c.socialLinks?.find(s => s.platform === 'instagram')?.handle 
                                    ? `@${c.socialLinks.find(s => s.platform === 'instagram').handle.replace('@', '')}`
                                    : c.socialLinks?.find(s => s.platform === 'instagram')?.url 
                                      ? `@${c.socialLinks.find(s => s.platform === 'instagram').url.split('/').filter(Boolean).pop()}`
                                      : '—'}
                              </span>
                            </td>

                            <td className="px-6 py-5.5">
                              <span className="text-xs font-bold text-gray-900">
                                {c.instagramProfile?.connected 
                                  ? (c.instagramProfile.followers || 0).toLocaleString() 
                                  : (c.followerCount ? c.followerCount.toLocaleString() : '—')}
                              </span>
                            </td>

                            <td className="px-6 py-5.5 text-right">
                              <span className="text-xs font-bold text-[#EA580C]">
                                {c.instagramProfile?.connected ? `${c.instagramProfile.engagementRate || 0}%` : '—'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-20 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <TrendingUp size={32} className="text-gray-300 mb-4" />
                              <h3 className="text-gray-400 font-black uppercase tracking-widest text-xs">No creator connections found</h3>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 9: Audit Logs */}
          {activeTab === 'audit-logs' && user?.role === 'superadmin' && (
            <motion.div key="audit-logs" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Console Management</span>
                  <h1 className="text-3xl sm:text-4xl font-black font-display text-gray-900 tracking-tight">System Audit Logs</h1>
                </div>

                <div className="w-full sm:w-64 relative group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EA580C]" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-xs font-bold outline-none focus:border-[#EA580C]/50 focus:ring-4 focus:ring-[#EA580C]/5"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin Email</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredAuditLogs.length > 0 ? (
                        filteredAuditLogs.map(log => (
                          <tr key={log._id} className="hover:bg-gray-50/30 transition-all text-xs font-medium text-gray-600">
                            <td className="px-6 py-5.5 whitespace-nowrap text-gray-400">
                              {new Date(log.timestamp || log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-5.5 text-gray-900 font-bold">
                              {log.adminEmail}
                            </td>
                            <td className="px-6 py-5.5">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                                log.adminRole === 'superadmin' ? 'bg-red-50 text-red-600 border-red-100' :
                                log.adminRole === 'admin' ? 'bg-[#EA580C]/10 text-[#EA580C] border-[#EA580C]/20' :
                                log.adminRole === 'moderator' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                'bg-blue-50 text-blue-600 border-blue-100'
                              }`}>
                                {log.adminRole}
                              </span>
                            </td>
                            <td className="px-6 py-5.5">
                              <span className="font-mono text-[10px] bg-gray-50 border border-gray-100 px-2 py-0.5 rounded font-black text-gray-700">
                                {log.action}
                              </span>
                            </td>
                            <td className="px-6 py-5.5 text-gray-900 max-w-md truncate" title={log.details}>
                              {log.details}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-20 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <FileText size={32} className="text-gray-300 mb-4" />
                              <h3 className="text-gray-400 font-black uppercase tracking-widest text-xs">No audit logs found</h3>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        
        </AnimatePresence>

        {/* Global Pagination Controls */}
        <div className="mt-8 flex justify-center pb-12">
          {activeTab === 'users' && hasNextUsers && (
            <button onClick={() => fetchNextUsers()} disabled={isFetchingUsers} className="px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#EA580C] transition-colors">
              {isFetchingUsers ? 'Loading...' : 'Load More Users'}
            </button>
          )}
          {activeTab === 'campaigns' && hasNextCampaigns && (
            <button onClick={() => fetchNextCampaigns()} disabled={isFetchingCampaigns} className="px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#EA580C] transition-colors">
              {isFetchingCampaigns ? 'Loading...' : 'Load More Campaigns'}
            </button>
          )}
          {activeTab === 'deals' && hasNextDeals && (
            <button onClick={() => fetchNextDeals()} disabled={isFetchingDeals} className="px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#EA580C] transition-colors">
              {isFetchingDeals ? 'Loading...' : 'Load More Deals'}
            </button>
          )}
          {activeTab === 'withdrawals' && hasNextWithdrawals && (
            <button onClick={() => fetchNextWithdrawals()} disabled={isFetchingWithdrawals} className="px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#EA580C] transition-colors">
              {isFetchingWithdrawals ? 'Loading...' : 'Load More Withdrawals'}
            </button>
          )}
          {activeTab === 'deposits' && hasNextDeposits && (
            <button onClick={() => fetchNextDeposits()} disabled={isFetchingDeposits} className="px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#EA580C] transition-colors">
              {isFetchingDeposits ? 'Loading...' : 'Load More Deposits'}
            </button>
          )}
          {activeTab === 'clearance' && hasNextClearance && (
            <button onClick={() => fetchNextClearance()} disabled={isFetchingClearance} className="px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#EA580C] transition-colors">
              {isFetchingClearance ? 'Loading...' : 'Load More Clearance'}
            </button>
          )}
          {activeTab === 'kyc' && hasNextKyc && (
            <button onClick={() => fetchNextKyc()} disabled={isFetchingKyc} className="px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#EA580C] transition-colors">
              {isFetchingKyc ? 'Loading...' : 'Load More KYC'}
            </button>
          )}
          {activeTab === 'ledger' && hasNextTransactions && (
            <button onClick={() => fetchNextTransactions()} disabled={isFetchingTransactions} className="px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#EA580C] transition-colors">
              {isFetchingTransactions ? 'Loading...' : 'Load More Transactions'}
            </button>
          )}
          {activeTab === 'social-monitor' && hasNextSocialMonitor && (
            <button onClick={() => fetchNextSocialMonitor()} disabled={isFetchingSocialMonitor} className="px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#EA580C] transition-colors">
              {isFetchingSocialMonitor ? 'Loading...' : 'Load More Social Monitor'}
            </button>
          )}
          {activeTab === 'audit-logs' && hasNextAuditLogs && (
            <button onClick={() => fetchNextAuditLogs()} disabled={isFetchingAuditLogs} className="px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#EA580C] transition-colors">
              {isFetchingAuditLogs ? 'Loading...' : 'Load More Audit Logs'}
            </button>
          )}
        </div>

      </div>

      {/* Details Inspector Modal */}
      <AnimatePresence>
        {selectedDetails && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setSelectedDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] max-w-md w-full p-6 sm:p-8 border border-gray-100 shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">
                    {selectedDetails.type === 'payout' && 'Payout Destination'}
                    {selectedDetails.type === 'campaign' && 'Campaign Brief Details'}
                    {selectedDetails.type === 'deal' && 'Arbitration Deliverables'}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Inspection Window</p>
                </div>
                <button onClick={() => setSelectedDetails(null)} className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center"><X size={18} /></button>
              </div>

              {/* PAYOUT DETAILS */}
              {selectedDetails.type === 'payout' && (
                selectedDetails.data.user?.payoutDetails?.method === 'upi' ? (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">UPI ID</span>
                      <span className="text-sm font-bold text-gray-900 select-all">{selectedDetails.data.user.payoutDetails.upiId}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1"><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Account Holder</span><span className="text-sm font-bold text-gray-900">{selectedDetails.data.user?.payoutDetails?.accountHolderName || 'N/A'}</span></div>
                    <div className="h-px bg-gray-200/50"></div>
                    <div className="flex flex-col gap-1"><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Account Number</span><span className="text-sm font-bold text-gray-900 select-all">{selectedDetails.data.user?.payoutDetails?.bankAccountNumber || 'N/A'}</span></div>
                    <div className="h-px bg-gray-200/50"></div>
                    <div className="flex flex-col gap-1"><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">IFSC Code</span><span className="text-sm font-bold text-gray-900 select-all uppercase">{selectedDetails.data.user?.payoutDetails?.ifscCode || 'N/A'}</span></div>
                  </div>
                )
              )}

              {/* CAMPAIGN BRIEF VIEW */}
              {selectedDetails.type === 'campaign' && (
                <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Budget</span>
                    <h4 className="text-lg font-black text-gray-900">🪙{(selectedDetails.data.budget || 0).toLocaleString()}</h4>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Niche</span>
                    <h4 className="text-sm font-bold text-gray-900">{selectedDetails.data.niche}</h4>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col gap-2">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Brief / Description</span>
                    <p className="text-xs font-medium text-gray-600 leading-relaxed">{selectedDetails.data.description}</p>
                  </div>
                  {selectedDetails.data.moderationFeedback && (
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex flex-col gap-2">
                      <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Rejection / Moderation Feedback</span>
                      <p className="text-xs font-semibold text-rose-700 leading-relaxed">{selectedDetails.data.moderationFeedback}</p>
                    </div>
                  )}
                  {selectedDetails.data.requirements && selectedDetails.data.requirements.length > 0 && (
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Requirements</span>
                      <ul className="list-disc list-inside text-xs font-medium text-gray-600 space-y-1">
                        {selectedDetails.data.requirements.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* DISPUTE / DEAL DETAILS */}
              {selectedDetails.type === 'deal' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Budget held Milestone Coins</span>
                    <h4 className="text-xl font-black text-gray-900 mt-1">🪙{(selectedDetails.data.budget || 0).toLocaleString()}</h4>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Submitted Deliverables</span>
                    {selectedDetails.data.contentUrl ? (
                      <a
                        href={selectedDetails.data.contentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-black text-blue-500 hover:underline mt-2 flex items-center gap-1.5 self-start"
                      >
                        Inspect Work Link <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 font-bold mt-2">No deliverables submitted yet.</span>
                    )}
                  </div>

                  {selectedDetails.data.status === 'disputed' && (
                    <div className="border-t border-gray-100 pt-5 flex flex-col gap-2.5">
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setSelectedDetails(null); setConfirmModal({ show: true, type: 'disputeRelease', data: selectedDetails.data }); }}
                          className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-500/10"
                        >
                          Release to Creator
                        </button>
                        <button
                          onClick={() => { setSelectedDetails(null); setConfirmModal({ show: true, type: 'disputeRefund', data: selectedDetails.data }); }}
                          className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md shadow-red-500/10"
                        >
                          Refund to Brand
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedDetails(null);
                          setCreatorSplitAmount(selectedDetails.data.budget / 2);
                          setConfirmModal({ show: true, type: 'disputeSplit', data: selectedDetails.data });
                        }}
                        className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-500/10"
                      >
                        Partial Split
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button onClick={() => setSelectedDetails(null)} className="mt-6 w-full py-3.5 bg-gray-900 hover:bg-black text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Actions Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[2rem] max-w-md w-full p-6 sm:p-8 border border-gray-100 shadow-2xl relative overflow-hidden"
            >
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 tracking-tight">
                {confirmModal.type === 'rejectCampaign' ? 'Reject Campaign' :
                  confirmModal.type === 'disputeSplit' ? 'Partial Split Arbitration' :
                    confirmModal.type === 'approveWithdrawal' ? 'Approve Payout Request' :
                      confirmModal.type === 'rejectWithdrawal' ? 'Reject Payout Request' :
                        'Confirm Action'}
              </h3>

              <div className="text-xs sm:text-sm font-medium text-gray-500 mb-4 leading-relaxed">
                {confirmModal.type === 'approveWithdrawal' && (
                  <div>
                    <div className="mb-4 text-xs font-semibold text-gray-600 leading-relaxed">
                      Please verify the banking credentials of the creator and process the bank/UPI transfer.
                    </div>
                    <div className="mb-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-2 text-left">
                      <div className="flex justify-between text-gray-600 font-medium">
                        <span>Gross Coins Requested:</span>
                        <span className="font-bold text-gray-900">🪙{(confirmModal.data?.amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-amber-700 font-medium">
                        <span>Platform Charges (5%):</span>
                        <span className="font-bold text-amber-800">-🪙{(confirmModal.data?.platformFee || Math.round((confirmModal.data?.amount || 0) * 0.05)).toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 flex justify-between text-emerald-900 font-black text-sm">
                        <span>Net Deposit to Bank/UPI:</span>
                        <span className="text-emerald-600 font-black">₹{(confirmModal.data?.netPayout || ((confirmModal.data?.amount || 0) - Math.round((confirmModal.data?.amount || 0) * 0.05))).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mb-2 text-xs text-gray-500 font-bold">
                      Enter the UTR / Bank Transfer Reference ID below to finalize:
                    </div>
                  </div>
                )}
                {confirmModal.type === 'rejectWithdrawal' && `Are you sure you want to reject this request of 🪙${confirmModal.data?.amount?.toLocaleString() || 0}? The money will be instantly refunded to the creator's wallet balance.`}
                {confirmModal.type === 'disputeRelease' && `Arbitrator Notice: You are releasing 🪙${confirmModal.data?.budget?.toLocaleString() || 0} to the Creator. This will mark the Deal as Completed.`}
                {confirmModal.type === 'disputeRefund' && `Arbitrator Notice: You are refunding 🪙${confirmModal.data?.budget?.toLocaleString() || 0} back to the Brand. Creator will receive no balance.`}
                {confirmModal.type === 'rejectCampaign' && `Provide constructive feedback indicating why the campaign brief for "${confirmModal.data?.title}" was rejected.`}
                {confirmModal.type === 'disputeSplit' && `As an arbitrator, you can divide the Secured budget of 🪙${(confirmModal.data?.budget || 0).toLocaleString()} between the Creator and the Brand.`}
              </div>

              {/* Dynamic Inputs depending on type */}
              {confirmModal.type === 'rejectCampaign' && (
                <div className="flex flex-col gap-1.5 text-left mb-6">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rejection Reason / Feedback</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Describe specific fixes required (e.g. niche discrepancy, budget details clarification)..."
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-medium outline-none focus:border-[#EA580C]/50 focus:ring-4 focus:ring-[#EA580C]/5"
                  />
                </div>
              )}

              {confirmModal.type === 'approveWithdrawal' && (
                <div className="flex flex-col gap-1.5 text-left mb-6">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">UTR / Bank Transfer Reference ID</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR94124912"
                    value={utrRef}
                    onChange={e => setUtrRef(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold outline-none focus:border-[#EA580C]/50 focus:ring-4 focus:ring-[#EA580C]/5"
                  />
                </div>
              )}

              {confirmModal.type === 'disputeSplit' && (
                <div className="flex flex-col gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left mb-6">
                  <div className="flex justify-between items-center text-xs font-black text-gray-400 uppercase tracking-widest">
                    <span>Creator share</span>
                    <span className="text-[#EA580C]">{confirmModal.data?.budget ? Math.round((creatorSplitAmount / confirmModal.data.budget) * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">🪙</span>
                    <input
                      type="number"
                      max={confirmModal.data?.budget || 0}
                      min={0}
                      value={creatorSplitAmount}
                      onChange={e => {
                        const val = Math.min(confirmModal.data?.budget || 0, Math.max(0, Number(e.target.value)));
                        setCreatorSplitAmount(val);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-[#EA580C]/50"
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs font-black text-gray-400 uppercase tracking-widest mt-2">
                    <span>Brand share</span>
                    <span className="text-blue-500">{confirmModal.data?.budget ? Math.round(((confirmModal.data.budget - creatorSplitAmount) / confirmModal.data.budget) * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">🪙</span>
                    <input
                      type="number"
                      max={confirmModal.data?.budget || 0}
                      min={0}
                      value={Math.max(0, (confirmModal.data?.budget || 0) - creatorSplitAmount)}
                      onChange={e => {
                        const val = Math.min(confirmModal.data?.budget || 0, Math.max(0, Number(e.target.value)));
                        setCreatorSplitAmount((confirmModal.data?.budget || 0) - val);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-[#EA580C]/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1 mt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={confirmModal.data?.budget ? Math.round((creatorSplitAmount / confirmModal.data.budget) * 100) : 50}
                      onChange={e => {
                        const pct = Number(e.target.value);
                        setCreatorSplitAmount(Math.round((pct / 100) * (confirmModal.data?.budget || 0)));
                      }}
                      className="w-full accent-[#EA580C]"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => setConfirmModal({ show: false, type: '', data: null })}
                  className="w-full sm:w-1/2 py-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-black rounded-xl text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (confirmModal.type === 'approveWithdrawal') await handleWithdrawalAction(confirmModal.data, 'approve', utrRef);
                    if (confirmModal.type === 'rejectWithdrawal') await handleWithdrawalAction(confirmModal.data, 'reject');
                    if (confirmModal.type === 'approveDeposit') await handleDepositAction(confirmModal.data, 'approve');
                    if (confirmModal.type === 'rejectDeposit') await handleDepositAction(confirmModal.data, 'reject');
                    if (confirmModal.type === 'disputeRelease') await handleDisputeResolution(confirmModal.data, 'release');
                    if (confirmModal.type === 'disputeRefund') await handleDisputeResolution(confirmModal.data, 'refund');
                    if (confirmModal.type === 'rejectCampaign') await handleCampaignModeration(confirmModal.data, 'paused', rejectionReason);
                    if (confirmModal.type === 'disputeSplit') await handleDisputeResolution(confirmModal.data, 'split', creatorSplitAmount, (confirmModal.data?.budget || 0) - creatorSplitAmount);
                  }}
                  disabled={actionLoading || (confirmModal.type === 'rejectCampaign' && !rejectionReason.trim())}
                  className={`w-full sm:w-1/2 py-3.5 text-white font-black rounded-xl shadow-lg text-xs uppercase tracking-widest transition-all ${confirmModal.type === 'rejectWithdrawal' || confirmModal.type === 'rejectDeposit' || confirmModal.type === 'disputeRefund' || confirmModal.type === 'rejectCampaign'
                      ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                      : confirmModal.type === 'disputeSplit'
                        ? 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20'
                        : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                    }`}
                >
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KYC Inspector Modal */}
      <AnimatePresence>
        {selectedKyc && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setSelectedKyc(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] max-w-5xl w-full p-6 sm:p-8 border border-gray-100 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-6 max-h-[90vh]"
            >
              {/* Left Column: Details & Document List */}
              <div className="w-full md:w-1/2 flex flex-col justify-between overflow-y-auto max-h-[80vh] pr-2">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">KYC Identity Audit</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Verification Ref: {selectedKyc.verificationId || 'N/A'}</p>
                    </div>
                    <button onClick={() => setSelectedKyc(null)} className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center"><X size={18} /></button>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 mb-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {selectedKyc.userType === 'brand' ? 'Brand Logo' : 'Profile Picture / Selfie'}
                    </span>
                    {(selectedKyc.avatarUrl || selectedKyc.selfieUrl) ? (
                      <div className="w-24 h-24 rounded-2xl border border-gray-200 overflow-hidden shadow-inner bg-white">
                        <img src={selectedKyc.avatarUrl || selectedKyc.selfieUrl} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 font-bold">
                        No {selectedKyc.userType === 'brand' ? 'logo' : 'profile picture'} uploaded.
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-100 p-4 rounded-2xl mb-4">
                    {selectedKyc.userType === 'brand' ? (
                      <>
                        <div className="flex flex-col"><span className="text-[10px] uppercase text-gray-400 font-bold">Company Legal Name</span><strong className="text-gray-900 text-sm mt-0.5">{selectedKyc.personalInfo?.companyName || 'N/A'}</strong></div>
                        <div className="flex flex-col"><span className="text-[10px] uppercase text-gray-400 font-bold">Business Type</span><strong className="text-gray-900 text-sm mt-0.5">{selectedKyc.personalInfo?.businessType || 'N/A'}</strong></div>
                        <div className="flex flex-col"><span className="text-[10px] uppercase text-gray-400 font-bold">Registration Number</span><strong className="text-gray-900 text-sm mt-0.5">{selectedKyc.personalInfo?.registrationNumber || selectedKyc.aadhaarNumber || 'N/A'}</strong></div>
                        <div className="flex flex-col"><span className="text-[10px] uppercase text-gray-400 font-bold">GST Number</span><strong className="text-gray-900 text-sm mt-0.5">{selectedKyc.personalInfo?.gstNumber || selectedKyc.aadhaarNumber || 'N/A'}</strong></div>
                        <div className="flex flex-col col-span-2"><span className="text-[10px] uppercase text-gray-400 font-bold">HQ Address</span><strong className="text-gray-900 text-sm mt-0.5">{selectedKyc.personalInfo?.companyAddress || 'N/A'}</strong></div>
                        <div className="flex flex-col col-span-2"><span className="text-[10px] uppercase text-gray-400 font-bold">Contact Representative</span><strong className="text-gray-900 text-sm mt-0.5">{selectedKyc.personalInfo?.contactPerson || 'N/A'}</strong></div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col"><span className="text-[10px] uppercase text-gray-400 font-bold">Full Legal Name</span><strong className="text-gray-900 text-sm mt-0.5">{selectedKyc.personalInfo?.fullName}</strong></div>
                        <div className="flex flex-col"><span className="text-[10px] uppercase text-gray-400 font-bold">Date of Birth</span><strong className="text-gray-900 text-sm mt-0.5">{selectedKyc.personalInfo?.dateOfBirth}</strong></div>
                        <div className="flex flex-col"><span className="text-[10px] uppercase text-gray-400 font-bold">Gender</span><strong className="text-gray-900 text-sm mt-0.5">{selectedKyc.personalInfo?.gender}</strong></div>
                        <div className="flex flex-col"><span className="text-[10px] uppercase text-gray-400 font-bold">Phone Number</span><strong className="text-gray-900 text-sm mt-0.5">{selectedKyc.personalInfo?.phoneNumber}</strong></div>
                        <div className="flex flex-col col-span-2"><span className="text-[10px] uppercase text-gray-400 font-bold">Permanent Address</span><strong className="text-gray-900 text-sm mt-0.5">{selectedKyc.personalInfo?.address}, {selectedKyc.personalInfo?.city}, {selectedKyc.personalInfo?.state}, {selectedKyc.personalInfo?.pincode}, {selectedKyc.personalInfo?.country}</strong></div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 mb-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Identity Documents ({kycDocs.length})</span>
                    {kycDocs.map(d => (
                      <div 
                        key={d._id} 
                        onClick={() => setActiveDocUrl(d.fileUrl)}
                        className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          activeDocUrl === d.fileUrl ? 'border-[#EA580C] bg-[#EA580C]/5' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-[#EA580C]" />
                          <div>
                            <span className="text-xs font-bold text-gray-900">{d.documentType}</span>
                            <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Uploaded {new Date(d.uploadedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                          d.verificationStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          d.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-500 border-red-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>{d.verificationStatus}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedKyc.status === 'PENDING' && (
                  <div className="border-t border-gray-100 pt-4 mt-4 flex gap-3">
                    <button
                      onClick={() => handleApproveKyc(selectedKyc._id)}
                      disabled={actionLoading}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shadow-emerald-500/10 active:scale-95"
                    >
                      Approve KYC
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading}
                      className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shadow-red-500/10 active:scale-95"
                    >
                      Reject KYC
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Interactive Image/PDF Viewer */}
              <div className="w-full md:w-1/2 flex flex-col justify-between max-h-[80vh]">
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Document Inspection Canvas</h4>
                  {activeDocUrl ? (
                    activeDocUrl.toLowerCase().split('?')[0].endsWith('.pdf') ? (
                      <div className="w-full h-[400px] border border-gray-200 rounded-[2rem] overflow-hidden bg-gray-50 flex items-center justify-center">
                        <iframe src={activeDocUrl} className="w-full h-full border-0" title="PDF Viewer" />
                      </div>
                    ) : (
                      <div className="w-full h-[400px] border border-gray-200 rounded-[2rem] bg-gray-900 overflow-hidden flex items-center justify-center relative">
                        <img 
                          src={activeDocUrl} 
                          alt="Verification Document" 
                          className="max-w-full max-h-full object-contain transition-transform duration-200"
                          style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
                        />
                      </div>
                    )
                  ) : (
                    <div className="w-full h-[400px] border border-gray-200 rounded-[2rem] bg-gray-50 flex items-center justify-center text-gray-400 text-xs font-bold">
                      No document selected for preview.
                    </div>
                  )}

                  {activeDocUrl && !activeDocUrl.toLowerCase().split('?')[0].endsWith('.pdf') && (
                    <div className="flex gap-2 justify-center mt-3 flex-wrap">
                      <button onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors">Zoom In (+)</button>
                      <button onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors">Zoom Out (-)</button>
                      <button onClick={() => setRotation(prev => prev - 90)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors">Rotate Left (↺)</button>
                      <button onClick={() => setRotation(prev => prev + 90)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors">Rotate Right (↻)</button>
                      <button onClick={() => { setZoom(1); setRotation(0); }} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors">Reset</button>
                    </div>
                  )}
                </div>

                <button onClick={() => setSelectedKyc(null)} className="mt-4 w-full py-3.5 bg-gray-900 hover:bg-black text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all">Close Inspector</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KYC Rejection Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[2rem] max-w-md w-full p-6 sm:p-8 border border-gray-100 shadow-2xl relative overflow-hidden"
            >
              <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Reject KYC Submission</h3>
              <p className="text-xs font-medium text-gray-500 mb-4 leading-relaxed">
                Provide the reasons why this KYC submission is being rejected. This feedback will be sent directly to the user to guide them for resubmission.
              </p>

              <div className="flex flex-col gap-1.5 text-left mb-6">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rejection Feedback *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Aadhaar card image is blurry, Selfie photo does not match identification documents..."
                  value={kycRejectionReason}
                  onChange={e => setKycRejectionReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-medium outline-none focus:border-[#EA580C]/50 focus:ring-4 focus:ring-[#EA580C]/5"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowRejectModal(false); setKycRejectionReason(''); }}
                  className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-black rounded-xl text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectKyc(selectedKyc._id, kycRejectionReason)}
                  disabled={actionLoading || !kycRejectionReason.trim()}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl shadow-lg text-xs uppercase tracking-widest transition-all shadow-red-500/20"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

export default AdminDashboard;
