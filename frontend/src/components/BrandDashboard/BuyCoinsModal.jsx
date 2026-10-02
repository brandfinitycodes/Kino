import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, DollarSign } from 'lucide-react';
import axios from '../../utils/axios';

const BuyCoinsModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(5000);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [referenceId, setReferenceId] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const packages = [
    { coins: 1000, price: 1000, popular: false },
    { coins: 5000, price: 5000, popular: true },
    { coins: 10000, price: 10000, popular: false },
    { coins: 50000, price: 50000, popular: false }
  ];

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!referenceId.trim()) {
        setError('Please enter a valid Transaction or Reference ID.');
        setLoading(false);
        return;
      }

      const response = await axios.post('/wallet/add-funds', { 
        amount: selectedPackage,
        method: paymentMethod,
        referenceId: referenceId
      });
      if (response.data) {
        setSuccessMsg(response.data.message);
        setTimeout(() => {
          onSuccess && onSuccess(selectedPackage, response.data.newBalance);
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to purchase coins. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessMsg(null);
    setError(null);
    setReferenceId('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl z-10"
        >
          <div className="p-5 sm:p-8 pb-4 sm:pb-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Top Up Wallet</h2>
              <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">Purchase Coins to fund deals and campaigns.</p>
            </div>
            <button onClick={handleClose} className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              <X size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}
            
            {successMsg && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-200 flex items-center gap-2">
                <Check size={16} /> {successMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {packages.map((pkg, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedPackage(pkg.coins)}
                  className={`relative p-4 sm:p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPackage === pkg.coins 
                      ? 'border-[#EA580C] bg-orange-50/50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#EA580C] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                      Most Popular
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                      {pkg.coins.toLocaleString()} <span className="text-base sm:text-lg">🪙</span>
                    </div>
                    {selectedPackage === pkg.coins && (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#EA580C] rounded-full flex items-center justify-center text-white shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-gray-500">
                    🪙{pkg.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6 p-4 sm:p-5 bg-gray-50 rounded-2xl border border-gray-200">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 sm:mb-3">Payment Details</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-4">Transfer the amount to our official bank or UPI and enter the reference number below.</p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-2 px-4 rounded-xl text-sm font-bold border ${paymentMethod === 'upi' ? 'border-[#EA580C] bg-orange-50 text-[#EA580C]' : 'border-gray-200 bg-white text-gray-600'}`}
                >
                  UPI Payment
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`py-2 px-4 rounded-xl text-sm font-bold border ${paymentMethod === 'bank' ? 'border-[#EA580C] bg-orange-50 text-[#EA580C]' : 'border-gray-200 bg-white text-gray-600'}`}
                >
                  Bank Transfer
                </button>
              </div>

              {paymentMethod === 'upi' ? (
                <div className="mb-4 text-xs font-medium text-gray-600 bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center gap-3">
                  <p className="text-center font-bold text-gray-700">Scan QR Code to Pay</p>
                  <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=brandfinity@ybl&pn=Brandfinity`} 
                      alt="Dummy UPI QR Code" 
                      className="w-32 h-32"
                    />
                  </div>
                  <div className="text-center">
                    UPI ID: <span className="font-bold text-gray-900">brandfinity@ybl</span>
                  </div>
                </div>
              ) : (
                <div className="mb-4 text-xs font-medium text-gray-600 bg-white p-3 rounded-lg border border-gray-200 space-y-1">
                  <div className="flex justify-between"><span>Account Name:</span> <span className="font-bold text-gray-900">Brandfinity Tech</span></div>
                  <div className="flex justify-between"><span>Account No:</span> <span className="font-bold text-gray-900">1234567890</span></div>
                  <div className="flex justify-between"><span>IFSC:</span> <span className="font-bold text-gray-900">HDFC0001234</span></div>
                </div>
              )}

              <input
                type="text"
                placeholder="Enter Transaction / UTR / Reference ID"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] outline-none"
              />
            </div>

            <button
              onClick={handlePurchase}
              disabled={loading || !selectedPackage || !referenceId.trim() || !!successMsg}
              className="w-full bg-[#EA580C] text-white font-black uppercase tracking-widest text-[11px] sm:text-[13px] py-4 sm:py-5 rounded-2xl hover:bg-[#c24100] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(234,88,12,0.2)]"
            >
              {loading ? 'Processing...' : `Submit Request for 🪙${selectedPackage.toLocaleString()}`}
            </button>
            <p className="text-center text-[10px] sm:text-xs text-gray-400 mt-3 sm:mt-4 font-medium flex items-center justify-center gap-1.5">
              Subject to manual verification
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BuyCoinsModal;
