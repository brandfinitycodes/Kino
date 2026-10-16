import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle, ArrowUpRight, MapPin, Building2 } from 'lucide-react';

const BrandCard = ({ brand }) => {
  return (
    <div className="w-full h-full p-5 sm:p-6 rounded-[2rem] bg-white relative group flex flex-col items-center text-center border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all hover:-translate-y-1">

      <div className="relative mb-5">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-[1.75rem] flex items-center justify-center overflow-hidden border-4 border-gray-50 shadow-md transition-transform group-hover:scale-105">
          {brand?.logo ? (
            <img 
              loading="lazy" 
              src={brand.logo} 
              alt={brand.businessName || 'Brand'} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement.querySelector('.brand-placeholder-icon');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
          ) : null}
          <Briefcase size={28} className={`text-gray-300 brand-placeholder-icon ${brand?.logo ? 'hidden' : 'block'}`} />
        </div>
        {(brand?.isVerified || brand?.userId?.isVerified) && (
          <div className="absolute -bottom-1 -right-1 bg-orange-50 p-1.5 rounded-full shadow-lg border-2 border-white">
            <CheckCircle size={16} className="text-[#EA580C]" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-center gap-2 mb-3 w-full">
        <h3 className="text-lg font-black font-display text-gray-900 tracking-tight group-hover:text-[#EA580C] transition-colors line-clamp-1 w-full px-1">
          {brand?.businessName || 'Brand Partner'}
        </h3>
        <div className="flex items-center justify-center flex-wrap gap-1.5 min-h-[26px]">
           {brand?.industry && (
             <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-[#EA580C] border border-orange-100 text-[9px] font-black uppercase tracking-widest shadow-sm">
               {brand.industry}
             </span>
           )}
           {brand?.location && (
             <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100 text-[9px] font-black uppercase tracking-widest shadow-sm">
                <MapPin size={10} /> {brand.location}
             </span>
           )}
        </div>
      </div>
      
      <p className="text-gray-500 text-xs font-medium leading-relaxed mb-5 line-clamp-3 min-h-12 px-1">
        {brand?.description || 'Innovative brand looking for high-impact creator collaborations.'}
      </p>

      <div className="w-full pt-4 border-t border-gray-100 flex flex-col gap-3 mt-auto">
        <div className="flex items-center justify-between text-gray-400 text-xs px-1">
           <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
             <Building2 size={13} className="shrink-0 text-gray-400" /> Type
           </span>
           <span className="text-xs font-bold text-gray-900 line-clamp-1">{brand?.businessType || 'Online'}</span>
        </div>
        <Link 
          to={`/brands/${brand?._id || brand?.id}`} 
          className="w-full py-3 rounded-xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-[#EA580C] hover:text-white transition-all shadow-md inline-flex items-center justify-center gap-1.5"
        >
          View Profile <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default React.memo(BrandCard);
