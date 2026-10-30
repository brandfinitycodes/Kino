import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target, ArrowUpRight, Building2, Wallet, User, Clock, Zap, X, Send, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { optimizeImage } from '../utils/imageKit';

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

const CampaignCard = ({ campaign }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showPitch, setShowPitch] = useState(false);
  const [pitchMessage, setPitchMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pitchError, setPitchError] = useState('');
  const [pitchSent, setPitchSent] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Safe requirements normalizer (prevents string slice ["M", "u"] bug)
  const normalizedRequirements = useMemo(() => {
    if (Array.isArray(campaign?.requirements)) {
      return campaign.requirements.filter(r => typeof r === 'string' && r.trim().length > 0);
    }
    if (typeof campaign?.requirements === 'string' && campaign.requirements.trim()) {
      return campaign.requirements.split(',').map(r => r.trim()).filter(Boolean);
    }
    return [];
  }, [campaign?.requirements]);

  const isNew = campaign?.createdAt && (new Date() - new Date(campaign.createdAt) < 3 * 24 * 60 * 60 * 1000);

  const handleOpenPitch = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'brand') {
      alert('Only creators can submit pitches to campaigns.');
      return;
    }
    setPitchError('');
    setShowPitch(true);
  };

  const handlePitchSubmit = async (e) => {
    e.preventDefault();
    if (!pitchMessage.trim() || isSubmitting) return;

    if (user?.role === 'creator' && user?.kycStatus !== 'APPROVED') {
      setPitchError('Identity verification is required before pitching. Please complete KYC verification first.');
      return;
    }

    setIsSubmitting(true);
    setPitchError('');

    try {
      await axios.post('/applications', {
        campaignId: campaign._id,
        message: pitchMessage.trim()
      });
      setPitchSent(true);
      setTimeout(() => {
        setShowPitch(false);
        setPitchSent(false);
        setPitchMessage('');
      }, 2000);
    } catch (err) {
      setPitchError(err.response?.data?.message || 'Failed to submit proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/campaigns/${campaign._id}`)}
      className="group relative bg-white rounded-[32px] p-3 hover:bg-white transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 overflow-hidden flex flex-col h-full border border-gray-100 cursor-pointer"
    >
      {/* Premium Image Header */}
      <div className="relative h-56 w-full rounded-[24px] overflow-hidden mb-5 bg-[#EA580C]">
        <img
          loading="lazy"
          src={getPlaceholderImage(campaign.niche || campaign.category)}
          alt={campaign.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100"
        />

        {/* Brand Logo Float with Error Fallback */}
        <div className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl overflow-hidden z-10">
          {campaign.brandId?.logo && !logoError ? (
            <img
              loading="lazy"
              src={optimizeImage(campaign.brandId.logo, { width: 120, quality: 80 })}
              alt={campaign.brandId?.businessName || 'Brand'}
              onError={() => setLogoError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <Building2 size={20} className="text-white drop-shadow-md" />
          )}
        </div>

        {/* Authentic Status Badge */}
        <div className="absolute top-16 left-4 z-10 flex flex-col gap-2 pointer-events-none">
          {isNew && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
              <Clock size={12} className="text-emerald-400" /> Just Added
            </span>
          )}
          {campaign.status === 'active' && !isNew && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
              <Zap size={12} className="text-indigo-300" /> Active
            </span>
          )}
        </div>

        {/* Darker Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

        {/* Budget on Image */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10">
          <div className="flex flex-col">
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-black mb-1">Campaign Budget</span>
            <span className="text-3xl font-display font-black text-white flex items-center gap-2">
              <Wallet size={20} className="text-[#eb4898]" /> 🪙{campaign.budget?.toLocaleString() || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Premium Content */}
      <div className="px-3 pb-3 flex flex-col flex-1">
        <h4 className="text-[20px] font-black text-gray-900 tracking-tight mb-2 line-clamp-2 group-hover:text-[#EA580C] transition-colors leading-tight">
          {campaign.title}
        </h4>

        <p className="text-[13px] text-gray-500 mb-6 line-clamp-2 leading-relaxed flex-1 font-medium">
          {campaign.description}
        </p>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
            <User size={12} className="text-gray-400" /> {campaign.niche || 'Any Niche'}
          </span>
          {normalizedRequirements.slice(0, 2).map((req, idx) => (
            <span key={idx} className="inline-flex items-center gap-1.5 bg-indigo-50 text-[#EA580C] border border-indigo-100 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
              <Target size={12} className="text-[#EA580C]/70" /> {req}
            </span>
          ))}
        </div>

        <div className="flex gap-2 w-full mt-auto">
          <Link
            to={`/campaigns/${campaign._id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 relative overflow-hidden bg-gradient-to-r from-[#EA580C] to-[#BE123C] text-white text-[12px] font-black uppercase tracking-widest py-4 rounded-xl transition-all hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 group/btn flex justify-center"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {campaign.status === 'active' ? 'Analyze Brief' : 'View Details'} <ArrowUpRight size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out"></div>
          </Link>

          {campaign.status === 'active' && (
            <button
              onClick={handleOpenPitch}
              className="w-12 flex-shrink-0 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-100 transition-colors border border-indigo-100 group/pitch"
              title="Quick Pitch"
            >
              <Zap size={18} className="group-hover/pitch:text-[#EA580C] group-hover/pitch:scale-110 transition-all" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Pitch Modal */}
      {showPitch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowPitch(false);
          }}
        >
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>
          <div
            className="relative w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl animate-reveal-up border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPitch(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100 shadow-sm">
              <Zap size={24} />
            </div>

            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Quick Pitch</h3>
            <p className="text-[13px] text-gray-500 mb-4 font-medium">
              Send a direct proposal to <span className="font-bold text-gray-800">{campaign.brandId?.businessName || 'this brand'}</span>.
            </p>

            {pitchError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{pitchError}</span>
              </div>
            )}

            {pitchSent ? (
              <div className="py-8 flex flex-col items-center justify-center text-center animate-reveal-up">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                  <CheckCircle size={28} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">Pitch Submitted!</h4>
                <p className="text-[13px] text-gray-500">The brand has received your proposal in their applications dashboard.</p>
              </div>
            ) : (
              <form onSubmit={handlePitchSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Your Proposal</label>
                  <textarea
                    rows={4}
                    value={pitchMessage}
                    onChange={(e) => setPitchMessage(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[16px] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#EA580C] focus:bg-white transition-all text-[13px] text-gray-900 placeholder:text-gray-400 resize-none font-medium disabled:opacity-50"
                    placeholder={`Hey! I'd love to collaborate on the "${campaign.title}" campaign. My audience matches your target demographics...`}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !pitchMessage.trim()}
                  className="w-full bg-gray-900 text-white text-[12px] font-black uppercase tracking-widest py-4 rounded-xl transition-all hover:bg-[#EA580C] hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] flex justify-center items-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Submitting Pitch...
                    </>
                  ) : (
                    <>
                      Send Proposal <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(CampaignCard);

