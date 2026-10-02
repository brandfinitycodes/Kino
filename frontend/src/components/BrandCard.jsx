import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle, ExternalLink, MapPin, Building2 } from 'lucide-react';
import WishlistButton from './WishlistButton';

const BrandCard = ({ brand }) => {
  return (
    <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white relative group flex flex-col items-center text-center border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all hover:-translate-y-1">
      <div className="absolute top-4 right-4 z-10">
        <WishlistButton targetId={brand._id} targetModel="BrandProfile" />
      </div>
      <div className="relative mb-6">
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center overflow-hidden border-4 border-gray-50 shadow-md transition-transform group-hover:scale-105">
          {brand.logo ? (
            <img loading="lazy" src={brand.logo} alt={brand.businessName} className="w-full h-full object-cover" />
          ) : (
            <Briefcase size={32} className="text-gray-300" />
          )}
        </div>
        <div className="absolute -bottom-2 -right-2 bg-indigo-50 p-1.5 rounded-full shadow-lg border-2 border-white">
          <CheckCircle size={20} className="text-indigo-500" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2 mb-4">
        <h3 className="text-xl font-black font-display text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">{brand.businessName}</h3>
        <div className="flex items-center justify-center flex-wrap gap-2">
           {brand.industry && (
             <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-black uppercase tracking-widest shadow-sm">
               {brand.industry}
             </span>
           )}
           {brand.location && (
             <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100 text-[9px] font-black uppercase tracking-widest shadow-sm">
                <MapPin size={10} /> {brand.location}
             </span>
           )}
        </div>
      </div>
      
      <p className="text-gray-500 text-xs font-medium leading-relaxed mb-8 line-clamp-3 min-h-12 px-2">
        {brand.description || 'Innovative brand looking for high-impact creator collaborations.'}
      </p>

      <div className="w-full pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
        <div className="text-left flex items-center gap-2 text-gray-400">
           <Building2 size={16} />
           <div>
             <p className="text-[9px] font-black uppercase tracking-widest">Type</p>
             <p className="text-xs font-black text-gray-900 line-clamp-1">{brand.businessType || 'Enterprise'}</p>
           </div>
        </div>
        <Link 
          to={`/brands/${brand._id}`} 
          className="px-6 py-3 rounded-xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-[#EA580C] hover:text-white transition-all shadow-md flex items-center gap-2 shrink-0"
        >
          View Profile <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
};

export default React.memo(BrandCard);
