import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Target, Star, ShieldCheck, Zap, ChevronRight, TrendingUp, CheckCircle, Image as ImageIcon, MessageSquare, DollarSign, Award, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreatorGuidelines = () => {
  const [activeStep, setActiveStep] = useState(0);

  const roadmapSteps = [
    {
      id: 'onboarding',
      title: 'Profile Optimization',
      subtitle: 'Setting up for Success',
      icon: <ImageIcon size={24} />,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      glowColor: 'shadow-indigo-500/20',
      gradient: 'from-indigo-500 to-blue-500',
      description: 'Your profile is your digital storefront. Make sure you leave a lasting impression before applying to any campaigns.',
      tips: [
        'Upload a high-quality avatar and cover image.',
        'Link all your active social media accounts with up-to-date stats.',
        'Upload a professional Media Kit (PDF) outlining your previous work.',
        'Write a compelling bio that clearly states your niche and target audience.'
      ]
    },
    {
      id: 'applying',
      title: 'Applying to Campaigns',
      subtitle: 'Stand Out from the Crowd',
      icon: <Target size={24} />,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      glowColor: 'shadow-orange-500/20',
      gradient: 'from-orange-500 to-amber-500',
      description: 'Brands receive hundreds of applications. Your pitch needs to be tailored, professional, and convincing.',
      tips: [
        'Read the campaign requirements thoroughly before applying.',
        'Write a personalized cover letter. Do not use generic copy-paste templates.',
        'Explain specifically how your audience aligns with the brand’s goals.',
        'Propose a unique content angle or idea in your pitch.'
      ]
    },
    {
      id: 'execution',
      title: 'Executing Deliverables',
      subtitle: 'Professionalism & Quality',
      icon: <MessageSquare size={24} />,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      glowColor: 'shadow-emerald-500/20',
      gradient: 'from-emerald-500 to-teal-500',
      description: 'Once you win a deal, clear communication and high-quality deliverables are key to securing long-term partnerships.',
      tips: [
        'Communicate promptly through the platform’s chat system.',
        'Submit drafts for review well before the deadline.',
        'Be receptive to feedback and handle revision requests professionally.',
        'Ensure the final post matches the agreed-upon requirements exactly.'
      ]
    },
    {
      id: 'growth',
      title: 'Getting Paid & Scaling',
      subtitle: 'Building Your Reputation',
      icon: <TrendingUp size={24} />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      glowColor: 'shadow-purple-500/20',
      gradient: 'from-purple-500 to-fuchsia-500',
      description: 'Complete deals successfully to unlock your payments, earn 5-star ratings, and get invited to exclusive premium campaigns.',
      tips: [
        'Upload the final post link to trigger the milestone release.',
        'Maintain a 5-star rating to rank higher in the creator directory.',
        'Build long-term relationships with brands for recurring deals.',
        'Update your media kit regularly with your latest successful campaigns.'
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
      {/* Decorative Interactive Background Rings */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-200/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-200/20 rounded-full blur-[100px] pointer-events-none z-0" />
      
      <div className="max-w-[1000px] mx-auto px-4 pt-12 md:pt-24 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={headerVariants}
          className="text-center mb-20 relative"
        >
          <motion.div 
            className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-3xl mb-6 relative group cursor-pointer"
            whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-indigo-300/30 rounded-3xl filter blur-md group-hover:blur-xl transition-all duration-300 opacity-70" />
            <Rocket className="text-indigo-600 relative z-10" size={36} />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight mb-6 text-gray-900 leading-tight">
            Creator <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Guidelines</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Your interactive roadmap to success. Learn the steps, optimize your workflow, and level up your collaborations on kino.
          </p>
        </motion.div>

        {/* Roadmap Timeline */}
        <div className="relative">
          {/* Vertical Progress Line */}
          <div className="absolute left-6 md:left-1/2 top-8 bottom-8 w-[4px] bg-gray-200 -translate-x-1/2 rounded-full hidden md:block overflow-hidden">
            {/* Animated Progress Indicator */}
            <motion.div 
              className="w-full bg-gradient-to-b from-indigo-500 via-orange-500 to-purple-500 origin-top"
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
                            Step 0{index + 1}
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

                  {/* Center Timeline Icon Node */}
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

                  {/* Empty Spacer to hold layout balance */}
                  <div className="hidden md:block flex-1 animate-pulse" />
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Call to Action Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 60 }}
          className="mt-28 text-center bg-gray-950 rounded-[48px] p-12 sm:p-16 relative overflow-hidden shadow-2xl"
        >
          {/* Neon Glow spots */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
          
          <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto">
            <div className="p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-md">
              <Award className="text-indigo-400" size={28} />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-4 leading-tight">
              Ready to claim campaigns?
            </h2>
            <p className="text-gray-400 text-base md:text-lg mb-8 font-medium">
              Put these guidelines into practice and start connecting with matching brands right away.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/campaigns" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-100 transition-all shadow-xl group"
              >
                Browse Campaigns 
                <ArrowUpRight className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" size={16} />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatorGuidelines;
