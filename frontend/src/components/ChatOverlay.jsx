import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from '../utils/axios';
import { io } from 'socket.io-client';
import { X, Send, User, Building2, CheckCheck, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Derive Socket URL dynamically from API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

const ChatOverlay = ({ deal, onClose, currentUser }) => {
  const adminRoles = ['superadmin', 'admin', 'moderator', 'support'];
  const isAdmin = adminRoles.includes(currentUser?.role);

  const isKycApproved = 
    isAdmin || 
    currentUser?.kycStatus === 'APPROVED' || 
    Boolean(currentUser?.isVerified);

  const isDealCompleted = deal?.status === 'completed';
  const isDisputed = deal?.status === 'disputed' || Boolean(deal?.disputeReason);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const dealId = String(deal?._id || deal?.id || '');
  const currentUserId = String(currentUser?._id || currentUser?.id || currentUser?.userId || '');
  const isBrandUser = currentUser?.role === 'brand';

  // Prevent background scrolling while chat drawer is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const creatorName = deal?.creatorId?.name || deal?.creatorId?.userId?.name || deal?.applicationId?.creatorId?.name || 'Creator';
  const creatorAvatar = deal?.creatorId?.profilePicture || deal?.creatorId?.userId?.profilePicture || deal?.applicationId?.creatorId?.profilePicture;

  const brandName = deal?.brandId?.businessName || deal?.applicationId?.campaignId?.brandId?.businessName || deal?.brandId?.userId?.name || 'Brand Partner';
  const brandAvatar = deal?.brandId?.logo || deal?.applicationId?.campaignId?.brandId?.logo;

  // Resolve the other party's identity dynamically based on current user role
  const otherPartyName = isAdmin
    ? `${creatorName} & ${brandName}`
    : isBrandUser
      ? creatorName
      : brandName;

  const otherPartyAvatar = isAdmin
    ? null
    : isBrandUser
      ? creatorAvatar
      : brandAvatar;

  const dealTitle = deal?.title || deal?.applicationId?.campaignId?.title || (deal?.packageTier ? `${deal.packageTier.toUpperCase()} Package Deal` : 'Collaboration Deal');
  const dealAmount = deal?.paymentAmount || deal?.budget || deal?.applicationId?.campaignId?.budget || deal?.packagePrice || 0;

  useEffect(() => {
    if (!dealId || !isKycApproved) return;

    // 1. Fetch existing messages
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/chat/${dealId}`);
        setMessages(res.data || []);
        scrollToBottom();
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };
    fetchMessages();

    // 2. Connect to Socket.io for real-time messages
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    socketRef.current.emit('join_deal_chat', dealId);

    socketRef.current.on('receive_message', (newMsg) => {
      setMessages((prev) => {
        const newMsgId = String(newMsg._id || '');
        if (newMsgId && prev.some((m) => String(m._id) === newMsgId)) {
          return prev;
        }
        return [...prev, newMsg];
      });
      scrollToBottom();
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [dealId, isKycApproved]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setErrorMessage('');
    setInputValue('');

    try {
      const res = await axios.post(`/chat/${dealId}`, { content: trimmed });
      if (res.data) {
        // Immediate local render if not already added by socket
        setMessages((prev) => {
          const resId = String(res.data._id || '');
          if (resId && prev.some((m) => String(m._id) === resId)) {
            return prev;
          }
          return [...prev, res.data];
        });
        scrollToBottom();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      const serverMsg = err.response?.data?.message || "Failed to send message. Please try again.";
      setErrorMessage(serverMsg);
      // Revert input in case of failure
      setInputValue(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex justify-end">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity cursor-pointer"
        />

        {/* Slide-out Drawer */}
        <motion.div 
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="relative w-full sm:w-[460px] md:w-[480px] h-full h-[100dvh] bg-white shadow-[-16px_0_50px_rgba(0,0,0,0.2)] z-[100000] flex flex-col border-l border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/80 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center border border-gray-200 overflow-hidden shadow-xs shrink-0">
                {isAdmin ? (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    🛡️
                  </div>
                ) : otherPartyAvatar ? (
                  <img src={otherPartyAvatar} alt={otherPartyName} className="w-full h-full object-cover rounded-full" />
                ) : isBrandUser ? (
                  <User size={20} className="text-indigo-600" />
                ) : (
                  <Building2 size={20} className="text-orange-600" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-gray-900 text-[16px] tracking-tight truncate max-w-[200px]">
                    {isAdmin ? 'Dispute Arbitration' : otherPartyName}
                  </h3>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider shrink-0 ${
                    isAdmin ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isAdmin ? 'Arbitrator Mode' : (isBrandUser ? 'Creator' : 'Brand')}
                  </span>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                  {isAdmin ? (
                    <span className="text-indigo-600 flex items-center gap-1 font-black">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                      {creatorName} ↔ {brandName}
                    </span>
                  ) : (
                    <span className="text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Direct Negotiation
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} 
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-xs shrink-0 cursor-pointer"
              title="Close Chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Campaign Mini-Card */}
          <div className="px-5 py-3 bg-white border-b border-gray-100 flex items-center justify-between gap-2 shadow-xs shrink-0">
            <div className="flex flex-col truncate pr-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Linked Deal</span>
              <h4 className="text-[13px] font-bold text-gray-900 truncate">{dealTitle}</h4>
            </div>
            <span className="text-[12px] font-black text-orange-600 px-3 py-1 bg-orange-50 border border-orange-200/60 rounded-xl shrink-0">
              🪙 {Number(dealAmount).toLocaleString()}
            </span>
          </div>

          {/* Dispute Notice Banner */}
          {isDisputed && (
            <div className="px-5 py-2.5 bg-red-50/90 border-b border-red-200 flex items-start gap-2.5 text-red-900 shrink-0">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600 block">
                  Dispute Active {deal?.disputedAt ? `· Filed ${new Date(deal.disputedAt).toLocaleDateString()}` : ''}
                </span>
                <p className="text-[11px] font-bold text-red-800 line-clamp-2 mt-0.5">
                  "{deal?.disputeReason || 'Dispute raised. Admin arbitration in progress.'}"
                </p>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className={`flex-1 overflow-y-auto p-4 sm:p-5 bg-gray-50/60 flex flex-col gap-3.5 ${!isKycApproved ? 'blur-sm select-none pointer-events-none' : ''}`}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 my-auto">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-3 border border-orange-100">
                  <Send size={22} className="text-orange-600 ml-0.5" />
                </div>
                <h4 className="font-black text-gray-900 text-[15px] mb-1">
                  {isAdmin ? 'Arbitration Thread' : 'Live Deal Negotiation'}
                </h4>
                <p className="text-[12px] text-gray-500 font-medium max-w-xs leading-relaxed">
                  {isAdmin 
                    ? `Review deal history or post mediator instructions to ${creatorName} and ${brandName}.`
                    : `Connect directly with ${otherPartyName} to coordinate deliverables, timelines, and revisions.`
                  }
                </p>
              </div>
            ) : (
              messages.map((msg, i) => {
                // Robust check for sender vs receiver across id formats
                const senderIdStr = String(msg.senderId?._id || msg.senderId || '');
                const isMine = Boolean(currentUserId && senderIdStr && currentUserId === senderIdStr);
                const senderRole = msg.senderId?.role;
                const isSenderAdmin = adminRoles.includes(senderRole);

                // Determine display label for sender
                let senderLabel = '';
                if (isSenderAdmin) {
                  senderLabel = `🛡️ Arbitrator (${msg.senderId?.name || 'Admin'})`;
                } else if (senderRole === 'creator' || String(deal?.creatorId?.userId?._id || deal?.creatorId?.userId || '') === senderIdStr) {
                  senderLabel = `🎨 Creator: ${creatorName}`;
                } else if (senderRole === 'brand' || String(deal?.brandId?.userId?._id || deal?.brandId?.userId || '') === senderIdStr) {
                  senderLabel = `💼 Brand: ${brandName}`;
                } else if (msg.senderId?.name) {
                  senderLabel = msg.senderId.name;
                }

                // Avatar for non-mine messages
                let bubbleAvatar = null;
                if (!isMine) {
                  if (isSenderAdmin) {
                    bubbleAvatar = (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mb-0.5 shadow-xs">
                        🛡️
                      </div>
                    );
                  } else if (senderRole === 'brand' || String(deal?.brandId?.userId?._id || deal?.brandId?.userId || '') === senderIdStr) {
                    bubbleAvatar = brandAvatar ? (
                      <img src={brandAvatar} alt="Brand" className="w-6 h-6 rounded-full object-cover shrink-0 mb-0.5" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-[10px] font-black shrink-0 mb-0.5">
                        {brandName.charAt(0).toUpperCase()}
                      </div>
                    );
                  } else {
                    bubbleAvatar = creatorAvatar ? (
                      <img src={creatorAvatar} alt="Creator" className="w-6 h-6 rounded-full object-cover shrink-0 mb-0.5" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black shrink-0 mb-0.5">
                        {creatorName.charAt(0).toUpperCase()}
                      </div>
                    );
                  }
                }

                return (
                  <div 
                    key={msg._id || i} 
                    className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMine && bubbleAvatar}

                    {/* Message Bubble */}
                    <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-xs ${
                      isMine 
                        ? isAdmin
                          ? 'bg-gradient-to-tr from-indigo-700 to-purple-600 text-white rounded-tr-xs shadow-indigo-500/10'
                          : 'bg-gradient-to-tr from-orange-600 to-amber-500 text-white rounded-tr-xs shadow-orange-500/10'
                        : isSenderAdmin
                          ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 rounded-tl-xs shadow-indigo-500/5'
                          : 'bg-white border border-gray-200/80 text-gray-800 rounded-tl-xs'
                    }`}>
                      {(!isMine || isAdmin) && senderLabel && (
                        <span className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${
                          isMine ? 'text-white/80' : isSenderAdmin ? 'text-indigo-700 font-bold' : 'text-gray-400'
                        }`}>
                          {isMine ? `You (${isAdmin ? 'Arbitrator' : isBrandUser ? 'Brand' : 'Creator'})` : senderLabel}
                        </span>
                      )}
                      <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                      <div className={`text-[9px] mt-1 flex items-center gap-1 font-bold ${
                        isMine ? 'text-white/80 justify-end' : 'text-gray-400 justify-start'
                      }`}>
                        <span>
                          {msg.createdAt 
                            ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                            : 'Just now'}
                        </span>
                        {isMine && <CheckCheck size={12} className="text-white/90" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Area: Read-Only, KYC prompt, or Message Input */}
          {isDealCompleted ? (
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-1">
                <CheckCheck size={14} /> Deal Completed
              </div>
              <p className="text-[11px] text-gray-500 font-medium">This deal is completed. Conversation is preserved in read-only mode.</p>
            </div>
          ) : !isKycApproved ? (
            <div className="p-6 bg-white border-t border-gray-100 flex flex-col items-center text-center gap-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shrink-0">
              <div className="w-10 h-10 bg-rose-50 border border-rose-100 text-rose-500 rounded-full flex items-center justify-center">
                <X size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <h5 className="text-xs font-black text-gray-900 uppercase tracking-widest">Chat Access Locked</h5>
                <p className="text-[11px] text-gray-500 font-medium mt-1">Complete KYC verification to start negotiating and collaborating on this deal.</p>
              </div>
              <button 
                onClick={() => {
                  onClose();
                  window.location.href = '/kyc-verification';
                }}
                className="mt-1 w-full py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Verify Identity
              </button>
            </div>
          ) : (
            <div className="p-4 bg-white border-t border-gray-100 pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0">
              {errorMessage && (
                <div className="mb-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" /> {errorMessage}
                  </span>
                  <button onClick={() => setErrorMessage('')} className="p-1 hover:text-rose-800 cursor-pointer">
                    <X size={13} />
                  </button>
                </div>
              )}
              <form onSubmit={handleSend} className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder={isAdmin ? "Type mediator instructions to Creator & Brand..." : `Message ${otherPartyName}...`}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  disabled={isSending}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-14 text-[13px] text-gray-900 outline-none ${
                    isAdmin ? 'focus:border-indigo-500' : 'focus:border-orange-500'
                  } focus:bg-white transition-all shadow-inner placeholder:text-gray-400 font-medium`}
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || isSending}
                  className={`absolute right-2 w-9 h-9 ${
                    isAdmin ? 'bg-gradient-to-tr from-indigo-600 to-purple-600' : 'bg-gradient-to-tr from-orange-600 to-amber-500'
                  } text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95 cursor-pointer`}
                >
                  <Send size={15} className="ml-0.5" />
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default ChatOverlay;
