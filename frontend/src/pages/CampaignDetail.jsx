import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Clock
} from "lucide-react";

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

  const updateAppStatus = async (appId, newStatus) => {
    try {
      await axios.put(`/applications/${appId}/status`, { status: newStatus });
      // Refresh applications list
      const appsRes = await axios.get(`/applications/brand/${id}`);
      setApplications(appsRes.data);
    } catch (err) {
      console.error(err);
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
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-center md:justify-start">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900">{campaign.title}</h1>
              <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-md border border-green-100 self-center">
                {campaign.status}
              </span>
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
            
            {/* Apply for Mission Card */}
            <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-gray-100/50 p-6 sm:p-8 sticky top-6">
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
                <div className="text-center py-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest p-6">This campaign is no longer active.</p>
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest p-6">Brand accounts cannot apply to missions.</p>
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
    </div>
  );
};

export default CampaignDetail;
