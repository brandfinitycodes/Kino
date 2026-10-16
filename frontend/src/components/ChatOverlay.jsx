import React, { useState, useEffect, useRef } from 'react';
import axios from '../utils/axios';
import { io } from 'socket.io-client';
import { X, Send, User, Building2, CheckCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Derive Socket URL dynamically from API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

const ChatOverlay = ({ deal, onClose, currentUser }) => {
  const isKycApproved = currentUser?.role === 'admin' || currentUser?.kycStatus === 'APPROVED';
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const dealId = String(deal?._id || deal?.id || '');
  const currentUserId = String(currentUser?._id || currentUser?.id || currentUser?.userId || '');
  const isBrandUser = currentUser?.role === 'brand';

  // Resolve the other party's identity dynamically based on current user role
  const otherPartyName = isBrandUser
    ? (deal.creatorId?.name || deal.creatorId?.userId?.name || deal.applicationId?.creatorId?.name || 'Creator')
    : (deal.brandId?.businessName || deal.applicationId?.campaignId?.brandId?.businessName || deal.brandId?.userId?.name || 'Brand Partner');

  const otherPartyAvatar = isBrandUser
    ? (deal.creatorId?.profilePicture || deal.creatorId?.userId?.profilePicture || deal.applicationId?.creatorId?.profilePicture)
    : (deal.brandId?.logo || deal.applicationId?.campaignId?.brandId?.logo);

  const dealTitle = deal.title || deal.applicationId?.campaignId?.title || (deal.packageTier ? `${deal.packageTier.toUpperCase()} Package Deal` : 'Collaboration Deal');
  const dealAmount = deal.paymentAmount || deal.applicationId?.campaignId?.budget || deal.packagePrice || 0;

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
      // Revert input in case of failure
      setInputValue(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-[80px] right-0 w-full md:w-[450px] h-[calc(100dvh-160px)] md:h-[calc(100vh-80px)] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.12)] z-[9999] flex flex-col border-l border-gray-100"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/70 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center border border-gray-200 overflow-hidden shadow-xs shrink-0">
              {otherPartyAvatar ? (
                <img src={otherPartyAvatar} alt={otherPartyName} className="w-full h-full object-cover rounded-full" />
              ) : isBrandUser ? (
                <User size={20} className="text-indigo-600" />
              ) : (
                <Building2 size={20} className="text-orange-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-gray-900 text-[16px] tracking-tight truncate max-w-[200px]">
                  {otherPartyName}
                </h3>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 tracking-wider">
                  {isBrandUser ? 'Creator' : 'Brand'}
                </span>
              </div>
              <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Direct Negotiation
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
        <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex flex-col truncate pr-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Linked Deal</span>
            <h4 className="text-[13px] font-bold text-gray-900 truncate">{dealTitle}</h4>
          </div>
          <span className="text-[12px] font-black text-orange-600 px-3 py-1 bg-orange-50 border border-orange-200/60 rounded-xl shrink-0">
            🪙 {Number(dealAmount).toLocaleString()}
          </span>
        </div>

        {/* Chat Messages */}
        <div className={`flex-1 overflow-y-auto p-5 bg-gray-50/60 flex flex-col gap-3.5 ${!isKycApproved ? 'blur-sm select-none pointer-events-none' : ''}`}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 my-auto">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-3 border border-orange-100">
                <Send size={22} className="text-orange-600 ml-0.5" />
              </div>
              <h4 className="font-black text-gray-900 text-[15px] mb-1">Live Deal Negotiation</h4>
              <p className="text-[12px] text-gray-500 font-medium max-w-xs leading-relaxed">
                Connect directly with {otherPartyName} to coordinate deliverables, timelines, and revisions.
              </p>
            </div>
          ) : (
            messages.map((msg, i) => {
              // Robust check for sender vs receiver across id formats
              const senderIdStr = String(msg.senderId?._id || msg.senderId || '');
              const isMine = Boolean(currentUserId && senderIdStr && currentUserId === senderIdStr);

              return (
                <div 
                  key={msg._id || i} 
                  className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Receiver Avatar on left */}
                  {!isMine && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 border border-gray-300/80 flex items-center justify-center text-[10px] font-black text-gray-600 overflow-hidden shrink-0 mb-0.5">
                      {otherPartyAvatar ? (
                        <img src={otherPartyAvatar} alt="Partner" className="w-full h-full object-cover" />
                      ) : (
                        otherPartyName.charAt(0).toUpperCase()
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-xs ${
                    isMine 
                      ? 'bg-gradient-to-tr from-orange-600 to-amber-500 text-white rounded-tr-xs shadow-orange-500/10' 
                      : 'bg-white border border-gray-200/80 text-gray-800 rounded-tl-xs'
                  }`}>
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

        {/* Input Area */}
        {!isKycApproved ? (
          <div className="p-6 bg-white border-t border-gray-100 flex flex-col items-center text-center gap-3">
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
              className="mt-1 w-full py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
            >
              Verify Identity
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder={`Message ${otherPartyName}...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isSending}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-14 text-[13px] text-gray-900 outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner placeholder:text-gray-400 font-medium"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim() || isSending}
                className="absolute right-2 w-9 h-9 bg-gradient-to-tr from-orange-600 to-amber-500 text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95"
              >
                <Send size={15} className="ml-0.5" />
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatOverlay;
