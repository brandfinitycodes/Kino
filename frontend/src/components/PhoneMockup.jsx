import React from 'react';
import { motion } from 'framer-motion';
import { Users, BadgeCheck, ShieldCheck, Building2, MousePointer2, TrendingUp } from 'lucide-react';

const PhoneMockup = React.memo(({
  transforms,
  states,
  actions,
  refs,
  data
}) => {
  const { 
    transformStr, darkOpacity, lightOpacity, accordionOpacity, chatOpacity,
    landscapeLeft, landscapeTop, landscapeWidth, landscapeHeight 
  } = transforms;

  const {
    currentInfluencerIndex, activeCarouselStep, activeAccordion, selectedBrandDetail,
    appliedBrands, fundsSecuredReleased, chatMessages, chatInputText, isTypingBrand,
    activePlatformSide, supportMessages, supportInputText, isTypingSupport,
    walletBalance, walletLockedFundsSecured, walletWithdrawalState, withdrawalUpi, withdrawnAmount,
    activeScreen
  } = states;

  const {
    handleApplyBrand, handleReleaseFundsSecured, handleSendChatMessage, setChatInputText,
    setActivePlatformSide, handleSendSupportMessage, setSupportInputText,
    handleInitiateWithdrawal, setWithdrawalUpi, handleConfirmWithdrawal
  } = actions;

  const { accordionChatEndRef, supportChatEndRef } = refs;
  const { influencerLoopData, analyticsData } = data;

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 280,
        height: 550,
        transformOrigin: 'center',
        transform: transformStr,
        zIndex: 40,
      }}
      className="pointer-events-none flex justify-center will-change-transform"
    >
      <div className="pointer-events-auto relative w-full h-full bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-gray-800 text-left">
        {/* Phone Speaker & Camera Bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-35 flex items-center justify-center">
          <div className="w-10 h-1 bg-white/20 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-white/20 rounded-full ml-3"></div>
        </div>

        {/* Phone Screen Shell */}
        <div className="w-full h-full rounded-[2rem] overflow-hidden relative border border-gray-950 flex flex-col bg-black">

          {/* HERO SCREEN: DARK LOOP */}
          <motion.div
            style={{ opacity: darkOpacity, pointerEvents: activeScreen === 'hero' ? 'auto' : 'none' }}
            className="absolute inset-0 bg-black flex flex-col z-10"
          >
            {/* Mock Status Bar */}
            <div className="h-8 bg-black/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 pt-2 select-none z-20">
              <span className="text-[10px] font-black text-white">09:41</span>
              <div className="flex gap-1.5 text-white/80 text-[10px] font-bold">
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>

            {/* Image Loop */}
            <div className="grow relative w-full overflow-hidden">
              {influencerLoopData.map((inf, idx) => (
                <motion.div
                  key={idx}
                  initial={false}
                  animate={{
                    opacity: currentInfluencerIndex === idx ? 1 : 0,
                    scale: currentInfluencerIndex === idx ? 1 : 1.05
                  }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <img src={inf.image} alt="Influencer" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 p-3.5 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/30">
                        {inf.niche}
                      </span>
                      <span className="text-[9px] font-black text-white flex items-center gap-0.5">
                        <Users size={9} className="text-orange-500" />
                        {inf.followers}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-white mt-1.5">{inf.handle}</h4>
                    <div className="h-px bg-white/10 my-2"></div>
                    <div className="flex justify-between items-center text-[9px] text-white/80 font-bold">
                      <span>Engagement: {inf.engagement}</span>
                      <span className="text-orange-400 font-extrabold">{inf.deal}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mock Home Indicator */}
            <div className="h-6 flex items-center justify-center pb-2 select-none z-20">
              <div className="w-20 h-1 bg-white/20 rounded-full"></div>
            </div>
          </motion.div>

          {/* CAROUSEL SCREEN: LIGHT STEPS */}
          <motion.div
            style={{ opacity: lightOpacity, pointerEvents: activeScreen === 'carousel' ? 'auto' : 'none' }}
            className="absolute inset-0 bg-[#FAFAFC] flex flex-col z-20"
          >
            {/* Mock Status Bar */}
            <div className="h-8 bg-white/60 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 pt-2 select-none z-20">
              <span className="text-[10px] font-black text-gray-900">09:41</span>
              <div className="flex gap-1.5 text-gray-900 text-[10px] font-bold">
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>

            <div className="grow relative overflow-hidden bg-[#FAFAFC]">
              {/* Step 1: Create Profile */}
              <motion.div
                initial={false}
                animate={{ opacity: activeCarouselStep === 0 ? 1 : 0, x: activeCarouselStep === 0 ? 0 : -20 }}
                className="absolute inset-0 p-5 flex flex-col pointer-events-none"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Avatar" className="w-full h-full rounded-full border-2 border-white object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900">@julia_travels</h4>
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Travel Creator</span>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-gray-500">Total Earnings</span>
                      <span className="text-[10px] font-black text-green-600">+12.5%</span>
                    </div>
                    <div className="text-xl font-black text-gray-900">$14,250</div>
                  </div>

                  <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                        <Users size={10} className="text-orange-600" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-700">Followers</span>
                    </div>
                    <span className="text-xs font-black text-gray-900">245K</span>
                  </div>
                </div>
              </motion.div>

              {/* Step 2: Browse Campaigns */}
              <motion.div
                initial={false}
                animate={{ opacity: activeCarouselStep === 1 ? 1 : 0, x: activeCarouselStep === 1 ? 0 : 20 }}
                className="absolute inset-0 p-5 flex flex-col bg-gray-50 pointer-events-none"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-black text-gray-900">Campaigns</h4>
                  <BadgeCheck size={14} className="text-indigo-600" />
                </div>

                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded bg-gray-100 animate-pulse"></div>
                        <div className="flex-1 space-y-1.5">
                          <div className="h-2 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-2 w-1/2 bg-gray-100 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between items-center pt-2 border-t border-gray-50">
                        <span className="text-[10px] font-bold text-gray-500">Reward</span>
                        <span className="text-[10px] font-black text-green-600">$500 - $1000</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Step 3: Get Paid */}
              <motion.div
                initial={false}
                animate={{ opacity: activeCarouselStep === 2 ? 1 : 0, x: activeCarouselStep === 2 ? 0 : 20 }}
                className="absolute inset-0 p-5 flex flex-col bg-gray-900 pointer-events-none"
              >
                <div className="flex flex-col items-center justify-center h-full space-y-4 text-center mt-[-20px]">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center relative">
                    <ShieldCheck size={28} className="text-green-400" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border border-green-400/50"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Payment Secured</h4>
                    <p className="text-[10px] text-gray-400 mt-1 px-4 leading-relaxed">Funds are locked Milestone Coins. Complete the campaign to release.</p>
                  </div>
                  <div className="w-full p-3 bg-black/50 border border-white/10 rounded-xl mt-4">
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold mb-1">
                      <span>Milestone 1</span>
                      <span className="text-green-400">Paid</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 4: Collaborate & Grow */}
              <motion.div
                initial={false}
                animate={{ opacity: activeCarouselStep === 3 ? 1 : 0, x: activeCarouselStep === 3 ? 0 : 20 }}
                className="absolute inset-0 p-5 flex flex-col bg-indigo-50 pointer-events-none"
              >
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xs font-black text-indigo-900">Performance</h4>
                  <TrendingUp size={14} className="text-indigo-600" />
                </div>
                
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-indigo-100 text-center">
                    <div className="text-[10px] font-bold text-gray-500 mb-1">Total Reach</div>
                    <div className="text-2xl font-black text-indigo-600">1.2M</div>
                    <div className="text-[9px] font-bold text-green-500 mt-1">+24% this week</div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-1 p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                      <div className="text-[9px] font-bold text-gray-500 mb-1">Engagement</div>
                      <div className="text-sm font-black text-gray-900">8.4%</div>
                    </div>
                    <div className="flex-1 p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                      <div className="text-[9px] font-bold text-gray-500 mb-1">Clicks</div>
                      <div className="text-sm font-black text-gray-900">45.2K</div>
                    </div>
                  </div>
                  
                  {/* Mock Chart */}
                  <div className="h-16 w-full mt-2 flex items-end justify-between px-2 gap-1">
                    {[30, 45, 25, 60, 80, 100, 75].map((h, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ height: 0 }}
                        animate={{ height: activeCarouselStep === 3 ? `${h}%` : 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="w-full bg-indigo-400 rounded-t-sm opacity-80"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Mock Home Indicator */}
            <div className="h-6 flex items-center justify-center pb-2 select-none z-20">
              <div className="w-20 h-1 bg-gray-300 rounded-full"></div>
            </div>
          </motion.div>

          {/* ACCORDION SCREEN: LANDSCAPE PORTALS */}
          <motion.div
            style={{ opacity: accordionOpacity, pointerEvents: activeScreen === 'accordion' ? 'auto' : 'none' }}
            className="absolute inset-0 bg-[#FAFAFC] flex flex-col z-30 overflow-hidden"
          >
            {/* The wrapper that rotates -90 to cancel phone rotation */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: landscapeLeft,
                top: landscapeTop,
                width: landscapeWidth,
                height: landscapeHeight,
                transform: 'rotate(-90deg)',
                transformOrigin: 'center center'
              }}
            >
              {/* Step 0: Brand Directory */}
              <motion.div
                initial={false}
                animate={{ opacity: activeAccordion === 0 ? 1 : 0, scale: activeAccordion === 0 ? 1 : 0.95 }}
                className="absolute inset-0 bg-white rounded-[24px] border border-gray-200 flex flex-col p-4 pointer-events-auto"
                style={{ zIndex: activeAccordion === 0 ? 10 : 0 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-black text-gray-900 tracking-wide uppercase">Brand Directory</h4>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-gray-500">12 New</span>
                  </div>
                </div>
                <div className="flex gap-3 h-full overflow-hidden">
                  {/* Brand Card 1 */}
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col justify-between hover:bg-gray-100 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg p-1">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" alt="Adidas" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[8px] font-black uppercase text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">Sports</span>
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black text-gray-900 group-hover:text-indigo-600 transition-colors">Adidas Originals</h5>
                      <p className="text-[9px] text-gray-500 font-medium leading-tight mt-1 line-clamp-2">Seeking fitness creators for the new UltraBoost campaign.</p>
                      <button
                        onClick={() => handleApplyBrand('adidas')}
                        disabled={appliedBrands['adidas']}
                        className={`mt-2 w-full py-1.5 rounded text-[9px] font-black uppercase tracking-wider transition-all ${appliedBrands['adidas'] ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-900 text-white hover:bg-indigo-600'}`}
                      >
                        {appliedBrands['adidas'] ? 'Applied ✓' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                  {/* Brand Card 2 */}
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col justify-between hover:bg-gray-100 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg p-1 flex items-center justify-center">
                        <span className="text-black font-black text-[10px]">DYSON</span>
                      </div>
                      <span className="text-[8px] font-black uppercase text-pink-600 bg-pink-100 px-1.5 py-0.5 rounded">Tech</span>
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black text-gray-900 group-hover:text-pink-600 transition-colors">Dyson Beauty</h5>
                      <p className="text-[9px] text-gray-500 font-medium leading-tight mt-1 line-clamp-2">Promote the new Airwrap. High engagement required.</p>
                      <button
                        onClick={() => handleApplyBrand('dyson')}
                        disabled={appliedBrands['dyson']}
                        className={`mt-2 w-full py-1.5 rounded text-[9px] font-black uppercase tracking-wider transition-all ${appliedBrands['dyson'] ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-900 text-white hover:bg-pink-600'}`}
                      >
                        {appliedBrands['dyson'] ? 'Applied ✓' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 1: Secure Payments */}
              <motion.div
                initial={false}
                animate={{ opacity: activeAccordion === 1 ? 1 : 0, scale: activeAccordion === 1 ? 1 : 0.95 }}
                className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white rounded-[24px] border border-indigo-100 flex p-4 pointer-events-auto"
                style={{ zIndex: activeAccordion === 1 ? 10 : 0 }}
              >
                <div className="flex-1 flex flex-col justify-center border-r border-indigo-100 pr-4">
                  <h4 className="text-xs font-black text-gray-900 tracking-wide uppercase flex items-center gap-1">
                    <ShieldCheck size={12} className="text-indigo-600" />
                    Secure Payments
                  </h4>
                  <div className="mt-3 bg-white rounded-lg p-2.5 border border-gray-200 shadow-sm">
                    <span className="text-[9px] text-gray-500 font-bold block mb-1">Locked by Brand</span>
                    <div className="text-lg font-black text-gray-900">🪙{walletLockedFundsSecured.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center pl-4 items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-2 border border-indigo-200">
                    <span className="text-indigo-600 font-black text-xs">P2P</span>
                  </div>
                  <p className="text-[9px] text-gray-500 font-medium leading-tight mb-2">Funds are safely held. Complete deliverables to unlock.</p>
                  <button
                    onClick={handleReleaseFundsSecured}
                    disabled={fundsSecuredReleased}
                    className={`w-full py-1.5 rounded text-[9px] font-black uppercase tracking-wider transition-all ${fundsSecuredReleased ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm'}`}
                  >
                    {fundsSecuredReleased ? 'Funds Released' : 'Simulate Release'}
                  </button>
                </div>
              </motion.div>

              {/* Step 2: Integrated Chat */}
              <motion.div
                initial={false}
                animate={{ opacity: activeAccordion === 2 ? 1 : 0, scale: activeAccordion === 2 ? 1 : 0.95 }}
                className="absolute inset-0 bg-white rounded-[24px] border border-gray-200 flex flex-col pointer-events-auto"
                style={{ zIndex: activeAccordion === 2 ? 10 : 0 }}
              >
                <div className="h-10 border-b border-gray-100 flex items-center justify-between px-4 bg-gray-50 rounded-t-[24px]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center">
                      <span className="text-[8px] font-black text-white">Z</span>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-gray-900 leading-none">Zara Marketing</h4>
                      <span className="text-[8px] text-green-600 font-bold">Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 flex flex-col custom-scrollbar">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'creator' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-lg p-2 text-[9px] font-medium leading-relaxed shadow-sm ${msg.sender === 'creator' ? 'bg-indigo-500 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTypingBrand && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 border border-gray-200 rounded-lg rounded-bl-sm p-2 flex items-center gap-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  )}
                  <div ref={accordionChatEndRef} />
                </div>
                <form onSubmit={handleSendChatMessage} className="h-10 border-t border-gray-100 flex items-center px-2 bg-gray-50 rounded-b-[24px] gap-2">
                  <input
                    type="text"
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    placeholder="Message brand..."
                    className="flex-1 bg-transparent border-none text-[10px] text-gray-900 focus:ring-0 placeholder-gray-400"
                  />
                  <button type="submit" className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition-colors">
                    <span className="text-[10px] font-black">↑</span>
                  </button>
                </form>
              </motion.div>

              {/* Step 3: Unified Wallet Withdrawals */}
              <motion.div
                initial={false}
                animate={{ opacity: activeAccordion === 3 ? 1 : 0, scale: activeAccordion === 3 ? 1 : 0.95 }}
                className="absolute inset-0 bg-white rounded-[24px] border border-gray-200 flex flex-col p-5 pointer-events-auto"
                style={{ zIndex: activeAccordion === 3 ? 10 : 0 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-black text-gray-900 tracking-wide uppercase">Wallet & Payouts</h4>
                  <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Ledger</span>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Available Balance</span>
                    <h2 className="text-3xl font-black text-gray-900 mt-1">🪙{walletBalance.toLocaleString()}</h2>
                  </div>

                  <div className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 h-24 flex flex-col justify-center">
                    {walletWithdrawalState === 'idle' && (
                      <button
                        onClick={handleInitiateWithdrawal}
                        disabled={walletBalance === 0}
                        className={`w-full py-2 rounded text-[10px] font-black uppercase tracking-wider transition-all ${walletBalance === 0 ? 'bg-gray-200 text-gray-400' : 'bg-gray-900 text-white hover:bg-orange-500 shadow-md'}`}
                      >
                        {walletBalance === 0 ? 'Zero Balance' : 'Withdraw Funds'}
                      </button>
                    )}

                    {walletWithdrawalState === 'prompt' && (
                      <div className="flex flex-col gap-2 w-full">
                        <input
                          type="text"
                          value={withdrawalUpi}
                          onChange={(e) => setWithdrawalUpi(e.target.value)}
                          placeholder="Enter UPI ID..."
                          className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-[10px] text-gray-900 focus:outline-none focus:border-orange-500"
                        />
                        <button
                          onClick={handleConfirmWithdrawal}
                          className="w-full py-1.5 rounded text-[9px] font-black uppercase tracking-wider transition-all bg-orange-500 text-white shadow-md hover:bg-orange-600"
                        >
                          Confirm Transfer
                        </button>
                      </div>
                    )}

                    {walletWithdrawalState === 'processing' && (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-5 h-5 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                        <span className="text-[9px] font-bold text-gray-500 animate-pulse">Processing Transfer...</span>
                      </div>
                    )}

                    {walletWithdrawalState === 'success' && (
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-1">
                          ✓
                        </div>
                        <span className="text-[10px] font-black text-gray-900">Transfer Complete</span>
                        <span className="text-[8px] font-bold text-gray-500">🪙{withdrawnAmount.toLocaleString()} sent to {withdrawalUpi}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* TWO-SIDED PLATFORM SCREEN (Section 4) */}
          <motion.div
            style={{ opacity: chatOpacity, pointerEvents: activeScreen === 'chat' ? 'auto' : 'none' }}
            className="absolute inset-0 bg-[#FAFAFC] flex flex-col z-40"
          >
            {/* Mock Status Bar */}
            <div className="h-8 bg-white/60 backdrop-blur-md flex items-center justify-between px-6 pt-2 select-none z-20">
              <span className="text-[10px] font-black text-gray-900">09:41</span>
              <div className="flex gap-1.5 text-gray-900 text-[10px] font-bold">
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
              <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-widest text-center">
                Select Your<br/>Journey
              </h3>

              <div className="w-full space-y-4 relative">
                {/* Creator Card */}
                <motion.button
                  onClick={() => setActivePlatformSide('creator')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all border-2 shadow-lg ${activePlatformSide === 'creator' ? 'bg-white border-indigo-500' : 'bg-gray-50 border-transparent hover:border-indigo-200'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${activePlatformSide === 'creator' ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-500'
                    }`}>
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-gray-900 text-left">For Creator</h4>
                    <p className="text-[9px] font-medium text-gray-500 mt-1 text-left">Monetize your audience</p>
                  </div>
                </motion.button>

                {/* Brand Card */}
                <motion.button
                  onClick={() => setActivePlatformSide('brand')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all border-2 shadow-lg ${activePlatformSide === 'brand' ? 'bg-white border-pink-500' : 'bg-gray-50 border-transparent hover:border-pink-200'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${activePlatformSide === 'brand' ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-500'
                    }`}>
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-gray-900 text-left">For Brand</h4>
                    <p className="text-[9px] font-medium text-gray-500 mt-1 text-left">Hire top talent</p>
                  </div>
                </motion.button>

                {/* Animated Hand Cursor */}
                <motion.div
                  animate={{
                    y: [0, 0, 100, 100, 0],
                    scale: [1, 0.85, 1, 0.85, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.1, 0.5, 0.6, 1]
                  }}
                  className="absolute z-50 pointer-events-none drop-shadow-2xl"
                  style={{ left: '60%', top: '15%' }}
                >
                  <MousePointer2 size={32} className="text-gray-900 fill-white drop-shadow-md -rotate-12" />
                </motion.div>
              </div>

              {/* Mock Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-6 flex items-center justify-center">
                <div className="w-20 h-1 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
});

export default PhoneMockup;
