import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, RefreshCw, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const OtpVerificationModal = ({ isOpen, onClose, email, onVerificationSuccess, title = "Email Verification Required" }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [devOtp, setDevOtp] = useState('');
  const inputRefs = useRef([]);
  const { sendOtp, verifyOtp } = useAuth();

  useEffect(() => {
    if (isOpen && email) {
      handleSendOtp();
    }
  }, [isOpen, email]);

  useEffect(() => {
    let interval = null;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const handleSendOtp = async () => {
    setResending(true);
    setError('');
    setOtp(['', '', '', '', '', '']);
    setTimer(60);
    try {
      const res = await sendOtp(email);
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP to your email.');
    } finally {
      setResending(false);
    }
  };

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await verifyOtp(email, fullOtp);
      onVerificationSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative overflow-hidden text-center"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
            <ShieldCheck size={32} />
          </div>

          <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {title}
          </h3>

          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            We sent a 6-digit verification code to <br />
            <span className="font-bold text-slate-800">{email}</span>
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold flex items-center justify-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {devOtp && (
            <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center justify-between">
              <span>Dev OTP Code: <strong className="text-slate-900 tracking-widest">{devOtp}</strong></span>
              <button
                type="button"
                onClick={() => {
                  setOtp(devOtp.split(''));
                  inputRefs.current[5]?.focus();
                }}
                className="px-2 py-1 bg-amber-500 text-white text-[10px] font-black rounded-lg hover:bg-amber-600 transition-colors"
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* 6 Digit Input Boxes */}
          <form onSubmit={handleVerify}>
            <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all shadow-sm"
                />
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>
          </form>

          {/* Resend Timer */}
          <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
            <span>Didn't receive code?</span>
            {timer > 0 ? (
              <span className="font-bold text-amber-600">Resend in {timer}s</span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={resending}
                className="font-bold text-amber-600 hover:text-amber-700 underline flex items-center gap-1 disabled:opacity-50"
              >
                {resending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Resend OTP
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OtpVerificationModal;
