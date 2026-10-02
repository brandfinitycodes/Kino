import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LottieComponent from "lottie-react";
const Lottie = LottieComponent.default || LottieComponent;
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { PlayCircle, BadgeCheck, FilePlus, Users, ClipboardCheck, TrendingUp, ArrowRight, ChevronRight, User, Building2, Globe, Share2, Mail, Target, Zap, Search, ShieldCheck, HelpCircle, Plus, Minus, Sparkles, Laptop, Gamepad2, Heart } from "lucide-react";
import { Instagram, Twitter, Facebook, Youtube as YoutubeIcon } from "../components/SocialIcons";

import animationCreator from "../assets/creator.json";
import axios from "../utils/axios";

// Retain framer-motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: (i = 0) => {
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
    return {
      opacity: 0,
      x: isDesktop ? (i === 0 ? "154%" : i === 1 ? "52%" : i === 2 ? "-52%" : "-154%") : 0,
      y: isDesktop ? 80 : 40,
      scale: isDesktop ? 0.5 : 0.8,
      rotate: isDesktop ? (i - 1.5) * 8 : 0,
      zIndex: 10 - i,
    };
  },
  visible: (i = 0) => {
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
    return {
      opacity: isDesktop ? [0, 1, 1] : 1,
      x: isDesktop ? [i === 0 ? "154%" : i === 1 ? "52%" : i === 2 ? "-52%" : "-154%", 0, 0] : 0,
      y: isDesktop ? [80, 80, 0] : 0,
      scale: isDesktop ? [0.5, 0.5, 1] : 1,
      rotate: isDesktop ? [(i - 1.5) * 8, 0, 0] : 0,
      zIndex: isDesktop ? [10 - i, 10 - i, 1] : 1,
      transition: {
        duration: 0.7,
        times: [0, 0.4, 1],
        ease: "easeInOut",
      },
    };
  },
};

const campaignVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.15, type: "spring", stiffness: 70 },
  }),
};

const performerVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 50 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * 0.1, stiffness: 100 },
  }),
};

const stepContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.25, delayChildren: 0.3 },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

const getFloatingVariants = (delay, rotateVal = 0, floatY = -20, floatR = 3) => ({
  hidden: { opacity: 0, scale: 0.3, y: 30, rotate: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    y: [30, 0, floatY, 0],
    rotate: [0, rotateVal, rotateVal + floatR, rotateVal],
    transition: {
      opacity: { duration: 0.5, delay, ease: "easeOut" },
      scale: { duration: 0.5, delay, ease: "easeOut" },
      y: {
        times: [0, 0.1, 0.55, 1],
        delay: delay,
        duration: 5,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut"
      },
      rotate: {
        times: [0, 0.1, 0.55, 1],
        delay: delay,
        duration: 5,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut"
      }
    }
  }
});

const OldHome = () => {
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [featuredCreators, setFeaturedCreators] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const campaignRes = await axios.get("/campaigns");
        const creatorRes = await axios.get("/creators");
        setFeaturedCampaigns(campaignRes.data.slice(0, 3));
        setFeaturedCreators(creatorRes.data.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch featured content", error);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="bg-white text-gray-900 transition-colors duration-300 font-sans">
      <main className="">
        {/* Hero Section */}
        <section
          onMouseMove={handleMouseMove}
          className="relative px-8 py-20 lg:py-32 min-h-[90vh] flex items-center justify-center overflow-hidden group"
        >
          {/* Subtle Abstract Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/80 via-white to-white pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#EA580C]/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 -translate-x-1/3"></div>
          {/* Cursor Glow Spotlight */}
          <div className="cursor-glow" />

          {/* Floating Elements Container */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Floating Items with Staggered Zoom & Float Animations */}
            <motion.div
              className="absolute top-[6%] sm:top-[10%] left-[3%] sm:left-[10%] h-12 sm:h-20"
              variants={getFloatingVariants(0.45, 0, -10, 2)}
              initial="hidden"
              animate="visible"
            >
              <img src="1-hero.png" className="w-12 h-12 sm:w-20 sm:h-20 lg:w-32 lg:h-32 border-[4px] border-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] object-cover" alt="" />
            </motion.div>

            <motion.div
              className="absolute top-[12%] sm:top-[20%] right-[4%] sm:right-[12%]"
              variants={getFloatingVariants(0.58, 4, -15, 3)}
              initial="hidden"
              animate="visible"
            >
              <div className="p-2 sm:p-4 lg:p-6 rounded-full bg-white border border-gray-100 shadow-[0_15px_35px_rgba(0,0,0,0.06)] flex items-center justify-center">
                <Instagram className="w-4 h-4 sm:w-6 sm:h-6 lg:w-10 lg:h-10 text-pink-500" />
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-[8%] sm:bottom-[10%] right-[6%] sm:right-[15%] h-16 sm:h-28"
              variants={getFloatingVariants(0.71, -3, -12, -2)}
              initial="hidden"
              animate="visible"
            >
              <img src="3-hero.png" className="w-10 h-10 sm:w-16 sm:h-16 lg:w-28 lg:h-28 border-[4px] border-white rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.08)] object-cover" alt="" />
            </motion.div>

            <motion.div
              className="absolute top-[45%] left-[2%] sm:left-[5%]"
              variants={getFloatingVariants(0.84, -5, -8, 2)}
              initial="hidden"
              animate="visible"
            >
              <div className="p-2 sm:p-3 lg:p-5 rounded-full bg-white border border-gray-100 shadow-[0_15px_35px_rgba(0,0,0,0.06)] flex items-center justify-center">
                <YoutubeIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-8 lg:h-8 text-red-500" />
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-[35%] sm:bottom-[40%] right-[2%] sm:right-[5%]"
              variants={getFloatingVariants(0.97, 3, -10, -3)}
              initial="hidden"
              animate="visible"
            >
              <div className="p-2 sm:p-3 lg:p-5 rounded-full bg-white border border-gray-100 shadow-[0_15px_35px_rgba(0,0,0,0.06)] flex items-center justify-center">
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5 lg:w-8 lg:h-8 text-blue-400" />
              </div>
            </motion.div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-[#EA580C]/10 text-[#EA580C] text-[10px] font-black tracking-[0.2em] uppercase mb-8 shadow-sm">
                Premium Creator Network
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-black font-display tracking-tight leading-[1.05] text-gray-900 mb-8 drop-shadow-sm">
                Hire <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Creators</span> <br />
                To Promote Your <br />
                <TypeAnimation
                  sequence={[
                    "Brand",
                    2500,
                    "Vision",
                    2500,
                    "Product",
                    2500,
                  ]}
                  wrapper="span"
                  speed={15}
                  repeat={Infinity}
                  className="inline-block text-[#EA580C]"
                />
              </h1>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                <Link
                  to="/register"
                  className="px-10 py-4 rounded-xl bg-gray-900 text-white font-bold text-sm tracking-widest uppercase hover:bg-[#EA580C] shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_35px_rgba(234,88,12,0.3)] transition-all duration-300"
                >
                  Start Free 30 Days Trial
                </Link>
                <Link
                  to="/how-it-works"
                  className="px-10 py-4 rounded-xl bg-white text-gray-900 font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm transition-all duration-300 group"
                >
                  <PlayCircle className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />{" "}
                  How It Works
                </Link>
              </div>

              {/* Trustpilot Placeholder */}
              <div className="mt-12 flex items-center justify-center gap-3 bg-white/60 backdrop-blur-sm py-2 px-6 rounded-full w-max mx-auto border border-white shadow-sm">
                <div className="flex items-center gap-1 text-emerald-500 font-bold">
                  <BadgeCheck className="w-5 h-5" />
                  <span className="text-sm">Trustpilot</span>
                </div>
                <div className="flex gap-0.5 text-amber-400">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest border-l border-gray-300 pl-3">10000+ Reviews</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Marquee Banner */}
        <div className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 text-white overflow-hidden py-3 shadow-inner">
          <div className="flex animate-marquee whitespace-nowrap opacity-90 font-bold text-xs uppercase tracking-[0.2em]">
            <div className="px-4">
              Premium Talent &bull; Global Missions &bull; Secure Payments &bull; High-Impact Content &bull; Verified Creators &bull; Editorial Precision &bull;&nbsp;
            </div>
            <div className="px-4">
              Premium Talent &bull; Global Missions &bull; Secure Payments &bull; High-Impact Content &bull; Verified Creators &bull; Editorial Precision &bull;&nbsp;
            </div>
          </div>
        </div>

        {/* Stats Banner */}
        <section className="relative -mt-12 mx-4 sm:mx-8 lg:mx-20 z-20">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 text-center divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
              <div className="flex flex-col gap-1 p-8 sm:py-10 hover:bg-gray-50/50 transition-colors">
                <span className="text-4xl lg:text-5xl font-black font-display text-indigo-600 tracking-tight">
                  2,400+
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Creators
                </span>
              </div>
              <div className="flex flex-col gap-1 p-8 sm:py-10 hover:bg-gray-50/50 transition-colors">
                <span className="text-4xl lg:text-5xl font-black font-display text-[#eb4898] tracking-tight">
                  850+
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Campaigns
                </span>
              </div>
              <div className="flex flex-col gap-1 p-8 sm:py-10 hover:bg-gray-50/50 transition-colors">
                <span className="text-4xl lg:text-5xl font-black font-display text-blue-500 tracking-tight">
                  🪙12Cr+
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Deals
                </span>
              </div>
              <div className="flex flex-col gap-1 p-8 sm:py-10 hover:bg-gray-50/50 transition-colors">
                <span className="text-4xl lg:text-5xl font-black font-display text-emerald-500 tracking-tight">
                  98%
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Satisfaction
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (Bento Grid) */}
        <section className="py-24 px-8 bg-gray-50/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="mb-16 text-center max-w-2xl mx-auto">
              <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black tracking-widest uppercase mb-4 shadow-sm border border-indigo-100/50">
                Streamlined Collaboration
              </span>
              <h2 className="text-4xl lg:text-5xl font-black font-display text-gray-900 mb-6 tracking-tight">
                Launch impactful campaigns in four steps.
              </h2>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <motion.div
                custom={0}
                variants={cardVariants}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 group flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <FilePlus className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black font-display text-gray-900 mb-3 tracking-tight">
                  Brands Post
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  Define your niche, budget, and creative requirements in minutes.
                </p>
              </motion.div>

              <motion.div
                custom={1}
                variants={cardVariants}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 group flex flex-col items-center text-center lg:mt-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center text-[#eb4898] mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black font-display text-gray-900 mb-3 tracking-tight">
                  Creators Apply
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  Our hand-picked creator network applies with personalized pitches.
                </p>
              </motion.div>

              <motion.div
                custom={2}
                variants={cardVariants}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 group flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-[#EA580C] mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <ClipboardCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black font-display text-gray-900 mb-3 tracking-tight">
                  2-Step Approval
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  Review profiles and analytics before finalizing your dream team.
                </p>
              </motion.div>

              <motion.div
                custom={3}
                variants={cardVariants}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 group flex flex-col items-center text-center lg:mt-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black font-display text-gray-900 mb-3 tracking-tight">
                  Collaborate &amp; Grow
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  Scale your brand through authentic content and tracked performance.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Featured Campaigns */}
        <section className="py-24 px-8 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
              <div className="max-w-2xl">
                <span className="text-[#EA580C] text-[10px] font-black tracking-[0.3em] uppercase mb-4 block">Marketplace Hub</span>
                <h2 className="text-5xl lg:text-6xl font-black font-display text-gray-900 leading-none tracking-tight">
                  Trending <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA580C] to-[#BE123C]">Campaigns</span>
                </h2>
              </div>
              <Link
                to="/campaigns"
                className="group flex items-center gap-3 bg-gray-50 px-8 py-4 rounded-xl border border-gray-200 hover:border-[#EA580C] hover:bg-white transition-all shadow-sm"
              >
                <span className="font-black uppercase tracking-widest text-[11px] text-gray-700 group-hover:text-[#EA580C]">View All Missions</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#EA580C]" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {featuredCampaigns.length > 0 ? (
                featuredCampaigns.map((campaign, i) => (
                  <motion.div
                    key={campaign._id}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ amount: 0.2 }}
                    variants={campaignVariants}
                    className="group"
                  >
                    <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-500 h-full flex flex-col">
                      <div className="h-48 relative bg-gradient-to-br from-indigo-50 to-white overflow-hidden border-b border-gray-50">
                        <div className="absolute top-4 right-4 z-10">
                          <span className="bg-white/80 backdrop-blur-md text-gray-900 shadow-sm text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-gray-100">
                            Priority
                          </span>
                        </div>
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-20 h-20 bg-white rounded-[1rem] flex items-center justify-center font-black text-indigo-600 text-3xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] transform group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500 border border-gray-50">
                            {campaign.brandId?.logo ? (
                              <img src={campaign.brandId.logo} alt="Logo" className="w-full h-full rounded-[1rem] object-cover" />
                            ) : (
                              campaign.brandId?.businessName?.[0] || "C"
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-8 flex-grow flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-md shadow-sm">
                            {campaign.niche || "General"}
                          </span>
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                            {campaign.status}
                          </span>
                        </div>
                        <h3 className="text-xl font-black font-display text-gray-900 mb-3 group-hover:text-[#EA580C] transition-colors line-clamp-2">
                          {campaign.title}
                        </h3>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8 line-clamp-2">
                          {campaign.description}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-100">
                          <div>
                            <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">Budget Allocation</p>
                            <p className="text-lg font-black text-gray-900 font-display">
                              🪙{campaign.budget?.toLocaleString()}
                            </p>
                          </div>
                          <Link
                            to={`/campaigns/${campaign._id}`}
                            className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 border border-gray-200 flex items-center justify-center hover:bg-[#EA580C] hover:text-white hover:border-[#EA580C] transition-all shadow-sm group/btn"
                          >
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-3 bg-gray-50 rounded-[2rem] text-center py-20 border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 font-bold text-lg mb-4">No active missions available</p>
                  <Link to="/register" className="text-[#EA580C] font-black hover:underline tracking-widest uppercase text-[11px]">Post the first one →</Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Top Performers */}
        <section className="py-24 px-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black tracking-widest uppercase mb-4 shadow-sm border border-indigo-100/50">
                Top Performers
              </span>
              <h2 className="text-4xl lg:text-5xl font-black font-display text-gray-900 mb-4 tracking-tight">
                Meet the elite creator network.
              </h2>
              <p className="text-gray-500 text-lg">
                Setting new standards for brand storytelling and engagement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredCreators.length > 0 ? (
                featuredCreators.map((creator, i) => (
                  <motion.div
                    key={creator._id}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ amount: 0.2 }}
                    variants={performerVariants}
                    className="bg-white p-6 rounded-[2rem] text-center border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 group flex flex-col items-center"
                  >
                    <div className="relative w-28 h-28 mx-auto mb-6">
                      {creator.profilePicture ? (
                        <img
                          alt="Avatar"
                          className="w-full h-full object-cover rounded-full p-1 ring-2 ring-indigo-100 group-hover:ring-indigo-300 transition-all shadow-sm"
                          src={creator.profilePicture}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-4xl p-1 ring-2 ring-indigo-100 group-hover:ring-indigo-300 transition-all shadow-sm">
                          <span className="text-gray-400">👤</span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md text-emerald-500 border border-gray-100">
                        <BadgeCheck className="w-6 h-6" />
                      </div>
                    </div>
                    <h4 className="text-xl font-black text-gray-900 font-display tracking-tight group-hover:text-indigo-600 transition-colors">
                      {creator.name}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-6">
                      {creator.niche}
                    </p>
                    <div className="grid grid-cols-2 gap-3 w-full mb-6">
                      <div className="bg-gray-50 py-3 rounded-xl border border-gray-100 shadow-inner">
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1 font-bold">
                          Response
                        </p>
                        <p className="text-sm font-black text-gray-900 font-display">
                          {creator.responseTime || "< 24H"}
                        </p>
                      </div>
                      <div className="bg-gray-50 py-3 rounded-xl border border-gray-100 shadow-inner">
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1 font-bold">
                          Followers
                        </p>
                        <p className="text-sm font-black text-gray-900 font-display">
                          {creator.followerCount >= 1000
                            ? (creator.followerCount / 1000).toFixed(1) + "K"
                            : creator.followerCount || 0}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/creators/${creator._id}`}
                      className="w-full py-3 rounded-xl bg-indigo-50/50 text-indigo-600 font-black text-[11px] uppercase tracking-widest flex justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100/50 group-hover:border-indigo-600"
                    >
                      View Profile
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-4 card text-center py-12 text-on-surface-variant bg-surface-container">
                  No creators registered yet — {" "}
                  <Link
                    to="/register"
                    className="text-secondary font-bold hover:underline"
                  >
                    join as a creator
                  </Link>
                  .
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Niche Showcase Grid Section */}
        <section className="py-24 px-8 bg-white relative overflow-hidden border-t border-gray-100">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <span className="inline-block px-4 py-1.5 rounded-full bg-pink-50 text-pink-600 text-[10px] font-black tracking-widest uppercase mb-4 shadow-sm border border-pink-100">
                Creative Niches
              </span>
              <h2 className="text-4xl lg:text-5xl font-black font-display text-gray-900 mb-4 tracking-tight">
                Explore Popular Categories
              </h2>
              <p className="text-gray-500 text-lg">
                Discover creators across elite verticals tailored for high conversion rates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { title: "Tech & Gadgets", icon: Laptop, count: "+420 Creators", stat: "98% Completion", color: "text-indigo-500", bg: "bg-indigo-50" },
                { title: "Fashion & Beauty", icon: Sparkles, count: "+840 Creators", stat: "4.8 Engagement", color: "text-pink-500", bg: "bg-pink-50" },
                { title: "Gaming & Esport", icon: Gamepad2, count: "+310 Creators", stat: "🪙2.2Cr Deals", color: "text-[#EA580C]", bg: "bg-orange-50" },
                { title: "Travel & Food", icon: Globe, count: "+560 Creators", stat: "94% Reach Rate", color: "text-emerald-500", bg: "bg-emerald-50" },
                { title: "Fitness & Wellness", icon: Heart, count: "+290 Creators", stat: "96% Retention", color: "text-rose-500", bg: "bg-rose-50" }
              ].map((niche, index) => {
                const Icon = niche.icon;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="relative overflow-hidden bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] group hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className={`w-12 h-12 rounded-xl ${niche.bg} flex items-center justify-center mb-6 shadow-inner`}>
                        <Icon className={`w-6 h-6 ${niche.color} group-hover:scale-110 transition-transform`} />
                      </div>
                      <h4 className="text-lg font-black text-gray-900 mb-2 font-display group-hover:text-indigo-600 transition-colors tracking-tight">
                        {niche.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">
                        {niche.count}
                      </p>
                    </div>
                    <div className="bg-gray-50 py-2 px-3 rounded-xl border border-gray-100 shadow-inner">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-0.5">Vertical Stat</span>
                      <span className="text-xs font-black text-gray-900 font-display">{niche.stat}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Operation Protocol (Redesign) */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 bg-gray-50/50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16 sm:mb-24">
              <div className="lg:w-1/2">
                <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black tracking-[0.2em] uppercase mb-4 shadow-sm border border-emerald-100/50">
                  Workflow Protocol
                </span>
                <h2 className="text-4xl sm:text-6xl lg:text-[5.5rem] font-black font-display text-gray-900 leading-none tracking-tight">
                  Two sides. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">One platform.</span>
                </h2>
              </div>
              <div className="lg:w-5/12 pt-6 sm:pt-12 border-l-[3px] border-emerald-200 pl-6 sm:pl-10">
                <p className="text-gray-500 text-lg sm:text-xl leading-relaxed font-medium">
                  Whether you're a creator scaling your influence or a brand
                  building a legacy — we provide the secure infrastructure
                  for high-impact collaboration.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
              {/* For Creators */}
              <div className="space-y-8 sm:space-y-12">
                <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                  <div className="w-2 sm:w-2.5 h-10 sm:h-12 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.3)]"></div>
                  <h3 className="text-2xl sm:text-4xl font-black font-display text-gray-900 uppercase tracking-tight">For Creators</h3>
                </div>

                <div className="grid gap-6 sm:gap-10">
                  <motion.div
                    whileHover={{ y: -8, x: 5 }}
                    className="relative overflow-hidden bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.04)] group hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500"
                  >
                    <span className="absolute top-4 sm:top-6 right-6 sm:right-12 text-6xl sm:text-9xl font-black text-gray-50 select-none group-hover:text-indigo-50 transition-colors">01</span>
                    <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-6 sm:mb-8 shadow-inner">
                      <User className="w-6 sm:w-8 h-6 sm:h-8" />
                    </div>
                    <h4 className="text-2xl sm:text-3xl font-black font-display text-gray-900 mb-3 sm:mb-4 group-hover:text-indigo-600 transition-colors tracking-tight">Build your profile</h4>
                    <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-medium">
                      Showcase your niche, follower stats, past work, and rate card. Connect networks seamlessly.
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -8, x: 5 }}
                    className="relative overflow-hidden bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.04)] group hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500"
                  >
                    <span className="absolute top-4 sm:top-6 right-6 sm:right-12 text-6xl sm:text-9xl font-black text-gray-50 select-none group-hover:text-indigo-50 transition-colors">02</span>
                    <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-6 sm:mb-8 shadow-inner">
                      <Target className="w-6 sm:w-8 h-6 sm:h-8" />
                    </div>
                    <h4 className="text-2xl sm:text-3xl font-black font-display text-gray-900 mb-3 sm:mb-4 group-hover:text-indigo-600 transition-colors tracking-tight">Browse campaigns</h4>
                    <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-medium">
                      Filter by category, budget, and region. Apply to missions that match your unique storytelling style.
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -8, x: 5 }}
                    className="relative overflow-hidden bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.04)] group hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500"
                  >
                    <span className="absolute top-4 sm:top-6 right-6 sm:right-12 text-6xl sm:text-9xl font-black text-gray-50 select-none group-hover:text-indigo-50 transition-colors">03</span>
                    <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-6 sm:mb-8 shadow-inner">
                      <Zap className="w-6 sm:w-8 h-6 sm:h-8" />
                    </div>
                    <h4 className="text-2xl sm:text-3xl font-black font-display text-gray-900 mb-3 sm:mb-4 group-hover:text-indigo-600 transition-colors tracking-tight">Execute & Get Paid</h4>
                    <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-medium">
                      Collaborate through our secure dashboard, complete milestones, and receive automated payouts.
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* For Brands */}
              <div className="space-y-8 sm:space-y-12 lg:mt-32">
                <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                  <div className="w-2 sm:w-2.5 h-10 sm:h-12 bg-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.3)]"></div>
                  <h3 className="text-2xl sm:text-4xl font-black font-display text-gray-900 uppercase tracking-tight">For Brands</h3>
                </div>

                <div className="grid gap-6 sm:gap-10">
                  <motion.div
                    whileHover={{ y: -8, x: -5 }}
                    className="relative overflow-hidden bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.04)] group hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500"
                  >
                    <span className="absolute top-4 sm:top-6 right-6 sm:right-12 text-6xl sm:text-9xl font-black text-gray-50 select-none group-hover:text-pink-50 transition-colors">01</span>
                    <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 mb-6 sm:mb-8 shadow-inner">
                      <Search className="w-6 sm:w-8 h-6 sm:h-8" />
                    </div>
                    <h4 className="text-2xl sm:text-3xl font-black font-display text-gray-900 mb-3 sm:mb-4 group-hover:text-pink-600 transition-colors tracking-tight">Find the right talent</h4>
                    <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-medium">
                      Use advanced filters to discover creators that align with your brand values and mission.
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -8, x: -5 }}
                    className="relative overflow-hidden bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.04)] group hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500"
                  >
                    <span className="absolute top-4 sm:top-6 right-6 sm:right-12 text-6xl sm:text-9xl font-black text-gray-50 select-none group-hover:text-pink-50 transition-colors">02</span>
                    <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 mb-8 shadow-inner">
                      <ShieldCheck className="w-6 sm:w-8 h-6 sm:h-8" />
                    </div>
                    <h4 className="text-2xl sm:text-3xl font-black font-display text-gray-900 mb-3 sm:mb-4 group-hover:text-pink-600 transition-colors tracking-tight">Set clear milestones</h4>
                    <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-medium">
                      Define deliverables and protect your budget with our secure payment pipeline.
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -8, x: -5 }}
                    className="relative overflow-hidden bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.04)] group hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500"
                  >
                    <span className="absolute top-4 sm:top-6 right-6 sm:right-12 text-6xl sm:text-9xl font-black text-gray-50 select-none group-hover:text-pink-50 transition-colors">03</span>
                    <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 mb-8 shadow-inner">
                      <TrendingUp className="w-6 sm:w-8 h-6 sm:h-8" />
                    </div>
                    <h4 className="text-2xl sm:text-3xl font-black font-display text-gray-900 mb-3 sm:mb-4 group-hover:text-pink-600 transition-colors tracking-tight">Scale with confidence</h4>
                    <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-medium">
                      Manage all collaborations in one command center with real-time analytics and tracking.
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive FAQ Accordion Section */}
        <section className="py-24 px-8 bg-white border-t border-gray-100 relative overflow-hidden">
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full bg-orange-50 text-[#EA580C] text-[10px] font-black tracking-widest uppercase mb-4 shadow-sm border border-orange-100/50">
                Knowledge Base
              </span>
              <h2 className="text-4xl font-black font-display text-gray-900 mb-4 tracking-tight">
                Frequently Answered Protocols
              </h2>
              <p className="text-gray-500 text-lg">
                Common inquiries regarding security, workflow, integration, and payouts.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {[
                {
                  q: "How does Secure Payments payment work?",
                  a: "Brands deposit funds before campaign launch. Payment is secured and released after delivery through our payment partners. This ensures complete budget safety and guaranteed payment for work."
                },
                {
                  q: "Are creator stats and followers verified?",
                  a: "Yes. We perform real-time verification of creator profiles, analytics, and engagement metrics via API integrations. This filters out bot accounts and guarantees that you collaborate with high-impact organic talent."
                },
                {
                  q: "Can I register as both a Brand and a Creator?",
                  a: "To maintain separate command dashboards and analytics structures, you must register separate accounts using different email credentials. This ensures console operations are separated perfectly."
                },
                {
                  q: "What is the typical campaign turnaround time?",
                  a: "Most campaigns go from posting to creator matching within 48 hours. Creators submit draft contents for review within the platform, allowing final deliverables to match your brand requirements within 7 to 10 days."
                }
              ].map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md hover:border-gray-300"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                      <span className="text-lg font-black font-display text-gray-900 leading-tight">
                        {faq.q}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                      {activeFaq === index ? (
                        <Minus className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Plus className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out origin-top ${activeFaq === index
                        ? 'max-h-48 border-t border-gray-100 opacity-100'
                        : 'max-h-0 opacity-0 pointer-events-none'
                      }`}
                  >
                    <p className="p-6 text-gray-600 font-medium leading-relaxed bg-gray-50/50">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 sm:py-32 px-4 sm:px-8 bg-gray-50/50 relative overflow-hidden">
          {/* Global Glow Backgrounds */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-40">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#EA580C]/10 rounded-full blur-[120px]"></div>
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="relative overflow-hidden rounded-[2.5rem] sm:rounded-[4rem] bg-gray-900 border border-gray-800 shadow-[0_30px_60px_rgba(0,0,0,0.2)] p-8 sm:p-16 lg:p-24 text-center group transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-[#EA580C]/20 opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>

              <div className="relative z-10">
                <span className="inline-block px-6 py-2 rounded-full bg-white/10 text-white backdrop-blur-md text-xs font-black tracking-widest uppercase mb-6 sm:mb-10 border border-white/20">
                  Global Opportunity
                </span>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display text-white mb-6 sm:mb-10 leading-[1.05] tracking-tight">
                  Scale Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-[#EA580C] group-hover:from-[#EA580C] group-hover:to-pink-500 transition-all duration-1000">Digital Legacy</span>
                </h2>
                <p className="text-gray-400 text-md sm:text-xl max-w-2xl mx-auto mb-8 sm:mb-16 font-medium leading-relaxed">
                  Join 850+ forward-thinking brands and thousands of creators
                  redefining the editorial landscape.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                  <Link
                    to="/register"
                    className="w-full sm:w-auto bg-[#EA580C] text-white px-10 py-5 rounded-2xl font-bold text-sm tracking-widest uppercase shadow-[0_15px_30px_rgba(234,88,12,0.3)] hover:bg-[#c2410a] hover:-translate-y-1 transition-all"
                  >
                    Start Your Campaign
                  </Link>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto bg-gray-800 text-white px-10 py-5 rounded-2xl font-bold text-sm tracking-widest uppercase border border-gray-700 hover:border-gray-600 hover:bg-gray-700 hover:-translate-y-1 transition-all shadow-[0_15px_30px_rgba(0,0,0,0.2)]"
                  >
                    Join Creator Ranks
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OldHome;
