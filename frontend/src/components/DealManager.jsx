import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Clock, ArrowUpRight, ExternalLink, 
  CheckCircle, AlertCircle, Calendar, ListTodo, UserSquare, Activity,
  Pause, Play, XCircle, Edit3, AlertTriangle, FileText, Sparkles, X, Check
} from 'lucide-react';
import ChatWidget from './ChatWidget';

function DealManager({ deal: initialDeal, onUpdate, user: userProp }) {
  const { user: authUser } = useAuth();
  const user = userProp || authUser || {};
  const currentRole = (user.role || authUser?.role || '').toLowerCase();
  const [deal, setDeal] = useState(initialDeal || {});
  const [loading, setLoading] = useState(false);
  const [contentUrl, setContentUrl] = useState(initialDeal?.contentUrl || '');
  const [brandAssetsUrl, setBrandAssetsUrl] = useState(initialDeal?.brandAssetsUrl || '');
  const [error, setError] = useState('');
  
  // Modals
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseReason, setPauseReason] = useState('');

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    brandAssetsUrl: initialDeal?.brandAssetsUrl || '',
    dealNotes: initialDeal?.dealNotes || '',
    deadline: initialDeal?.deadline ? new Date(initialDeal.deadline).toISOString().split('T')[0] : ''
  });

  const openEditModal = () => {
    setError('');
    setEditForm({
      brandAssetsUrl: deal.brandAssetsUrl || '',
      dealNotes: deal.dealNotes || '',
      deadline: deal.deadline ? new Date(deal.deadline).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  // Scroll to top when deal is opened & sync edit form
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (initialDeal) {
      setDeal(initialDeal);
      setBrandAssetsUrl(initialDeal.brandAssetsUrl || '');
      setContentUrl(initialDeal.contentUrl || '');
      setEditForm({
        brandAssetsUrl: initialDeal.brandAssetsUrl || '',
        dealNotes: initialDeal.dealNotes || '',
        deadline: initialDeal.deadline ? new Date(initialDeal.deadline).toISOString().split('T')[0] : ''
      });
    }
  }, [initialDeal?._id, initialDeal?.updatedAt, initialDeal?.brandAssetsUrl, initialDeal?.dealNotes, initialDeal?.deadline]);

  // Handle older database entries that might have used hyphens or no budget field
  const normalizedStatus = (deal.status || '').replace('-', '_');
  const displayBudget = deal.budget || deal.applicationId?.campaignId?.budget || 0;
  const isDeliverableSubmitted = Boolean(
    deal.contentUrl || 
    deal.submittedAt || 
    ['in_review', 'revision_requested', 'pending_clearance', 'completed'].includes(normalizedStatus)
  );

  const brandName = 
    deal.brandId?.businessName || 
    deal.applicationId?.campaignId?.brandId?.businessName || 
    deal.brandId?.userId?.name || 
    deal.applicationId?.campaignId?.brandId?.userId?.name || 
    'Brand Partner';

  const brandLogo = 
    deal.brandId?.logo || 
    deal.applicationId?.campaignId?.brandId?.logo || 
    deal.brandId?.userId?.profilePicture;

  const creatorName = 
    deal.creatorId?.name || 
    deal.creatorId?.userId?.name || 
    deal.applicationId?.creatorId?.name || 
    deal.applicationId?.creatorId?.userId?.name || 
    'Creator';

  const creatorAvatar = 
    deal.creatorId?.profilePicture || 
    deal.creatorId?.userId?.profilePicture || 
    deal.applicationId?.creatorId?.profilePicture;

  const handleAction = async (actionType, payload = {}) => {
    setLoading(true);
    setError('');
    try {
      let url = `/deals/${deal._id}`;
      
      if (actionType === 'pay') url += '/pay';
      else if (actionType === 'submit-content') url += '/submit-content';
      else if (actionType === 'review') url += '/review';
      else if (actionType === 'dispute') url += '/dispute';
      else if (actionType === 'pause') url += '/pause';
      else if (actionType === 'resume') url += '/resume';
      else if (actionType === 'cancel') url += '/cancel';
      else if (actionType === 'edit-details') {
        url += '/details';
        const res = await axios.put(url, payload);
        const updated = res.data?.deal;
        if (updated) {
          setDeal(updated);
          setBrandAssetsUrl(updated.brandAssetsUrl || '');
          setEditForm({
            brandAssetsUrl: updated.brandAssetsUrl || '',
            dealNotes: updated.dealNotes || '',
            deadline: updated.deadline ? new Date(updated.deadline).toISOString().split('T')[0] : ''
          });
        }
        if (onUpdate) onUpdate(updated || deal);
        setShowEditModal(false);
        setLoading(false);
        return;
      }

      const res = await axios.post(url, payload);
      if (res.data?.deal) {
        setDeal(res.data.deal);
      }
      
      if (onUpdate) onUpdate(res.data?.deal || deal); // Refresh parent component data
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    } finally {
      setLoading(false);
      setShowDisputeModal(false);
      setDisputeReason('');
      setShowPauseModal(false);
      setPauseReason('');
      setShowCancelModal(false);
      setCancelReason('');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending_payment': return 'bg-yellow-100 text-yellow-900 border-yellow-300';
      case 'in_progress': return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'paused': return 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse';
      case 'in_review': return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'revision_requested': return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'pending_clearance': return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'completed': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'disputed': return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'cancelled': return 'bg-gray-200 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="p-6 sm:p-8 rounded-[2.5rem_1rem_2.5rem_1rem] bg-surface-container/15 backdrop-blur-xl border border-outline-variant/10 hover:border-secondary transition-all shadow-2xl group">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 text-left w-full lg:w-auto">
          <div className="w-16 h-16 rounded-2xl bg-surface-container/15 backdrop-blur-md flex items-center justify-center text-secondary border border-outline-variant/10 shadow-xl shrink-0 group-hover:scale-105 transition-transform duration-500 overflow-hidden">
            {brandLogo ? (
              <img src={brandLogo} alt={brandName} className="w-full h-full object-cover" />
            ) : (
              <Building2 size={32} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="console-label">
                {deal.originType === 'package' ? 'Package Order' : 'Campaign Deal'} / 0x{deal._id.slice(-4).toUpperCase()}
              </span>
              <span className="text-outline-variant/40 hidden sm:inline">•</span>
              <span className="text-[11px] font-black uppercase tracking-wider text-secondary flex items-center gap-1 bg-secondary/10 px-2 py-0.5 rounded-md border border-secondary/20">
                <Building2 size={12} /> Brand: {brandName}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tighter group-hover:text-violet-400 transition-colors break-words">
              {deal.originType === 'package' || (!deal.campaignId && !deal.applicationId?.campaignId)
                ? `${(deal.packageTier ? deal.packageTier.charAt(0).toUpperCase() + deal.packageTier.slice(1) : 'Custom')} Tier Package Order` 
                : (deal.campaignId?.title || deal.applicationId?.campaignId?.title || deal.title || 'Campaign Deal')}
            </h3>
            <div className="flex flex-wrap items-center justify-start gap-3 mt-3">
              <span className="text-lg font-black text-secondary">{displayBudget.toLocaleString()} 🪙</span>
              <span className="w-1 h-1 rounded-full bg-outline-variant hidden sm:inline" />
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Payment: {formatStatus(deal.paymentDetails?.status || 'pending')}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-3 w-full lg:w-auto border-t lg:border-t-0 border-outline-variant/5 pt-4 lg:pt-0 shrink-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
             <ChatWidget dealId={deal._id} deal={deal} isCompleted={normalizedStatus === 'completed' || normalizedStatus === 'cancelled'} />
             
             {/* Edit Deal Button (Brands only) */}
             {currentRole === 'brand' && normalizedStatus !== 'completed' && normalizedStatus !== 'cancelled' && (
               <button
                 onClick={openEditModal}
                 className="px-3.5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider bg-surface-container/30 hover:bg-surface-container text-on-surface border border-outline-variant/20 hover:border-secondary transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                 title="Edit brand requirements, notes or deadline"
               >
                 <Edit3 size={13} className="text-secondary" /> Edit Deal
               </button>
             )}

             {/* Pause Deal (when In Progress) */}
             {normalizedStatus === 'in_progress' && (
               <button
                 onClick={() => setShowPauseModal(true)}
                 className="px-3.5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                 title="Put deal on temporary hold (e.g. waiting for physical product shipment)"
               >
                 <Pause size={13} className="text-amber-400" /> Pause Deal
               </button>
             )}

             {/* Resume Deal (when Paused) */}
             {normalizedStatus === 'paused' && (
               <button
                 disabled={loading}
                 onClick={() => handleAction('resume')}
                 className="px-3.5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black font-black border border-emerald-400 transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                 title="Resume deal collaboration"
               >
                 <Play size={13} className="fill-black" /> Resume Deal
               </button>
             )}

             {/* Cancel Deal (Available in pending_payment, in_progress, paused) */}
             {['pending_payment', 'in_progress', 'paused'].includes(normalizedStatus) && (
               <button
                 onClick={() => setShowCancelModal(true)}
                 className="px-3.5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                 title="Cancel deal and refund escrow coins to brand"
               >
                 <XCircle size={13} className="text-red-400" /> Cancel Deal
               </button>
             )}

             <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl ${getStatusBadgeColor(normalizedStatus)}`}>
               {formatStatus(normalizedStatus)}
             </span>
          </div>
          {normalizedStatus === 'completed' && <span className="text-[8px] font-bold text-accent-teal uppercase tracking-widest animate-pulse mt-1">Archived</span>}
          {normalizedStatus === 'cancelled' && <span className="text-[8px] font-bold text-red-400 uppercase tracking-widest mt-1">Cancelled & Refunded</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Milestone Track */}
          <div className="px-4 mb-8">
            <div className="milestone-track">
              {[
                { id: 'pending_payment', label: 'Funded' },
                { id: 'in_progress', label: 'Working' },
                { id: 'in_review', label: 'Review' },
                { id: 'pending_clearance', label: 'Clearance' },
                { id: 'completed', label: 'Finalized' }
              ].map((milestone, i, arr) => {
                const steps = ['pending_payment', 'in_progress', 'in_review', 'pending_clearance', 'completed'];
                const currentIndex = steps.indexOf(normalizedStatus);
                const milestoneIndex = steps.indexOf(milestone.id);
                const isActive = milestoneIndex <= currentIndex;
                const isCurrent = milestoneIndex === currentIndex;

                return (
                  <div key={milestone.id} className="relative">
                      <div className={`milestone-node ${isActive ? 'milestone-node-active' : ''} ${isCurrent ? 'ring-8 ring-secondary/20' : ''}`} />
                      <span className={`milestone-label ${isActive ? 'text-on-surface font-black' : 'text-on-surface-variant/40'}`}>
                        {milestone.label}
                      </span>
                  </div>
                );
              })}
              
              {/* Progress fill */}
              <div 
                className="absolute top-0 h-full bg-secondary transition-all duration-1000 ease-in-out rounded-full"
                style={{ 
                  left: '6px',
                  width: (Math.max(0, ['pending_payment', 'in_progress', 'in_review', 'pending_clearance', 'completed'].indexOf(normalizedStatus))) > 0 
                    ? `calc(${ (Math.max(0, ['pending_payment', 'in_progress', 'in_review', 'pending_clearance', 'completed'].indexOf(normalizedStatus)) / 4) * 100 }% - 12px)`
                    : '0px'
                }}
              />
            </div>
          </div>

          {error && (
            <div className="bg-error/10 text-error p-4 rounded-2xl text-sm font-bold border border-error/20 flex items-center gap-3">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {/* PAUSED BANNER ALERT */}
          {normalizedStatus === 'paused' && (
            <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 p-6 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] mb-2 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                    <Pause size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-widest border border-amber-500/30">
                        Deal Paused
                      </span>
                      {deal.pauseDetails?.pausedBy && (
                        <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider">
                          by {deal.pauseDetails.pausedBy === 'brand' ? 'Brand' : 'Creator'}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-black text-amber-300 tracking-tight">Collaboration is Temporarily on Hold</h4>
                    <p className="text-xs text-on-surface-variant font-medium mt-1 leading-relaxed">
                      {deal.pauseDetails?.reason 
                        ? `Reason: "${deal.pauseDetails.reason}"`
                        : "Timelines and deliverables are paused. Either party can resume when ready."}
                    </p>
                  </div>
                </div>

                <button
                  disabled={loading}
                  onClick={() => handleAction('resume')}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer shrink-0 self-stretch sm:self-auto justify-center"
                >
                  <Play size={14} className="fill-black" /> Resume Deal Now
                </button>
              </div>
            </div>
          )}

          {/* CANCELLED BANNER ALERT */}
          {normalizedStatus === 'cancelled' && (
            <div className="bg-gradient-to-r from-red-500/15 via-rose-500/10 to-transparent border border-red-500/30 p-6 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] mb-2">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <XCircle size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 text-[10px] font-black uppercase tracking-widest border border-red-500/30">
                      Cancelled
                    </span>
                    {deal.cancellationDetails?.cancelledBy && (
                      <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider">
                        by {deal.cancellationDetails.cancelledBy === 'brand' ? 'Brand' : 'Creator'}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-black text-red-300 tracking-tight">This Collaboration has Been Cancelled</h4>
                  <p className="text-xs text-on-surface-variant font-medium mt-1 leading-relaxed">
                    {deal.cancellationDetails?.reason 
                      ? `Reason: "${deal.cancellationDetails.reason}"`
                      : "The collaboration was terminated."}
                  </p>
                  {deal.cancellationDetails?.refundedAmount > 0 && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
                      <CheckCircle size={14} className="text-emerald-400" />
                      <span>Escrow Refunded: 🪙{deal.cancellationDetails.refundedAmount.toLocaleString()} returned to Brand balance.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DEAL NOTES & BRIEF GUIDELINES (IF ANY) */}
          {deal.dealNotes ? (
            <div className="bg-surface-container/10 backdrop-blur-md border border-outline-variant/15 p-6 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] mb-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="font-black text-secondary uppercase text-xs tracking-widest flex items-center gap-2">
                  <FileText size={16} /> Collaboration Brief & Instructions
                </h4>
                {currentRole === 'brand' && normalizedStatus !== 'completed' && normalizedStatus !== 'cancelled' && (
                  <button 
                    onClick={openEditModal}
                    className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-secondary flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 size={12} /> Edit Notes
                  </button>
                )}
              </div>
              <p className="text-xs text-on-surface leading-relaxed whitespace-pre-line font-medium bg-surface-container/20 p-4 rounded-xl border border-outline-variant/10">
                {deal.dealNotes}
              </p>
            </div>
          ) : (
            currentRole === 'brand' && normalizedStatus !== 'completed' && normalizedStatus !== 'cancelled' && (
              <div className="bg-surface-container/5 backdrop-blur-md border border-dashed border-outline-variant/30 p-5 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-on-surface">No Brief or Notes Added Yet</h5>
                    <p className="text-[11px] text-on-surface-variant font-medium">Add creative requirements, talking points or guidelines for the creator.</p>
                  </div>
                </div>
                <button
                  onClick={openEditModal}
                  className="px-3.5 py-2 rounded-xl bg-secondary/20 hover:bg-secondary text-secondary hover:text-black text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Edit3 size={12} /> Add Instructions
                </button>
              </div>
            )
          )}

          {/* BRAND ASSETS & REQUIREMENTS LINK DISPLAY (FOR BOTH BRAND & CREATOR) */}
          {(() => {
            const reqUrl = deal.brandAssetsUrl || deal.requirementsUrl || deal.applicationId?.campaignId?.requirementsLink;
            if (reqUrl) {
              return (
                <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/20 p-6 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] mb-6">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="font-black text-amber-400 uppercase text-xs tracking-widest flex items-center gap-2">
                      <ExternalLink size={16} /> Brand Requirements & Raw Video Assets (Google Drive)
                    </h4>
                    {currentRole === 'brand' && normalizedStatus !== 'completed' && normalizedStatus !== 'cancelled' && (
                      <button 
                        onClick={openEditModal}
                        className="text-[10px] font-bold uppercase tracking-wider text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit3 size={12} /> Edit Link
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant mb-4 font-medium leading-relaxed">
                    The brand has attached requirement files and raw video assets for this collaboration:
                  </p>
                  <a 
                    href={reqUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Open Requirements & Video Data Drive Link <ArrowUpRight size={14} />
                  </a>
                </div>
              );
            }
            if (currentRole === 'brand' && normalizedStatus !== 'completed' && normalizedStatus !== 'cancelled') {
              return (
                <div className="bg-surface-container/5 backdrop-blur-md border border-dashed border-outline-variant/30 p-5 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] mb-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                      <ExternalLink size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-on-surface">No Assets Drive Link Added</h5>
                      <p className="text-[11px] text-on-surface-variant font-medium">Attach a Google Drive folder with video clips, logos, or raw assets.</p>
                    </div>
                  </div>
                  <button
                    onClick={openEditModal}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Edit3 size={12} /> Add Drive Link
                  </button>
                </div>
              );
            }
            return null;
          })()}

          {/* BRAND ACTIONS */}
          {currentRole === 'brand' && (
            <div className="pt-6 border-t border-outline-variant/10">
              {normalizedStatus === 'pending_payment' && (
                <div className="bg-surface-container/10 backdrop-blur-md rounded-[1.5rem_0.5rem_1.5rem_0.5rem] p-6 border border-outline-variant/10 hover:border-primary/25 transition-all">
                  <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">Allocate Milestone Coins. Funds are only released upon your approval of the final deliverables.</p>
                  
                  <div className="mb-6 text-left">
                    <label className="text-xs font-bold text-on-surface mb-2 block flex items-center justify-between">
                      <span>Requirements & Video Data Drive Link</span>
                      <span className="text-[10px] text-on-surface-variant/60 font-normal">Optional / Recommended</span>
                    </label>
                    <input
                      type="url"
                      value={brandAssetsUrl}
                      onChange={(e) => setBrandAssetsUrl(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/... (Requirements & raw video files)"
                      className="w-full px-4 py-3 bg-surface-container/20 border border-outline-variant/20 rounded-xl text-on-surface text-xs font-medium outline-none focus:border-secondary"
                    />
                  </div>

                  <button 
                    disabled={loading}
                    onClick={() => handleAction('pay', { brandAssetsUrl })}
                    className="w-full py-4 rounded-2xl bg-white text-black font-black hover:bg-secondary hover:text-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    {loading ? 'Processing...' : <>Fund with Coins & Start Deal <ArrowUpRight size={18} /></>}
                  </button>
                </div>
              )}

              {(normalizedStatus === 'in_progress' || normalizedStatus === 'revision_requested') && (
                <div className="bg-surface-container/10 backdrop-blur-md p-6 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] border border-secondary/20">
                  <h4 className="font-black text-secondary uppercase text-xs tracking-widest mb-2 flex items-center gap-2">
                    <Clock size={16} /> Waiting for Creator
                  </h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">Coins are securely allocated Milestone Coins. The creator is currently working on your deliverables.</p>
                </div>
              )}

              {normalizedStatus === 'in_review' && (
                <div className="bg-surface-container/10 backdrop-blur-md border border-primary/20 p-6 rounded-[1.5rem_0.5rem_1.5rem_0.5rem]">
                  <h4 className="font-black text-primary uppercase text-xs tracking-widest mb-4">Review Deliverables</h4>
                  <div className="bg-surface-container/20 p-4 rounded-xl border border-outline-variant/10 mb-6 break-all font-bold text-sm text-primary flex items-center gap-3">
                    <ExternalLink size={16} />
                    <a href={deal.contentUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {deal.contentUrl || 'No URL Provided'}
                    </a>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <button 
                      disabled={loading}
                      onClick={() => handleAction('review', { action: 'approve' })}
                      className="flex-1 py-4 bg-primary text-on-primary rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform text-sm w-full cursor-pointer"
                    >
                      Approve & Release Funds
                    </button>
                    <button 
                      disabled={loading}
                      onClick={() => handleAction('review', { action: 'reject' })}
                      className="flex-1 py-4 bg-surface-container/20 text-on-surface rounded-2xl font-black border border-outline-variant/25 hover:bg-error hover:text-white hover:border-error transition-all text-sm w-full cursor-pointer"
                    >
                      Request Revision
                    </button>
                  </div>
                </div>
              )}

              {normalizedStatus === 'pending_clearance' && (
                <div className="bg-surface-container/10 backdrop-blur-md border border-teal-500/20 p-6 rounded-[1.5rem_0.5rem_1.5rem_0.5rem]">
                  <h4 className="font-black text-teal-400 uppercase text-xs tracking-widest mb-4">Deliverables Approved</h4>
                  <p className="text-sm text-on-surface-variant">You have approved the deliverables. Admin is now clearing the payout to the creator.</p>
                </div>
              )}
              
              {normalizedStatus === 'disputed' && (
                <div className="bg-error/10 backdrop-blur-md border border-error/20 p-6 rounded-[1.5rem_0.5rem_1.5rem_0.5rem]">
                  <h4 className="font-black text-error uppercase text-xs tracking-widest mb-4 flex items-center gap-2"><AlertCircle size={16} /> Deal Disputed</h4>
                  <p className="text-sm text-error/80 mb-2">Reason: {deal.disputeReason}</p>
                  <p className="text-sm text-on-surface-variant">Admin is reviewing this dispute. We will contact you soon.</p>
                </div>
              )}

              {normalizedStatus === 'completed' && (
                <div className="bg-surface-container/10 backdrop-blur-md border border-emerald-500/20 p-6 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] text-left sm:text-center relative">
                  <div className="w-12 h-12 rounded-full bg-surface-container/20 flex items-center justify-center text-emerald-400 mb-4 sm:mx-auto border border-emerald-500/20">
                    <CheckCircle size={24} />
                  </div>
                  <h4 className="font-black text-emerald-400 text-lg mb-1">Deal Completed</h4>
                  <p className="text-sm text-on-surface-variant mb-6">Content approved and payment released.</p>
                  {deal.contentUrl && (
                    <a href={deal.contentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-black text-on-surface hover:text-secondary transition-colors uppercase tracking-widest">
                      View Assets <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CREATOR ACTIONS */}
          {currentRole === 'creator' && (
            <div className="pt-6 border-t border-outline-variant/10">
              {normalizedStatus === 'pending_payment' && (
                <div className="bg-surface-container/10 backdrop-blur-md rounded-[1.5rem_0.5rem_1.5rem_0.5rem] p-6 border border-outline-variant/10 text-left sm:text-center">
                  <Clock size={32} className="text-on-surface-variant/30 mb-4 animate-pulse sm:mx-auto" />
                  <p className="text-sm text-on-surface-variant leading-relaxed">Waiting for the brand to fund the funds-secured. <strong>Avoid starting work</strong> until payment is secured.</p>
                </div>
              )}

              {(normalizedStatus === 'in_progress' || normalizedStatus === 'revision_requested') && (
                <div className="bg-surface-container/10 backdrop-blur-md border border-secondary/20 p-6 rounded-[1.5rem_0.5rem_1.5rem_0.5rem]">
                  {(() => {
                    const reqUrl = deal.brandAssetsUrl || deal.requirementsUrl || deal.applicationId?.campaignId?.requirementsLink;
                    if (!reqUrl) return null;
                    return (
                      <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-bold text-amber-300">
                        <div className="flex items-center gap-2">
                          <ExternalLink size={16} className="text-amber-400 shrink-0" />
                          <span>Brand Requirements & Raw Video Assets:</span>
                        </div>
                        <a 
                          href={reqUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-[10px] rounded-lg transition-all flex items-center gap-1 shadow-sm shrink-0"
                        >
                          Open Brand Requirements Drive ↗
                        </a>
                      </div>
                    );
                  })()}
                  <h4 className="font-black text-secondary uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                    {normalizedStatus === 'revision_requested' ? 'Revision Requested' : 'Submit Deliverables'}
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
                    <input 
                      type="url" 
                      value={contentUrl}
                      onChange={(e) => setContentUrl(e.target.value)}
                      placeholder="Add the drive-link of deliverables" 
                      className="w-full sm:flex-1 px-5 py-4 bg-surface-container/10 backdrop-blur-md border border-outline-variant/15 rounded-xl text-on-surface outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/20 transition-all duration-300 font-bold text-sm"
                    />
                    <button 
                      disabled={loading || !contentUrl}
                      onClick={() => handleAction('submit-content', { contentUrl })}
                      className="w-full sm:w-auto px-8 py-4 bg-secondary text-black rounded-xl font-black shadow-lg shadow-secondary/10 hover:scale-105 active:scale-95 transition-all text-sm cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : 'Submit Deliverable'}
                    </button>
                  </div>
                </div>
              )}

              {normalizedStatus === 'in_review' && (
                <div className="bg-surface-container/10 backdrop-blur-md border border-outline-variant/10 p-6 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container/20 flex items-center justify-center text-secondary border border-outline-variant/10">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-on-surface text-sm uppercase tracking-widest">In Review</h4>
                      <p className="text-xs text-on-surface-variant">Waiting for Brand Approval</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {deal.contentUrl && (
                      <a href={deal.contentUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-secondary hover:underline">View Submission</a>
                    )}
                  </div>
                </div>
              )}
              
              {normalizedStatus === 'pending_clearance' && (
                <div className="bg-surface-container/10 backdrop-blur-md border border-teal-500/20 p-6 rounded-[1.5rem_0.5rem_1.5rem_0.5rem]">
                  <h4 className="font-black text-teal-400 uppercase text-xs tracking-widest mb-4">Approved by Brand</h4>
                  <p className="text-sm text-on-surface-variant">Waiting for Admin Payout Clearance. Funds will be transferred to your bank account shortly.</p>
                </div>
              )}

              {normalizedStatus === 'disputed' && (
                <div className="bg-error/10 backdrop-blur-md border border-error/20 p-6 rounded-[1.5rem_0.5rem_1.5rem_0.5rem]">
                  <h4 className="font-black text-error uppercase text-xs tracking-widest mb-4 flex items-center gap-2"><AlertCircle size={16} /> Deal Disputed</h4>
                  <p className="text-sm text-error/80 mb-2">Reason: {deal.disputeReason}</p>
                  <p className="text-sm text-on-surface-variant">Admin is reviewing this dispute. We will contact you soon.</p>
                </div>
              )}

              {normalizedStatus === 'completed' && (
                <div className="bg-surface-container/10 backdrop-blur-md border border-emerald-500/20 p-8 rounded-[2rem_0.5rem_2rem_0.5rem] text-left sm:text-center shadow-xl shadow-emerald-500/5 relative">
                  <div className="w-16 h-16 rounded-full bg-surface-container/20 flex items-center justify-center text-emerald-400 mb-4 sm:mx-auto border border-emerald-500/30">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="text-2xl font-black text-on-surface mb-2 tracking-tight">Success!</h4>
                  <p className="text-on-surface-variant font-medium">Collaboration complete. Your funds have been released.</p>
                </div>
              )}
            </div>
          )}

          {['in_progress', 'in_review', 'revision_requested'].includes(normalizedStatus) && (
            <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2 pt-2">
               {!isDeliverableSubmitted && (
                 <span className="text-[11px] text-on-surface-variant/60 font-semibold flex items-center gap-1">
                   <Clock size={12} className="text-on-surface-variant/40" /> Deliverables must be submitted before filing a dispute
                 </span>
               )}
               <button 
                 type="button"
                 disabled={!isDeliverableSubmitted}
                 onClick={() => {
                   if (isDeliverableSubmitted) setShowDisputeModal(true);
                 }}
                 title={!isDeliverableSubmitted ? "Dispute can only be filed after deliverables are submitted" : "File a dispute with admin mediation"}
                 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all ${
                   isDeliverableSubmitted 
                     ? 'text-error hover:underline cursor-pointer' 
                     : 'text-on-surface-variant/40 opacity-40 cursor-not-allowed select-none'
                 }`}
               >
                 <AlertCircle size={14} /> File Dispute
               </button>
            </div>
          )}

        </div>

        {/* Meta Sidebar Column */}
        <div className="flex flex-col gap-6">
          
          {/* 1. Deadlines / Countdowns UI */}
          {(() => {
            const dueDate = deal.deadline ? new Date(deal.deadline) : new Date(new Date(deal.createdAt || Date.now()).getTime() + 86400000 * 7);
            const autoReleaseDate = new Date(dueDate.getTime() + 86400000 * 7);
            const diffDays = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            return (
              <div className="bg-surface-container/5 backdrop-blur-md border border-outline-variant/10 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                    <Calendar size={14} className="text-secondary" /> Key Dates
                  </h4>
                  {currentRole === 'brand' && normalizedStatus !== 'completed' && normalizedStatus !== 'cancelled' && (
                    <button
                      onClick={openEditModal}
                      className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-secondary flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 size={11} /> Edit Date
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-on-surface-variant">Content Due</span>
                    <span className="text-xs font-black text-on-surface bg-surface-container/30 px-2 py-1 rounded-md">
                      {dueDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-on-surface-variant">Auto-Release</span>
                    <span className="text-xs font-black text-on-surface bg-surface-container/30 px-2 py-1 rounded-md">
                      {autoReleaseDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                {normalizedStatus === 'in_progress' && (
                  <div className="mt-4 bg-secondary/10 border border-secondary/20 p-3 rounded-xl flex items-start gap-3">
                    <Clock size={16} className="text-secondary mt-0.5 shrink-0" />
                    <p className="text-[11px] font-bold text-secondary leading-snug">
                      {diffDays <= 0 
                        ? 'Target deadline reached or delivery overdue.' 
                        : `${diffDays} day${diffDays > 1 ? 's' : ''} remaining to submit deliverables.`}
                    </p>
                  </div>
                )}
                {normalizedStatus === 'in_review' && (
                  <div className="mt-4 bg-primary/10 border border-primary/20 p-3 rounded-xl flex items-start gap-3">
                    <Clock size={16} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-[11px] font-bold text-primary leading-snug">
                      Brand has 3 days to review before auto-approval.
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 2. Interactive Deliverables Checklist */}
          <div className="bg-surface-container/5 backdrop-blur-md border border-outline-variant/10 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] p-5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
              <ListTodo size={14} className="text-secondary" /> Deliverables
            </h4>
            <div className="flex flex-col gap-3">
              {deal.originType === 'package' && deal.packageSnapshot ? (
                <div className="text-xs font-medium text-on-surface leading-relaxed">
                  {deal.packageSnapshot.description}
                </div>
              ) : (
                <>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked={normalizedStatus === 'completed'} disabled className="mt-0.5 accent-secondary" />
                    <span className="text-xs font-bold text-on-surface group-hover:text-secondary transition-colors">1x Dedicated TikTok Video (60s)</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked={normalizedStatus === 'completed'} disabled className="mt-0.5 accent-secondary" />
                    <span className="text-xs font-bold text-on-surface group-hover:text-secondary transition-colors">1x Instagram Story with Link</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked={normalizedStatus === 'completed'} disabled className="mt-0.5 accent-secondary" />
                    <span className="text-xs font-bold text-on-surface group-hover:text-secondary transition-colors">30 Days Usage Rights for Ads</span>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* 3. Partner Mini-Profile */}
          <div className="bg-surface-container/5 backdrop-blur-md border border-outline-variant/10 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] p-5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
              <UserSquare size={14} className="text-secondary" /> {currentRole === 'brand' ? 'Creator Profile' : 'Brand Profile'}
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-black font-black shadow-md shrink-0 overflow-hidden">
                {currentRole === 'brand' ? (
                  creatorAvatar ? <img src={creatorAvatar} alt={creatorName} className="w-full h-full object-cover" /> : creatorName.charAt(0).toUpperCase()
                ) : (
                  brandLogo ? <img src={brandLogo} alt={brandName} className="w-full h-full object-cover" /> : brandName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-black text-on-surface truncate">{currentRole === 'brand' ? creatorName : brandName}</h5>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">⭐ 4.9 • Verified Partnership</p>
              </div>
            </div>
          </div>

          {/* 4. Activity Log */}
          <div className="bg-surface-container/5 backdrop-blur-md border border-outline-variant/10 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] p-5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
              <Activity size={14} className="text-secondary" /> Activity Log
            </h4>
            <div className="flex flex-col gap-4 relative">
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-outline-variant/20 z-0"></div>
              
              <div className="flex gap-3 relative z-10">
                <div className="w-3 h-3 rounded-full bg-secondary ring-4 ring-surface shrink-0 mt-0.5"></div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Deal Initiated</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">{new Date(deal.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>

              {['in_progress', 'in_review', 'completed'].includes(normalizedStatus) && (
                <div className="flex gap-3 relative z-10">
                  <div className="w-3 h-3 rounded-full bg-secondary ring-4 ring-surface shrink-0 mt-0.5"></div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Payment Secured</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">System Verified</p>
                  </div>
                </div>
              )}

              {normalizedStatus === 'completed' && (
                <div className="flex gap-3 relative z-10">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-surface shrink-0 mt-0.5"></div>
                  <div>
                    <p className="text-xs font-bold text-emerald-400">Payment Released</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">{new Date(deal.updatedAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* DISPUTE MODAL */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant/20 rounded-[2rem] p-8 max-w-md w-full relative shadow-2xl">
            <h3 className="text-xl font-black text-error mb-2">File a Dispute</h3>
            <p className="text-sm text-on-surface-variant mb-6">If you are unable to resolve the issue with the other party, explain the problem below. Our admin team will arbitrate the resolution.</p>
            <textarea
              className="w-full bg-surface-container/20 border border-outline-variant/20 rounded-xl p-4 text-sm text-on-surface mb-6 outline-none focus:border-error/50 focus:ring-1 focus:ring-error/20 h-32 resize-none"
              placeholder="Explain the reason for dispute..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            ></textarea>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDisputeModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-on-surface bg-surface-container/20 hover:bg-surface-container transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button 
                disabled={loading || !disputeReason}
                onClick={() => handleAction('dispute', { reason: disputeReason })}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-error hover:bg-red-600 transition-colors text-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Submitting...' : 'Submit Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAUSE DEAL MODAL */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-amber-500/30 rounded-[2rem] p-8 max-w-md w-full relative shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Pause size={20} />
              </div>
              <h3 className="text-xl font-black text-on-surface">Pause Deal Collaboration</h3>
            </div>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              Putting the deal on hold freezes milestone expectations and deadlines. Ideal when waiting for physical product shipment or brief updates.
            </p>

            <div className="mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block mb-2">Quick Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Waiting for product delivery",
                  "Creative guidelines revision",
                  "Creator schedule / travel delay",
                  "Brief clarification needed"
                ].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setPauseReason(tag)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-surface-container/30 hover:bg-amber-500/20 text-on-surface-variant hover:text-amber-300 border border-outline-variant/15 transition-colors cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="w-full bg-surface-container/20 border border-outline-variant/20 rounded-xl p-4 text-sm text-on-surface mb-6 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 h-28 resize-none"
              placeholder="State reason for pause (e.g. tracking number, expected shipping date)..."
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
            ></textarea>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowPauseModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-on-surface bg-surface-container/20 hover:bg-surface-container transition-colors text-sm cursor-pointer"
              >
                Close
              </button>
              <button 
                disabled={loading}
                onClick={() => handleAction('pause', { reason: pauseReason })}
                className="flex-1 py-3 rounded-xl font-bold text-black bg-amber-400 hover:bg-amber-300 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {loading ? 'Pausing...' : <><Pause size={14} /> Pause Deal</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL DEAL MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-red-500/30 rounded-[2rem] p-8 max-w-md w-full relative shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                <XCircle size={20} />
              </div>
              <h3 className="text-xl font-black text-red-400">Cancel Collaboration</h3>
            </div>

            {['in_progress', 'paused'].includes(normalizedStatus) ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl mb-4 text-xs font-bold text-emerald-300 flex items-start gap-2.5">
                <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Escrow Protection Active:</strong> Cancelling will automatically refund 🪙{(displayBudget + Math.round(displayBudget * 0.05)).toLocaleString()} Coins (Deal Budget + 5% platform charge) back to the Brand's wallet balance.
                </span>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                This deal has not been funded yet and will be closed without financial impact.
              </p>
            )}

            <div className="mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block mb-2">Select Reason:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Mutual agreement",
                  "Product unavailable",
                  "Missed initial timeline",
                  "Scope mismatch"
                ].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setCancelReason(tag)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-surface-container/30 hover:bg-red-500/20 text-on-surface-variant hover:text-red-300 border border-outline-variant/15 transition-colors cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="w-full bg-surface-container/20 border border-outline-variant/20 rounded-xl p-4 text-sm text-on-surface mb-6 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/30 h-28 resize-none"
              placeholder="Why is this collaboration being cancelled?..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            ></textarea>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-on-surface bg-surface-container/20 hover:bg-surface-container transition-colors text-sm cursor-pointer"
              >
                Keep Deal Active
              </button>
              <button 
                disabled={loading}
                onClick={() => handleAction('cancel', { reason: cancelReason })}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-red-500/20"
              >
                {loading ? 'Cancelling...' : <><XCircle size={14} /> Confirm Cancel</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DEAL PARAMETERS MODAL (Brands only) */}
      {currentRole === 'brand' && showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant/20 rounded-[2rem] p-8 max-w-lg w-full relative shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-on-surface">Edit Deal Parameters</h3>
                  <p className="text-xs text-on-surface-variant">Update creative requirements, notes, and deadline</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface bg-surface-container/20 hover:bg-surface-container cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="text-xs font-bold text-on-surface mb-1.5 block">
                  Brand Requirements & Raw Video Assets (Google Drive Link)
                </label>
                <input
                  type="url"
                  value={editForm.brandAssetsUrl}
                  onChange={(e) => setEditForm(prev => ({ ...prev, brandAssetsUrl: e.target.value }))}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-3 bg-surface-container/20 border border-outline-variant/20 rounded-xl text-on-surface text-xs font-medium outline-none focus:border-secondary transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface mb-1.5 block">
                  Collaboration Notes & Deliverable Instructions
                </label>
                <textarea
                  value={editForm.dealNotes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, dealNotes: e.target.value }))}
                  placeholder="Specific talking points, hashtags to mention, lighting or audio guidelines..."
                  className="w-full bg-surface-container/20 border border-outline-variant/20 rounded-xl p-3 text-xs text-on-surface outline-none focus:border-secondary h-28 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface mb-1.5 block">
                  Target Delivery Deadline
                </label>
                <input
                  type="date"
                  value={editForm.deadline}
                  onChange={(e) => setEditForm(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-4 py-3 bg-surface-container/20 border border-outline-variant/20 rounded-xl text-on-surface text-xs font-medium outline-none focus:border-secondary transition-all cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-on-surface bg-surface-container/20 hover:bg-surface-container transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button 
                disabled={loading}
                onClick={() => handleAction('edit-details', editForm)}
                className="flex-1 py-3 rounded-xl font-black text-black bg-secondary hover:bg-secondary/90 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-secondary/20"
              >
                {loading ? 'Saving...' : <><Check size={16} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DealManager;
