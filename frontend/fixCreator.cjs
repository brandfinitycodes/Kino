const fs = require('fs');
const path = require('path');
const d = 'src/components/CreatorDashboard';

const placeholderCode = `
const getPlaceholderImage = (niche) => {
  const map = {
    'Tech': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    'Fashion': 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80',
    'Gaming': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    'Lifestyle': 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=400&q=80',
    'Food': 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=400&q=80',
    'Travel': 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=400&q=80',
    'Beauty': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    'Other': 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=400&q=80'
  };
  return map[niche] || map['Other'];
};
`;

const files = fs.readdirSync(d);

files.forEach(f => {
  if (!f.endsWith('.jsx')) return;
  const oldPath = path.join(d, f);
  const newName = f.replace('View', '').replace('Profile', 'CreatorProfile')
                   .replace('Applications', 'CreatorApplications')
                   .replace('Discover', 'CreatorDiscover')
                   .replace('Deals', 'CreatorDeals')
                   .replace('Settings', 'CreatorSettings')
                   .replace('Wallet', 'CreatorWallet');
                   
  const newPath = path.join(d, newName);
  let c = fs.readFileSync(oldPath, 'utf8');
  const oldComp = f.replace('.jsx', '');
  const newComp = newName.replace('.jsx', '');
  
  c = c.replace(new RegExp('const ' + oldComp, 'g'), 'const ' + newComp);
  c = c.replace(new RegExp('export default ' + oldComp, 'g'), 'export default ' + newComp);
  
  if (!c.includes('const getPlaceholderImage =')) {
    c = c.replace('const ANIMATION_VARIANTS = {', placeholderCode + '\nconst ANIMATION_VARIANTS = {');
  }
  
  fs.writeFileSync(newPath, c);
  if (oldPath !== newPath) {
    fs.unlinkSync(oldPath);
  }
});
console.log('Fixed and renamed components!');
