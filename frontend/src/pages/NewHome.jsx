import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios";
import {
  BadgeCheck,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Check,
  DollarSign,
  Clock,
  MessageSquare,
  FileText,
  Layers,
  Scale,
  Star,
  Zap,
  Lock,
  Compass,
  CheckCircle2,
  Sliders,
  TrendingUp,
  Eye,
  Award,
  Wifi,
  Battery,
  Bell,
  User,
  Search,
  SlidersHorizontal,
  Rocket,
  Wallet,
  Target,
  Briefcase,
  Building2,
  Play,
} from "lucide-react";

// Influencer Loop Data for Hero Phone Mockup
const influencerLoopData = [
  {
    image: "/mockup_first.jpg",
    handle: "@julia_travels",
    niche: "Travel & Lifestyle",
    followers: "245K",
    engagement: "5.8%",
    deal: "Nike Adventure",
  },
  {
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    handle: "@marcus_tech",
    niche: "Tech & Gaming",
    followers: "820K",
    engagement: "4.2%",
    deal: "Samsung Unpacked",
  },
  {
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    handle: "@clara_fashion",
    niche: "Fashion & Beauty",
    followers: "1.2M",
    engagement: "6.5%",
    deal: "Zara Autumn",
  },
  {
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    handle: "@fitness_dan",
    niche: "Health & Fitness",
    followers: "410K",
    engagement: "7.1%",
    deal: "Gymshark Active",
  },
];

// 4-Step Dual-Audience Flow Data
const flowData = {
  brand: [
    {
      num: "01",
      title: "Post your project",
      desc: "Describe the work, budget and deadline. It takes about five minutes..",
    },
    {
      num: "02",
      title: "Compare proposals",
      desc: "Review profiles, past work and prices. Chat before you decide.",
    },
    {
      num: "03",
      title: "Fund the first milestone",
      desc: "Money goes into secured Funds. Work starts only once it is safely held.",
    },
    {
      num: "04",
      title: "Approve and pay",
      desc: "Check each delivery. Approve it and the payment is released.",
    },
  ],
  creator: [
    {
      num: "01",
      title: "Build your profile",
      desc: "Add skills, samples and your rate. Get verified to stand out.",
    },
    {
      num: "02",
      title: "Send proposals",
      desc: "Reply to projects that fit. Set milestones and price clearly.",
    },
    {
      num: "03",
      title: "Start when funded",
      desc: "You begin once the client's money is in escrow, so no chasing.",
    },
    {
      num: "04",
      title: "Deliver and get paid",
      desc: "Upload your work. Approval releases payment to your account.",
    },
  ],
};

// 9-Video Reel Slider Data (Served via ImageKit CDN)
const reelsData = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=700&q=80",
    video:
      "https://ik.imagekit.io/9hwpxbgrw/Homepage%20Assets/cb722b01b691323a8a2b9e8dd0a4698c_720w.mp4?tr=orig",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=700&q=80",
    video:
      "https://ik.imagekit.io/9hwpxbgrw/Homepage%20Assets/68cfcfbef24b3b55effbd88963ac780b_720w.mp4?tr=orig",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=700&q=80",
    video:
      "https://ik.imagekit.io/9hwpxbgrw/Homepage%20Assets/c6ae7ae77ed7cf61a5b8d5bc0b6c7c0e_720w.mp4?tr=orig",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=700&q=80",
    video:
      "https://ik.imagekit.io/9hwpxbgrw/Homepage%20Assets/1a0249c7f295d5dae9001bd0c8563e20.mp4?tr=orig",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80",
    video:
      "https://ik.imagekit.io/9hwpxbgrw/Homepage%20Assets/f05239a28684d7bfa6f25e37eb837320.mp4?tr=orig",
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=700&q=80",
    video:
      "https://ik.imagekit.io/9hwpxbgrw/Homepage%20Assets/c6d1bccfdd72e2c5a9a2f14e0b6f058a_720w.mp4?tr=orig",
  },
  {
    id: 7,
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=700&q=80",
    video:
      "https://ik.imagekit.io/9hwpxbgrw/Homepage%20Assets/9ef051c1acd4abefa57681073c0b29ae.mp4?tr=orig",
  },
  {
    id: 8,
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=700&q=80",
    video:
      "https://ik.imagekit.io/9hwpxbgrw/Homepage%20Assets/260f5eba2310fd463dcff9db5eea9f66_720w.mp4?tr=orig",
  },
  {
    id: 9,
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=700&q=80",
    video:
      "https://ik.imagekit.io/9hwpxbgrw/Homepage%20Assets/9c093292d15e88d039d8846973387852_720w.mp4?tr=orig",
  },
];

// 6-Stage Deal Cycle Data (Transformed layout with simple language)
const dealStages = [
  {
    step: "1",
    tab: "Find & Brief",
    title: "Find the Right Creator and Set Clear Goals",
    desc: "Brands post what they need—video style, deliverables, and timeline. Verified creators in your niche get notified immediately so you can match and connect without wasting hours searching.",
    tags: ["Vetted Creators", "Clear Deliverables", "Instant Niche Match"],
  },
  {
    step: "2",
    tab: "Proposal & Terms",
    title: "Agree on Timelines, Scope, and Fair Pricing",
    desc: "Creators send proposals with exact delivery dates and revision limits. Both sides see the fees upfront before saying yes. Once accepted, the terms are locked so there are zero surprises.",
    tags: ["Locked Deadlines", "Transparent Pricing", "Zero Scope Creep"],
  },
  {
    step: "3",
    tab: "Secured-Funds",
    title: "Payment Stays 100% Safe in Platform Escrow",
    desc: "The brand deposits milestone coins into secure escrow before work starts. Creators produce content with total peace of mind knowing the funds are already there, and brands only pay when satisfied.",
    tags: ["Protected Escrow", "Guaranteed Payout", "Zero Financial Risk"],
  },
  {
    step: "4",
    tab: "Create & Upload",
    title: "Everything Happens in One Shared Workspace",
    desc: "Creators upload video drafts and watermarked previews directly into the deal room. Chat, files, notes, and timestamps stay in one place—no chasing attachments in WhatsApp or endless emails.",
    tags: ["Unified Workspace", "Automatic Timestamps", "No Lost Files"],
  },
  {
    step: "5",
    tab: "10-Day Review",
    title: "10-Day Review Window With Zero Ghosting",
    desc: "Brands have 10 days to review the submission against the original brief. A live countdown timer keeps everyone on track. If a brand goes silent, funds release automatically to protect the creator.",
    tags: ["10-Day Countdown", "Zero Ghosting", "Fair Edits Only"],
  },
  {
    step: "6",
    tab: "Instant Payout",
    title: "Instant Wallet Payout and Verified Reviews",
    desc: "As soon as the work is approved, coins drop straight into the creator's wallet with zero wait time. Both sides leave honest feedback to build lasting reputation and credibility on GrowFox.",
    tags: ["Instant Coin Transfer", "Zero Payout Delay", "Permanent Trust Score"],
  },
];

// Creator photo mock data for Stage 1 in the deal workflow
const workflowCreators = [
  {
    name: "Aanya Sharma",
    handle: "@avacooks",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Mason Ray",
    handle: "@masonlifts",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Iris Verma",
    handle: "@irisbeauty",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Devan Mehta",
    handle: "@devan_tech",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Priya Rao",
    handle: "@priya_travel",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Arjun Sen",
    handle: "@arjun_beats",
    image:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
  },
];

// Why It Helps Data (Redesigned matching reference)
const benefitsData = {
  brand: [
    {
      title: "Pay Only for Approved Work",
      desc: "Keep payments linked to agreed deliverables and approval milestones.",
      type: "escrow",
    },
    {
      title: "Zero Scope Confusion",
      desc: "Set clear expectations from the beginning. Keep briefs, deliverables and revisions aligned.",
      type: "scope",
    },
    {
      title: "Less Time Chasing",
      desc: "Manage deadlines, conversations and campaign updates in one place.",
      type: "time",
    },
    {
      title: "Verified Creator Profiles",
      desc: "Explore creator portfolios, audience insights and past work before making a decision.",
      type: "profile",
    },
    {
      title: "Everything Documented",
      desc: "Keep briefs, approvals, files and invoices organized and accessible.",
      type: "documents",
    },
    {
      title: "Support When It Matters",
      desc: "Get help resolving collaboration concerns with clear communication and documented agreements.",
      type: "support",
    },
  ],
  creator: [
    {
      title: "Guaranteed Escrow Coins",
      desc: "Work begins only after milestone coins are safely deposited. Zero risk of unpaid deliverables.",
      type: "escrow",
    },
    {
      title: "10-Day Auto Payout",
      desc: "Brands have 10 days to review. If they go silent, funds auto-release directly to your wallet.",
      type: "scope",
    },
    {
      title: "Brief-Enforced Protection",
      desc: "Deliverables are locked. Brands cannot demand endless revisions without extra milestone coins.",
      type: "time",
    },
    {
      title: "Permanent Reputation",
      desc: "Every completed campaign adds a verified brand review to build your tier-one rate card.",
      type: "profile",
    },
    {
      title: "Direct Instant Withdrawals",
      desc: "Withdraw your earnings directly to your bank account or UPI with zero hidden deductions.",
      type: "documents",
    },
    {
      title: "Fair Dispute Adjudication",
      desc: "Our neutral review team protects creators against unfair rejections if work meets brief specs.",
      type: "support",
    },
  ],
};

const bentoCardStyles = [
  {
    bg: "bg-[#F7F4EE]",
    title: "text-[#0E1015]",
    desc: "text-[#4B5162]",
    badge: "text-[#0E1015]",
    shield: "fill-[#0E1015] text-[#F7F4EE]",
  },
  {
    bg: "bg-[#FF5C00]",
    title: "text-[#0A0B0E]",
    desc: "text-[#2B1100]/85 font-medium",
    badge: "text-[#0A0B0E]",
    shield: "fill-[#0A0B0E] text-[#FF5C00]",
  },
  {
    bg: "bg-[#6D28D9]",
    title: "text-white",
    desc: "text-white/80",
    badge: "text-white",
    shield: "fill-white text-[#6D28D9]",
  },
  {
    bg: "bg-[#1d202b] border border-white/5",
    title: "text-white",
    desc: "text-slate-400",
    badge: "text-white",
    shield: "fill-white text-[#141519]",
  },
  {
    bg: "bg-[#F7F4EE]",
    title: "text-[#0E1015]",
    desc: "text-[#4B5162]",
    badge: "text-[#0E1015]",
    shield: "fill-[#0E1015] text-[#F7F4EE]",
  },
  {
    bg: "bg-[#1d202b] border border-white/5",
    title: "text-white",
    desc: "text-slate-400",
    badge: "text-white",
    shield: "fill-white text-[#141519]",
  },
];

const renderBentoGraphic = (type) => {
  switch (type) {
    case "escrow":
      return (
        <svg viewBox="0 0 160 140" className="w-full h-full drop-shadow-xl" fill="none">
          <path d="M125 18 L130 10 M140 25 L148 22 M135 35 L143 40" stroke="#FF9800" strokeWidth="2.5" strokeLinecap="round" />
          <g transform="translate(15, 15) rotate(-4)">
            <rect x="0" y="0" width="105" height="72" rx="12" fill="#2D2E36" />
            <rect x="4" y="4" width="97" height="64" rx="9" fill="#1C1D24" />
            <rect x="12" y="12" width="40" height="26" rx="6" fill="#FF7A00" />
            <polygon points="28,21 38,25 28,29" fill="white" />
            <rect x="58" y="14" width="30" height="5" rx="2.5" fill="#FFFFFF" opacity="0.4" />
            <rect x="58" y="24" width="22" height="4" rx="2" fill="#FFFFFF" opacity="0.25" />
            <rect x="12" y="46" width="76" height="5" rx="2.5" fill="#FFFFFF" opacity="0.15" />
            <rect x="12" y="55" width="55" height="4" rx="2" fill="#FFFFFF" opacity="0.1" />
          </g>
          <g transform="translate(10, 68)">
            <ellipse cx="26" cy="40" rx="22" ry="9" fill="#D97706" />
            <ellipse cx="26" cy="38" rx="22" ry="9" fill="#F59E0B" />
            <ellipse cx="26" cy="30" rx="20" ry="8" fill="#D97706" />
            <ellipse cx="26" cy="28" rx="20" ry="8" fill="#FBBF24" />
            <ellipse cx="26" cy="20" rx="18" ry="7" fill="#D97706" />
            <ellipse cx="26" cy="18" rx="18" ry="7" fill="#FCD34D" />
            <ellipse cx="26" cy="10" rx="16" ry="6" fill="#F59E0B" />
          </g>
          <g transform="translate(68, 52)">
            <path d="M22 28 V16 A16 16 0 0 1 54 16 V28" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M22 28 V16 A16 16 0 0 1 54 16 V28" stroke="#D97706" strokeWidth="4" strokeLinecap="round" fill="none" />
            <rect x="12" y="24" width="52" height="44" rx="10" fill="url(#goldLockGrad)" />
            <circle cx="38" cy="42" r="5" fill="#78350F" />
            <polygon points="36,44 40,44 41,54 35,54" fill="#78350F" />
          </g>
          <defs>
            <linearGradient id="goldLockGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="40%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
      );
    case "scope":
      return (
        <svg viewBox="0 0 160 140" className="w-full h-full drop-shadow-xl" fill="none">
          <g transform="translate(30, 8) rotate(4)">
            <rect x="0" y="10" width="85" height="110" rx="12" fill="#D97706" />
            <rect x="2" y="12" width="81" height="106" rx="10" fill="#FFFBEB" />
            <rect x="26" y="2" width="33" height="16" rx="4" fill="#64748B" />
            <circle cx="42" cy="7" r="3" fill="#334155" />
            <g transform="translate(14, 28)">
              <path d="M0 6 L4 10 L12 2" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="18" y1="6" x2="56" y2="6" stroke="#94A3B8" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M0 24 L4 28 L12 20" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="18" y1="24" x2="52" y2="24" stroke="#94A3B8" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M0 42 L4 46 L12 38" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="18" y1="42" x2="48" y2="42" stroke="#94A3B8" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          </g>
          <g transform="translate(80, 60)">
            <circle cx="34" cy="34" r="32" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="3" />
            <circle cx="34" cy="34" r="24" fill="#FFEDD5" />
            <circle cx="34" cy="34" r="16" fill="#FB923C" />
            <circle cx="34" cy="34" r="8" fill="#EA580C" />
            <g transform="translate(34, 34) rotate(-35)">
              <line x1="0" y1="0" x2="-28" y2="0" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
              <polygon points="0,0 -8,-4 -5,0 -8,4" fill="#EA580C" />
              <path d="M-28 0 L-34 -5 M-28 0 L-34 5" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </g>
        </svg>
      );
    case "time":
      return (
        <svg viewBox="0 0 160 140" className="w-full h-full drop-shadow-xl" fill="none">
          <path d="M140 18 L145 10 M148 28 L156 25 M144 38 L152 42" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
          <g transform="translate(18, 14) rotate(-3)">
            <rect x="0" y="0" width="88" height="96" rx="14" fill="#FFFFFF" />
            <rect x="0" y="0" width="88" height="24" rx="14" fill="#F97316" />
            <rect x="0" y="16" width="88" height="8" fill="#F97316" />
            <circle cx="20" cy="6" r="3" fill="#FFFFFF" />
            <circle cx="44" cy="6" r="3" fill="#FFFFFF" />
            <circle cx="68" cy="6" r="3" fill="#FFFFFF" />
            <g transform="translate(12, 34)" fill="#E2E8F0">
              <rect x="0" y="0" width="10" height="9" rx="2.5" />
              <rect x="18" y="0" width="10" height="9" rx="2.5" />
              <rect x="36" y="0" width="10" height="9" rx="2.5" fill="#FB923C" />
              <rect x="54" y="0" width="10" height="9" rx="2.5" />
              <rect x="0" y="16" width="10" height="9" rx="2.5" />
              <rect x="18" y="16" width="10" height="9" rx="2.5" />
              <rect x="36" y="16" width="10" height="9" rx="2.5" />
              <rect x="54" y="16" width="10" height="9" rx="2.5" fill="#FB923C" />
              <rect x="0" y="32" width="10" height="9" rx="2.5" />
              <rect x="18" y="32" width="10" height="9" rx="2.5" fill="#EA580C" />
              <rect x="36" y="32" width="10" height="9" rx="2.5" />
              <rect x="54" y="32" width="10" height="9" rx="2.5" />
            </g>
          </g>
          <g transform="translate(74, 56)">
            <circle cx="34" cy="34" r="30" fill="#F59E0B" />
            <circle cx="34" cy="34" r="26" fill="#FFFBEB" />
            <circle cx="34" cy="14" r="1.5" fill="#D97706" />
            <circle cx="34" cy="54" r="1.5" fill="#D97706" />
            <circle cx="14" cy="34" r="1.5" fill="#D97706" />
            <circle cx="54" cy="34" r="1.5" fill="#D97706" />
            <line x1="34" y1="34" x2="34" y2="18" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
            <line x1="34" y1="34" x2="46" y2="34" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="34" cy="34" r="3" fill="#D97706" />
          </g>
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 160 140" className="w-full h-full drop-shadow-xl" fill="none">
          <path d="M126 22 L132 14 M138 30 L146 27 M132 40 L140 44" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" />
          <g transform="translate(35, 15) rotate(3)">
            <rect x="0" y="0" width="94" height="110" rx="16" fill="#F8FAFC" />
            <circle cx="47" cy="42" r="22" fill="url(#purpleAvatarGrad)" />
            <circle cx="47" cy="35" r="9" fill="#FFFFFF" opacity="0.9" />
            <path d="M33 55 A14 14 0 0 1 61 55 Z" fill="#FFFFFF" opacity="0.9" />
            <circle cx="63" cy="24" r="10" fill="#8B5CF6" />
            <path d="M59 24 L62 27 L68 21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="18" y="74" width="58" height="6" rx="3" fill="#94A3B8" />
            <rect x="24" y="86" width="46" height="5" rx="2.5" fill="#CBD5E1" />
            <rect x="30" y="96" width="34" height="4" rx="2" fill="#E2E8F0" />
          </g>
          <defs>
            <linearGradient id="purpleAvatarGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
      );
    case "documents":
      return (
        <svg viewBox="0 0 160 140" className="w-full h-full drop-shadow-xl" fill="none">
          <g transform="translate(25, 30)">
            <path d="M0 12 C0 6 6 0 12 0 L36 0 C42 0 46 6 48 10 L52 14 L98 14 C104 14 110 20 110 26 L110 84 C110 90 104 96 98 96 L12 96 C6 96 0 90 0 84 Z" fill="#F97316" />
            <g transform="translate(24, -14) rotate(-6)">
              <rect x="0" y="0" width="70" height="92" rx="8" fill="#FFFFFF" />
              <path d="M54 0 L70 16 L54 16 Z" fill="#E2E8F0" />
              <rect x="10" y="10" width="38" height="10" rx="3" fill="#FB923C" />
              <text x="14" y="18" fill="white" fontSize="6" fontWeight="bold" fontFamily="sans-serif">INVOICE</text>
              <rect x="10" y="28" width="50" height="4" rx="2" fill="#CBD5E1" />
              <rect x="10" y="38" width="44" height="4" rx="2" fill="#E2E8F0" />
              <rect x="10" y="48" width="48" height="4" rx="2" fill="#CBD5E1" />
              <rect x="10" y="58" width="36" height="4" rx="2" fill="#E2E8F0" />
              <rect x="10" y="70" width="50" height="6" rx="3" fill="#94A3B8" />
            </g>
            <path d="M0 36 C0 30 6 24 12 24 L100 24 C106 24 112 30 112 36 L108 86 C108 92 102 98 96 98 L12 98 C6 98 0 92 0 86 Z" fill="#FB923C" />
          </g>
        </svg>
      );
    case "support":
      return (
        <svg viewBox="0 0 160 140" className="w-full h-full drop-shadow-xl" fill="none">
          <g transform="translate(48, 18)">
            <path d="M12 55 C12 18 68 18 68 55" stroke="#7C3AED" strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d="M12 55 C12 24 68 24 68 55" stroke="#A855F7" strokeWidth="4" strokeLinecap="round" fill="none" />
            <g transform="translate(0, 46)">
              <rect x="0" y="0" width="20" height="34" rx="9" fill="#6D28D9" />
              <rect x="3" y="3" width="14" height="28" rx="7" fill="#C084FC" />
            </g>
            <g transform="translate(60, 46)">
              <rect x="0" y="0" width="20" height="34" rx="9" fill="#6D28D9" />
              <rect x="3" y="3" width="14" height="28" rx="7" fill="#C084FC" />
            </g>
          </g>
          <g transform="translate(86, 74)">
            <rect x="0" y="0" width="38" height="28" rx="10" fill="#FFFFFF" />
            <polygon points="12,28 18,28 10,36" fill="#FFFFFF" />
            <circle cx="11" cy="14" r="2.5" fill="#7C3AED" />
            <circle cx="19" cy="14" r="2.5" fill="#7C3AED" />
            <circle cx="27" cy="14" r="2.5" fill="#7C3AED" />
          </g>
        </svg>
      );
    default:
      return null;
  }
};

// Platform Bento Features Data
const bentoFeatures = [
  {
    wide: true,
    icon: ShieldCheck,
    title: "Fund-secured Milestone Coins",
    desc: "The brand deposits milestone coins upfront. The creator produces content knowing the money exists and is protected, and the brand pays only for verified, brief-compliant deliverables.",
  },
  {
    icon: Compass,
    title: "Milestone Planner",
    desc: "Break any collaboration into manageable steps: Script approval, rough cut, final edit, and live link verification.",
  },
  {
    icon: MessageSquare,
    title: "Brief-Locked Project Chat",
    desc: "Messages, contract adjustments, and deliverable links stay anchored to the deal, never buried in DMs or emails.",
  },
  {
    icon: BadgeCheck,
    title: "Identity & Metric Verification",
    desc: "PAN/Aadhaar verification plus verified engagement stats ensure you collaborate with legitimate creators and brands.",
  },
  {
    icon: TrendingUp,
    title: "Live Deal Progress Tracker",
    desc: "See at a glance what is in production, what is in review, and what is ready for payout across all campaigns.",
  },
  {
    icon: Scale,
    title: "Objective Brief Adjudication",
    desc: "A neutral reviewer evaluates submitted content strictly against written brief criteria under Indian Contract Act standards.",
  },
  {
    icon: Star,
    title: "Two-Way Verified Reviews",
    desc: "Both brands and creators rate each other after milestone completion, building real, un-buyable reputations.",
  },
];

// FAQs Data
const faqs = [
  {
    q: "When does the creator receive their payout?",
    a: 'As soon as the brand clicks "Approve" on a milestone deliverable, the coins are released immediately to the creator\'s wallet. If the brand does not review or respond within the 10-day review window, GrowFox automatically releases the milestone funds to the creator.',
  },
  {
    q: "What happens if a brand requests work not in the original brief?",
    a: "The locked brief is law on GrowFox. Creators are not obligated to fulfill extra requests outside the written brief. If the brand desires additional deliverables (such as extra story slides or usage rights), both parties must use the chat renegotiation tool to add milestone coins.",
  },
  {
    q: "Does it cost anything to register or browse campaigns?",
    a: "No. Creating an account, building a creator portfolio, and posting brand briefs are 100% free. Platform protection fees apply only when a deal milestone is funded, and all deductions are shown transparently before any payment is initiated.",
  },
  {
    q: "Can a brand or creator cancel an ongoing deal?",
    a: "Yes. Any unfunded milestone can be cancelled by either party without penalty. For funded milestones, if work has not started, funds can be returned. If drafts have already been delivered, our dispute adjudication ensures fair compensation based on brief adherence.",
  },
];

const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

const NewHome = () => {
  const { user } = useAuth();
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [featuredCreators, setFeaturedCreators] = useState([]);

  // Fetch campaigns and creators for marketplace sections
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const campaignRes = await axios.get("/campaigns");
        const creatorRes = await axios.get("/creators");
        setFeaturedCampaigns(campaignRes.data?.data?.slice(0, 3) || []);
        setFeaturedCreators(creatorRes.data?.data?.slice(0, 8) || []);
      } catch (error) {
        console.error("Failed to fetch featured content", error);
      }
    };
    fetchFeatured();
  }, []);

  // Influencer loop state for hero phone
  const [currentInfluencerIndex, setCurrentInfluencerIndex] = useState(0);

  // Flow tab switcher ('brand' | 'creator')
  const [activeFlowTab, setActiveFlowTab] = useState("brand");

  // Deal cycle state (0 to 5)
  const [activeCycleIndex, setActiveCycleIndex] = useState(0);
  const [isCycleAutoPlaying, setIsCycleAutoPlaying] = useState(true);

  // Benefits tab switcher ('brand' | 'creator')
  const [activeBenefitTab, setActiveBenefitTab] = useState("brand");

  // Fee transparency slider state (₹5,000 to ₹5,00,000)
  const [projectValue, setProjectValue] = useState(50000);

  // FAQ accordion open states
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // 9-Video Reels Hand Slider (Drag-to-Scroll & Touch, No Auto Animation)
  const reelsContainerRef = useRef(null);
  const isReelsDragging = useRef(false);
  const reelsStartX = useRef(0);
  const reelsScrollLeft = useRef(0);

  const handleReelsMouseDown = (e) => {
    const slider = reelsContainerRef.current;
    if (!slider) return;
    isReelsDragging.current = true;
    reelsStartX.current = e.pageX - slider.offsetLeft;
    reelsScrollLeft.current = slider.scrollLeft;
  };

  const handleReelsMouseLeave = () => {
    isReelsDragging.current = false;
  };

  const handleReelsMouseUp = () => {
    isReelsDragging.current = false;
  };

  const handleReelsMouseMove = (e) => {
    if (!isReelsDragging.current) return;
    e.preventDefault();
    const slider = reelsContainerRef.current;
    if (!slider) return;
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - reelsStartX.current) * 1.5;
    slider.scrollLeft = reelsScrollLeft.current - walk;
  };

  // Handle Spotlight Cursor Glow
  const mouseMoveRaf = useRef(null);
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const currentTarget = e.currentTarget;
    if (mouseMoveRaf.current) cancelAnimationFrame(mouseMoveRaf.current);
    mouseMoveRaf.current = requestAnimationFrame(() => {
      currentTarget.style.setProperty("--mouse-x", `${x}px`);
      currentTarget.style.setProperty("--mouse-y", `${y}px`);
    });
  };

  useEffect(() => {
    return () => {
      if (mouseMoveRaf.current) cancelAnimationFrame(mouseMoveRaf.current);
    };
  }, []);

  // Timer for Hero Influencer Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentInfluencerIndex(
        (prev) => (prev + 1) % influencerLoopData.length,
      );
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Timer for 6-Stage Deal Cycle Auto-Play
  useEffect(() => {
    if (!isCycleAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveCycleIndex((prev) => (prev + 1) % dealStages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isCycleAutoPlaying]);

  // Fee calculations
  const platformFee = projectValue * 0.1; // 10% platform protection
  const paymentFee = projectValue * 0.03; // 3% gateway & processing
  const creatorPayout = projectValue - platformFee;
  const brandTotal = projectValue + paymentFee;

  return (
    <div className="bg-[#FAF9F6] text-slate-900 transition-colors duration-300 font-sans overflow-x-hidden selection:bg-orange-500 selection:text-white">
      {/* ================= 1. HERO SECTION (VIDEO BACKGROUND) ================= */}
      <section
        onMouseMove={handleMouseMove}
        className="relative px-6 py-28 sm:py-36 lg:py-44 h-[700px] flex items-center justify-center border-b border-white/10"
      >
        {/* Autoplay & Looping Background Video (ImageKit CDN with Local /public Fallback) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
          onError={(e) => {
            const fallback = "/Grid_Video.mp4";
            if (e.currentTarget.src !== window.location.origin + fallback) {
              e.currentTarget.src = fallback;
              e.currentTarget.play().catch(() => { });
            }
          }}
        >
          <source
            src="https://ik.imagekit.io/9hwpxbgrw/Homepage%20Assets/Grid_Video.mp4?tr=orig"
            type="video/mp4"
          />
          <source src="/Grid_Video.mp4" type="video/mp4" />
          <source src="/grid_vedio.mp4" type="video/mp4" />
        </video>

        {/* Ambient Dark Overlay for High-Contrast Text Legibility */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-black/40 to-transparent pointer-events-none z-0" />

        {/* Center Content: Heading & Action Buttons */}
        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-[4.5rem] font-black font-display tracking-tight leading-[1.05] text-white drop-shadow-md">
              The Platform Where <br />
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
                Content Meets
              </span>{" "}
              <br />
              Performance
            </h1>

            <p className="mt-5 text-sm sm:text-base lg:text-lg text-gray-200 max-w-xl mx-auto font-medium leading-relaxed drop-shadow">
              Every campaign protected with upfront Milestone Coins
            </p>

            <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 mt-8">
              <Link
                to="/register"
                className="px-6 py-3 sm:px-10 sm:py-4 rounded-xl bg-orange-500 text-white font-bold text-xs sm:text-sm tracking-widest uppercase hover:bg-orange-600 shadow-[0_10px_30px_rgba(249,115,22,0.35)] transition-all duration-300 active:scale-95 flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/creators"
                className="px-6 py-3 sm:px-10 sm:py-4 rounded-xl bg-white/10 backdrop-blur-md text-white font-bold text-xs sm:text-sm tracking-widest uppercase hover:bg-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all duration-300 border border-white/20 active:scale-95"
              >
                View Creators
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= TWO SIDES OF CREATOR ECONOMY ================= */}
      <section className="py-16 sm:py-24 px-6 sm:px-10 lg:px-16 bg-[#FAF9F6] border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black font-moderustic text-slate-900 leading-[1.1] mb-10 sm:mb-14 max-w-3xl">
            One <span className="text-orange-500">platform.</span>{" "}
            <br className="hidden sm:block" />
            Two <span className="text-orange-500">Sides.</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {/* Card 1: For Creators */}
            <div className="bg-[#EEEDFC] rounded-[2.2rem] sm:rounded-[2.6rem] p-8 sm:p-12 lg:p-14 relative overflow-hidden flex flex-col  min-h-[340px] sm:min-h-[500px]">
              <div className="relative z-10 max-w-sm sm:max-w-md">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#C85A32] block mb-4 sm:mb-5">
                  FOR CREATORS
                </span>
                <h3 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black font-display text-slate-900 leading-[1.15] mb-4 sm:mb-5">
                  Turn your content into opportunities.
                </h3>
                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mb-8 sm:mb-10 max-w-xs sm:max-w-sm">
                  Discover campaigns that match your niche, pitch directly to
                  brands, and get paid through a secure workflow.
                </p>
                <Link
                  to="/campaigns"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#E45318] hover:bg-[#cf450f] text-white font-bold text-sm shadow-[0_8px_20px_-4px_rgba(228,83,24,0.45)] transition-all duration-300 active:scale-95 w-fit"
                >
                  <span>Find Campaigns</span>
                  <span className="text-base leading-none">→</span>
                </Link>
              </div>

              {/* Creator Cutout Image */}
              <img
                src="/creator.png"
                alt="Creator"
                className="absolute -bottom-14 -right-4 sm:right-0 w-48 sm:w-64 md:w-64 lg:w-80 object-contain pointer-events-none select-none z-10"
              />
            </div>

            {/* Card 2: For Brands */}
            <div className="bg-[#0C101C] rounded-[2.2rem] sm:rounded-[2.6rem] p-8 sm:p-12 lg:p-14 relative overflow-hidden flex flex-col justify-between min-h-[360px] sm:min-h-[500px] text-white">

              <div className="relative z-10 max-w-sm sm:max-w-md">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#E87A50] block mb-4 sm:mb-5">
                  FOR BRANDS
                </span>
                <h3 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black font-display text-white leading-[1.15] mb-4 sm:mb-5">
                  Find creators who fit your campaign.
                </h3>
                <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed mb-8 sm:mb-10 max-w-xs sm:max-w-sm">
                  Post your brief, set your budget, review creator proposals,
                  and manage the collaboration from one place.
                </p>
                <Link
                  to="/creators"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg transition-all duration-300 active:scale-95 w-fit"
                >
                  <span>Find Creators</span>
                  <span className="text-base leading-none">→</span>
                </Link>
              </div>

              {/* Brand Cutout Image */}
              <img
                src="/brand.png"
                alt="Brand Professional"
                className="absolute -bottom-1 right-2 sm:right-6 w-60 sm:w-52 md:w-60 lg:w-80 object-contain pointer-events-none select-none z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. USER FLOW (4 STEPS DUAL TABS) ================= */}
      <section className="py-20 px-6 sm:px-12 lg:px-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className=" max-w-2xl mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-black tracking-widest uppercase mb-3">
              User Flow
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-moderustic tracking-tight text-slate-900">
              Four steps. Pick your side.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              Whether you are hiring or being hired, the journey is
              straightforward and every milestone tells you what happens next.
            </p>

            {/* Side Switcher Tabs */}
            <div className="inline-flex bg-slate-100 p-1.5 rounded-full mt-8 border border-slate-200 shadow-inner">
              <button
                onClick={() => setActiveFlowTab("brand")}
                className={`px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 ${activeFlowTab === "brand"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                I want to hire
              </button>
              <button
                onClick={() => setActiveFlowTab("creator")}
                className={`px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 ${activeFlowTab === "creator"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                I want to earn
              </button>
            </div>
          </div>

          {/* 4 Connected Step Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {flowData[activeFlowTab].map((step, idx) => (
              <motion.div
                key={`${activeFlowTab}-${step.num}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-[#FAF9F6] border-2 border-slate-200 rounded-3xl p-6 sm:p-7 relative hover:-translate-y-1.5 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="">
                    <div className="w-12 hidden md:flex h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-display font-black text-lg items-center justify-center mb-5 shadow-md shadow-orange-500/30">
                      {step.num}
                    </div>
                    <h3 className="text-lg py-2 font-black font-display text-slate-900">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold text-orange-600 uppercase tracking-widest">
                  <span>Step {idx + 1} of 4</span>
                  <CheckCircle2 size={14} className="text-emerald-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 4. DEAL CYCLE (EVERYTHING IN ONE WORKFLOW) ================= */}
      <section className="py-20 sm:py-24 px-6 sm:px-12 lg:px-20 bg-[#FAF9F6] select-none">
        <div className="max-w-6xl mx-auto">
          {/* Centered Heading */}
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-moderustic tracking-tight text-slate-900">
              Everything in One Workflow
            </h2>
          </div>

          {/* Centered Dark Pill Navigation Tabs */}
          <div className="flex bg-[#17191C] rounded-full justify-center mb-10 sm:mb-12 overflow-x-auto no-scrollbar py-2 px-2">
            <div className=" rounded-full p-1.5 flex items-center gap-1 sm:gap-1.5 shadow-xl max-w-full">
              {dealStages.map((stg, i) => {
                const isActive = activeCycleIndex === i;
                return (
                  <button
                    key={stg.step}
                    onClick={() => {
                      setIsCycleAutoPlaying(false);
                      setActiveCycleIndex(i);
                    }}
                    className={`rounded-full px-3.5 sm:px-4 py-2 flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 cursor-pointer ${isActive
                      ? "bg-white text-slate-900 shadow-md font-bold"
                      : "text-slate-300 hover:text-white"
                      }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 ${isActive
                        ? "bg-pink-500 text-white"
                        : "bg-white/10 text-slate-300"
                        }`}
                    >
                      {stg.step}
                    </span>
                    <span className="whitespace-nowrap">{stg.tab}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Soft Pastel Lavender Main Card Container */}
          <div
            onMouseEnter={() => setIsCycleAutoPlaying(false)}
            className="bg-[#DDE2FF] rounded-[32px] sm:rounded-[44px] p-6 sm:p-10 lg:p-14 border border-[#CED4F5] shadow-sm relative overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading, Simple Language Explanation, Pill Badges */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCycleIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h3 className="text-2xl sm:text-3xl lg:text-[2.2rem] font-black font-display text-slate-900 tracking-tight leading-[1.18] mb-4">
                      {dealStages[activeCycleIndex].title}
                    </h3>
                    <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-normal mb-8 max-w-md">
                      {dealStages[activeCycleIndex].desc}
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {dealStages[activeCycleIndex].tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-slate-800 text-xs sm:text-[13px] font-semibold shadow-sm border border-white/60"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Column: Tailored White Interactive Mock UI Card */}
              <div className="lg:col-span-7 flex justify-center">
                <div className="w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl shadow-indigo-950/10 border border-slate-100 min-h-[360px] flex flex-col justify-between">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCycleIndex}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25 }}
                      className="w-full h-full flex flex-col justify-between"
                    >
                      {/* Step 1: Find & Brief (Search bar + 6 creator cards) */}
                      {activeCycleIndex === 0 && (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
                            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">Beauty & Fitness creators · Under ₹25,000 · Mumbai, Delhi</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2.5">
                            {workflowCreators.map((c, idx) => (
                              <div
                                key={idx}
                                className="relative aspect-[4/5] rounded-xl overflow-hidden group shadow-sm bg-slate-100"
                              >
                                <img
                                  src={c.image}
                                  alt={c.name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
                                <span className="absolute bottom-1.5 left-1.5 text-[9px] sm:text-[10px] font-semibold text-white/95 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm truncate max-w-[90%]">
                                  {c.handle}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 2: Proposal & Terms */}
                      {activeCycleIndex === 1 && (
                        <div className="flex flex-col gap-3.5">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={workflowCreators[2].image}
                                alt="Iris"
                                className="w-9 h-9 rounded-full object-cover border border-slate-200"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs sm:text-sm text-slate-900">@irisbeauty</span>
                                  <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white" />
                                </div>
                                <span className="text-[10px] text-slate-500">Proposal submitted 2h ago</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              Awaiting Approval
                            </span>
                          </div>

                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              Deliverables & Scope
                            </span>
                            <p className="text-xs font-semibold text-slate-800">
                              2x 60s High-Energy Reels + 1x Story Sequence with Link
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80">
                              <span className="text-[10px] text-slate-500 block">First Draft Due</span>
                              <span className="font-bold text-slate-900">Oct 22 (4 Days)</span>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80">
                              <span className="text-[10px] text-slate-500 block">Included Revisions</span>
                              <span className="font-bold text-slate-900">Up to 2 Rounds</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 px-1">
                            <div>
                              <span className="text-[10px] text-slate-500 block">Agreed Budget</span>
                              <span className="text-base font-black text-slate-900">₹30,000 Coins</span>
                            </div>
                            <button className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all">
                              <Lock className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Lock & Accept</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Safe Escrow */}
                      {activeCycleIndex === 2 && (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                                <ShieldCheck className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                                  Platform Escrow Vault
                                </span>
                                <span className="text-base sm:text-lg font-black text-emerald-950">
                                  ₹30,000 Coins Secured
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-sm">
                              Held & Verified
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                              <div className="flex items-center gap-2 mb-1.5">
                                <Lock className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-xs font-bold text-slate-900">Brand Protection</span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed">
                                Your coins stay protected in escrow. Funds are only released after you inspect and approve the final work.
                              </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                              <div className="flex items-center gap-2 mb-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                                <span className="text-xs font-bold text-slate-900">Creator Guarantee</span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed">
                                Create content with zero hesitation. The platform guarantees the money is already deposited before you begin.
                              </p>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-400 text-center font-medium pt-1">
                            Ledger Hash: #GF-ESC-92810 · Safe Escrow Protocol Active
                          </div>
                        </div>
                      )}

                      {/* Step 4: Create & Upload */}
                      {activeCycleIndex === 3 && (
                        <div className="flex flex-col gap-3.5">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-orange-500" />
                              <span className="text-xs sm:text-sm font-bold text-slate-900">
                                Summer_Glow_Reel_Draft_v1.mp4
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              Draft Ready
                            </span>
                          </div>

                          <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center group shadow-inner">
                            <img
                              src={workflowCreators[2].image}
                              alt="Video preview"
                              className="w-full h-full object-cover opacity-70"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="w-11 h-11 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play className="w-4 h-4 fill-slate-900 ml-0.5" />
                              </div>
                            </div>
                            <span className="absolute bottom-2 left-2 text-[9px] font-bold text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                              9:16 Reel · 0:58s · 1080p
                            </span>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                            <span className="text-[10px] font-bold text-slate-500 block mb-1">Creator Note:</span>
                            <p className="text-[11px] text-slate-700 italic">
                              "Hey team, just uploaded the first draft! The product callout is placed in the first 3 seconds with the upbeat sound."
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Step 5: 10-Day Review */}
                      {activeCycleIndex === 4 && (
                        <div className="flex flex-col gap-4">
                          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 text-center">
                            <span className="text-[10px] font-black uppercase tracking-wider text-orange-800 block mb-1">
                              Review Window Active
                            </span>
                            <div className="text-2xl sm:text-3xl font-black font-display text-orange-950 tracking-tight">
                              07d : 14h : 22m : 18s
                            </div>
                            <span className="text-[10px] text-orange-700 font-medium">
                              Automatic payout triggers if no review is submitted in 10 days
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                              <span className="font-semibold text-slate-800">Check Brief Deliverables</span>
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> All 3 Met
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                              <span className="font-semibold text-slate-800">Requested Revisions</span>
                              <span className="text-[10px] font-bold text-slate-500">0 of 2 used</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5 pt-1">
                            <button className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors">
                              Request Edit
                            </button>
                            <button className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5">
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve Content</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 6: Instant Payout */}
                      {activeCycleIndex === 5 && (
                        <div className="flex flex-col gap-3.5">
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-2 shadow-md">
                              <Check className="w-5 h-5 stroke-[3]" />
                            </div>
                            <span className="text-base sm:text-lg font-black text-emerald-950 block">
                              Payment Released Instantly!
                            </span>
                            <span className="text-xs font-bold text-emerald-700">
                              ₹30,000 Coins added to @irisbeauty wallet
                            </span>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-slate-900">Mutual Ratings Published</span>
                              <div className="flex text-amber-400">
                                {"★★★★★"}
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed italic">
                              "Incredible creator to work with. Flawless video quality, delivered 2 days ahead of schedule!"
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              Zero withdrawal delay
                            </span>
                            <span className="text-emerald-600 font-bold">100% On-Time Deal</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. WHY IT HELPS (REDESIGNED MATCHING REFERENCE) ================= */}
      <section className="py-20 sm:py-18 px-6 sm:px-10 lg:px-16 bg-[#08090C] text-white relative overflow-hidden select-none border-b border-white/5">
        {/* Subtle ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-600/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">

            {/* Headline with hand-drawn orange underline under 'Worries About.' */}
            <h2 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black font-moderustic tracking-tight text-white leading-[1.15]">
              Built Around What Each <br className="hidden sm:inline" />
              <span>Side </span>
              <span className="text-[#FF5C00] relative inline-block">
                Worries About.
                <svg
                  className="absolute -bottom-2 sm:-bottom-3 left-0 w-full overflow-visible pointer-events-none"
                  viewBox="0 0 240 14"
                  fill="none"
                >
                  <path
                    d="M3 10C65 2 175 2 237 10"
                    stroke="#FF5C00"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>

            {/* Audience Switcher Tabs */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setActiveBenefitTab("brand")}
                className={`px-7 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${activeBenefitTab === "brand"
                  ? "bg-[#FF5C00] text-white shadow-lg shadow-orange-500/30 scale-105"
                  : "bg-[#141519] hover:bg-white/10 text-slate-300 border border-white/10"
                  }`}
              >
                For Brand
              </button>
              <button
                onClick={() => setActiveBenefitTab("creator")}
                className={`px-7 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${activeBenefitTab === "creator"
                  ? "bg-[#FF5C00] text-white shadow-lg shadow-orange-500/30 scale-105"
                  : "bg-[#141519] hover:bg-white/10 text-slate-300 border border-white/10"
                  }`}
              >
                For Creators
              </button>
            </div>
          </div>

          {/* 3x2 Bento Benefit Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {benefitsData[activeBenefitTab].map((item, idx) => {
              const card = bentoCardStyles[idx % bentoCardStyles.length];
              return (
                <motion.div
                  key={`${activeBenefitTab}-${idx}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className={`${card.bg} rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between min-h-[230px] sm:min-h-[240px] shadow-lg group hover:scale-[1.015] transition-all duration-300`}
                >
                  {/* Left Text Content */}
                  <div className="relative z-10 max-w-[92%] sm:max-w-[65%]">
                    <h3
                      className={`text-lg sm:text-xl font-bold font-moderustic tracking-tight mb-2.5 ${card.title}`}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`text-xs sm:text-[13px] leading-relaxed font-normal ${card.desc}`}
                    >
                      {item.desc}
                    </p>
                  </div>

                  {/* Right Floating 3D Graphic */}
                  <div className="absolute -right-2 -bottom-2 sm:right-1 sm:bottom-1 w-20 h-20 sm:w-34 sm:h-34 pointer-events-none select-none flex items-end justify-end group-hover:scale-105 transition-transform duration-300">
                    {renderBentoGraphic(item.type)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= VETTED CREATORS SHOWCASE ================= */}
      <section className="py-24 px-6 sm:px-12 bg-gray-50 border-t border-gray-200/60 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black font-moderustic text-gray-900 mb-4 tracking-tight leading-tight">
              Creators
            </h2>
            <p className="text-gray-500 text-sm sm:text-base font-medium">
              Hover over the creator cards below to view their showcase details.
            </p>
          </div>

          {/* Static columns flex list */}
          <div className="flex flex-wrap justify-center gap-8 px-4">
            {(featuredCreators && featuredCreators.length > 0
              ? user
                ? featuredCreators.filter((c) => {
                  const creatorUserId = c.userId?._id || c.userId;
                  return creatorUserId !== user._id;
                })
                : featuredCreators
              : [
                {
                  name: "Alice Smith",
                  niche: "Tech & Gadgets",
                  stat: "4.8% Engagement",
                  url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                },
                {
                  name: "Marcus Jones",
                  niche: "Gaming & Setup",
                  stat: "🪙4.5L Earned",
                  url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
                },
                {
                  name: "Saria Roy",
                  niche: "Travel & Lifestyle",
                  stat: "98% Completion",
                  url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
                },
                {
                  name: "Kenji Suzuki",
                  niche: "Food & Culinary",
                  stat: "96% Reach Rate",
                  url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
                },
              ]
            )
              .slice(0, 4)
              .map((creator, i) => {
                const isFromDb = !!creator._id;
                const followerText = isFromDb
                  ? creator.followerCount >= 1000000
                    ? `${(creator.followerCount / 1000000).toFixed(1)}M Followers`
                    : creator.followerCount >= 1000
                      ? `${Math.round(creator.followerCount / 1000)}K Followers`
                      : `${creator.followerCount || 0} Followers`
                  : creator.stat;

                const imageUrl = isFromDb
                  ? creator.profilePicture ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                  : creator.url;

                return (
                  <motion.div
                    key={creator._id || i}
                    whileHover={{ scale: 1.05, y: -10 }}
                    className="w-64 sm:w-72 shrink-0 bg-white border border-gray-200/80 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col group relative text-left"
                  >
                    {/* Aspect video/image thumb */}
                    <div className="h-80 relative bg-gray-100 overflow-hidden">
                      <img
                        src={imageUrl}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        alt={creator.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-80 z-10" />

                      <div className="absolute bottom-4 left-4 z-20 text-white flex flex-col gap-1">
                        <h4 className="text-sm font-black tracking-tight leading-tight">
                          {creator.name}
                        </h4>
                        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                          {creator.niche}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 flex justify-between items-center border-t border-gray-100">
                      <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 border border-orange-100 px-3 py-1 rounded-md">
                        {followerText}
                      </span>
                      {isFromDb ? (
                        <Link
                          to={user ? `/creators/${creator._id}` : "/login"}
                          className="px-3.5 py-1.5 bg-gray-900 text-white hover:bg-[#EA580C] font-black text-[9px] uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                        >
                          View Profile
                        </Link>
                      ) : (
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                          Verified 🌟
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      </section>

      {/* ================= ACTIVE BRAND CAMPAIGNS ================= */}
      <section className="py-24 px-6 sm:px-12 bg-white border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <span className="text-orange-500 text-[10px] font-black tracking-[0.3em] uppercase mb-4 block">
                Marketplace Hub
              </span>
              <h2 className="text-4xl lg:text-5xl font-black font-moderustic text-gray-900 leading-none tracking-tight">
                Active Brand <br />{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                  Campaigns
                </span>
              </h2>
            </div>
            <Link
              to="/campaigns"
              className="group flex items-center gap-3 bg-gray-50 px-8 py-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-white transition-all shadow-sm"
            >
              <span className="font-black uppercase tracking-widest text-[11px] text-gray-700 group-hover:text-orange-500">
                View All Missions
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-orange-500" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {featuredCampaigns.length > 0 ? (
              featuredCampaigns.map((campaign) => (
                <motion.div
                  key={campaign._id}
                  whileHover={{ y: -8 }}
                  className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-[0_20px_45px_rgba(0,0,0,0.06)] transition-all duration-500 h-full relative text-left"
                >
                  {/* Cover Image Section */}
                  <div className="h-64 relative bg-gray-100 overflow-hidden shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt="Campaign Cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent opacity-90 z-10" />

                    {/* Top Badges */}
                    <div className="absolute top-5 left-5 z-20 flex gap-2">
                      <span className="text-[9px] font-black text-white uppercase tracking-widest bg-white/20 backdrop-blur-md border border-white/10 px-3 py-1 rounded-md">
                        {campaign.niche || "General"}
                      </span>
                    </div>
                    <div className="absolute top-5 right-5 z-20">
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 px-3 py-1 rounded-md flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active
                      </span>
                    </div>

                    {/* Title & Brand Bottom Left */}
                    <div className="absolute bottom-5 left-5 right-5 z-20 text-white flex flex-col gap-2">
                      <div className="flex items-center gap-2 mb-1">
                        {campaign.brandId?.logo ? (
                          <img
                            src={campaign.brandId.logo}
                            className="w-5 h-5 rounded-full bg-white object-cover border border-white/20"
                            alt=""
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-white text-gray-900 flex items-center justify-center text-[10px] font-black">
                            {campaign.brandId?.businessName?.[0] || "B"}
                          </div>
                        )}
                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest line-clamp-1">
                          {campaign.brandId?.businessName || "Brand Partner"}
                        </span>
                      </div>
                      <h3 className="text-lg font-black font-display tracking-tight leading-tight line-clamp-2">
                        {campaign.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                        Key Requirements
                      </p>
                      {campaign.requirements &&
                        campaign.requirements.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {campaign.requirements.slice(0, 3).map((req, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-[10px] font-bold rounded-lg truncate max-w-full"
                            >
                              {req}
                            </span>
                          ))}
                          {campaign.requirements.length > 3 && (
                            <span className="px-2.5 py-1.5 bg-gray-50 border border-gray-100 text-gray-400 text-[10px] font-bold rounded-lg">
                              +{campaign.requirements.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2.5 py-1.5 bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold rounded-lg">
                            High-Quality Content
                          </span>
                          <span className="px-2.5 py-1.5 bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold rounded-lg">
                            Brand Integration
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6">
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">
                          Budget
                        </p>
                        <p className="text-lg font-black font-display text-gray-900">
                          🪙{campaign.budget?.toLocaleString()}
                        </p>
                      </div>
                      <Link
                        to={`/campaigns/${campaign._id}`}
                        className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-orange-500 font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                      >
                        View Brief <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 bg-gray-50 rounded-[2rem] text-center py-20 border border-dashed border-gray-200">
                <p className="text-gray-500 font-bold text-base mb-4">
                  No active brand campaigns available
                </p>
                <Link
                  to="/register"
                  className="text-orange-500 font-black hover:underline tracking-widest uppercase text-xs"
                >
                  Register and post brief →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= 8. FAQ ACCORDION ================= */}
      <section className="py-20 px-6 sm:px-12 lg:px-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-black tracking-widest uppercase mb-3">
              Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-moderustic tracking-tight text-slate-900">
              Quick answers.
            </h2>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className={`border-2 rounded-2xl transition-all duration-300 overflow-hidden ${isOpen
                    ? "border-orange-500 bg-orange-50/40"
                    : "border-slate-200 bg-white"
                    }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full p-5 sm:p-6 text-left flex justify-between items-center gap-4 cursor-pointer"
                  >
                    <span className="font-display font-black text-sm sm:text-base text-slate-900">
                      {faq.q}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-black transition-transform duration-300 ${isOpen
                        ? "bg-orange-500 text-white rotate-45"
                        : "bg-slate-100 text-slate-600"
                        }`}
                    >
                      +
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-5 pb-6 sm:px-6 pt-1 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-orange-100">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 8.5 9-VIDEO REEL SLIDER ================= */}
      <section className="relative w-full py-12 sm:py-16 bg-[#090A0C] overflow-hidden border-t border-white/5 select-none">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-orange-600/5 rounded-full blur-[140px] pointer-events-none" />

        {/* 9-Reel Hand Slider Track */}
        <div
          ref={reelsContainerRef}
          onMouseDown={handleReelsMouseDown}
          onMouseLeave={handleReelsMouseLeave}
          onMouseUp={handleReelsMouseUp}
          onMouseMove={handleReelsMouseMove}
          className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-3 px-4 sm:px-8 cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {reelsData.map((reel, idx) => (
            <div
              key={`${reel.id}-${idx}`}
              className="w-[200px] sm:w-[220px] md:w-[240px] aspect-[9/16] shrink-0 rounded-2xl overflow-hidden relative border border-white/10 bg-[#121417] shadow-2xl transition-all duration-300 hover:border-white/30 hover:scale-[1.02]"
            >
              <video
                poster={reel.image}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover select-none pointer-events-none"
                onError={(e) => {
                  const fallback = "/Grid_Video.mp4";
                  if (e.currentTarget.src !== window.location.origin + fallback) {
                    e.currentTarget.src = fallback;
                    e.currentTarget.play().catch(() => { });
                  }
                }}
              >
                <source src={reel.video} type="video/mp4" />
                <source src="/Grid_Video.mp4" type="video/mp4" />
                <source src="/grid_vedio.mp4" type="video/mp4" />
              </video>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 9. CONVERSION CALL TO ACTION ================= */}
      <section className="relative w-full py-20 sm:py-28 lg:py-32 bg-[#090A0C] overflow-hidden border-t border-white/5">
        {/* Subtle dark ambient glows */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[450px] h-[450px] bg-pink-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Left Column: Headline, Description, Download Badges & Eligibility Link */}
          <div className="flex-1 text-left max-w-2xl lg:max-w-xl">
            <h2 className="text-4xl sm:text-6xl lg:text-[4.5rem] font-black font-moderustic text-white tracking-tight leading-[1.08] mb-6">
              Your influence, <br />
              your income.
            </h2>

            <p className="text-slate-400 text-base sm:text-lg lg:text-xl font-medium leading-relaxed mb-10 max-w-lg">
              Join as creators on GrowFox. Apply to campaigns, track
              earnings, and redeem exclusive brand perks — all from one app.
            </p>

            {/* Check Eligibility Link */}
            <div className="flex flex-row items-center gap-3 sm:gap-4 mt-8">
              <Link
                to="/register"
                className="px-6 py-3 sm:px-10 sm:py-4 rounded-xl bg-orange-500 text-white font-bold text-xs sm:text-sm tracking-widest uppercase hover:bg-orange-600 shadow-[0_10px_30px_rgba(249,115,22,0.35)] transition-all duration-300 active:scale-95 flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right Column: Realistic iPhone Mockup - Scaled Down & Tight Spacing */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative w-[260px] sm:w-[285px] h-[480px] sm:h-[550px] bg-[#121417] rounded-[44px] p-2.5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.12),inset_0_0_0_2px_#22252A] border-[3px] border-[#282B31] select-none">
              {/* Top Dynamic Island / Notch */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-20 h-4.5 bg-black rounded-full z-30 flex items-center justify-between px-2.5">
                <div className="w-2 h-2 rounded-full bg-[#18191C]/80 border border-white/5"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-900/40"></div>
              </div>

              {/* Screen Content Container - Fully Locked, No Scrolling, Snug Spacing */}
              <div className="w-full h-full bg-gray-50 rounded-[34px] overflow-hidden flex flex-col justify-between text-gray-900 relative select-none">
                {/* Top Section */}
                <div className="shrink-0 bg-white border-b border-gray-100">
                  {/* Status Bar */}
                  <div className="pt-2 px-5 pb-1 flex justify-between items-center text-[9px] font-black text-gray-900 z-20 bg-gray-50">
                    <span>9:41</span>
                    <div className="flex items-center gap-1 text-gray-900">
                      <Wifi size={10} />
                      <Battery size={11} />
                    </div>
                  </div>

                  {/* In-App Header */}
                  <div className="px-3 py-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <img
                        src="/growfox.png"
                        alt="GrowFox"
                        className="h-4 w-auto object-contain"
                      />
                      <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-[#EA580C] text-[7.5px] font-black uppercase tracking-wider">
                        Explore
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <Bell size={13} className="text-gray-600" />
                        <div className="w-1.5 h-1.5 bg-[#EA580C] rounded-full absolute -top-0.5 -right-0.5" />
                      </div>
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 p-0.5">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                          <User size={10} className="text-gray-700" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Middle Content - Zero Scroll, Tight & Cohesive Spacing */}
                <div className="flex-1 p-2.5 flex flex-col justify-start gap-2 overflow-hidden">
                  {/* Search Bar */}
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-xs shrink-0">
                    <Search size={11} className="text-gray-400 shrink-0" />
                    <span className="text-[8.5px] text-gray-400 font-medium flex-1">
                      Search missions, brands...
                    </span>
                    <SlidersHorizontal
                      size={11}
                      className="text-gray-400 shrink-0"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="px-2 py-0.5 bg-gray-900 text-white rounded-md text-[7px] font-bold">
                      All
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded-md text-[7px] font-medium">
                      Tech
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded-md text-[7px] font-medium">
                      Lifestyle
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded-md text-[7px] font-medium">
                      Fashion
                    </span>
                  </div>

                  {/* Hero Campaign Card (Our CampaignCard Design) */}
                  <div className="bg-white rounded-xl p-2 shadow-xs border border-gray-100 flex flex-col shrink-0">
                    {/* Cover Image */}
                    <div className="relative h-24 w-full rounded-lg overflow-hidden mb-1.5 bg-gray-900">
                      <img
                        src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80"
                        alt="Tech Mission"
                        className="w-full h-full object-cover"
                      />
                      {/* Brand Logo Float */}
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-white/25 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xs">
                        <Building2 size={11} className="text-white" />
                      </div>
                      {/* Status Badge */}
                      <div className="absolute top-1.5 left-1.5 z-10">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/30 backdrop-blur-md border border-emerald-500/40 text-[7px] font-black uppercase tracking-wider text-white shadow-xs">
                          <Clock size={7} className="text-emerald-300" /> Active
                        </span>
                      </div>
                      {/* Gradient Overlay & Budget */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-85" />
                      <div className="absolute bottom-1.5 left-2 right-2 flex justify-between items-end z-10">
                        <div className="flex flex-col">
                          <span className="text-[6.5px] text-white/60 uppercase tracking-widest font-black leading-tight">
                            Campaign Budget
                          </span>
                          <span className="text-sm font-black font-display text-white flex items-center gap-1 leading-none mt-0.5">
                            <Wallet size={10} className="text-[#eb4898]" />{" "}
                            🪙45,000
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="px-0.5 flex flex-col">
                      <h4 className="text-[11px] font-black text-gray-900 leading-tight mb-1 truncate">
                        UltraVision 4K Drone Launch
                      </h4>
                      {/* Requirements */}
                      <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-800 border border-gray-200 px-1 py-0.5 rounded text-[7px] font-black uppercase tracking-wider">
                          <User size={7} className="text-gray-400" /> Tech
                        </span>
                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-[#EA580C] border border-indigo-100 px-1 py-0.5 rounded text-[7px] font-black uppercase tracking-wider">
                          <Target size={7} className="text-[#EA580C]/70" /> 3
                          Reels
                        </span>
                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-[#EA580C] border border-indigo-100 px-1 py-0.5 rounded text-[7px] font-black uppercase tracking-wider">
                          <Target size={7} className="text-[#EA580C]/70" /> 2
                          Stories
                        </span>
                      </div>
                      {/* Button */}
                      <div className="w-full bg-gradient-to-r from-[#EA580C] to-[#BE123C] text-white text-[8.5px] font-black uppercase tracking-widest py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-xs">
                        Analyze Brief <ArrowRight size={9} />
                      </div>
                    </div>
                  </div>

                  {/* Peeking Next Card Teaser */}
                  <div className="bg-white rounded-lg p-1.5 shadow-xs border border-gray-100 flex items-center gap-2 opacity-65 shrink-0">
                    <div className="w-8 h-7 rounded-md overflow-hidden bg-gray-900 shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80"
                        alt="Fashion Mission"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[8.5px] font-black text-gray-900 truncate leading-tight">
                        Aura Summer Apparel Launch
                      </div>
                      <div className="text-[7.5px] text-[#EA580C] font-bold leading-tight">
                        🪙 32,000 Budget
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom App Navigation */}
                <div className="shrink-0 bg-white border-t border-gray-100">
                  <div className="h-9 flex items-center justify-around px-3">
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-[#EA580C] text-white flex items-center justify-center shadow-xs">
                        <Compass size={11} />
                      </div>
                      <span className="text-[7px] font-black text-[#EA580C] leading-none mt-0.5">
                        Home
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-gray-400">
                      <Briefcase size={12} />
                      <span className="text-[7px] font-bold leading-none mt-0.5">
                        Deals
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-gray-400">
                      <Wallet size={12} />
                      <span className="text-[7px] font-bold leading-none mt-0.5">
                        Wallet
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-gray-400">
                      <User size={12} />
                      <span className="text-[7px] font-bold leading-none mt-0.5">
                        Profile
                      </span>
                    </div>
                  </div>

                  {/* Bottom Home Indicator */}
                  <div className="h-2.5 w-full flex items-center justify-center">
                    <div className="w-16 h-1 bg-gray-300 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewHome;
