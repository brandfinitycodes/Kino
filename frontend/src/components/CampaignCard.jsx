import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, ArrowUpRight, Building2, Wallet, User, Flame, Clock, Zap, X, Send } from 'lucide-react';
import WishlistButton from './WishlistButton';

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
  const [showPitch, setShowPitch] = useState(false);
  const [pitchSent, setPitchSent] = useState(false);

  const getMockApplicantCount = (id) => {
    if (!id) return 12;
    const hash = id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 45) + 5;
  };

  const isHot = getMockApplicantCount(campaign._id) > 25;
  const isNew = new Date() - new Date(campaign.createdAt) < 3 * 24 * 60 * 60 * 1000; // < 3 days old

  const handlePitchSubmit = (e) => {
    e.preventDefault();
    setPitchSent(true);
    setTimeout(() => {
      setShowPitch(false);
      setPitchSent(false);
    }, 2000);
  };

  return (
    <div className="group relative bg-white rounded-[32px] p-3 hover:bg-white transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 overflow-hidden flex flex-col h-full border border-gray-100">

      {/* Premium Image Header */}
      <div className="relative h-56 w-full rounded-[24px] overflow-hidden mb-5 bg-[#EA580C]">
        <img loading="lazy" src={getPlaceholderImage(campaign.niche || campaign.category)} alt={campaign.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100" />

        {/* Brand Logo Float */}
        <div className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl overflow-hidden z-10">
          {campaign.brandId?.logo ? <img loading="lazy" src={campaign.brandId.logo} className="w-full h-full object-cover" /> : <Building2 size={20} className="text-white drop-shadow-md" />}
        </div>

        {/* Wishlist Button Float */}
        <div className="absolute top-4 left-4 z-10 shadow-lg rounded-full">
          <WishlistButton targetId={campaign._id} targetModel="Campaign" />
        </div>

        {/* Live FOMO Badges */}
        <div className="absolute top-16 left-4 z-10 flex flex-col gap-2 pointer-events-none">
          {isHot && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-red-500/20 backdrop-blur-md border border-red-500/30 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
              <Flame size={12} className="text-red-400" /> Hot: {getMockApplicantCount(campaign._id)} Applied
            </span>
          )}
          {isNew && !isHot && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
              <Clock size={12} className="text-emerald-400" /> Just Added
            </span>
          )}
        </div>

        {/* Darker Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

        {/* Budget on Image */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10">
          <div className="flex flex-col">
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-black mb-1">Campaign Budget</span>
            <span className="text-3xl font-display font-black text-white flex items-center gap-2"><Wallet size={20} className="text-[#eb4898]" /> 🪙{campaign.budget?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>

      {/* Premium Content */}
      <div className="px-3 pb-3 flex flex-col flex-1">
        <h4 className="text-[20px] font-black text-gray-900 tracking-tight mb-2 line-clamp-2 group-hover:text-[#EA580C] transition-colors leading-tight">{campaign.title}</h4>

        <p className="text-[13px] text-gray-500 mb-6 line-clamp-2 leading-relaxed flex-1 font-medium">
          {campaign.description}
        </p>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
            <User size={12} className="text-gray-400" /> {campaign.niche || 'Any Niche'}
          </span>
          {campaign.requirements?.slice(0, 2).map((req, idx) => (
            <span key={idx} className="inline-flex items-center gap-1.5 bg-indigo-50 text-[#EA580C] border border-indigo-100 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
              <Target size={12} className="text-[#EA580C]/70" /> {req}
            </span>
          ))}
        </div>

        <div className="flex gap-2 w-full">
          <Link
            to={`/campaigns/${campaign._id}`}
            className="flex-1 relative overflow-hidden bg-gradient-to-r from-[#EA580C] to-[#BE123C] text-white text-[12px] font-black uppercase tracking-widest py-4 rounded-xl transition-all hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 group/btn flex justify-center"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {campaign.status === 'active' ? 'Analyze Brief' : 'View Details'} <ArrowUpRight size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out"></div>
          </Link>

          {campaign.status === 'active' && (
            <button
              onClick={() => setShowPitch(true)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowPitch(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl animate-reveal-up border border-gray-100">
            <button onClick={() => setShowPitch(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors">
              <X size={16} />
            </button>

            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100 shadow-sm">
              <Zap size={24} />
            </div>

            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Quick Pitch</h3>
            <p className="text-[13px] text-gray-500 mb-6 font-medium">Send a lightning-fast proposal to {campaign.brandId?.businessName || 'this brand'} directly from the discovery console.</p>

            {pitchSent ? (
              <div className="py-12 flex flex-col items-center justify-center text-center animate-reveal-up">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                  <Send size={24} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Pitch Sent!</h4>
                <p className="text-[13px] text-gray-500">The brand has received your lightning proposal.</p>
              </div>
            ) : (
              <form onSubmit={handlePitchSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Your Message</label>
                  <textarea
                    rows={4}
                    className="w-full p-4 bg-gray-50 border border-transparent rounded-[16px] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#EA580C] focus:bg-white transition-all text-[13px] text-gray-900 placeholder:text-gray-400 resize-none font-medium"
                    placeholder={`Hey! I'd love to collaborate on the ${campaign.title} campaign. My audience perfectly matches your niche...`}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="w-full bg-gray-900 text-white text-[12px] font-black uppercase tracking-widest py-4 rounded-xl transition-all hover:bg-[#EA580C] hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] flex justify-center items-center gap-2 mt-2">
                  Send Proposal <Send size={14} />
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
