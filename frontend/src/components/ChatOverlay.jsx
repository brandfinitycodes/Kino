import React, { useState, useEffect, useRef } from 'react';
import axios from '../utils/axios';
import { io } from 'socket.io-client';
import { X, Send, User, Building2, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Replace with your actual backend URL if different
const SOCKET_URL = 'http://localhost:5000';

const ChatOverlay = ({ deal, onClose, currentUser }) => {
  const isKycApproved = currentUser?.role === 'admin' || currentUser?.kycStatus === 'APPROVED';
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isKycApproved) return;

    // 1. Fetch existing messages
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/chat/${deal._id}`);
        setMessages(res.data || []);
        scrollToBottom();
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };
    fetchMessages();

    // 2. Connect to Socket.io
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('join_deal_chat', deal._id);

    socketRef.current.on('receive_message', (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
      scrollToBottom();
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [deal._id, isKycApproved]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      const msgContent = inputValue;
      setInputValue('');
      await axios.post(`/chat/${deal._id}`, { content: msgContent });
      // The socket server will emit 'receive_message' back to us
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-[80px] right-0 w-full md:w-[450px] h-[calc(100dvh-160px)] md:h-[calc(100vh-80px)] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] z-[9999] flex flex-col border-l border-gray-100"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
              {deal.applicationId?.campaignId?.brandId?.logo ? (
                <img src={deal.applicationId.campaignId.brandId.logo} className="w-full h-full object-cover rounded-full" />
              ) : (
                <Building2 size={20} className="text-blue-500" />
              )}
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg tracking-tight">
                {deal.applicationId?.campaignId?.brandId?.businessName || 'Brand Partner'}
              </h3>
              <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} 
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm relative z-[60] cursor-pointer shrink-0"
            title="Close Chat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Campaign Mini-Card */}
        <div className="px-6 py-4 bg-white border-b border-gray-50 flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Deal</span>
          <h4 className="text-[13px] font-bold text-gray-900">{deal.applicationId?.campaignId?.title}</h4>
          <span className="text-[11px] font-black text-[#eb4898]">🪙{deal.paymentAmount || deal.applicationId?.campaignId?.budget}</span>
        </div>

        {/* Chat Messages */}
        <div className={`flex-1 overflow-y-auto p-6 bg-gray-50/50 flex flex-col gap-4 ${!isKycApproved ? 'blur-sm select-none pointer-events-none' : ''}`}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Send size={24} className="text-blue-500" />
              </div>
              <h4 className="font-black text-gray-900 text-[15px] mb-1">Start Negotiating</h4>
              <p className="text-[13px] text-gray-500 font-medium">Send a message to discuss deliverables or ask questions.</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMine = msg.senderId === currentUser.id;
              return (
                <div key={msg._id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-[14px] font-medium leading-relaxed shadow-sm ${
                    isMine 
                      ? 'bg-[#EA580C] text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    {msg.content}
                    <div className={`text-[9px] mt-1.5 flex items-center gap-1 font-bold ${isMine ? 'text-blue-200 justify-end' : 'text-gray-400 justify-start'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isMine && <CheckCheck size={12} />}
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
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-full px-5 py-3.5 pr-14 text-[14px] text-gray-900 outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="absolute right-2 w-10 h-10 bg-[#EA580C] text-white rounded-full flex items-center justify-center hover:bg-[#C2410C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Send size={16} className="ml-1" />
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatOverlay;
