import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import {
  ChevronLeft,
  CheckCircle,
  Send,
  AlertCircle,
  Building,
  User,
  ExternalLink,
  Target,
  Zap,
  TrendingUp,
  Briefcase,
  ClipboardList,
  ListChecks,
  ArrowUpRight,
  Clock,
  Edit3,
  Trash2,
  PauseCircle,
  PlayCircle,
  X,
  Check,
  Loader2,
  ShieldAlert,
  AlertTriangle,
  Flag
} from "lucide-react";

const NICHES = ['Tech', 'Lifestyle', 'Fashion', 'Food', 'Travel', 'Gaming', 'Beauty', 'Finance', 'Health', 'Other'];

const CampaignDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [applications, setApplications] = useState([]);
  const [applyMessage, setApplyMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/campaigns/${id}`);
        setCampaign(res.data);

        // If brand, fetch applications for this campaign
        if (user?.role === "brand") {
          const appsRes = await axios.get(`/applications/brand/${id}`);
          setApplications(appsRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (submitLoading) return;
    setSubmitLoading(true);
    setStatus({ type: "", text: "" });
    try {
      await axios.post("/applications", {
        campaignId: id,
        message: applyMessage,
      });
      setStatus({ type: "success", text: "Application sent successfully! Redirecting to applications..." });
      setApplyMessage("");
      setTimeout(() => {
        navigate("/creator-dashboard?tab=applications");
      }, 1200);
    } catch (err) {
      setStatus({
        type: "error",
        text: err.response?.data?.message || "Failed to apply.",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    niche: "Tech",
    budget: "",
    requirements: "",
    status: "active",
    description: ""
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const isOwner = user?.role === "brand" && (
    applications !== null || 
    String(campaign?.brandId?._id || campaign?.brandId || "") === String(user?.profileId || user?.brandId || "")
  );

  const handleOpenEdit = () => {
    if (!campaign) return;
    setEditForm({
      title: campaign.title || "",
      niche: campaign.niche || "Tech",
      budget: campaign.budget || "",
      requirements: Array.isArray(campaign.requirements) ? campaign.requirements.join(", ") : (campaign.requirements || ""),
      status: campaign.status || "active",
      description: campaign.description || ""
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim() || !editForm.budget) return;

    setIsSavingEdit(true);
    try {
      const payload = {
        title: editForm.title.trim(),
        niche: editForm.niche,
        budget: Number(editForm.budget),
        requirements: editForm.requirements.split(",").map(r => r.trim()).filter(Boolean),
        status: editForm.status,
        description: editForm.description.trim()
      };
      const res = await axios.put(`/campaigns/${id}`, payload);
      setCampaign(res.data.campaign);
      setStatus({ type: "success", text: "Campaign updated successfully!" });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: err.response?.data?.message || "Failed to update campaign." });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleStatus = async (targetStatus = null) => {
    if (!campaign) return;
    setIsTogglingStatus(true);
    try {
      const newStatus = targetStatus || (campaign.status === "active" ? "paused" : "active");
      const res = await axios.patch(`/campaigns/${id}/status`, { status: newStatus });
      setCampaign(res.data.campaign);
      setStatus({ type: "success", text: `Campaign is now ${newStatus.toUpperCase()}` });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: err.response?.data?.message || "Failed to change campaign status." });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      await axios.delete(`/campaigns/${id}`);
      navigate("/brand-dashboard?tab=campaigns");
    } catch (err) {
      console.error(err);
      setDeleteError(err.response?.data?.message || "Failed to delete campaign.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
      </div>
    );

  if (!campaign)
    return (
      <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center justify-center text-gray-500">
        <Zap size={64} className="mb-6 opacity-20" />
        <p className="text-xl font-bold tracking-tight text-gray-900">Mission Not Found</p>
        <Link to="/campaigns" className="mt-8 text-black font-bold uppercase text-xs tracking-widest hover:underline">Return to Discovery Console</Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 font-sans pb-12 overflow-x-hidden selection:bg-black selection:text-white">
      <div className="max-w-6xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <Link to="/campaigns" className="inline-flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-gray-900 uppercase tracking-widest mb-8 transition-colors group">
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> BACK TO GLOBAL DISCOVERY
        </Link>
        
        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-gray-100/50 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
          
          {/* Logo Block */}
          <div className="w-32 h-32 sm:w-36 sm:h-36 bg-[#0B1014] rounded-full flex items-center justify-center shrink-0 shadow-lg relative p-2 overflow-hidden group">
            {campaign.brandId?.logo ? (
              <img src={campaign.brandId.logo} alt="Brand Logo" className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-inner"></div>
            )}
            <div className="absolute bottom-2 right-2 bg-black text-white p-1.5 rounded-full border-[3px] border-white shadow-sm z-10">
              <CheckCircle size={14}/>
            </div>
          </div>
          
          {/* Hero Info */}
          <div className="flex flex-col gap-4 flex-1 text-center md:text-left justify-center pt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900">{campaign.title}</h1>
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border self-center flex items-center gap-1.5 ${
                  campaign.status === 'active' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                    : campaign.status === 'paused'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    campaign.status === 'active' ? 'bg-emerald-500 animate-pulse' : campaign.status === 'paused' ? 'bg-amber-500' : 'bg-gray-400'
                  }`} />
                  {campaign.status}
                </span>
              </div>

              {/* Owner Action Buttons Toolbar */}
              {isOwner && (
                <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
                  <button
                    onClick={() => handleToggleStatus()}
                    disabled={isTogglingStatus}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 border cursor-pointer ${
                      campaign.status === 'active'
                        ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {isTogglingStatus ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : campaign.status === 'active' ? (
                      <PauseCircle size={14} />
                    ) : (
                      <PlayCircle size={14} />
                    )}
                    {campaign.status === 'active' ? 'Pause' : 'Activate'}
                  </button>

                  <button
                    onClick={handleOpenEdit}
                    className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Edit3 size={14} /> Edit
                  </button>

                  <button
                    onClick={() => { setDeleteError(''); setIsDeleteModalOpen(true); }}
                    className="px-3 py-2 rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
              <Link to={`/brands/${campaign.brandId?._id}`} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors rounded-md text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                {campaign.brandId?.businessName || "Brand Partner"} <ExternalLink size={12}/>
              </Link>
              <div className="flex items-center gap-2 px-3 py-2 bg-[#111827] rounded-md text-[10px] font-bold text-white uppercase tracking-widest shadow-sm">
                <Briefcase size={14}/> BUDGET: 🪙{campaign.budget?.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                <Target size={14}/> {campaign.niche}
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-md text-[10px] font-bold uppercase tracking-widest border border-purple-100">
                <User size={14}/> 1 CREATOR
              </div>
            </div>
          </div>

        </div>

        {/* Paused / Inactive Banner Alert */}
        {campaign.status === 'paused' && (
          <div className="mb-8 p-5 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-amber-900 animate-reveal-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
                <PauseCircle size={22} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider">Mission Status: Paused</p>
                <p className="text-xs text-amber-700/90 font-medium mt-0.5">
                  {isOwner 
                    ? "This mission is currently hidden from creator discovery and not accepting new proposals. You can reactivate it at any time."
                    : "This campaign is temporarily paused by the brand. Applications are closed."}
                </p>
              </div>
            </div>
            {isOwner && (
              <button
                onClick={() => handleToggleStatus('active')}
                disabled={isTogglingStatus}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isTogglingStatus ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
                Activate Mission
              </button>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
            
            {/* Mission Brief Card */}
            <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-gray-100/50 overflow-hidden relative p-8 sm:p-10">
              <div className="absolute left-0 top-10 bottom-10 w-1.5 bg-[#007A8A] rounded-r-md opacity-80"></div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <ClipboardList className="text-[#007A8A]" size={24} strokeWidth={2.5} /> Mission Brief
              </h2>
              <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                {campaign.description}
              </p>
            </div>

            {/* Requirements Matrix Card */}
            <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-gray-100/50 p-8 sm:p-10">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3 mb-8">
                <ListChecks className="text-[#007A8A]" size={24} strokeWidth={2.5} /> Requirements Matrix
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {campaign.requirements?.map((req, idx) => (
                  <div key={idx} className="bg-[#f9fafb] border border-gray-100 rounded-2xl p-6 flex items-start gap-4 transition-all hover:bg-gray-50 hover:shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                      0{idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1.5">{req.split(':')[0] || 'Requirement Component'}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">{req}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand View: Talent Pipeline */}
            {user?.role === 'brand' && (String(campaign.brandId?._id || campaign.brandId || '') === String(user.profileId || '')) && (
              <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-gray-100/50 p-8 sm:p-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <User className="text-[#007A8A]" size={24} /> Talent Pipeline
                  </h2>
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                    {applications.length} Applications
                  </span>
                </div>

                <div className="flex flex-col gap-6">
                  {applications.length > 0 ? (
                    applications.map((app) => (
                      <div key={app._id} className="bg-[#f9fafb] border border-gray-100 rounded-2xl p-6 hover:shadow-sm transition-all">
                        <div className="flex justify-between items-start mb-6">
                          <Link to={`/creators/${app.creatorId?._id}`} className="flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-gray-200 rounded-xl overflow-hidden shadow-sm">
                              {app.creatorId?.profilePicture ? (
                                <img src={app.creatorId.profilePicture} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={20}/></div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {app.creatorId?.name || "Premium Talent"}
                              </h4>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                Status: {app.status}
                              </span>
                            </div>
                          </Link>
                          <Link to={`/creators/${app.creatorId?._id}`} className="text-gray-400 hover:text-gray-900 transition-colors">
                            <ArrowUpRight size={18} />
                          </Link>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed italic mb-6 pl-4 border-l-2 border-gray-300">
                          "{app.message}"
                        </p>

                        {app.status === "pending" && (
                          <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => updateAppStatus(app._id, "accepted")} className="bg-[#111827] text-white py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-sm">
                              Accept Application
                            </button>
                            <button onClick={() => updateAppStatus(app._id, "rejected")} className="bg-white border border-gray-200 text-gray-600 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 hover:text-red-600 transition-colors">
                              Reject
                            </button>
                          </div>
                        )}

                        {app.status === "accepted" && (
                          <div className="flex flex-col gap-3">
                            <div className="bg-amber-50 text-amber-900 px-4 py-3.5 rounded-xl border border-amber-200 text-xs font-bold flex items-center gap-2">
                              <Clock size={16} className="text-amber-600 shrink-0" />
                              <span>Application Accepted! Payment required to activate deal.</span>
                            </div>
                            <Link to="/brand-dashboard?tab=deals" className="w-full bg-[#EA580C] hover:bg-orange-600 text-white text-center py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm flex items-center justify-center gap-1.5">
                              Go to Active Deals to Pay & Fund Escrow <ArrowUpRight size={14} />
                            </Link>
                          </div>
                        )}

                        {app.status === "confirmed_by_creator" && (
                          <div className="flex flex-col gap-3">
                            <div className="bg-amber-50 text-amber-900 px-4 py-3.5 rounded-xl border border-amber-200 text-xs font-bold flex items-center gap-2">
                              <CheckCircle size={16} className="text-amber-600 shrink-0" />
                              <span>Collaboration Confirmed! Payment required to start deal.</span>
                            </div>
                            <Link to="/brand-dashboard?tab=deals" className="w-full bg-[#EA580C] hover:bg-orange-600 text-white text-center py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm flex items-center justify-center gap-1.5">
                              Go to Active Deals to Pay & Fund Escrow <ArrowUpRight size={14} />
                            </Link>
                          </div>
                        )}

                        {app.status === "rejected" && (
                          <div className="bg-red-50 text-red-700 px-4 py-3.5 rounded-xl border border-red-100 text-xs font-bold">
                            Rejected Application
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                      <Briefcase size={32} className="text-gray-300 mb-3" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pipeline Empty</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8">
            
            {/* Apply / Command Card */}
            <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-gray-100/50 p-6 sm:p-8 sticky top-6">
              {isOwner ? (
                /* BRAND COMMAND DECK */
                <div className="flex flex-col gap-6 text-left">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      Mission Control <Zap size={18} className="text-[#EA580C]" fill="currentColor" />
                    </h2>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-gray-100 text-gray-600">
                      Brand Owner
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold uppercase tracking-wider">Live Status</span>
                      <span className={`font-black uppercase text-xs px-2.5 py-0.5 rounded-full ${
                        campaign.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold uppercase tracking-wider">Applicants</span>
                      <span className="font-black text-gray-900 text-sm">{applications.length} creators</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={() => handleToggleStatus()}
                      disabled={isTogglingStatus}
                      className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm border cursor-pointer ${
                        campaign.status === 'active'
                          ? 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800'
                          : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isTogglingStatus ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : campaign.status === 'active' ? (
                        <PauseCircle size={16} />
                      ) : (
                        <PlayCircle size={16} />
                      )}
                      {campaign.status === 'active' ? 'Pause Mission' : 'Activate Mission'}
                    </button>

                    <button
                      onClick={handleOpenEdit}
                      className="w-full py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      <Edit3 size={16} /> Edit Parameters
                    </button>

                    <button
                      onClick={() => { setDeleteError(''); setIsDeleteModalOpen(true); }}
                      className="w-full py-3 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <Trash2 size={15} /> Delete Campaign
                    </button>
                  </div>
                </div>
              ) : (
                /* CREATOR / VISITOR APPLICATION FORM */
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-8">
                    Apply for Mission <Zap size={18} className="text-[#3b82f6]" fill="currentColor" />
                  </h2>
                  
                  {!user ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 font-medium mb-6">Authenticate to explore full campaign intelligence and apply.</p>
                      <Link to="/login" className="w-full bg-[#111827] text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-md hover:bg-black transition-all">
                        Access Marketplace
                      </Link>
                    </div>
                  ) : user.role === 'creator' && campaign.status === 'active' ? (
                    <form onSubmit={handleApply} className="flex flex-col gap-5">
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-3 pl-1">Proposal Details</label>
                        <textarea 
                          value={applyMessage} onChange={e => setApplyMessage(e.target.value)} required
                          placeholder="Detail your strategic fit, engagement metrics, and proposed execution strategy for the campaign..."
                          className="w-full h-40 bg-[#f9fafb] border border-gray-200 rounded-2xl p-5 text-sm text-gray-700 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none placeholder:text-gray-400 font-medium leading-relaxed"
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={submitLoading} 
                        className="w-full bg-[#111827] hover:bg-black text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-colors shadow-md group disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {submitLoading ? (
                          <>Applying...</>
                        ) : (
                          <>
                            <Send size={14} className="group-hover:translate-x-1 transition-transform" /> Dispatch Application
                          </>
                        )}
                      </button>
                      
                      {status.text && (
                        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 mt-2 ${status.type==='success'?'bg-green-50 text-green-700 border border-green-100':'bg-red-50 text-red-700 border border-red-100'}`}>
                          {status.type==='success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>} {status.text}
                        </div>
                      )}
                      
                      <div className="mt-4 border-t border-gray-100 pt-5">
                        <p className="text-[9px] text-gray-400 text-center font-bold uppercase tracking-widest leading-relaxed">
                          Our team typically reviews applications within 48 hours.
                        </p>
                      </div>
                    </form>
                  ) : user.role === 'creator' ? (
                    <div className="text-center py-6 bg-amber-50 rounded-2xl border border-amber-200">
                      <PauseCircle size={32} className="mx-auto text-amber-500 mb-2" />
                      <p className="text-xs text-amber-800 font-bold uppercase tracking-widest">Applications Paused</p>
                      <p className="text-[11px] text-amber-600 mt-1 font-medium">The brand is not currently taking new applications for this campaign.</p>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest p-6">Brand accounts cannot apply to missions.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Campaign Overview Card */}
            <div className="bg-[#111827] rounded-3xl p-6 sm:p-8 relative overflow-hidden text-white shadow-2xl border border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg text-white tracking-tight">Campaign Overview</h2>
                <TrendingUp size={18} className="text-gray-400" />
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center text-sm border-b border-gray-800/80 pb-3">
                  <span className="text-gray-400 font-bold tracking-wide">Creator Needed</span>
                  <span className="font-black text-white text-base">1 Creator</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-gray-800/80 pb-3">
                  <span className="text-gray-400 font-bold tracking-wide">Collaboration Type</span>
                  <span className="font-bold text-[#EA580C] text-xs uppercase tracking-wider">1-on-1 Exclusive</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-gray-800/80 pb-3">
                  <span className="text-gray-400 font-bold tracking-wide">Campaign Status</span>
                  <span className="font-black text-emerald-400 uppercase text-xs tracking-wider">{campaign.status}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold tracking-wide">Escrow Protection</span>
                  <span className="font-bold text-blue-400 text-xs uppercase tracking-wider">100% Guaranteed</span>
                </div>
              </div>
            </div>

          </div>

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
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#EA580C]">
                    <Edit3 size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 tracking-tight">Edit Campaign</h3>
                    <p className="text-[11px] font-bold text-gray-400">Modify title, budget, deliverables, or status.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4 text-left">
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
                  />
                </div>

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
                      <option value="active">🟢 Active</option>
                      <option value="paused">🟡 Paused</option>
                      <option value="inactive">⚪ Inactive</option>
                      <option value="completed">🔵 Completed</option>
                    </select>
                  </div>
                </div>

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
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1.5">
                    Required Deliverables (comma-separated)
                  </label>
                  <input 
                    type="text" 
                    value={editForm.requirements} 
                    onChange={e => setEditForm({ ...editForm, requirements: e.target.value })} 
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors font-medium" 
                    placeholder="e.g. 2 Reels, 1 Story"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1.5">
                    Creative Brief & Expectations
                  </label>
                  <textarea 
                    rows={4}
                    value={editForm.description} 
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })} 
                    className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors font-medium resize-none" 
                  />
                </div>

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
                Are you sure you want to permanently delete this campaign? All applicant records will be removed. This cannot be undone.
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
    </div>
  );
};

export default CampaignDetail;
