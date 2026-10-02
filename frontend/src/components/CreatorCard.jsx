import React from 'react';
import { Link } from 'react-router-dom';
import { User, CheckCircle, ExternalLink, MapPin } from 'lucide-react';
import WishlistButton from './WishlistButton';

const CreatorCard = ({ creator }) => {
  return (
    <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white relative group flex flex-col items-center text-center border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all hover:-translate-y-1">
      <div className="absolute top-4 right-4 z-10">
        <WishlistButton targetId={creator._id} targetModel="CreatorProfile" />
      </div>
      <div className="relative mb-6">
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center overflow-hidden border-4 border-gray-50 shadow-md transition-transform group-hover:scale-105">
          {creator.profilePicture ? (
            <img loading="lazy" src={creator.profilePicture} alt={creator.name} className="w-full h-full object-cover" />
          ) : (
            <User size={32} className="text-gray-300" />
          )}
        </div>
        <div className="absolute -bottom-2 -right-2 bg-emerald-50 p-1.5 rounded-full shadow-lg border-2 border-white">
          <CheckCircle size={20} className="text-emerald-500" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2 mb-4">
        <h3 className="text-xl font-black font-display text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">{creator.name}</h3>
        <div className="flex items-center justify-center flex-wrap gap-2">
           <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-black uppercase tracking-widest shadow-sm">
             {creator.niche} Expert
           </span>
           {creator.location && (
             <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100 text-[9px] font-black uppercase tracking-widest shadow-sm">
                <MapPin size={10} /> {creator.location}
             </span>
           )}
        </div>
      </div>
      
      <p className="text-gray-500 text-xs font-medium leading-relaxed mb-8 line-clamp-3 min-h-12 px-2">
        {creator.bio || 'Professional creator building high-impact digital narratives.'}
      </p>

      <div className="w-full pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
        <div className="text-left">
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Starting at</p>
           <p className="text-sm font-black text-gray-900">🪙{creator.pricing?.basic?.price?.toLocaleString() || '0'}</p>
        </div>
        <Link 
          to={`/creators/${creator._id}`} 
          className="px-6 py-3 rounded-xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-[#EA580C] hover:text-white transition-all shadow-md flex items-center gap-2"
        >
          Analyze <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
};

export default React.memo(CreatorCard);
