import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, DollarSign } from 'lucide-react';
import axios from '../../utils/axios';

const BuyCoinsModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(5000);
  const [error, setError] = useState(null);

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
      // Assuming a simplified flow for testing, bypassing real Razorpay
      const response = await axios.post('/wallet/add-funds', { amount: selectedPackage });
      if (response.data) {
        onSuccess(selectedPackage, response.data.newBalance);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to purchase coins. Try again.');
    } finally {
      setLoading(false);
    }
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
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl z-10"
        >
          <div className="p-8 pb-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Top Up Wallet</h2>
              <p className="text-sm font-medium text-gray-500 mt-1">Purchase Coins to fund deals and campaigns.</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {packages.map((pkg, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedPackage(pkg.coins)}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPackage === pkg.coins 
                      ? 'border-[#EA580C] bg-orange-50/50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#EA580C] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                      Most Popular
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-2xl font-black text-gray-900 tracking-tight">
                      {pkg.coins.toLocaleString()} <span className="text-lg">🪙</span>
                    </div>
                    {selectedPackage === pkg.coins && (
                      <div className="w-6 h-6 bg-[#EA580C] rounded-full flex items-center justify-center text-white shrink-0">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-bold text-gray-500">
                    🪙{pkg.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handlePurchase}
              disabled={loading || !selectedPackage}
              className="w-full bg-[#EA580C] text-white font-black uppercase tracking-widest text-[13px] py-5 rounded-2xl hover:bg-[#c24100] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(234,88,12,0.2)]"
            >
              {loading ? 'Processing...' : `Pay 🪙${selectedPackage.toLocaleString()}`}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 font-medium flex items-center justify-center gap-1.5">
              <DollarSign size={14} /> Secured by Razorpay
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BuyCoinsModal;
