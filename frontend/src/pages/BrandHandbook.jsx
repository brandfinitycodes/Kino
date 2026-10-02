import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, ShieldCheck, Target, ChevronRight, BarChart3, PlusCircle, CheckCircle, Search, CircleDollarSign, ArrowUpRight, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const BrandHandbook = () => {
  const [activeStep, setActiveStep] = useState(0);

  const roadmapSteps = [
    {
      id: 'creation',
      title: 'Campaign Creation',
      subtitle: 'Designing the Perfect Pitch',
      icon: <PlusCircle size={24} />,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      glowColor: 'shadow-orange-500/20',
      gradient: 'from-orange-500 to-red-500',
      description: 'The foundation of a successful influencer marketing push starts with a clear, detailed campaign brief.',
      tips: [
        'Set realistic budgets based on your required follower count and niche.',
        'Clearly outline required deliverables (e.g. 1 Reel, 2 Stories).',
        'Specify any preferred location targeting or demographics.',
        'Detail any exact talking points or "do not say" lists in the description.'
      ]
    },
    {
      id: 'discovery',
      title: 'Creator Discovery',
      subtitle: 'Finding Your Perfect Match',
      icon: <Search size={24} />,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      glowColor: 'shadow-indigo-500/20',
      gradient: 'from-indigo-500 to-blue-500',
      description: 'Don\'t just wait for applications—actively scout our database of verified creators to find your ideal partners.',
      tips: [
        'Use the Creator Directory to filter by niche and platform.',
        'Save promising profiles to your Wishlist for future campaigns.',
        'Review a creator\'s past ratings and Media Kit before hiring.',
        'Reach out proactively if their style aligns with your brand identity.'
      ]
    },
    {
      id: 'management',
      title: 'Deal Management',
      subtitle: 'Secure & Transparent Workflows',
      icon: <ShieldCheck size={24} />,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      glowColor: 'shadow-emerald-500/20',
      gradient: 'from-emerald-500 to-teal-500',
      description: 'Our milestone-based escrow system ensures you only pay for content that meets your standards.',
      tips: [
        'Secure funds upfront to activate the deal and show the creator you are serious.',
        'Use the built-in chat for all revisions and feedback.',
        'Never release funds until you are 100% satisfied with the final deliverables.',
        'Do not take communication off-platform, as we cannot mediate external disputes.'
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Re-engagement',
      subtitle: 'Scaling Your ROI',
      icon: <BarChart3 size={24} />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      glowColor: 'shadow-purple-500/20',
      gradient: 'from-purple-500 to-fuchsia-500',
      description: 'Track your spending, analyze campaign performance, and build long-term relationships with top-performing creators.',
      tips: [
        'Use your Financial Wallet dashboard to track deposits vs. spend.',
        'Leave detailed, honest reviews for creators to help the community.',
        'Re-hire creators who generated the most engagement for recurring campaigns.',
        'Adjust your future campaign budgets based on past ROI metrics.'
      ]
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 15 }
    }
  };

  const tipContainerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: {
        height: { type: "spring", stiffness: 100, damping: 20 },
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { ease: "easeInOut", duration: 0.25 },
        opacity: { duration: 0.15 }
      }
    }
  };

  const tipItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 120, damping: 12 } }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 font-sans pb-24 relative overflow-hidden">
      {/* Decorative Background Rings */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-orange-100/25 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] bg-emerald-100/20 rounded-full blur-[100px] pointer-events-none z-0" />
      
      <div className="max-w-[1000px] mx-auto px-4 pt-12 md:pt-24 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={headerVariants}
          className="text-center mb-20 relative"
        >
          <motion.div 
            className="inline-flex items-center justify-center p-4 bg-orange-50 rounded-3xl mb-6 relative group cursor-pointer"
            whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-orange-300/30 rounded-3xl filter blur-md group-hover:blur-xl transition-all duration-300 opacity-70" />
            <Building className="text-orange-600 relative z-10" size={36} />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight mb-6 text-gray-900 leading-tight">
            Brand <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Handbook</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Your interactive blueprint to high-ROI influencer campaigns. Learn how to discover, hire, and secure creator campaigns efficiently.
          </p>
        </motion.div>

        {/* Roadmap Timeline */}
        <div className="relative">
          {/* Vertical Progress Line */}
          <div className="absolute left-6 md:left-1/2 top-8 bottom-8 w-[4px] bg-gray-200 -translate-x-1/2 rounded-full hidden md:block overflow-hidden">
            {/* Animated Progress Line */}
            <motion.div 
              className="w-full bg-gradient-to-b from-orange-500 via-indigo-500 to-emerald-500 origin-top"
              initial={{ height: "0%" }}
              animate={{ height: `${((activeStep + 1) / roadmapSteps.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
              style={{ height: '100%' }}
            />
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col gap-12 md:gap-20"
          >
            {roadmapSteps.map((step, index) => {
              const isActive = activeStep === index;
              const isEven = index % 2 === 0;

              return (
                <motion.div 
                  key={step.id}
                  variants={stepVariants}
                  className={`relative flex flex-col md:flex-row items-stretch gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Content Box */}
                  <div className={`flex-1 w-full ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                    <motion.div 
                      onClick={() => setActiveStep(index)}
                      whileHover={{ y: -6, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`cursor-pointer transition-all duration-300 p-6 sm:p-8 rounded-[32px] border-2 bg-white shadow-sm hover:shadow-2xl flex flex-col justify-between ${
                        isActive 
                          ? `${step.borderColor} shadow-lg ring-1 ring-offset-2 ${step.bgColor.replace('10', '5')}` 
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between md:justify-start gap-4 mb-4">
                          <div className={`md:hidden p-3 rounded-2xl ${step.bgColor} ${step.color}`}>
                            {step.icon}
                          </div>
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${step.bgColor} ${step.color}`}>
                            Phase 0{index + 1}
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-black tracking-tight text-gray-900 mb-1">{step.title}</h3>
                        <p className={`text-sm font-bold uppercase tracking-widest mb-4 ${step.color}`}>{step.subtitle}</p>
                        <p className="text-gray-600 leading-relaxed mb-6 font-medium">
                          {step.description}
                        </p>
                      </div>
                      
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.div 
                            variants={tipContainerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="overflow-hidden"
                          >
                            <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
                              {step.tips.map((tip, i) => (
                                <motion.div 
                                  key={i} 
                                  variants={tipItemVariants}
                                  className={`flex items-start gap-3 ${isEven ? 'md:justify-end' : 'md:justify-start'} text-left`}
                                >
                                  <CheckCircle className={`shrink-0 mt-0.5 ${step.color}`} size={16} />
                                  <span className="text-sm text-gray-700 font-bold">{tip}</span>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  {/* Center Node */}
                  <div className="hidden md:flex items-center justify-center relative w-16 z-10">
                    <motion.div 
                      className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer relative ${
                        isActive 
                          ? `bg-gradient-to-r ${step.gradient} text-white shadow-lg ${step.glowColor}` 
                          : 'bg-white text-gray-400 border-2 border-gray-200'
                      }`}
                      animate={isActive ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                      transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6 }}
                      onClick={() => setActiveStep(index)}
                    >
                      {isActive && (
                        <motion.div 
                          className="absolute inset-[-4px] rounded-full border-2 border-dashed"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                          style={{ borderColor: isActive ? `var(--theme-primary)` : 'transparent' }}
                        />
                      )}
                      {step.icon}
                    </motion.div>
                  </div>

                  {/* Empty Spacer */}
                  <div className="hidden md:block flex-1 animate-pulse" />
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* CTA Area */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 60 }}
          className="mt-28 text-center bg-gray-950 rounded-[48px] p-12 sm:p-16 relative overflow-hidden shadow-2xl"
        >
          {/* Neon Glow spots */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
          
          <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto">
            <div className="p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-md">
              <Award className="text-orange-400" size={28} />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-4 leading-tight">
              Ready to post your first campaign?
            </h2>
            <p className="text-gray-400 text-base md:text-lg mb-8 font-medium">
              Start securing top creators with milestone protections and scale your brand reach today.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Link 
                  to="/brand-dashboard?tab=create" 
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-600 transition-all shadow-xl group"
                >
                  Create Campaign 
                  <ArrowUpRight className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" size={16} />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Link 
                  to="/creators" 
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/20 transition-all border border-white/15"
                >
                  Browse Creators 
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BrandHandbook;
