import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  X, 
  ArrowRight, 
  SlidersHorizontal, 
  Briefcase, 
  Edit3, 
  Trash2, 
  PlayCircle, 
  PauseCircle, 
  AlertTriangle, 
  Check, 
  Sparkles,
  ShieldAlert,
  Loader2,
  Calendar,
  Layers,
  Flag
} from 'lucide-react';
import axios from '../../utils/axios';

const NICHES = ['Tech', 'Lifestyle', 'Fashion', 'Food', 'Travel', 'Gaming', 'Beauty', 'Finance', 'Health', 'Other'];

const BrandCampaigns = (props) => {
  const { 
    campaigns = [], 
    setCampaigns,
    campaignFilter = 'All', 
    setCampaignFilter, 
    campaignSearch = '', 
    setCampaignSearch, 
    setActiveTab, 
    showToast,
    onRefreshCampaigns,
    user
  } = props;

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    niche: 'Tech',
    budget: '',
    requirements: '',
    status: 'active',
    description: ''
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCampaign, setDeletingCampaign] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Status Toggle Loading State per campaign id
  const [togglingId, setTogglingId] = useState(null);

  // Status Filter Counts
  const counts = {
    All: campaigns.length,
    Active: campaigns.filter(c => c.status === 'active').length,
    Paused: campaigns.filter(c => c.status === 'paused').length,
    Inactive: campaigns.filter(c => c.status === 'inactive').length,
  };

  // Open Edit Modal
  const handleOpenEdit = (camp) => {
    setEditingCampaign(camp);
    setEditForm({
      title: camp.title || '',
      niche: camp.niche || 'Tech',
      budget: camp.budget || '',
      requirements: Array.isArray(camp.requirements) ? camp.requirements.join(', ') : (camp.requirements || ''),
      status: camp.status || 'active',
      description: camp.description || ''
    });
    setIsEditModalOpen(true);
  };

  // Save Campaign Edits
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCampaign) return;

    if (!editForm.title.trim()) {
      showToast?.('Please enter a campaign title.', 'error');
      return;
    }
    if (!editForm.budget || Number(editForm.budget) <= 0) {
      showToast?.('Please specify a valid campaign budget.', 'error');
      return;
    }

    setIsSavingEdit(true);
    try {
      const payload = {
        title: editForm.title.trim(),
        niche: editForm.niche,
        budget: Number(editForm.budget),
        requirements: editForm.requirements.split(',').map(r => r.trim()).filter(Boolean),
        status: editForm.status,
        description: editForm.description.trim()
      };

      const res = await axios.put(`/campaigns/${editingCampaign._id}`, payload);
      const updated = res.data.campaign;

      // Update local campaigns list
      if (setCampaigns) {
        setCampaigns(prev => prev.map(c => c._id === updated._id ? { ...c, ...updated } : c));
      }
      if (onRefreshCampaigns) {
        await onRefreshCampaigns();
      }

      showToast?.('Campaign updated successfully!', 'success');
      setIsEditModalOpen(false);
      setEditingCampaign(null);
    } catch (err) {
      console.error(err);
      showToast?.(err.response?.data?.message || 'Failed to update campaign.', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Toggle Campaign Status (Active <-> Paused / Inactive)
  const handleToggleStatus = async (camp, targetStatus = null) => {
    setTogglingId(camp._id);
    try {
      const newStatus = targetStatus || (camp.status === 'active' ? 'paused' : 'active');
      const res = await axios.patch(`/campaigns/${camp._id}/status`, { status: newStatus });
      const updated = res.data.campaign;

      if (setCampaigns) {
        setCampaigns(prev => prev.map(c => c._id === updated._id ? { ...c, ...updated } : c));
      }
      if (onRefreshCampaigns) {
        await onRefreshCampaigns();
      }

      showToast?.(`Campaign is now ${newStatus.toUpperCase()}`, 'success');
    } catch (err) {
      console.error(err);
      showToast?.(err.response?.data?.message || 'Failed to update campaign status.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // Open Delete Confirmation
  const handleOpenDelete = (camp) => {
    setDeletingCampaign(camp);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete Campaign
  const handleConfirmDelete = async () => {
    if (!deletingCampaign) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await axios.delete(`/campaigns/${deletingCampaign._id}`);

      if (setCampaigns) {
        setCampaigns(prev => prev.filter(c => c._id !== deletingCampaign._id));
      }
      if (onRefreshCampaigns) {
        await onRefreshCampaigns();
      }

      showToast?.('Campaign deleted successfully.', 'success');
      setIsDeleteModalOpen(false);
      setDeletingCampaign(null);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to delete campaign.';
      setDeleteError(errMsg);
      showToast?.(errMsg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(c => {
    if (campaignFilter === 'All') return true;
    if (campaignFilter === 'Active') return c.status === 'active';
    if (campaignFilter === 'Paused') return c.status === 'paused';
    if (campaignFilter === 'Inactive') return c.status === 'inactive';
    return true;
  }).filter(c => 
    c.title?.toLowerCase().includes(campaignSearch.toLowerCase()) || 
    c.niche?.toLowerCase().includes(campaignSearch.toLowerCase()) ||
    c.description?.toLowerCase().includes(campaignSearch.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col animate-reveal-up pb-24 md:pb-8 text-left">
        {/* Search & Header Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="flex-1 flex items-center gap-3 bg-white border border-gray-200 rounded-2xl p-3.5 shadow-sm shadow-black/5">
            <Search className="text-gray-400 shrink-0" size={18} />
            <input 
              type="text" 
              placeholder="Search campaigns by title, niche, or keywords..." 
              value={campaignSearch} 
              onChange={(e) => setCampaignSearch(e.target.value)} 
              className="bg-transparent border-none outline-none text-gray-900 font-semibold w-full placeholder:text-gray-400 text-sm" 
            />
            {campaignSearch && (
              <button onClick={() => setCampaignSearch('')} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={16} />
              </button>
            )}
          </div>

          {/* New Campaign Button */}
          <button 
            onClick={() => setActiveTab('create')} 
            className="px-6 py-3.5 rounded-2xl bg-[#EA580C] hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} /> New Campaign
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex border-b border-gray-200 mb-6 w-full overflow-x-auto hide-scrollbar gap-2 sm:gap-4">
          {[
            { id: 'All', label: 'All Campaigns', count: counts.All },
            { id: 'Active', label: 'Active', count: counts.Active },
            { id: 'Paused', label: 'Paused', count: counts.Paused },
            { id: 'Inactive', label: 'Inactive', count: counts.Inactive }
          ].map(tab => {
            const isActive = campaignFilter === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => setCampaignFilter(tab.id)} 
                className={`pb-3.5 px-3 text-sm font-black uppercase tracking-wider relative transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive ? 'text-gray-900 font-black' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
                {isActive && (
                  <motion.div layoutId="campaignFilterUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA580C]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Campaign Cards List */}
        <div className="flex flex-col gap-5">
          {filteredCampaigns.map((camp) => {
            const budgetValue = camp.budget || 0;
            const isPaused = camp.status === 'paused';
            const isInactive = camp.status === 'inactive';
            const isActive = camp.status === 'active';
            const isTogglingThis = togglingId === camp._id;

            return (
              <div 
                key={camp._id} 
                className={`bg-white p-6 rounded-3xl border transition-all duration-200 shadow-sm hover:shadow-md relative overflow-hidden flex flex-col gap-4 ${
                  isPaused 
                    ? 'border-amber-200 bg-amber-500/[0.02]' 
                    : isInactive 
                    ? 'border-gray-200 opacity-80' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Header row: Niche, Status Pill & Budget */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Flag size={12} className="text-[#EA580C]" />
                      {camp.niche || 'GENERAL'}
                    </span>

                    {/* Status Badge */}
                    {isActive && (
                      <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        ACTIVE
                      </span>
                    )}
                    {isPaused && (
                      <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        PAUSED
                      </span>
                    )}
                    {isInactive && (
                      <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        INACTIVE
                      </span>
                    )}
                    {camp.status === 'completed' && (
                      <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-wider">
                        COMPLETED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mr-1">Budget</span>
                    <span className="text-xl font-black text-gray-900 font-display flex items-center gap-1">
                      <span>🪙</span>
                      <span>{budgetValue.toLocaleString()}</span>
                    </span>
                  </div>
                </div>

                {/* Campaign Title & Description */}
                <div>
                  <h4 className="font-black text-gray-900 text-lg leading-tight tracking-tight">
                    {camp.title}
                  </h4>
                  <p className="text-gray-500 text-xs font-medium mt-2 leading-relaxed line-clamp-3">
                    {camp.description || 'No detailed campaign overview provided.'}
                  </p>
                </div>

                {/* Requirements / Deliverables Chips */}
                {camp.requirements && camp.requirements.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Deliverables:</span>
                    {camp.requirements.map((req, rIdx) => (
                      <span key={rIdx} className="px-2.5 py-1 rounded-md bg-gray-50 text-gray-700 border border-gray-200 text-[10px] font-bold">
                        {req}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons Toolbar */}
                <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-gray-100 mt-1">
                  {/* Primary Link: View & Applications */}
                  <Link 
                    to={`/campaigns/${camp._id}`}
                    className="flex-1 sm:flex-initial px-5 py-3 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                  >
                    View & Applications <ArrowRight size={14} className="rotate-[-45deg]" />
                  </Link>

                  {/* Quick Status Toggle Button */}
                  {isActive ? (
                    <button 
                      onClick={() => handleToggleStatus(camp, 'paused')}
                      disabled={isTogglingThis}
                      title="Pause this campaign so creators cannot apply"
                      className="px-4 py-3 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isTogglingThis ? <Loader2 size={14} className="animate-spin" /> : <PauseCircle size={15} />}
                      Pause
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleToggleStatus(camp, 'active')}
                      disabled={isTogglingThis}
                      title="Activate this campaign so creators can discover and apply"
                      className="px-4 py-3 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isTogglingThis ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={15} />}
                      Activate
                    </button>
                  )}

                  {/* Edit Campaign Button */}
                  <button 
                    onClick={() => handleOpenEdit(camp)}
                    className="px-4 py-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Edit3 size={15} /> Edit
                  </button>

                  {/* Delete Campaign Button */}
                  <button 
                    onClick={() => handleOpenDelete(camp)}
                    title="Delete Campaign"
                    className="px-3.5 py-3 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            );
          })}

          {filteredCampaigns.length === 0 && (
            <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#EA580C] mb-4">
                <Briefcase size={26} />
              </div>
              <h3 className="font-black text-gray-900 text-base uppercase tracking-wider">No Campaigns Found</h3>
              <p className="text-gray-400 text-xs font-medium mt-1 max-w-sm">
                {campaignSearch 
                  ? `No campaigns match "${campaignSearch}". Try a different search query.` 
                  : campaignFilter !== 'All' 
                  ? `You have no ${campaignFilter.toLowerCase()} campaigns right now.`
                  : "You haven't launched any campaigns yet. Create your first campaign to connect with top creators."}
              </p>
              <button 
                onClick={() => setActiveTab('create')} 
                className="mt-5 px-5 py-2.5 bg-[#EA580C] hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
              >
                Create Campaign
              </button>
            </div>
          )}
        </div>
      </div>

      {/* EDIT CAMPAIGN MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }} 
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#EA580C]">
                    <Edit3 size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 tracking-tight">Edit Campaign</h3>
                    <p className="text-[11px] font-bold text-gray-400">Update parameters, budget, status, or creative brief.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4 text-left">
                {/* Title */}
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1.5">
                    Campaign Title <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={editForm.title} 
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })} 
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors font-medium" 
                    placeholder="e.g. Summer Flagship Product Review"
                  />
                </div>

                {/* Niche & Status Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1.5">
                      Content Niche
                    </label>
                    <select 
                      value={editForm.niche} 
                      onChange={e => setEditForm({ ...editForm, niche: e.target.value })} 
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors font-medium cursor-pointer"
                    >
                      {NICHES.map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1.5">
                      Status
                    </label>
                    <select 
                      value={editForm.status} 
                      onChange={e => setEditForm({ ...editForm, status: e.target.value })} 
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors font-medium cursor-pointer"
                    >
                      <option value="active">🟢 Active (Open for Discovery)</option>
                      <option value="paused">🟡 Paused (Hidden from Discovery)</option>
                      <option value="inactive">⚪ Inactive / Closed</option>
                      <option value="completed">🔵 Completed</option>
                    </select>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1.5">
                    Campaign Budget (🪙 Coins) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">🪙</span>
                    <input 
                      type="number" 
                      required 
                      min="1"
                      value={editForm.budget} 
                      onChange={e => setEditForm({ ...editForm, budget: e.target.value })} 
                      className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors font-bold" 
                      placeholder="e.g. 25000"
                    />
                  </div>
                </div>

                {/* Deliverables / Requirements */}
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1.5">
                    Required Deliverables (comma-separated)
                  </label>
                  <input 
                    type="text" 
                    value={editForm.requirements} 
                    onChange={e => setEditForm({ ...editForm, requirements: e.target.value })} 
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors font-medium" 
                    placeholder="e.g. 2 Instagram Reels, 1 YouTube Short, Dedicated Story"
                  />
                  <p className="text-[11px] text-gray-400 font-medium mt-1">Separate individual deliverables with commas.</p>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1.5">
                    Creative Brief & Expectations
                  </label>
                  <textarea 
                    rows={4}
                    value={editForm.description} 
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })} 
                    className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors font-medium resize-none" 
                    placeholder="Describe your brand guidelines, key messaging points, and deliverable timeline..."
                  />
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-black uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSavingEdit}
                    className="px-6 py-3 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSavingEdit ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Check size={14} /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }} 
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 p-6 text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4">
                <ShieldAlert size={24} />
              </div>

              <h3 className="text-lg font-black text-gray-900 tracking-tight">Delete Campaign?</h3>
              <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
                Are you sure you want to permanently delete <span className="font-bold text-gray-900">"{deletingCampaign?.title}"</span>? All creator applications linked to this campaign will also be removed.
              </p>

              {deleteError && (
                <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-medium flex items-start gap-2.5">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} /> Delete Forever
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BrandCampaigns;
