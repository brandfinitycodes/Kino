import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, Check, ArrowRight, Sun, Sparkles, TrendingUp, Compass, Loader2 } from 'lucide-react';
import { Instagram, Youtube, Twitter } from '../components/SocialIcons';
import { motion } from 'framer-motion';
import OtpVerificationModal from '../components/OtpVerificationModal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Google OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState(null);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleCallback = async (response) => {
    try {
      setLoading(true);
      setError('');
      const data = await googleLogin(response.credential);
      if (data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (data.user.role === 'creator') {
        navigate('/creator-dashboard');
      } else {
        navigate('/brand-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed.');
      setLoading(false);
    }
  };

  const handleOtpVerified = async () => {
    setShowOtpModal(false);
    setLoading(true);
    setError('');
    try {
      const data = await googleLogin(pendingGoogleCredential);
      if (data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (data.user.role === 'creator') {
        navigate('/creator-dashboard');
      } else {
        navigate('/brand-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed after verification.');
      setLoading(false);
    }
  };

  React.useEffect(() => {
    let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    
    const initializeGsi = () => {
      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
          });

          const btn = document.getElementById('google-signin-button');
          if (btn) {
            window.google.accounts.id.renderButton(
              btn,
              {
                theme: 'filled_black',
                size: 'large',
                width: document.getElementById('google-signin-button-container')?.clientWidth || 382,
                text: 'continue_with',
                shape: 'pill'
              }
            );
          }
        } catch (err) {
          console.error("GSI login initialization failed:", err);
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = initializeGsi;
    } else {
      if (window.google) {
        initializeGsi();
      } else {
        script.addEventListener('load', initializeGsi);
      }
    }

    return () => {
      if (script) {
        script.removeEventListener('load', initializeGsi);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      if (data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (data.user.role === 'creator') {
        navigate('/creator-dashboard');
      } else {
        navigate('/brand-dashboard');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100dvh-5rem)] overflow-hidden w-full flex bg-[#FAF9F6] font-sans text-slate-900 relative">
      
      {/* Decorative Morning Backdrop Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-gradient-to-tr from-amber-300/30 to-orange-400/0 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[5%] right-[20%] w-[350px] h-[350px] bg-gradient-to-tr from-orange-300/15 to-amber-200/0 rounded-full blur-[80px] pointer-events-none z-0" />

      {/* Floating Background Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <motion.div
          className="absolute top-[12%] left-[8%] text-amber-500/35"
          animate={{ y: [0, -15, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sun size={52} />
        </motion.div>
        <motion.div
          className="absolute bottom-[22%] left-[12%] text-orange-500/35"
          animate={{ y: [0, 18, 0], rotate: [0, -12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <Sparkles size={36} />
        </motion.div>
        <motion.div
          className="absolute top-[28%] right-[54%] text-amber-600/35"
          animate={{ y: [0, -12, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <TrendingUp size={44} />
        </motion.div>
        <motion.div
          className="absolute bottom-[12%] right-[55%] text-orange-600/35"
          animate={{ y: [0, 10, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <Compass size={40} />
        </motion.div>
      </div>

      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-12 relative h-full z-10">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl border border-orange-100/60 rounded-[2rem] p-8 sm:p-10 md:p-12 shadow-[0_24px_50px_rgba(251,146,60,0.06)] hover:shadow-[0_32px_60px_rgba(251,146,60,0.12)] transition-all duration-300 animate-reveal-up">
          
          <div className="mb-6 sm:mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-orange-500/10 text-white relative">
              <span className="absolute inset-0 bg-white/20 rounded-2xl animate-ping opacity-25"></span>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="flex items-center justify-center"
              >
                <Sun size={24} />
              </motion.div>
            </div>
            <h2 className="text-3xl font-black font-display tracking-tight text-slate-900 mb-1">Rise & Shine</h2>
            <p className="text-sm text-slate-500 font-medium font-sans">Good morning! Enter details to access your dashboard.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-2xl flex items-center gap-3 mb-6 animate-pulse shadow-sm">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Google Authentication Integration */}
          <div id="google-signin-button-container" className="w-full mb-4 flex justify-center">
            <div id="google-signin-button" className="w-full flex justify-center"></div>
          </div>

          <div className="flex items-center my-4 sm:my-5 select-none">
            <div className="flex-grow h-px bg-slate-100"></div>
            <span className="px-4 text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-bold">Or log in with email</span>
            <div className="flex-grow h-px bg-slate-100"></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 group">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 group-focus-within:text-amber-500 transition-colors">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-3.5 bg-slate-50/50 border-2 border-slate-100/80 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm sm:text-base text-slate-900 font-medium placeholder:text-slate-400"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 group">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 group-focus-within:text-amber-500 transition-colors">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 sm:pl-14 pr-10 sm:pr-12 py-3.5 bg-slate-50/50 border-2 border-slate-100/80 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm sm:text-base text-slate-900 font-medium placeholder:text-slate-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group/cb">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-[6px] checked:bg-amber-500 checked:border-amber-500 transition-all cursor-pointer outline-none focus:ring-4 focus:ring-amber-500/10"
                  />
                  <Check size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-500 group-hover/cb:text-slate-800 transition-colors select-none">Remember for 30 days</span>
              </label>
              
              <a href="#" className="text-xs sm:text-sm font-bold text-amber-600 hover:text-orange-700 transition-colors">Forgot password?</a>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all mt-4 cursor-pointer flex items-center justify-center gap-2 group/btn disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500 font-medium text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-slate-900 font-black hover:underline">Sign up for free</Link>
          </p>
        </div>
      </div>

      {/* Right Column: Visual Panel */}
      <div className="hidden lg:flex w-1/2 bg-[#FAF9F6] p-6 h-full z-10 relative">
        <div className="w-full h-full bg-[#ffeecf]/70 border border-orange-100/30 rounded-[2.5rem] relative overflow-hidden shadow-[inset_0_4px_30px_rgba(0,0,0,0.01)] flex flex-col justify-around p-8 lg:p-10 xl:p-14">
          
          {/* Faint Dotted Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #EA580C 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />

          {/* Abstract soft glowing shapes */}
          <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] bg-gradient-to-tr from-amber-300/15 to-orange-400/0 rounded-full blur-[90px] pointer-events-none z-0"></div>
          <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-gradient-to-tr from-orange-400/10 to-amber-200/0 rounded-full blur-[80px] pointer-events-none z-0"></div>
          
          {/* Header Text */}
          <div className="relative z-10 text-slate-900 mt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100/60 shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Rise & Shine Network</span>
            </div>
            <h1 className="text-[44px] font-black font-display tracking-tight leading-[1.15] mb-5 text-slate-900">
              Where morning <br/>ambition meets <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">brand reach.</span>
            </h1>
            {/* Text description and Social Icons placed horizontally */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mt-6 animate-reveal-up select-none border-t border-orange-100/30 pt-6 max-w-md xl:max-w-xl">
              <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-sm">
                Connect with top-tier brands, manage active campaigns, and accelerate your growth all from one unified intelligence console.
              </p>
              
              <div className="flex items-center gap-4 shrink-0">
                <div className="h-8 w-px bg-slate-200 hidden xl:block"></div>
                <div className="flex gap-4">
                  <motion.div
                    className="text-pink-500 hover:text-pink-600 cursor-pointer transition-colors"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Instagram size={22} />
                  </motion.div>
                  <motion.div
                    className="text-red-500 hover:text-red-600 cursor-pointer transition-colors"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Youtube size={22} />
                  </motion.div>
                  <motion.div
                    className="text-slate-800 hover:text-slate-900 cursor-pointer transition-colors"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Twitter size={22} />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>



          {/* Decorative morning card */}
          <div className="relative z-10 flex justify-center">
             <div className="w-full max-w-sm bg-white border border-orange-100/50 rounded-3xl p-6 shadow-[0_12px_30px_rgba(234,88,12,0.03)] hover:shadow-[0_20px_45px_rgba(234,88,12,0.06)] transition-all duration-500 group">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Campaign Pulse</span>
                 </div>
                 <span className="text-xs font-black text-orange-600">+🪙24,800 today</span>
               </div>
               <div className="space-y-3">
                 <div className="h-2 w-full bg-slate-50 rounded-full"></div>
                 <div className="h-2 w-4/5 bg-slate-50 rounded-full"></div>
                 <div className="h-10 w-full bg-orange-50/30 border border-orange-100/30 rounded-xl mt-4 flex items-center justify-between px-3 text-[10px] font-black text-slate-700">
                   <span>Nike Autumn Campaign</span>
                   <span className="text-orange-600 uppercase tracking-widest text-[9px] bg-orange-100/50 px-2 py-0.5 rounded">APPROVED</span>
                 </div>
               </div>
              </div>
           </div>

        </div>
      </div>

      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={otpEmail}
        onVerificationSuccess={handleOtpVerified}
        title="Verify Google Account Email"
      />
    </div>
  );
};

export default Login;
