import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Users, Briefcase, AlertCircle, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, User as UserIcon, ShieldCheck, TrendingUp, Zap, DollarSign, Sun, Sparkles, Compass, Loader2 } from 'lucide-react';
import { Instagram, Youtube, Twitter } from '../components/SocialIcons';
import { motion } from 'framer-motion';
import OtpVerificationModal from '../components/OtpVerificationModal';

const Register = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);
  
  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState(null);
  const [pendingRegType, setPendingRegType] = useState(''); // 'STANDARD' | 'GOOGLE'

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, googleRegister } = useAuth();
  const navigate = useNavigate();
  const roleRef = React.useRef(role);

  React.useEffect(() => {
    roleRef.current = role;
  }, [role]);

  const handleGoogleCallback = async (response) => {
    try {
      let gEmail = email;
      if (response.credential) {
        try {
          const payload = JSON.parse(atob(response.credential.split('.')[1]));
          if (payload.email) gEmail = payload.email;
        } catch (e) {
          console.error("Failed to parse Google ID token email:", e);
        }
      }
      setPendingGoogleCredential(response.credential);
      setPendingRegType('GOOGLE');
      setOtpEmail(gEmail || email);
      setShowOtpModal(true);
    } catch (err) {
      setError('Google registration failed.');
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

          const btn = document.getElementById('google-signup-button');
          if (btn) {
            window.google.accounts.id.renderButton(
              btn,
              {
                theme: 'filled_black',
                size: 'large',
                width: document.getElementById('google-signup-button-container')?.clientWidth || 382,
                text: 'signup_with',
                shape: 'pill'
              }
            );
          }
        } catch (err) {
          console.error("GSI registration initialization failed:", err);
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

  // Password Strength Logic
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 6) score += 1;
    if (pass.length > 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(score, 4);
  };

  const strengthScore = getPasswordStrength(password);
  const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][strengthScore] || '';
  const strengthColor = ['bg-red-500', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'][strengthScore] || 'bg-gray-200';

  const handleNextStep = () => {
    if (!role) {
      setError('Please select an account type to continue.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreePolicy) {
      setError('You must agree to the network guidelines and policies.');
      return;
    }
    if (strengthScore < 2) {
      setError('Please choose a stronger password.');
      return;
    }
    
    setError('');
    setPendingRegType('STANDARD');
    setOtpEmail(email);
    setShowOtpModal(true);
  };

  const handleOtpVerified = async () => {
    setShowOtpModal(false);
    setLoading(true);
    setError('');

    try {
      sessionStorage.setItem('justRegistered', 'true');
      let data;

      if (pendingRegType === 'GOOGLE' && pendingGoogleCredential) {
        data = await googleRegister(pendingGoogleCredential, roleRef.current);
      } else {
        data = await register(email, password, role, name, businessName);
      }

      if (data.user.role === 'admin') {
        sessionStorage.removeItem('justRegistered');
        navigate('/admin-dashboard');
      } else {
        navigate('/aadhaar-verification');
      }
    } catch (err) {
      sessionStorage.removeItem('justRegistered');
      setError(err.response?.data?.message || 'Registration failed after OTP verification. Please try again.');
      setLoading(false);
    }
  };

  const isBrand = role === 'brand';
  const primaryColorClass = 'bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-lg shadow-orange-500/20 active:scale-[0.98]';
  const focusRingClass = 'focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all';

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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-6 md:p-8 relative overflow-y-auto h-full hide-scrollbar z-10">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl border border-orange-100/60 rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-[0_24px_50px_rgba(251,146,60,0.06)] hover:shadow-[0_32px_60px_rgba(251,146,60,0.12)] transition-all duration-300 animate-reveal-up pb-6 sm:pb-8">
          
          {/* Rise & Shine Icon */}
          <div className="w-11 h-11 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-orange-500/10 text-white relative select-none">
            <span className="absolute inset-0 bg-white/20 rounded-2xl animate-ping opacity-25"></span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="flex items-center justify-center"
            >
              <Sun size={20} />
            </motion.div>
          </div>

          {/* Stepper Indicators */}
          <div className="flex items-center gap-2 mb-4 select-none">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-amber-500' : 'bg-slate-100'} transition-colors`}></div>
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-amber-500' : 'bg-slate-100'} transition-colors`}></div>
          </div>

          <div className="mb-4">
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900 mb-0.5">
              {step === 1 ? 'Join the network' : 'Create your account'}
            </h2>
            <p className="text-sm text-slate-500 font-medium font-sans">
              {step === 1 ? 'Choose your account type to get started.' : 'Enter your details to finalize registration.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-2xl flex items-center gap-3 mb-8 animate-pulse shadow-sm">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4 animate-reveal-up select-none">
              <div 
                onClick={() => {setRole('creator'); setError('');}}
                className={`p-4 sm:p-5 rounded-3xl border-2 cursor-pointer transition-all ${role === 'creator' ? 'border-amber-500 bg-amber-50/30 shadow-md scale-[1.02]' : 'border-slate-100 hover:border-amber-200 hover:bg-slate-50/50'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'creator' ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/15' : 'bg-slate-100 text-slate-500'}`}>
                    <Users size={20} />
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${role === 'creator' ? 'border-amber-500 bg-amber-500' : 'border-slate-200'}`}>
                    {role === 'creator' && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-0.5">I am a Creator</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">I want to find brand deals, monetize my audience, and manage my portfolio.</p>
              </div>

              <div 
                onClick={() => {setRole('brand'); setError('');}}
                className={`p-4 sm:p-5 rounded-3xl border-2 cursor-pointer transition-all ${role === 'brand' ? 'border-orange-500 bg-orange-50/20 shadow-md scale-[1.02]' : 'border-slate-100 hover:border-orange-200 hover:bg-slate-50/50'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'brand' ? 'bg-gradient-to-tr from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-600/15' : 'bg-slate-100 text-slate-500'}`}>
                    <Briefcase size={20} />
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${role === 'brand' ? 'border-orange-500 bg-amber-500' : 'border-slate-200'}`}>
                    {role === 'brand' && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-0.5">I am a Brand</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">I want to launch campaigns, discover talent, and scale my marketing.</p>
              </div>

              <button 
                onClick={handleNextStep}
                className={`w-full py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all mt-2 flex items-center justify-center gap-2 group ${role ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-orange-500/15' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                disabled={!role}
              >
                Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* Google Authentication Integration */}
          <div className={`w-full flex-col gap-3 mt-4 ${step === 1 ? 'flex' : 'hidden'}`}>
            <div className="flex items-center select-none">
              <div className="flex-grow h-px bg-slate-100"></div>
              <span className="px-4 text-[9px] uppercase tracking-widest text-slate-400 font-bold">Or sign up with Google</span>
              <div className="flex-grow h-px bg-slate-100"></div>
            </div>
            <div id="google-signup-button-container" className="w-full flex justify-center">
              <div id="google-signup-button" className="w-full flex justify-center"></div>
            </div>
          </div>

          {step === 2 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:gap-2.5 animate-reveal-up">
              
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="self-start flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-slate-900 mb-0.5 transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>

              {/* Dynamic Name Field */}
              <div className="flex flex-col gap-0.5 group">
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 group-focus-within:text-amber-500 transition-colors">
                  {isBrand ? 'Company Name' : 'Full Name / Handle'}
                </label>
                <div className="relative">
                  {isBrand ? (
                     <Briefcase className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={16} />
                  ) : (
                     <UserIcon className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={16} />
                  )}
                  <input
                    type="text"
                    required
                    value={isBrand ? businessName : name}
                    onChange={(e) => isBrand ? setBusinessName(e.target.value) : setName(e.target.value)}
                    className="w-full pl-11 sm:pl-12 pr-4 py-2.5 bg-slate-50/50 border-2 border-slate-100/80 rounded-2xl focus:bg-white outline-none transition-all text-xs sm:text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    placeholder={isBrand ? "Acme Corp" : "Jane Doe"}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-0.5 group">
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 group-focus-within:text-amber-500 transition-colors">
                  {isBrand ? 'Work Email' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 sm:pl-12 pr-4 py-2.5 bg-slate-50/50 border-2 border-slate-100/80 rounded-2xl focus:bg-white outline-none transition-all text-xs sm:text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-0.5 group">
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 group-focus-within:text-amber-500 transition-colors">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 sm:pl-12 pr-10 py-2.5 bg-slate-50/50 border-2 border-slate-100/80 rounded-2xl focus:bg-white outline-none transition-all text-xs sm:text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Strength Meter */}
                {password && (
                  <div className="flex flex-col gap-0.5 mt-0.5 ml-1 select-none">
                    <div className="flex gap-1 h-1 w-full">
                       {[0, 1, 2, 3].map(idx => (
                         <div key={idx} className={`h-full flex-1 rounded-full ${idx < strengthScore ? strengthColor : 'bg-slate-100'} transition-all duration-300`}></div>
                       ))}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex justify-end">{strengthText}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="flex flex-col gap-0.5 group">
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 group-focus-within:text-amber-500 transition-colors">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={16} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 sm:pl-12 pr-4 py-2.5 bg-slate-50/50 border-2 border-slate-100/80 rounded-2xl focus:bg-white outline-none transition-all text-xs sm:text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Policy Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group/cb mt-1 select-none">
                <div className="relative flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreePolicy}
                    onChange={(e) => setAgreePolicy(e.target.checked)}
                    className="peer appearance-none w-4 h-4 sm:w-5 sm:h-5 border-2 border-slate-200 rounded-[6px] transition-all cursor-pointer outline-none checked:bg-amber-500 checked:border-amber-500 focus:ring-amber-500/10 focus:ring-4"
                  />
                  <CheckCircle2 size={10} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none stroke-[3]" />
                </div>
                <span className="text-xs font-bold text-slate-500 group-hover/cb:text-slate-800 transition-colors select-none leading-tight">
                  I agree to the <a href="#" className="text-amber-600 hover:text-orange-700 transition-colors hover:underline">Terms</a> & <a href="#" className="text-amber-600 hover:text-orange-700 transition-colors hover:underline">Privacy</a>.
                </span>
              </label>

              <button 
                type="submit" 
                disabled={loading} 
                className={`w-full py-2.5 rounded-2xl text-white font-bold text-xs sm:text-sm uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all mt-2.5 cursor-pointer flex items-center justify-center gap-2 group/btn ${primaryColorClass} disabled:opacity-75 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Registering...
                  </>
                ) : (
                  <>
                    Complete Registration <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-center mt-4 sm:mt-5 text-slate-500 font-medium text-xs sm:text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-slate-900 font-black hover:underline">Log in</Link>
          </p>
        </div>
      </div>

      {/* Right Column: Visual Panel */}
      <div className="hidden lg:flex w-1/2 bg-[#FAF9F6] p-6 h-full z-10 relative">
        <div className="w-full h-full bg-[#ffeecf]/70 border border-orange-100/30 rounded-[2.5rem] relative overflow-hidden shadow-[inset_0_4px_30px_rgba(0,0,0,0.01)] flex flex-col justify-around p-8 lg:p-10 xl:p-14 transition-all duration-500">
          
          {/* Faint Dotted Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #EA580C 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />

          {/* Abstract soft glowing shapes */}
          <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] bg-gradient-to-tr from-amber-300/15 to-orange-400/0 rounded-full blur-[90px] pointer-events-none z-0"></div>
          <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-gradient-to-tr from-orange-400/10 to-amber-200/0 rounded-full blur-[80px] pointer-events-none z-0"></div>

          <div className="relative z-10 text-slate-900 mt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100/60 shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                {isBrand ? 'Enterprise Hub' : role === 'creator' ? 'Creator Suite' : 'Rise & Shine Portal'}
              </span>
            </div>
            
            <h1 className="text-[44px] font-black font-display tracking-tight leading-[1.15] mb-5 text-slate-900">
              {isBrand ? (
                <>Scale your brand <br/>reach with <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">vetted talent.</span></>
              ) : role === 'creator' ? (
                <>Monetize your <br/>influence and <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">claim deals.</span></>
              ) : (
                <>Where morning <br/>ambition meets <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">brand reach.</span></>
              )}
            </h1>

            {/* Text description and Social Icons placed horizontally */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mt-6 animate-reveal-up select-none border-t border-orange-100/30 pt-6 max-w-md xl:max-w-xl">
              <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-sm">
                {isBrand 
                  ? 'Discover vetted creators, launch high-impact campaigns, and monitor your marketing spend ROI securely.' 
                  : role === 'creator' 
                    ? 'Connect directly with premium brands, negotiate coin-based milestones, and build your digital footprint.' 
                    : 'The ultimate marketplace connecting premium brands with top-tier creative talent.'}
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

          <div className="relative z-10 w-full max-w-md">
             {/* Visual representation based on role */}
             {isBrand ? (
                <div className="bg-white border border-orange-100/50 rounded-3xl p-6 sm:p-8 shadow-[0_12px_30px_rgba(234,88,12,0.03)] hover:shadow-[0_20px_45px_rgba(234,88,12,0.06)] transition-all duration-500 group flex flex-col gap-6">
                  <div className="border-b border-slate-100 pb-4">
                     <p className="text-orange-600 text-[10px] font-black uppercase tracking-widest mb-1">Brand Advantages</p>
                     <h3 className="text-xl font-black text-slate-900 tracking-tight">Hire with Intelligence</h3>
                  </div>
                  
                  <div className="flex flex-col gap-5">
                    {/* Item 1 */}
                    <div className="flex gap-4 items-start group/item hover:bg-slate-50/50 p-3 -m-3 rounded-2xl transition-all duration-300">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-sm border border-orange-100/30">
                        <Users size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-950 mb-0.5">Vetted Talent Network</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Browse pre-screened creators with verified follower statistics and deep target demographic insights.</p>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex gap-4 items-start group/item hover:bg-slate-50/50 p-3 -m-3 rounded-2xl transition-all duration-300">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-sm border border-amber-100/30">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-950 mb-0.5">Secure Budget Payments</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Keep your marketing spend protected. Funds are locked securely and only released when you approve the content.</p>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="flex gap-4 items-start group/item hover:bg-slate-50/50 p-3 -m-3 rounded-2xl transition-all duration-300">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 shadow-sm border border-slate-200">
                        <TrendingUp size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-950 mb-0.5">Centralized CRM Dashboard</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Track your content deliverables, negotiate contract agreements, and monitor campaigns in one unified console.</p>
                      </div>
                    </div>
                  </div>
                </div>
             ) : (
                <div className="bg-white border border-orange-100/50 rounded-3xl p-6 sm:p-8 shadow-[0_12px_30px_rgba(234,88,12,0.03)] hover:shadow-[0_20px_45px_rgba(234,88,12,0.06)] transition-all duration-500 group flex flex-col gap-6">
                  <div className="border-b border-slate-100 pb-4">
                     <p className="text-orange-600 text-[10px] font-black uppercase tracking-widest mb-1">Creator Console</p>
                     <h3 className="text-xl font-black text-slate-900 tracking-tight">Monetize Your Influence</h3>
                  </div>

                  <div className="flex flex-col gap-5">
                    {/* Item 1 */}
                    <div className="flex gap-4 items-start group/item hover:bg-slate-50/50 p-3 -m-3 rounded-2xl transition-all duration-300">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-sm border border-orange-100/30">
                        <DollarSign size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-950 mb-0.5">Guaranteed Secure Payouts</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">No chasing unpaid invoices. Brands fund your milestones in advance, ensuring safe and direct payouts.</p>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex gap-4 items-start group/item hover:bg-slate-50/50 p-3 -m-3 rounded-2xl transition-all duration-300">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-sm border border-amber-100/30">
                        <Zap size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-950 mb-0.5">Direct Brand Collaboration</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Pitch directly to active briefs on the global discovery console. Keep 100% of your deal value without agent fees.</p>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="flex gap-4 items-start group/item hover:bg-slate-50/50 p-3 -m-3 rounded-2xl transition-all duration-300">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 shadow-sm border border-slate-200">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-950 mb-0.5">Automated Media Kit</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Sync your platforms to compile a dynamic media kit that displays verified stats and past collabs directly to brands.</p>
                      </div>
                    </div>
                  </div>
                </div>
             )}
          </div>
        </div>
      </div>

      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={otpEmail}
        onVerificationSuccess={handleOtpVerified}
        title={pendingRegType === 'GOOGLE' ? 'Verify Google Email Address' : 'Email Security Verification'}
      />
    </div>
  );
};

export default Register;
