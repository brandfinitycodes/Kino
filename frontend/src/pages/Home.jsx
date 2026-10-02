import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useInView, animate, useMotionValueEvent } from 'framer-motion';
const PhoneMockup = lazy(() => import('../components/PhoneMockup'));
import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';
import {
  BadgeCheck,
  Users,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  User,
  Globe,
  Target,
  Zap,
  Search,
  ShieldCheck,
  Sparkles,
  Laptop,
  Heart,
  Copy,
  MessageSquare,
  DollarSign,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  Building2,
  MousePointer2,
  FilePlus,
  ClipboardCheck,
  Share2,
  Mail
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import axios from '../utils/axios';

// Recharts Dummy Analytics Data for Mockup Step 3
const analyticsData = [
  { name: 'Mon', earnings: 1200 },
  { name: 'Tue', earnings: 1800 },
  { name: 'Wed', earnings: 1400 },
  { name: 'Thu', earnings: 2800 },
  { name: 'Fri', earnings: 2200 },
  { name: 'Sat', earnings: 3600 },
  { name: 'Sun', earnings: 4200 },
];

// Influencer Loop Data for Hero Phone Mockup
const influencerLoopData = [
  {
    image: '/mockup_first.jpg',
    handle: '@julia_travels',
    niche: 'Travel & Lifestyle',
    followers: '245K',
    engagement: '5.8%',
    deal: 'Nike Adventure'
  },
  {
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    handle: '@marcus_tech',
    niche: 'Tech & Gaming',
    followers: '820K',
    engagement: '4.2%',
    deal: 'Samsung Unpacked'
  },
  {
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    handle: '@clara_fashion',
    niche: 'Fashion & Beauty',
    followers: '1.2M',
    engagement: '6.5%',
    deal: 'Zara Autumn'
  },
  {
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    handle: '@fitness_dan',
    niche: 'Health & Fitness',
    followers: '410K',
    engagement: '7.1%',
    deal: 'Gymshark Active'
  }
];

const Home = () => {
  const { user } = useAuth();
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [featuredCreators, setFeaturedCreators] = useState([]);

  // Interactive 3-Step Phone Mockup State
  const [activeCarouselStep, setActiveCarouselStep] = useState(0);

  // Influencer Loop state
  const [currentInfluencerIndex, setCurrentInfluencerIndex] = useState(0);

  // Why Creators Choose: Tablet Sync & Accordion State
  const [activeAccordion, setActiveAccordion] = useState(0);

  // Why Creators Choose: Section 3 Interactions
  const [selectedBrandDetail, setSelectedBrandDetail] = useState(null); // 'adidas' | 'dyson' | null
  const [appliedBrands, setAppliedBrands] = useState({}); // { adidas: boolean, dyson: boolean }
  const [fundsSecuredReleased, setFundsSecuredReleased] = useState(false);
  const [walletBalance, setWalletBalance] = useState(42800);
  const [walletLockedFundsSecured, setWalletLockedFundsSecured] = useState(80000);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'brand', text: 'Hey! Can we make it 1 YouTube post and 2 Instagram story slides instead?' },
    { sender: 'creator', text: "Sure! Let's update the contract brief with this tier details." }
  ]);
  const [chatInputText, setChatInputText] = useState('');
  const [isTypingBrand, setIsTypingBrand] = useState(false);
  const [walletWithdrawalState, setWalletWithdrawalState] = useState('idle'); // 'idle' | 'prompt' | 'processing' | 'success'
  const [withdrawalUpi, setWithdrawalUpi] = useState('alice@upi');
  const [withdrawnAmount, setWithdrawnAmount] = useState(0);

  // Why Creators Choose: Accordion auto-scroll Ref
  const accordionChatEndRef = useRef(null);

  // Two-Sided Platform States (Section 4 Redesign)
  const [activePlatformSide, setActivePlatformSide] = useState('creator'); // 'creator' | 'brand'
  const [activeScreen, setActiveScreen] = useState('hero'); // 'hero' | 'carousel' | 'accordion' | 'chat'



  // Section 4 Support Chat States
  const [supportMessages, setSupportMessages] = useState([
    { sender: 'support', text: 'Hey there! Welcome to the support hub. How can we assist with your pending deal?' },
    { sender: 'user', text: 'Hi! I completed the video review link and submitted it. When will the brand release the payment?' },
    { sender: 'support', text: 'The brand has 72 hours to review deliverables. Once approved, the system moves the funds to your wallet balance.' }
  ]);
  const [supportInputText, setSupportInputText] = useState('');
  const [isTypingSupport, setIsTypingSupport] = useState(false);
  const supportChatEndRef = useRef(null);

  // Handle Support Chat message sending
  const handleSendSupportMessage = (e) => {
    if (e) e.preventDefault();
    if (!supportInputText.trim()) return;

    const userMsg = supportInputText.trim();
    setSupportMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setSupportInputText('');

    // Trigger typing response from support
    setIsTypingSupport(true);
    setTimeout(() => {
      setIsTypingSupport(false);
      const supportReplies = [
        "I'm checking that campaign status right now. One moment, please.",
        "Yes, our system logs show the draft is uploaded. I've sent a ping to the Brand Manager to speed up verification.",
        "That's correct! Payment releases are processed within 2 hours of brand approval. Is there anything else I can clarify?",
        "Got it! Let me review this submission. It looks like it meets all brief specifications.",
      ];
      const randomReply = supportReplies[Math.floor(Math.random() * supportReplies.length)];
      setSupportMessages(prev => [...prev, { sender: 'support', text: randomReply }]);
    }, 1200);
  };

  useEffect(() => {
    if (accordionChatEndRef.current) {
      accordionChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  useEffect(() => {
    if (supportChatEndRef.current) {
      supportChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [supportMessages]);

  // Handle Proposal Application inside phone
  const handleApplyBrand = (brandId) => {
    setAppliedBrands(prev => ({ ...prev, [brandId]: true }));
  };

  // Handle Funds-secured release inside phone
  const handleReleaseFundsSecured = () => {
    if (fundsSecuredReleased) return;
    setFundsSecuredReleased(true);
    setWalletLockedFundsSecured(0);
    setWalletBalance(prev => prev + 80000);
  };

  // Handle Chat message sending inside phone
  const handleSendChatMessage = (e) => {
    if (e) e.preventDefault();
    if (!chatInputText.trim()) return;

    const userMsg = chatInputText.trim();
    const newMsgs = [...chatMessages, { sender: 'creator', text: userMsg }];
    setChatMessages(newMsgs);
    setChatInputText('');

    // Trigger typing response from brand
    setIsTypingBrand(true);
    setTimeout(() => {
      setIsTypingBrand(false);
      const brandReplies = [
        "Perfect! I've updated the payment terms on Razorpay now.",
        "Awesome, looking forward to the draft upload!",
        "Thanks for confirming. I'll pass this to our marketing lead.",
        "Sounds like a plan! Let's launch this brief soon.",
      ];
      const randomReply = brandReplies[Math.floor(Math.random() * brandReplies.length)];
      setChatMessages(prev => [...prev, { sender: 'brand', text: randomReply }]);
    }, 1200);
  };

  // Handle Wallet withdrawal trigger inside phone
  const handleInitiateWithdrawal = () => {
    setWalletWithdrawalState('prompt');
  };

  const handleConfirmWithdrawal = () => {
    if (!withdrawalUpi.trim()) return;
    setWalletWithdrawalState('processing');
    setWithdrawnAmount(walletBalance);
    setTimeout(() => {
      setWalletBalance(0);
      setWalletWithdrawalState('success');
    }, 1500);
  };


  const [copiedLink, setCopiedLink] = useState(false);
  const [customLinkInput, setCustomLinkInput] = useState('kino.app/collab/alice');

  // Refs for tracking position
  const mainRef = useRef(null);
  const heroPlaceholderRef = useRef(null);
  const carouselPlaceholderRef = useRef(null);
  const accordionPlaceholderRef = useRef(null);
  const chatPlaceholderRef = useRef(null);
  const canvasRef = useRef(null);

  // Tracks if layout dimensions/coordinates have been measured on mount
  const [coordsLoaded, setCoordsLoaded] = useState(false);

  // Coordinates state for the shared phone
  const [coords, setCoords] = useState({
    heroLeft: 0,
    heroTop: 0,
    heroWidth: 280,
    heroHeight: 550,
    carouselLeft: 0,
    carouselTop: 0,
    carouselWidth: 280,
    carouselHeight: 550,
    accordionLeft: 0,
    accordionTop: 0,
    chatLeft: 0,
    chatTop: 0,
    chatWidth: 280,
    chatHeight: 550,
    heroLeave: 120,
    carouselArrive: 600,
    carouselLeave: 1200,
    accordionArrive: 1800,
    accordionLeave: 2400,
    chatArrive: 3000,
    chatLeave: 3600,
  });

  const coordsRef = useRef(coords);
  useEffect(() => {
    coordsRef.current = coords;
  }, [coords]);

  const scrollProgress = useMotionValue(0);

  const updateCoords = () => {
    if (!mainRef.current || !heroPlaceholderRef.current || !carouselPlaceholderRef.current || !accordionPlaceholderRef.current || !chatPlaceholderRef.current) return;
    const mainRect = mainRef.current.getBoundingClientRect();
    const heroRect = heroPlaceholderRef.current.getBoundingClientRect();
    const carouselRect = carouselPlaceholderRef.current.getBoundingClientRect();
    const accordionRect = accordionPlaceholderRef.current.getBoundingClientRect();
    const chatRect = chatPlaceholderRef.current.getBoundingClientRect();

    const scrollY = window.scrollY;

    const heroLeft = heroRect.left - mainRect.left;
    const heroTop = heroRect.top - mainRect.top;
    const heroWidth = heroRect.width || 280;
    const heroHeight = heroRect.height || 550;

    const carouselLeft = carouselRect.left - mainRect.left;
    const carouselTop = carouselRect.top - mainRect.top;
    const carouselWidth = carouselRect.width || 280;
    const carouselHeight = carouselRect.height || 550;

    // Calculate centering bounds for Accordion landscape mode
    const accordionCenterX = accordionRect.left - mainRect.left + accordionRect.width / 2;
    const accordionCenterY = accordionRect.top - mainRect.top + accordionRect.height / 2;
    const accordionLeft = accordionCenterX - carouselWidth / 2;
    const accordionTop = accordionCenterY - carouselHeight / 2;

    const chatLeft = chatRect.left - mainRect.left;
    const chatTop = chatRect.top - mainRect.top;
    const chatWidth = chatRect.width || 280;
    const chatHeight = chatRect.height || 550;

    const isMobile = window.innerWidth < 768;
    const carouselAbsoluteTop = carouselTop + mainRect.top + scrollY;
    const accordionAbsoluteTop = accordionTop + mainRect.top + scrollY;
    const chatAbsoluteTop = chatTop + mainRect.top + scrollY;

    // Calculate scroll target center points
    const carouselCenterScroll = carouselAbsoluteTop - (window.innerHeight - carouselHeight) / 2;
    const accordionCenterScroll = accordionAbsoluteTop - (window.innerHeight - carouselHeight) / 2;
    const chatCenterScroll = chatAbsoluteTop - (window.innerHeight - chatHeight) / 2;

    // Timings with hold intervals (plateaus)
    const heroLeave = 120; // Starts translating from Hero
    const carouselArrive = Math.max(heroLeave + 100, carouselCenterScroll - (isMobile ? 100 : 150));
    const carouselLeave = carouselCenterScroll + (isMobile ? 100 : 150);
    const accordionArrive = Math.max(carouselLeave + 50, accordionCenterScroll - (isMobile ? 100 : 150));
    const accordionLeave = accordionCenterScroll + (isMobile ? 100 : 150);
    const chatArrive = Math.max(accordionLeave + 50, chatCenterScroll - (isMobile ? 100 : 150));
    const chatLeave = chatCenterScroll + (isMobile ? 100 : 150);

    setCoords({
      heroLeft,
      heroTop,
      heroWidth,
      heroHeight,
      carouselLeft,
      carouselTop,
      carouselWidth,
      carouselHeight,
      accordionLeft,
      accordionTop,
      chatLeft,
      chatTop,
      chatWidth,
      chatHeight,
      heroLeave,
      carouselArrive,
      carouselLeave,
      accordionArrive,
      accordionLeave,
      chatArrive,
      chatLeave,
    });
    setCoordsLoaded(true);
  };

  useEffect(() => {
    // Initial update after a short delay for fonts/images to settle
    const timer = setTimeout(() => {
      updateCoords();
    }, 500);

    let lastWidth = window.innerWidth;
    let timeoutId = null;

    const debouncedUpdate = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // On mobile, only update if width changes to prevent scroll-jank from address bar hiding
        const currentWidth = window.innerWidth;
        if (currentWidth !== lastWidth || currentWidth >= 768) {
          lastWidth = currentWidth;
          updateCoords();
        }
      }, 150);
    };

    // Use ResizeObserver to auto-update coordinates whenever the layout changes
    let resizeObserver;
    if (mainRef.current) {
      resizeObserver = new ResizeObserver(debouncedUpdate);
      resizeObserver.observe(mainRef.current);
    }

    window.addEventListener('resize', debouncedUpdate);

    return () => {
      clearTimeout(timer);
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedUpdate);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  // Canvas particle grid lines effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const gridSize = 80;
    const constantSpeed = 1.2; // Reduced speed for softer, calmer motion
    let particles = [];

    class LineParticle {
      constructor(type, index) {
        this.type = type; // 'horizontal' or 'vertical'
        this.index = index;
        this.reset();
      }

      reset() {
        const offsetX = (width % gridSize) / 2;
        const offsetY = (height % gridSize) / 2;

        if (this.type === 'horizontal') {
          this.x = 0;
          this.y = offsetY + this.index * gridSize;
          this.targetX = width;
          this.targetY = this.y;
        } else {
          this.x = offsetX + this.index * gridSize;
          this.y = 0;
          this.targetX = this.x;
          this.targetY = height;
        }

        this.active = false;
        // Random different delays before spawning
        this.delay = Math.floor(Math.random() * 400) + 50;
        this.trail = [];
        this.glowColor = 'rgba(249, 115, 22, '; // Orange glow base
      }

      update() {
        if (!this.active) {
          if (this.delay > 0) {
            this.delay--;
          } else {
            this.active = true;
          }
          return;
        }

        // Move linearly at constant speed along the gridline path
        if (this.type === 'horizontal') {
          this.x += constantSpeed;
          if (this.x >= this.targetX) {
            this.reset();
          }
        } else {
          this.y += constantSpeed;
          if (this.y >= this.targetY) {
            this.reset();
          }
        }

        // Add history point to trail (optimized trail size)
        this.trail.push({ x: this.x, y: this.y, opacity: 1.0 });
        if (this.trail.length > 30) {
          this.trail.shift();
        }
      }

      draw() {
        // Draw trailing stars with fading opacity
        this.trail.forEach((p, idx) => {
          // Optimized fade rate
          p.opacity -= 0.03;
          if (p.opacity <= 0) return;

          const alpha = p.opacity * (idx / this.trail.length) * 0.35;

          // Draw star trail spark
          ctx.beginPath();
          ctx.arc(p.x, p.y, 0.3 + (idx / this.trail.length) * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = this.glowColor + alpha + ')';
          ctx.fill();

          // Sparkle star effects off-grid slightly (softer rate)
          if (Math.random() < 0.03) {
            ctx.beginPath();
            ctx.arc(
              p.x + (Math.random() - 0.5) * 6,
              p.y + (Math.random() - 0.5) * 6,
              0.5,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha * 0.6 + ')';
            ctx.fill();
          }
        });

        if (!this.active) return;

        // Draw main head glowing dot using smaller, softer radial gradients
        const glowGrad = ctx.createRadialGradient(this.x, this.y, 0.2, this.x, this.y, 4);
        glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)'); // softer white center
        glowGrad.addColorStop(0.3, 'rgba(249, 115, 22, 0.5)'); // softer orange core
        glowGrad.addColorStop(0.7, 'rgba(249, 115, 22, 0.15)'); // softer glow aura
        glowGrad.addColorStop(1, 'rgba(249, 115, 22, 0)'); // fade out

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2); // smaller radius (4px)
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const cols = Math.floor(width / gridSize);
      const rows = Math.floor(height / gridSize);

      for (let i = 0; i <= cols; i++) {
        particles.push(new LineParticle('vertical', i));
      }
      for (let j = 0; j <= rows; j++) {
        particles.push(new LineParticle('horizontal', j));
      }
    };

    initParticles();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      initParticles();
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Parallax Scroll Hooks
  const { scrollY } = useScroll();
  const parallaxFast = useTransform(scrollY, [0, 800], [0, -100]);
  const parallaxSlow = useTransform(scrollY, [0, 800], [0, -50]);
  const parallaxRotate = useTransform(scrollY, [0, 800], [4, 12]);

  // Combined hardware-accelerated transform
  const phoneTransformStr = useTransform(scrollY, (yVal) => {
    const w = 280;
    const h = 550;

    let x = coords.heroLeft;
    let y = coords.heroTop;
    let r = 0;
    let sx = 1;
    let sy = 1;

    // Helper ease function
    const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    // Helper to calculate target X and Y for center-scaled alignment
    const getTarget = (left, top, tw, th) => {
      const scaleX = tw / w;
      const scaleY = th / h;
      // Apply uniform scaling to maintain aspect ratio smoothly on mobile
      const scale = Math.min(scaleX, scaleY);
      return {
        x: left + (tw - w) / 2,
        y: top + (th - h) / 2,
        sx: scale,
        sy: scale
      };
    };

    const hero = getTarget(coords.heroLeft, coords.heroTop, coords.heroWidth || 280, coords.heroHeight || 550);
    const carousel = getTarget(coords.carouselLeft, coords.carouselTop, coords.carouselWidth || 280, coords.carouselHeight || 550);
    const accordion = getTarget(coords.accordionLeft, coords.accordionTop, coords.carouselWidth || 280, coords.carouselHeight || 550);
    const chat = getTarget(coords.chatLeft, coords.chatTop, coords.chatWidth || 280, coords.chatHeight || 550);

    if (yVal <= coords.heroLeave) {
      x = hero.x; y = hero.y; sx = hero.sx; sy = hero.sy;
    } else if (yVal <= coords.carouselArrive) {
      const p = (yVal - coords.heroLeave) / (coords.carouselArrive - coords.heroLeave);
      const ease = easeInOut(p);
      x = hero.x + (carousel.x - hero.x) * ease;
      y = hero.y + (carousel.y - hero.y) * ease;
      sx = hero.sx + (carousel.sx - hero.sx) * ease;
      sy = hero.sy + (carousel.sy - hero.sy) * ease;
    } else if (yVal <= coords.carouselLeave) {
      x = carousel.x; y = carousel.y; sx = carousel.sx; sy = carousel.sy;
    } else if (yVal <= coords.accordionArrive) {
      const p = (yVal - coords.carouselLeave) / (coords.accordionArrive - coords.carouselLeave);
      const ease = easeInOut(p);
      x = carousel.x + (accordion.x - carousel.x) * ease;
      y = carousel.y + (accordion.y - carousel.y) * ease;
      sx = carousel.sx + (accordion.sx - carousel.sx) * ease;
      sy = carousel.sy + (accordion.sy - carousel.sy) * ease;
      r = 90 * ease;
    } else if (yVal <= coords.accordionLeave) {
      x = accordion.x; y = accordion.y; sx = accordion.sx; sy = accordion.sy; r = 90;
    } else if (yVal <= coords.chatArrive) {
      const p = (yVal - coords.accordionLeave) / (coords.chatArrive - coords.accordionLeave);
      const ease = easeInOut(p);
      x = accordion.x + (chat.x - accordion.x) * ease;
      y = accordion.y + (chat.y - accordion.y) * ease;
      sx = accordion.sx + (chat.sx - accordion.sx) * ease;
      sy = accordion.sy + (chat.sy - accordion.sy) * ease;
      r = 90 - 90 * ease;
    } else {
      x = chat.x; y = chat.y; sx = chat.sx; sy = chat.sy; r = 0;
    }

    return `translate3d(${x}px, ${y}px, 0) scaleX(${sx}) scaleY(${sy}) rotate(${r}deg)`;
  });

  const darkOpacity = useTransform(scrollY, [0, coords.heroLeave, coords.carouselArrive], [1, 1, 1], { clamp: true });
  const lightOpacity = useTransform(scrollY, [coords.heroLeave, coords.carouselArrive], [0, 1], { clamp: true });
  const accordionOpacity = useTransform(scrollY, [coords.carouselLeave, coords.accordionArrive], [0, 1], { clamp: true });
  const chatOpacity = useTransform(scrollY, [coords.accordionLeave, coords.chatArrive], [0, 1], { clamp: true });

  useMotionValueEvent(scrollY, "change", (latest) => {
    let current = 'hero';
    if (latest >= coords.chatArrive - 150) current = 'chat';
    else if (latest >= coords.accordionArrive - 150) current = 'accordion';
    else if (latest >= coords.carouselArrive - 150) current = 'carousel';

    if (current !== activeScreen) setActiveScreen(current);
  });

  const screenInset = 32;
  const phoneBaseWidth = 280;
  const phoneBaseHeight = 550;
  const landscapeWidth = phoneBaseHeight - screenInset;
  const landscapeHeight = phoneBaseWidth - screenInset;
  const landscapeLeft = (phoneBaseWidth - phoneBaseHeight) / 2;
  const landscapeTop = (phoneBaseHeight - phoneBaseWidth) / 2;

  // Handle Spotlight Cursor Glow (Throttled using requestAnimationFrame)
  const mouseMoveRaf = useRef(null);
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const currentTarget = e.currentTarget;
    if (mouseMoveRaf.current) cancelAnimationFrame(mouseMoveRaf.current);
    mouseMoveRaf.current = requestAnimationFrame(() => {
      currentTarget.style.setProperty('--mouse-x', `${x}px`);
      currentTarget.style.setProperty('--mouse-y', `${y}px`);
    });
  };

  useEffect(() => {
    return () => {
      if (mouseMoveRaf.current) cancelAnimationFrame(mouseMoveRaf.current);
    };
  }, []);

  // Timer for Influencer Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentInfluencerIndex((prev) => (prev + 1) % influencerLoopData.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const campaignRes = await axios.get('/campaigns');
        const creatorRes = await axios.get('/creators');
        setFeaturedCampaigns(campaignRes.data?.data?.slice(0, 3) || []);
        setFeaturedCreators(creatorRes.data?.data?.slice(0, 8) || []);
      } catch (error) {
        console.error('Failed to fetch featured content', error);
      }
    };
    fetchFeatured();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${customLinkInput}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // 4-Step Phone Mockup Custom Shifting Colors & Info
  const stepsInfo = [
    {
      label: '01',
      title: 'Brands Post',
      bgColor: 'bg-indigo-50/70 border-indigo-100',
      tagColor: 'bg-indigo-100 text-indigo-600',
      activeBorder: 'border-indigo-200',
      activeIconBg: 'bg-indigo-100 text-indigo-500',
      description: 'Define your niche, budget, and creative requirements in minutes.',
      icon: FilePlus,
    },
    {
      label: '02',
      title: 'Creators Apply',
      bgColor: 'bg-pink-50/70 border-pink-100',
      tagColor: 'bg-pink-100 text-pink-600',
      activeBorder: 'border-pink-200',
      activeIconBg: 'bg-pink-100 text-pink-500',
      description: 'Our hand-picked creator network applies with personalized pitches.',
      icon: Users,
    },
    {
      label: '03',
      title: '2-Step Approval',
      bgColor: 'bg-orange-50/70 border-orange-100',
      tagColor: 'bg-orange-100 text-orange-600',
      activeBorder: 'border-orange-200',
      activeIconBg: 'bg-orange-100 text-orange-500',
      description: 'Review profiles and analytics before finalizing your dream team.',
      icon: ClipboardCheck,
    },
    {
      label: '04',
      title: 'Collaborate & Grow',
      bgColor: 'bg-emerald-50/70 border-emerald-100',
      tagColor: 'bg-emerald-100 text-emerald-600',
      activeBorder: 'border-emerald-200',
      activeIconBg: 'bg-emerald-100 text-emerald-500',
      description: 'Scale your brand through authentic content and tracked performance.',
      icon: TrendingUp,
    }
  ];

  // Accordion Items for Tablet Mockup Sync
  const accordionItems = [
    {
      title: 'Verified Brand Directory',
      desc: 'Collaborate with top-tier verified brands. Complete details are vetted in advance, guaranteeing campaign safety.',
      screen: 'brands',
    },
    {
      title: 'Automated Payment Security',
      desc: 'Never work without payment security. Brands fund deals in advance via Razorpay; funds are locked securely until deliverable approval.',
      screen: 'funds-secured',
    },
    {
      title: 'Real-Time Negotiator Chat',
      desc: 'Communicate directly via deal-locked messages. Finalize budgets, deliverables, and revision rounds without leaving the workspace.',
      screen: 'chat',
    },
    {
      title: 'Unified Wallet Withdrawals',
      desc: 'Consolidate all income. View your active milestone coins, request withdrawals directly to UPI or bank credentials, and log transaction ledgers.',
      screen: 'wallet',
    }
  ];



  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <div className="bg-white text-gray-900 transition-colors duration-300 font-sans overflow-x-hidden">
        <main ref={mainRef} className="relative">

        {/* ================= HERO AREA (DARK THEME) ================= */}
        <section
          onMouseMove={handleMouseMove}
          className="relative px-6 pt-16 pb-24 lg:pt-20 lg:pb-28 min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden bg-[#111111] border-b border-white/5"
        >
          {/* Custom Ambient Grid Background */}
          <div className="absolute inset-0 bg-grid-glow opacity-80 pointer-events-none"></div>

          {/* Grid lines traveling dots canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
          />

          {/* Spotlight overlay */}
          <div className="cursor-glow" />

          {/* Floating Parallax Cards */}
          <div className="absolute inset-0 z-0 pointer-events-none scale-75 sm:scale-100 origin-center">
            {/* Stylist / Makeup Creator Card (Top Right) */}
            <motion.div style={{ y: parallaxSlow, rotate: parallaxRotate }} className="absolute top-[48%] sm:top-[18%] right-[-10%] sm:right-[12%] z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
                transition={{
                  opacity: { duration: 1, delay: 0.3 },
                  scale: { duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] },
                  y: { duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }
                }}
                className="p-3 bg-[#1C1C21]/80 backdrop-blur-2xl border border-orange-500/50 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center gap-3 pr-4 sm:pr-6"
              >
                <img src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=100&q=80" alt="Stylist" className="w-10 h-10 rounded-full object-cover border-2 border-pink-500/50" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Stylist</span>
                  <span className="text-xs font-bold text-white hidden sm:block">@glambyriya</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Fashion Creator Card */}
            <motion.div style={{ y: parallaxFast, rotate: parallaxRotate }} className="absolute top-[58%] sm:top-[12%] left-[-12%] sm:left-[8%] z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
                transition={{
                  opacity: { duration: 1, delay: 0.2 },
                  scale: { duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] },
                  y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
                }}
                className="p-3 bg-[#1C1C21]/80 backdrop-blur-2xl border border-orange-500/50 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center gap-3 pr-4 sm:pr-6"
              >
                <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80" alt="Fashion" className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/50" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Fashion</span>
                  <span className="text-xs font-bold text-white hidden sm:block">@styleicon</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Food Creator Card */}
            <motion.div style={{ y: parallaxSlow }} className="absolute bottom-[2%] sm:bottom-[35%] right-[-15%] sm:right-[10%] z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, y: [0, 15, 0] }}
                transition={{
                  opacity: { duration: 1, delay: 0.4 },
                  scale: { duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] },
                  y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }
                }}
                className="p-3 bg-[#1C1C21]/80 backdrop-blur-2xl border border-orange-500/50 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center gap-3 pr-4 sm:pr-5"
              >
                <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=100&q=80" alt="Food" className="w-10 h-10 rounded-full object-cover border-2 border-orange-500/50" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Food</span>
                  <span className="text-xs font-bold text-white hidden sm:flex items-center gap-1">Top Rated <BadgeCheck size={10} className="text-orange-500" /></span>
                </div>
              </motion.div>
            </motion.div>

            {/* Fitness Creator Card */}
            <motion.div style={{ y: parallaxFast }} className="absolute bottom-[6%] sm:bottom-[40%] left-[-10%] sm:left-[12%] z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, y: [0, -14, 0] }}
                transition={{
                  opacity: { duration: 1, delay: 0.6 },
                  scale: { duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] },
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }
                }}
                className="p-3 bg-[#1C1C21]/80 backdrop-blur-2xl border border-orange-500/50 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center gap-3 pr-4 sm:pr-6"
              >
                <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=100&q=80" alt="Fitness" className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/50" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Fitness & Gym</span>
                  <span className="text-xs font-bold text-white hidden sm:block">4.8% Engagement</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >

              <h1 className="text-4xl sm:text-6xl lg:text-[4.5rem] font-black font-display tracking-tight leading-[1.05] text-white drop-shadow-sm">
                The Platform Where <br />
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
                  Content Meets
                </span> <br />
                Performance
              </h1>

              <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 mt-8 mb-6">
                <Link
                  to="/register"
                  className="px-5 py-2.5 sm:px-10 sm:py-4 rounded-xl bg-orange-500 text-white font-bold text-[10px] sm:text-sm tracking-widest uppercase hover:bg-orange-600 shadow-[0_10px_30px_rgba(249,115,22,0.3)] transition-all duration-300"
                >
                  Get Started
                </Link>
                <Link
                  to="/creators"
                  className="px-5 py-2.5 sm:px-10 sm:py-4 rounded-xl bg-white/10 backdrop-blur-sm text-white font-bold text-[10px] sm:text-sm tracking-widest uppercase hover:bg-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all duration-300 border border-white/20"
                >
                  View Creators
                </Link>
              </div>

              {/* Hero Phone Placeholder for alignment and spacing */}
              <div
                ref={heroPlaceholderRef}
                className="w-[140px] h-[280px] sm:w-[280px] sm:h-[550px] mx-auto shrink-0 mt-6 sm:mt-8"
              />

            </motion.div>
          </div>
        </section>



        {/* ================= INTERACTIVE 3-STEP PHONE CAROUSEL ================= */}
        <section className="pt-12 pb-16 sm:pt-24 sm:pb-32 md:pt-40 md:pb-56 lg:pb-72 px-6 sm:px-12 lg:px-20 bg-gray-50">
          <div className="max-w-7xl mx-auto">

            {/* Main Shifting Container */}
            <div className={`p-6 sm:p-8 lg:p-12 rounded-[2rem] sm:rounded-[3rem] border transition-colors duration-500 shadow-xl ${stepsInfo[activeCarouselStep].bgColor} flex flex-col lg:flex-row items-center gap-6 lg:gap-12`}>

              {/* Left Column: Selector (Column view, smaller on mobile) */}
              <div className="w-full lg:w-1/3 flex flex-col gap-2 lg:gap-3">
                {stepsInfo.map((step, index) => {
                  const IconComponent = step.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveCarouselStep(index)}
                      className={`p-3 lg:p-5 rounded-2xl border text-left transition-all duration-300 ${activeCarouselStep === index
                        ? `bg-white ${step.activeBorder} shadow-md translate-x-1 lg:translate-x-2`
                        : 'bg-white/40 hover:bg-white/70 border-transparent text-gray-500'
                        }`}
                    >
                      <div className="flex items-center gap-3 lg:gap-4">
                        <span className={`w-8 h-8 lg:w-10 lg:h-10 shrink-0 rounded-xl flex items-center justify-center shadow-inner ${activeCarouselStep === index ? step.activeIconBg : 'bg-gray-100 text-gray-400'
                          }`}>
                          <IconComponent className="w-4 h-4 lg:w-5 lg:h-5" />
                        </span>
                        <h4 className="font-black text-xs lg:text-sm tracking-tight text-gray-900">{step.title}</h4>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Side-by-Side Wrapper for Phone & Text details */}
              <div className="w-full lg:flex-1 flex flex-row items-center justify-between gap-4 lg:gap-12 mt-2 lg:mt-0">

                {/* Carousel Phone Placeholder */}
                <div className="shrink-0 flex justify-center">
                  <div
                    ref={carouselPlaceholderRef}
                    className="w-[140px] h-[280px] sm:w-[280px] sm:h-[550px]"
                  />
                </div>

                {/* Explanatory Card details */}
                <div className="flex-1 text-left">
                  <span className={`inline-block px-2 py-1 lg:px-3 lg:py-1 rounded-md text-[8px] lg:text-[9px] font-black uppercase tracking-wider shadow-sm border mb-2 lg:mb-4 ${stepsInfo[activeCarouselStep].tagColor}`}>
                    Action Panel
                  </span>
                  <h3 className="text-sm sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight mb-2 lg:mb-4 leading-tight">
                    {stepsInfo[activeCarouselStep].title}
                  </h3>
                  <p className="text-gray-500 font-medium text-[10px] sm:text-sm leading-snug lg:leading-relaxed mb-3 lg:mb-6">
                    {stepsInfo[activeCarouselStep].description}
                  </p>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1 lg:gap-2 text-[9px] sm:text-xs font-black uppercase tracking-widest text-[#EA580C] hover:text-[#BE123C] hover:underline"
                  >
                    Join <ArrowRight size={12} className="hidden lg:inline-block" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ================= WHY CREATORS CHOOSE (TABLET ACCORDION SYNC) ================= */}
        <section className="pt-12 pb-16 sm:pt-24 sm:pb-32 md:pt-40 md:pb-48 lg:pt-56 lg:pb-64 px-6 sm:px-12 lg:px-20 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 sm:gap-16">

            {/* Left Column: Sync Phone Mockup Placeholder */}
            <div className="w-full lg:w-[500px] shrink-0 flex justify-center">
              <div
                ref={accordionPlaceholderRef}
                className="w-[320px] h-[170px] sm:w-[450px] sm:h-[240px] md:w-[550px] md:h-[280px] shrink-0"
              />
            </div>

            {/* Right Column: Accordion list */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              <div className="mb-4 sm:mb-6">
                <span className="text-[#EA580C] text-[9px] sm:text-[10px] font-black tracking-[0.3em] uppercase mb-2 sm:mb-3 block">Platform Infrastructure</span>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-gray-900 tracking-tight leading-none">
                  Engineered For Creative Trust
                </h3>
              </div>

              <div className="space-y-2 sm:space-y-4">
                {accordionItems.map((item, index) => (
                  <div
                    key={index}
                    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${activeAccordion === index ? 'bg-orange-50/20 border-orange-200/60 shadow-sm' : 'border-gray-100 bg-white'
                      }`}
                  >
                    <button
                      onClick={() => setActiveAccordion(index)}
                      className="w-full px-4 py-3 sm:px-6 sm:py-5 text-left flex justify-between items-center focus:outline-none"
                    >
                      <span className="font-black font-display text-sm sm:text-base tracking-tight text-gray-900">{item.title}</span>
                      <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform duration-300 ${activeAccordion === index ? 'rotate-180 text-orange-500' : ''}`} />
                    </button>

                    <AnimatePresence initial={false}>
                      {activeAccordion === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <div className="px-4 pb-4 sm:px-6 sm:pb-6 text-[10px] sm:text-xs text-gray-500 font-medium leading-relaxed border-t border-gray-100/50 pt-2 sm:pt-3">
                            {item.desc}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ================= TWO-SIDED PLATFORM PROTOCOL ================= */}
        <section className="py-8 sm:py-20 md:py-32 lg:py-48 px-6 sm:px-12 bg-gray-50 border-t border-gray-200/60 min-h-[100vh] sm:min-h-0 flex items-center">
          <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-6 sm:gap-16">

            {/* Left side: content */}
            <div className="w-full lg:w-1/2 min-h-[auto] sm:min-h-[480px] flex flex-col justify-center">
              <span className={`inline-block w-max px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black tracking-[0.2em] uppercase mb-2 sm:mb-4 shadow-sm border transition-colors duration-500 ${activePlatformSide === 'creator' ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : 'bg-pink-100 text-pink-600 border-pink-200'
                }`}>
                Workflow Protocol
              </span>
              <h2 className="text-2xl sm:text-5xl lg:text-6xl font-black font-display text-gray-900 leading-tight sm:leading-none tracking-tight mb-4 sm:mb-8">
                Two sides. <br />
                <span className={`text-transparent bg-clip-text bg-gradient-to-r transition-all duration-500 ${activePlatformSide === 'creator' ? 'from-indigo-500 to-purple-500' : 'from-pink-500 to-rose-500'
                  }`}>
                  One platform.
                </span>
              </h2>

              {/* Dynamic Steps based on activePlatformSide */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  {activePlatformSide === 'creator' ? (
                    <motion.div
                      key="creator-steps"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4 }}
                      className="grid gap-3 sm:gap-8"
                    >
                      <div className="flex gap-3 sm:gap-5">
                        <div className="shrink-0 w-6 h-6 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner">
                          <User className="w-3 h-3 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-xl font-black font-display text-gray-900 mb-0 sm:mb-1">Build your profile</h4>
                          <p className="text-gray-500 text-[9px] sm:text-sm leading-tight sm:leading-relaxed font-medium">Showcase your niche, follower stats, past work, and rate card. Connect networks seamlessly.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 sm:gap-5">
                        <div className="shrink-0 w-6 h-6 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner">
                          <Target className="w-3 h-3 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-xl font-black font-display text-gray-900 mb-0 sm:mb-1">Browse campaigns</h4>
                          <p className="text-gray-500 text-[9px] sm:text-sm leading-tight sm:leading-relaxed font-medium">Filter by category, budget, and region. Apply to missions that match your storytelling style.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 sm:gap-5">
                        <div className="shrink-0 w-6 h-6 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner">
                          <Zap className="w-3 h-3 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-xl font-black font-display text-gray-900 mb-0 sm:mb-1">Execute & Get Paid</h4>
                          <p className="text-gray-500 text-[9px] sm:text-sm leading-tight sm:leading-relaxed font-medium">Collaborate through our secure dashboard, complete milestones, and receive automated payouts.</p>
                        </div>
                      </div>
                      
                      <div className="pt-2 sm:pt-4 text-left">
                        <Link to="/creator-guidelines" className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 active:scale-95 transition-transform duration-200">
                          View Creator Guidelines <ChevronRight size={14} />
                        </Link>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="brand-steps"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4 }}
                      className="grid gap-3 sm:gap-8"
                    >
                      <div className="flex gap-3 sm:gap-5">
                        <div className="shrink-0 w-6 h-6 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 shadow-inner">
                          <Search className="w-3 h-3 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-xl font-black font-display text-gray-900 mb-0 sm:mb-1">Find the right talent</h4>
                          <p className="text-gray-500 text-[9px] sm:text-sm leading-tight sm:leading-relaxed font-medium">Use advanced filters to discover creators that align with your brand values and mission.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 sm:gap-5">
                        <div className="shrink-0 w-6 h-6 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 shadow-inner">
                          <ShieldCheck className="w-3 h-3 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-xl font-black font-display text-gray-900 mb-0 sm:mb-1">Set clear milestones</h4>
                          <p className="text-gray-500 text-[9px] sm:text-sm leading-tight sm:leading-relaxed font-medium">Define deliverables and protect your budget with our secure payment pipeline.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 sm:gap-5">
                        <div className="shrink-0 w-6 h-6 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 shadow-inner">
                          <TrendingUp className="w-3 h-3 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-xl font-black font-display text-gray-900 mb-0 sm:mb-1">Scale with confidence</h4>
                          <p className="text-gray-500 text-[9px] sm:text-sm leading-tight sm:leading-relaxed font-medium">Manage all collaborations in one command center with real-time analytics and tracking.</p>
                        </div>
                      </div>

                      <div className="pt-2 sm:pt-4 text-left">
                        <Link to="/brand-handbook" className="inline-flex items-center gap-2 px-6 py-3.5 bg-pink-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-pink-700 transition-colors shadow-md shadow-pink-600/20 active:scale-95 transition-transform duration-200">
                          View Brand Handbook <ChevronRight size={14} />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right side: Two-Sided Platform placeholder */}
            <div className="w-full lg:w-[360px] shrink-0 flex justify-center">
              <div
                ref={chatPlaceholderRef}
                className="w-[120px] h-[240px] sm:w-[280px] sm:h-[550px] shrink-0"
              />
            </div>

          </div>
        </section>



        {/* ================= DRAGGABLE VIDEO CAROUSEL ================= */}
        <section className="py-24 px-6 sm:px-12 bg-gray-50 border-t border-gray-200/60 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center max-w-2xl mx-auto">
              <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black tracking-widest uppercase mb-4 border border-orange-200">
                Creator Showcase
              </span>
              <h2 className="text-3xl sm:text-5xl font-black font-display text-gray-900 mb-4 tracking-tight leading-tight">
                Vetted Creators
              </h2>
              <p className="text-gray-500 text-sm sm:text-base font-medium">
                Hover over the creator cards below to view their showcase details.
              </p>
            </div>

            {/* Static columns flex list */}
            <div className="flex flex-wrap justify-center gap-8 px-4">
              {(featuredCreators && featuredCreators.length > 0
                ? (user ? featuredCreators.filter(c => {
                  const creatorUserId = c.userId?._id || c.userId;
                  return creatorUserId !== user._id;
                }) : featuredCreators)
                : [
                  { name: 'Alice Smith', niche: 'Tech & Gadgets', stat: '4.8% Engagement', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
                  { name: 'Marcus Jones', niche: 'Gaming & Setup', stat: '🪙4.5L Earned', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
                  { name: 'Saria Roy', niche: 'Travel & Lifestyle', stat: '98% Completion', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80' },
                  { name: 'Kenji Suzuki', niche: 'Food & Culinary', stat: '96% Reach Rate', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' }
                ]).slice(0, 3).map((creator, i) => {
                  const isFromDb = !!creator._id;
                  const followerText = isFromDb
                    ? (creator.followerCount >= 1000000
                      ? `${(creator.followerCount / 1000000).toFixed(1)}M Followers`
                      : creator.followerCount >= 1000
                        ? `${Math.round(creator.followerCount / 1000)}K Followers`
                        : `${creator.followerCount || 0} Followers`)
                    : creator.stat;

                  const imageUrl = isFromDb
                    ? (creator.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80')
                    : creator.url;

                  return (
                    <motion.div
                      key={creator._id || i}
                      whileHover={{ scale: 1.05, y: -10 }}
                      className="w-64 sm:w-72 shrink-0 bg-white border border-gray-200/80 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col group relative text-left"
                    >
                      {/* Aspect video/image thumb */}
                      <div className="h-80 relative bg-gray-100 overflow-hidden">
                        <img src={imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={creator.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-80 z-10"></div>



                        <div className="absolute bottom-4 left-4 z-20 text-white flex flex-col gap-1">
                          <h4 className="text-sm font-black tracking-tight leading-tight">{creator.name}</h4>
                          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{creator.niche}</p>
                        </div>
                      </div>

                      <div className="p-5 flex justify-between items-center border-t border-gray-100">
                        <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 border border-orange-100 px-3 py-1 rounded-md">
                          {followerText}
                        </span>
                        {isFromDb ? (
                          <Link
                            to={user ? `/creators/${creator._id}` : '/login'}
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

        {/* ================= TRENDING CAMPAIGNS (GRID) ================= */}
        <section className="py-24 px-6 sm:px-12 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
              <div className="max-w-2xl">
                <span className="text-orange-500 text-[10px] font-black tracking-[0.3em] uppercase mb-4 block">Marketplace Hub</span>
                <h2 className="text-4xl lg:text-5xl font-black font-display text-gray-900 leading-none tracking-tight">
                  Active Brand <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Campaigns</span>
                </h2>
              </div>
              <Link
                to="/campaigns"
                className="group flex items-center gap-3 bg-gray-50 px-8 py-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-white transition-all shadow-sm"
              >
                <span className="font-black uppercase tracking-widest text-[11px] text-gray-700 group-hover:text-orange-500">View All Missions</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-orange-500" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {featuredCampaigns.length > 0 ? (
                featuredCampaigns.map((campaign, i) => (
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
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent opacity-90 z-10"></div>

                      {/* Top Badges */}
                      <div className="absolute top-5 left-5 z-20 flex gap-2">
                        <span className="text-[9px] font-black text-white uppercase tracking-widest bg-white/20 backdrop-blur-md border border-white/10 px-3 py-1 rounded-md">
                          {campaign.niche || 'General'}
                        </span>
                      </div>
                      <div className="absolute top-5 right-5 z-20">
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 px-3 py-1 rounded-md flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Active
                        </span>
                      </div>

                      {/* Title & Brand Bottom Left */}
                      <div className="absolute bottom-5 left-5 right-5 z-20 text-white flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-1">
                          {campaign.brandId?.logo ? (
                            <img src={campaign.brandId.logo} className="w-5 h-5 rounded-full bg-white object-cover border border-white/20" alt="" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-white text-gray-900 flex items-center justify-center text-[10px] font-black">
                              {campaign.brandId?.businessName?.[0] || 'B'}
                            </div>
                          )}
                          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest line-clamp-1">
                            {campaign.brandId?.businessName || 'Brand Partner'}
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
                        {campaign.requirements && campaign.requirements.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {campaign.requirements.slice(0, 3).map((req, idx) => (
                              <span key={idx} className="px-2.5 py-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-[10px] font-bold rounded-lg truncate max-w-full">
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
                            <span className="px-2.5 py-1.5 bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold rounded-lg">High-Quality Content</span>
                            <span className="px-2.5 py-1.5 bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold rounded-lg">Brand Integration</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6">
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">Budget</p>
                          <p className="text-lg font-black font-display text-gray-900">🪙{campaign.budget?.toLocaleString()}</p>
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
                  <p className="text-gray-500 font-bold text-base mb-4">No active brand campaigns available</p>
                  <Link to="/register" className="text-orange-500 font-black hover:underline tracking-widest uppercase text-xs">Register and post brief →</Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================= FINAL CALL TO ACTION (CTA) ================= */}
        <section className="py-24 px-6 sm:px-12 bg-white">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-[3rem] p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-grid-glow opacity-20 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl mx-auto">
              <span className="inline-block px-4 py-1.5 bg-white/15 border border-white/20 text-white text-[10px] font-black tracking-widest uppercase rounded-full">
                Get Started
              </span>
              <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight leading-none">
                Ready to Scale Your Brand?
              </h2>
              <p className="text-orange-50 text-sm sm:text-base font-medium leading-relaxed">
                Connect with thousands of top-performing content creators. Protect campaigns with secure Razorpay payments and automate payouts.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center mt-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-10 py-4 bg-white text-orange-600 font-black text-xs uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all shadow-lg active:scale-95"
                >
                  Join as Brand
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-10 py-4 bg-transparent border-2 border-white text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 rounded-xl transition-all active:scale-95"
                >
                  Join as Creator
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SHARED ANIMATING PHONE ================= */}
        {coordsLoaded && (
          <Suspense fallback={
            <div className="absolute pointer-events-none flex items-center justify-center bg-transparent" style={{ left: coords.heroLeft, top: coords.heroTop, width: coords.heroWidth, height: coords.heroHeight }}>
              <div className="w-10 h-10 border-4 border-solid border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            <PhoneMockup
              transforms={{
                transformStr: phoneTransformStr,
                darkOpacity,
                lightOpacity,
                accordionOpacity,
                chatOpacity,
                landscapeLeft,
                landscapeTop,
                landscapeWidth,
                landscapeHeight
              }}
              states={{
                currentInfluencerIndex,
                activeCarouselStep,
                activeAccordion,
                selectedBrandDetail,
                appliedBrands,
                fundsSecuredReleased,
                chatMessages,
                chatInputText,
                isTypingBrand,
                activePlatformSide,
                supportMessages,
                supportInputText,
                isTypingSupport,
                walletBalance,
                walletLockedFundsSecured,
                walletWithdrawalState,
                withdrawalUpi,
                withdrawnAmount,
                activeScreen
              }}
              actions={{
                handleApplyBrand,
                handleReleaseFundsSecured,
                handleSendChatMessage,
                setChatInputText,
                setActivePlatformSide,
                handleSendSupportMessage,
                setSupportInputText,
                handleInitiateWithdrawal,
                setWithdrawalUpi,
                handleConfirmWithdrawal
              }}
              refs={{
                accordionChatEndRef,
                supportChatEndRef
              }}
              data={{
                influencerLoopData,
                analyticsData
              }}
            />
          </Suspense>
        )}
      </main>
    </div>
    </ReactLenis>
  );
};

export default Home;
