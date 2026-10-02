import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Mail, ArrowUpRight, Sparkles } from 'lucide-react';
import { Instagram, Twitter, Linkedin } from './SocialIcons';

const Footer = () => {
  const location = useLocation();
  const isDashboardWithSidebar = 
    location.pathname.startsWith('/creator-dashboard') || 
    location.pathname.startsWith('/brand-dashboard') ||
    location.pathname.startsWith('/dashboard');

  return (
    <footer 
      className={`bg-white border-t border-gray-100 text-gray-600 z-20 relative transition-all duration-300 ${
        isDashboardWithSidebar 
          ? 'md:ml-64 md:w-[calc(100%-16rem)] w-full pb-28 md:pb-12' 
          : 'w-full pb-12'
      } py-12 px-6 sm:px-8 lg:px-12`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Info */}
          <div className="flex flex-col items-start gap-5 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center transition-transform group-hover:scale-105 shadow-md shadow-orange-500/20">
                <span className="text-white font-sans font-black text-xl tracking-tighter">K</span>
              </div>
              <span className="text-2xl font-black font-display text-gray-900 tracking-tight lowercase">
                kino
              </span>
            </Link>
            <p className="font-sans text-sm text-gray-500 leading-relaxed font-medium">
              Empowering the next generation of storytellers and brands through high-impact, transparent collaborations.
            </p>
            <div className="flex items-center gap-3 text-gray-400 mt-1">
              <a
                href="https://brandfinity.in"
                target="_blank"
                rel="noreferrer"
                aria-label="Website"
                className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-orange-50 hover:text-[#EA580C] transition-all"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="mailto:hello@brandfinity.in"
                aria-label="Email"
                className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-orange-50 hover:text-[#EA580C] transition-all"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-orange-50 hover:text-[#EA580C] transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-orange-50 hover:text-[#EA580C] transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-display font-black text-gray-900 mb-5 uppercase text-[11px] tracking-widest">
              Platform
            </h4>
            <ul className="space-y-3.5">
              <li>
                <Link to="/creators" className="text-sm text-gray-500 hover:text-[#EA580C] transition-colors font-medium inline-flex items-center gap-1">
                  Discover Creators
                </Link>
              </li>
              <li>
                <Link to="/campaigns" className="text-sm text-gray-500 hover:text-[#EA580C] transition-colors font-medium inline-flex items-center gap-1">
                  Brand Campaigns
                </Link>
              </li>
              <li>
                <Link to="/brands" className="text-sm text-gray-500 hover:text-[#EA580C] transition-colors font-medium inline-flex items-center gap-1">
                  Featured Brands
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-display font-black text-gray-900 mb-5 uppercase text-[11px] tracking-widest">
              Resources
            </h4>
            <ul className="space-y-3.5">
              <li>
                <Link to="/creator-guidelines" className="text-sm text-gray-500 hover:text-[#EA580C] transition-colors font-medium inline-flex items-center gap-1">
                  Creator Guidelines
                </Link>
              </li>
              <li>
                <Link to="/brand-handbook" className="text-sm text-gray-500 hover:text-[#EA580C] transition-colors font-medium inline-flex items-center gap-1">
                  Brand Handbook
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-display font-black text-gray-900 mb-5 uppercase text-[11px] tracking-widest">
              Legal
            </h4>
            <ul className="space-y-3.5">
              <li>
                <Link to="/privacy" className="text-sm text-gray-500 hover:text-[#EA580C] transition-colors font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-500 hover:text-[#EA580C] transition-colors font-medium">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-sm text-gray-500 hover:text-[#EA580C] transition-colors font-medium">
                  Cancellation & Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-display font-black text-gray-900 mb-5 uppercase text-[11px] tracking-widest">
              Contact Us
            </h4>
            <ul className="space-y-3.5">
              <li>
                <span className="text-sm font-bold text-gray-800">
                  kino by Brandfinity
                </span>
              </li>
              <li>
                <a 
                  href="mailto:hello@brandfinity.in" 
                  className="text-sm text-gray-500 hover:text-[#EA580C] transition-colors font-medium block"
                >
                  hello@brandfinity.in
                </a>
              </li>
              <li>
                <span className="text-xs text-gray-500 font-medium leading-relaxed block">
                  1st floor Brandfinity, Vijayanand Society, P-15, near NIT Garden, Narendra Nagar square, Somalwada, Nagpur, Maharashtra 440015
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="font-sans text-xs text-gray-400 font-medium tracking-wide">
            © {new Date().getFullYear()} kino. All rights reserved.
          </p>
          <span className="text-xs text-gray-400 font-medium tracking-wide flex items-center justify-center gap-1.5">
            <Sparkles size={12} className="text-amber-500" /> Made with precision for the creator economy.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
