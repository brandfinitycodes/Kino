const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'src', 'components', 'CreatorDashboardViews.jsx');
const outputDir = path.join(__dirname, 'src', 'components', 'CreatorDashboard');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const content = fs.readFileSync(inputFile, 'utf-8');

// The shared imports and utility functions
const importsAndUtils = `import React, { useState, useEffect, useRef } from "react";
import axios from "../../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  User, Compass, Briefcase, Wallet, Settings, Bell,
  ExternalLink, ShieldCheck, Clock, TrendingUp, Building,
  Upload, Search, SlidersHorizontal, CheckCircle, AlertTriangle,
  Receipt, Download, ChevronLeft, ChevronRight, X, Building2, LayoutDashboard,
  Folder, ArrowUpRight, Edit3, ChevronDown, Film, UploadCloud,
  LogOut, Users, Check, Plus, Trash2, MessageCircle, MessageSquare, MapPin, Gauge, Star, Quote, FileText, Copy,
  LayoutGrid, Columns, Bookmark, Zap, Lock, ShieldAlert, AlertCircle,
  Calendar, FileSignature, Video, Filter
} from "lucide-react";
import ChatOverlay from "../ChatOverlay";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAuth } from "../../context/AuthContext";

export const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;
  let score = 0;
  if (profile.bio) score += 15;
  if (profile.niche && profile.niche !== 'Other') score += 15;
  if (profile.profilePicture) score += 15;
  if (profile.instagramProfile?.connected) score += 20;
  if (profile.expertise && profile.expertise.length > 0) score += 15;
  if (profile.pricing?.basic?.price > 0 || profile.pricing?.standard?.price > 0 || profile.pricing?.premium?.price > 0) score += 10;
  if (profile.payoutDetails?.isComplete || profile.payoutDetails?.upiId || profile.payoutDetails?.bankAccountNumber) score += 10;
  return score;
};

export const ANIMATION_VARIANTS = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.25, ease: "easeOut" }
};
`;

// Helper to extract a component
function extractComponent(name) {
  const regex = new RegExp(`export const ${name} =.*?(?=\\nexport const |$)`, 's');
  const match = content.match(regex);
  if (match) {
    let componentCode = match[0];
    // Special handling if there are shared helpers right before it that are part of the file.
    // e.g. getPlaceholderImage is used by ProfileView
    if (name === 'ProfileView') {
        const placeholderRegex = /const getPlaceholderImage =.*?(?=\nexport const ProfileView)/s;
        const pMatch = content.match(placeholderRegex);
        if (pMatch) componentCode = pMatch[0] + "\n" + componentCode;
        
        const animatedAvatarRegex = /export const ScrollAnimatedAvatar =.*?(?=\nexport const ANIMATION_VARIANTS)/s;
        const aMatch = content.match(animatedAvatarRegex);
        if (aMatch) componentCode = aMatch[0] + "\n" + componentCode;
    }
    
    // We will strip the "export " from the component declaration so we can do export default at the bottom
    componentCode = componentCode.replace(new RegExp(`export const ${name} =`), `const ${name} =`);
    
    // We also might have nested helper exports we should clean up if needed, but it's okay for now.
    
    const finalCode = `${importsAndUtils}\n\n${componentCode}\n\nexport default ${name};\n`;
    fs.writeFileSync(path.join(outputDir, `${name}.jsx`), finalCode);
    console.log(`Extracted ${name}.jsx`);
  } else {
    console.log(`Failed to find ${name}`);
  }
}

['ProfileView', 'ApplicationsView', 'DiscoverView', 'DealsView', 'SettingsView', 'WalletView'].forEach(extractComponent);

console.log("Extraction complete.");
