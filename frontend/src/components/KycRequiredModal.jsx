import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, X, ArrowRight, Clock, AlertTriangle } from 'lucide-react';

const KycRequiredModal = ({ isOpen, onClose, message, kycStatus }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isPending = kycStatus === 'PENDING' || kycStatus === 'UNDER_REVIEW';
  const isRejected = kycStatus === 'REJECTED';

  let title = 'KYC Verification Required';
  let primaryBtnText = 'Complete Verification';
  let primaryAction = () => {
    onClose();
    navigate('/kyc-onboarding');
  };
  let showSecondary = true;

  if (isPending) {
    title = 'Verification Pending';
    primaryBtnText = 'Got It';
    primaryAction = onClose;
    showSecondary = false;
  } else if (isRejected) {
    title = 'Verification Rejected';
    primaryBtnText = 'Resubmit KYC';
    primaryAction = () => {
      onClose();
      navigate('/kyc-onboarding');
    };
    showSecondary = true;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-reveal-up select-none">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white text-center relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-all cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className={`inline-flex p-3 rounded-2xl mb-5 mt-2 border ${
          isPending 
            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' 
            : isRejected 
              ? 'bg-red-500/10 text-red-600 border-red-500/20' 
              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
        }`}>
          {isPending ? (
            <Clock size={36} className="stroke-[1.8] animate-pulse" />
          ) : isRejected ? (
            <AlertTriangle size={36} className="stroke-[1.8]" />
          ) : (
            <ShieldAlert size={36} className="stroke-[1.8]" />
          )}
        </div>

        <h3 className="font-display font-black text-xl tracking-tight text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-xs sm:text-sm font-medium leading-relaxed mb-6 px-4">
          {message || (isPending 
            ? "Your identity verification details have been submitted and are currently being reviewed by our team."
            : "Identity verification is required before accessing deal-related features. Complete KYC to continue.")}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={primaryAction}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-display font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            {primaryBtnText} {!isPending && <ArrowRight size={14} />}
          </button>
          
          {showSecondary && (
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-display font-bold uppercase tracking-widest text-[10px] rounded-xl border border-gray-200 transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default KycRequiredModal;
