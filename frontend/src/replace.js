const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'pages', 'BrandDashboard.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

// The replacements
const replacements = [
  // Backgrounds
  { regex: /bg-\[\#0d0d0f\](?:\/\d+)?/g, replacement: 'bg-gray-50' },
  { regex: /bg-\[\#141416\](?:\/\d+)?/g, replacement: 'bg-white' },
  { regex: /bg-\[\#1e1e20\](?:\/\d+)?/g, replacement: 'bg-gray-100' },
  { regex: /bg-\[\#1e1e1e\](?:\/\d+)?/g, replacement: 'bg-gray-100' },
  // Text
  { regex: /text-\[\#f0f0f5\]/g, replacement: 'text-gray-900' },
  { regex: /text-white/g, replacement: 'text-gray-900' },
  { regex: /text-\[\#8b8b9a\]/g, replacement: 'text-gray-500' },
  { regex: /text-gray-400/g, replacement: 'text-gray-500' },
  // Borders
  { regex: /border-\[rgba\(255,255,255,0\.05\)\]/g, replacement: 'border-gray-100' },
  { regex: /border-\[rgba\(255,255,255,0\.07\)\]/g, replacement: 'border-gray-200' },
  { regex: /border-\[rgba\(255,255,255,0\.1\)\]/g, replacement: 'border-gray-200' },
  { regex: /border-\[rgba\(255,255,255,0\.03\)\]/g, replacement: 'border-gray-100' },
  // Purples -> Blues
  { regex: /bg-\[\#a855f7\]/g, replacement: 'bg-[#3b82f6]' },
  { regex: /text-\[\#a855f7\]/g, replacement: 'text-[#3b82f6]' },
  { regex: /border-\[\#a855f7\]/g, replacement: 'border-[#3b82f6]' },
  { regex: /hover:bg-\[\#a855f7\]/g, replacement: 'hover:bg-blue-600' },
  { regex: /hover:text-\[\#a855f7\]/g, replacement: 'hover:text-[#3b82f6]' },
  { regex: /hover:border-\[\#a855f7\]/g, replacement: 'hover:border-blue-400' },
  // Yellows -> Emerald/Blue
  { regex: /bg-\[\#bef264\]/g, replacement: 'bg-emerald-500' },
  { regex: /text-\[\#bef264\]/g, replacement: 'text-emerald-500' },
  { regex: /border-\[\#bef264\]/g, replacement: 'border-emerald-500' },
  // Specific fix for text-white in buttons
  { regex: /bg-\[\#3b82f6\] text-gray-900/g, replacement: 'bg-[#3b82f6] text-white' }, // Re-fix button text
  { regex: /bg-emerald-500 text-gray-900/g, replacement: 'bg-emerald-500 text-white' }, // Re-fix button text
  { regex: /hover:text-\[\#0d0d0f\]/g, replacement: 'hover:text-white' }
];

replacements.forEach(({ regex, replacement }) => {
  content = content.replace(regex, replacement);
});

// A few specific manual fixes
// Sidebar text might have `text-gray-900` where it was `text-[#8b8b9a]`, etc.
content = content.replace(/shadow-\[0_0_20px_rgba\(168,85,247,0\.3\)\]/g, 'shadow-md shadow-blue-500/20');
content = content.replace(/shadow-\[0_0_20px_rgba\(168,85,247,0\.2\)\]/g, 'shadow-sm shadow-blue-500/10');
content = content.replace(/shadow-\[0_0_10px_rgba\(168,85,247,0\.5\)\]/g, 'shadow-sm shadow-blue-500/20');
content = content.replace(/shadow-\[0_0_10px_rgba\(190,242,100,0\.5\)\]/g, 'shadow-sm shadow-emerald-500/20');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully replaced hardcoded colors in BrandDashboard.jsx');
