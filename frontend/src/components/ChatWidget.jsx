import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Smile, Building2, User } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

function ChatWidget({ dealId, deal, isCompleted }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const socket = useSocket();
  const { user } = useAuth();

  const brandName = 
    deal?.brandId?.businessName || 
    deal?.applicationId?.campaignId?.brandId?.businessName || 
    deal?.brandId?.userId?.name || 
    deal?.applicationId?.campaignId?.brandId?.userId?.name || 
    'Brand Partner';

  const brandLogo = 
    deal?.brandId?.logo || 
    deal?.applicationId?.campaignId?.brandId?.logo || 
    deal?.brandId?.userId?.profilePicture;

  const creatorName = 
    deal?.creatorId?.name || 
    deal?.creatorId?.userId?.name || 
    deal?.applicationId?.creatorId?.name || 
    'Creator';

  const creatorAvatar = 
    deal?.creatorId?.profilePicture || 
    deal?.creatorId?.userId?.profilePicture;

  const isBrandUser = user?.role === 'brand';
  const otherPartyName = isBrandUser ? creatorName : brandName;
  const otherPartyAvatar = isBrandUser ? creatorAvatar : brandLogo;

  const adminRoles = ['superadmin', 'admin', 'moderator', 'support'];
  const isAdmin = adminRoles.includes(user?.role);
  const isKycApproved = isAdmin || user?.kycStatus === 'APPROVED' || Boolean(user?.isVerified);

  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (socket && isOpen && isKycApproved) {
      socket.emit('join_deal_chat', dealId);

      const onReceiveMessage = (message) => {
        setMessages((prev) => {
          const msgId = String(message?._id || '');
          if (msgId && prev.some(m => String(m._id) === msgId)) return prev;
          return [...prev, message];
        });
        setTimeout(scrollToBottom, 50);
      };

      const handleConnect = () => {
        socket.emit('join_deal_chat', dealId);
      };

      socket.on('receive_message', onReceiveMessage);
      socket.on('connect', handleConnect);

      return () => {
        socket.off('receive_message', onReceiveMessage);
        socket.off('connect', handleConnect);
      };
    }
  }, [socket, isOpen, dealId, isKycApproved]);

  useEffect(() => {
    if (isOpen && isKycApproved) {
      fetchMessages();
    }
  }, [isOpen, dealId, isKycApproved]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`/chat/${dealId}`);
      setMessages(data || []);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isCompleted) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear immediately for better UX

    try {
      setLoading(true);
      const res = await axios.post(`/chat/${dealId}`, { content: messageContent });
      if (res.data) {
        // Immediate local render so message appears in real time without waiting for socket
        setMessages((prev) => {
          const resId = String(res.data._id || '');
          if (resId && prev.some(m => String(m._id) === resId)) return prev;
          return [...prev, res.data];
        });
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setNewMessage(messageContent); // Restore on failure
    } finally {
      setLoading(false);
    }
  };

  const currentUserId = String(user?.id || user?._id || user?.userId || '');

  return (
    <div className="relative z-[60]">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-white text-black rounded-2xl shadow-xl flex items-center justify-center hover:bg-secondary transition-colors relative group border border-outline-variant/10"
      >
        <MessageSquare size={24} className="group-hover:rotate-12 transition-transform duration-300" />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-[70px] left-0 sm:left-auto sm:right-0 w-[320px] max-w-[90vw] sm:w-[400px] h-[65vh] sm:h-[450px] bg-surface-container-low border border-outline-variant/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden backdrop-blur-3xl origin-top-left sm:origin-top-right z-[10000]"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-surface-container border-b border-outline-variant/10 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/15 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {otherPartyAvatar ? (
                    <img src={otherPartyAvatar} alt={otherPartyName} className="w-full h-full object-cover" />
                  ) : isBrandUser ? (
                    <User size={18} className="text-secondary" />
                  ) : (
                    <Building2 size={18} className="text-secondary" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-on-surface text-sm sm:text-base tracking-tight truncate max-w-[200px]">
                    {otherPartyName}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 truncate">
                      {isBrandUser ? 'Creator Partner' : 'Brand Partner'} • Live Chat
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(false); }}
                className="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant transition-colors relative z-[60] cursor-pointer shrink-0 shadow-sm"
                title="Close Chat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={messagesContainerRef} className={`flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide ${!isKycApproved ? 'blur-sm select-none pointer-events-none' : ''}`}>
              {messages.map((msg, i) => {
                const senderIdStr = String(msg.senderId?._id || msg.senderId || '');
                const isMe = Boolean(currentUserId && senderIdStr && currentUserId === senderIdStr);
                const senderRole = msg.senderId?.role;
                const senderName = msg.senderId?.name;

                let label = isMe ? 'You' : (isBrandUser ? (creatorName || 'Creator') : (brandName || 'Brand'));
                if (!isMe && senderName && senderName !== label) {
                  label = `${label} (${senderName})`;
                }

                return (
                  <div key={msg._id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1 px-1">
                      {label}
                    </span>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-bold leading-relaxed break-words ${isMe
                        ? 'bg-primary text-on-primary rounded-tr-none shadow-lg shadow-primary/20'
                        : 'bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant/10'
                      }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer / Input */}
            <div className="p-6 bg-surface-container border-t border-outline-variant/10">
              {isCompleted ? (
                <div className="text-center p-3 bg-surface-container-highest rounded-2xl text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                  Read-only: Deal finalized
                </div>
              ) : !isKycApproved ? (
                <div className="flex flex-col items-center text-center gap-2">
                  <span className="text-[10px] font-black text-on-surface uppercase tracking-widest flex items-center gap-1.5 justify-center">
                    🔒 Chat Access Locked
                  </span>
                  <p className="text-[10px] text-on-surface-variant/60 font-medium">Verify your identity to unlock messaging.</p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = '/kyc-verification';
                    }}
                    className="w-full py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer mt-1"
                  >
                    Verify KYC
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-surface-container-high border border-outline-variant/5 rounded-xl px-4 py-3 text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-secondary/50 transition-all placeholder:text-on-surface-variant/30"
                  />
                  <button
                    disabled={loading || !newMessage.trim()}
                    type="submit"
                    className="p-3 bg-secondary text-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-secondary/10"
                  >
                    <Send size={18} />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatWidget;
