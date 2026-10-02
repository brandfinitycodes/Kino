import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import CampaignCard from '../components/CampaignCard';
import CreatorCard from '../components/CreatorCard';
import { Heart, Compass, ArrowUpRight, ArrowLeft, Folder, Search, LayoutGrid, List as ListIcon, Edit3, Save, CheckCircle, X, CheckSquare, Trash2, Columns, TrendingUp, Users, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CreatorBottomNav from '../components/CreatorBottomNav';
import BrandBottomNav from '../components/BrandBottomNav';

const WishlistItemBox = ({ item, onUpdate, isSelected, toggleSelection, children, applications, isBoardView }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(item.note || '');
  const [folder, setFolder] = useState(item.folder || 'Saved');

  const handleSave = async () => {
    try {
      const res = await axios.put(`/wishlists/${item._id}`, { note, folder });
      onUpdate(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Status Syncing: Check if already applied
  const hasApplied = item.targetModel === 'Campaign' && applications.some(app => app.campaignId?._id === item.targetId?._id || app.campaignId === item.targetId?._id);

  return (
    <div className={`bg-white/80 backdrop-blur-xl rounded-[32px] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border flex flex-col h-full group relative transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 ${isSelected ? 'border-rose-500 ring-4 ring-rose-500/20 shadow-[0_15px_40px_rgba(244,63,94,0.15)]' : 'border-white hover:border-indigo-100'}`}>
      
      {/* Checkbox for Bulk Actions */}
      {!isBoardView && (
        <div className="absolute top-4 left-4 z-20">
          <button onClick={() => toggleSelection(item._id)} className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all duration-300 ${isSelected ? 'bg-gradient-to-br from-rose-500 to-[#eb4898] border-transparent text-white shadow-md scale-110' : 'bg-white/80 backdrop-blur-sm border-white shadow-sm text-transparent hover:border-rose-200 hover:scale-110'}`}>
            <CheckSquare size={16} strokeWidth={3} />
          </button>
        </div>
      )}

      {/* Status Badge */}
      {hasApplied && (
        <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-emerald-400 to-emerald-500 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-2 shadow-[0_8px_20px_rgba(16,185,129,0.3)]">
          <CheckCircle size={14} strokeWidth={3} /> Applied
        </div>
      )}

      {/* Target Content (Card) */}
      <div className={`flex flex-col flex-1 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 ${hasApplied ? 'opacity-70 group-hover:opacity-100' : ''}`}>
        {children}
      </div>
      
      {/* Interactive CRM Box */}
      <div className="mt-4 pt-4 border-t border-gray-100/50 flex flex-col gap-3">
        {!isEditing ? (
          <div className="flex flex-col gap-2 cursor-pointer p-4 bg-gradient-to-br from-gray-50 to-white rounded-[24px] hover:shadow-md border border-white hover:border-gray-100 transition-all duration-300 group/crm relative overflow-hidden" onClick={() => setIsEditing(true)}>
            <div className="absolute right-0 top-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover/crm:scale-150 transition-transform duration-700"></div>
            
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#eb4898] flex items-center gap-2 bg-[#eb4898]/10 px-3 py-1 rounded-full border border-[#eb4898]/20"><Folder size={12} /> {item.folder || 'Saved'}</span>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover/crm:text-rose-500 group-hover/crm:scale-110 transition-all">
                <Edit3 size={14} />
              </div>
            </div>
            {item.note ? (
              <p className="text-[13px] font-medium text-gray-700 leading-relaxed mt-1 relative z-10">{item.note}</p>
            ) : (
              <p className="text-[13px] font-medium text-gray-400 italic mt-1 relative z-10">Click to add a private note...</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[24px] border border-indigo-100 shadow-inner">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 ml-1">Folder</label>
              <input 
                type="text" 
                value={folder} 
                onChange={e => setFolder(e.target.value)}
                className="w-full bg-white border border-indigo-100/50 rounded-xl px-4 py-3 text-[13px] font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 transition-all shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 ml-1">Private Note</label>
              <textarea 
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Follow up next week..."
                className="w-full bg-white border border-indigo-100/50 rounded-xl px-4 py-3 text-[13px] font-medium outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 transition-all min-h-[80px] resize-none shadow-sm"
              />
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-white hover:text-gray-900 transition-all shadow-sm border border-transparent hover:border-gray-200">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-[0_10px_20px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2"><Save size={14}/> Save</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Wishlist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'board'
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkFolderInput, setBulkFolderInput] = useState('');
  const [showBulkFolderInput, setShowBulkFolderInput] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/wishlists');
        const validItems = res.data.filter(item => item.targetId);
        setItems(validItems);

        if (user?.role === 'creator') {
          const appRes = await axios.get('/applications');
          setApplications(appRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
    else setLoading(false);
  }, [user]);

  const handleUpdateItem = (updatedItem) => {
    setItems(prev => prev.map(item => item._id === updatedItem._id ? updatedItem : item));
  };

  const toggleSelection = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if(!window.confirm(`Remove ${selectedItems.length} items from wishlist?`)) return;
    try {
      for (const id of selectedItems) {
        const item = items.find(i => i._id === id);
        if(item) {
          await axios.post('/wishlists/toggle', { targetId: item.targetId._id, targetModel: item.targetModel });
        }
      }
      setItems(prev => prev.filter(i => !selectedItems.includes(i._id)));
      setSelectedItems([]);
    } catch(err) {
      console.error(err);
    }
  };

  const handleBulkMove = async () => {
    if(!bulkFolderInput.trim()) return;
    try {
      for (const id of selectedItems) {
        const item = items.find(i => i._id === id);
        if(item) {
          await axios.put(`/wishlists/${id}`, { note: item.note, folder: bulkFolderInput });
        }
      }
      setItems(prev => prev.map(item => selectedItems.includes(item._id) ? { ...item, folder: bulkFolderInput } : item));
      setSelectedItems([]);
      setShowBulkFolderInput(false);
      setBulkFolderInput('');
    } catch(err) {
      console.error(err);
    }
  };

  const handleDragStart = (e, itemId) => {
    e.dataTransfer.setData('itemId', itemId);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = async (e, folderName) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('itemId');
    if (itemId) {
      try {
        const item = items.find(i => i._id === itemId);
        if(item && item.folder !== folderName) {
          const res = await axios.put(`/wishlists/${itemId}`, { note: item.note, folder: folderName });
          handleUpdateItem(res.data);
        }
      } catch(err) {
        console.error(err);
      }
    }
  };

  const calculateInsights = () => {
    if (user?.role === 'creator') {
      const totalBudget = items.reduce((acc, curr) => {
        return acc + (curr.targetModel === 'Campaign' ? (curr.targetId.budget || 0) : 0);
      }, 0);
      return { label: 'Total Potential Revenue', value: `🪙${totalBudget.toLocaleString()}` };
    } else {
      const totalCreators = items.filter(i => i.targetModel === 'CreatorProfile');
      return { label: 'Saved Creators', value: totalCreators.length };
    }
  };
  const insights = calculateInsights();

  const folders = ['All', ...new Set(items.map(item => item.folder || 'Saved'))];

  const filteredItems = items.filter(item => {
    const target = item.targetId;
    if (!target) return false;
    const matchesFolder = activeFolder === 'All' || (item.folder || 'Saved') === activeFolder;
    const name = target.title || target.businessName || target.user?.name || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-100/40 via-purple-100/40 to-pink-100/40 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>
        <div className="bg-white/80 backdrop-blur-xl rounded-[40px] p-12 flex flex-col items-center text-center shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-white max-w-md w-full relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
           <div className="w-28 h-28 rounded-[28px] bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white">
             <Heart size={48} className="text-rose-500 drop-shadow-md" />
           </div>
          <h2 className="text-4xl font-black font-display tracking-tight text-gray-900 mb-4">Auth Required</h2>
          <p className="text-[15px] text-gray-500 font-medium mb-10 leading-relaxed max-w-xs">Connect your account to access your curated collection of premium opportunities.</p>
          <Link to="/login" className="w-full relative overflow-hidden bg-gradient-to-r from-gray-900 to-black text-white px-8 py-5 rounded-2xl text-[13px] font-black uppercase tracking-widest hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all group/btn flex items-center justify-center gap-3 border border-gray-800">
            <span className="relative z-10 flex items-center gap-2">Log In Securely <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" /></span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out"></div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 py-12 px-4 sm:px-8 relative overflow-hidden">
      {/* Global Decorative Backgrounds */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-100/40 via-purple-100/40 to-pink-100/40 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-orange-100/40 to-rose-100/40 rounded-full blur-[100px] translate-y-1/4 translate-x-1/4 pointer-events-none z-0"></div>
      
      <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col md:flex-row gap-8 pb-32">
        
        {/* Sidebar */}
        <div className="w-full md:w-80 flex flex-col gap-6 shrink-0">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-all font-black text-[11px] uppercase tracking-widest w-fit bg-white/50 px-5 py-3 rounded-[16px] backdrop-blur-md shadow-[0_5px_15px_rgba(0,0,0,0.02)] border border-white hover:bg-white hover:shadow-md hover:-translate-y-0.5">
            <ArrowLeft size={16} /> Back
          </button>
          
          <div className="bg-white/70 backdrop-blur-2xl rounded-[40px] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-white flex flex-col gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-rose-400/10 to-purple-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex items-center gap-5 relative z-10">
              <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-rose-500 via-[#eb4898] to-purple-600 text-white flex items-center justify-center shadow-[0_10px_25px_rgba(225,29,72,0.4)] transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 border border-white/20">
                <Heart size={28} className="drop-shadow-lg"/>
              </div>
              <div>
                <h2 className="font-display font-black text-gray-900 text-[26px] leading-[1.1] tracking-tight">Curation<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600">Board</span></h2>
              </div>
            </div>

            {/* Financial Insights Widget */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[28px] p-6 border border-white shadow-sm relative overflow-hidden group/insight hover:shadow-[0_15px_30px_rgba(16,185,129,0.1)] transition-all duration-500 hover:-translate-y-1">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl group-hover/insight:scale-[2] transition-transform duration-1000"></div>
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none mix-blend-overlay"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-1.5 relative z-10 mb-2"><TrendingUp size={14}/> Insights</span>
              <span className="text-[34px] font-display font-black text-emerald-900 tracking-tight relative z-10 leading-none">{insights.value}</span>
              <span className="text-[12px] font-bold text-emerald-700 relative z-10 mt-1">{insights.label}</span>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

            <div className="flex flex-col gap-2 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-2 px-3">Your Folders</span>
              {folders.map(f => (
                <button 
                  key={f}
                  onClick={() => { setActiveFolder(f); setViewMode(viewMode === 'board' ? 'grid' : viewMode); }}
                  className={`flex items-center justify-between px-5 py-4 rounded-[20px] text-[13px] font-bold transition-all duration-300 group/btn border ${activeFolder === f && viewMode !== 'board' ? 'bg-gradient-to-r from-gray-900 to-black text-white shadow-[0_10px_20px_rgba(0,0,0,0.15)] border-gray-800 scale-[1.02]' : 'text-gray-500 bg-white/40 hover:bg-white border-white hover:text-gray-900 hover:shadow-[0_5px_15px_rgba(0,0,0,0.03)] hover:scale-[1.01]'}`}
                >
                  <span className="flex items-center gap-3 tracking-wide"><Folder size={18} className={`${activeFolder === f && viewMode !== 'board' ? 'text-rose-400' : 'text-gray-400 group-hover/btn:text-rose-400'} transition-colors`} /> {f}</span>
                  <span className={`text-[11px] px-3 py-1 rounded-xl font-black shadow-inner ${activeFolder === f && viewMode !== 'board' ? 'bg-white/20 text-white border border-white/20' : 'bg-gray-100 text-gray-600 group-hover/btn:bg-rose-50 group-hover/btn:text-rose-600 border border-gray-200/50'}`}>
                    {f === 'All' ? items.length : items.filter(i => (i.folder || 'Saved') === f).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-8 w-full overflow-hidden">
          {/* Header Controls */}
          <div className="flex flex-col xl:flex-row items-center justify-between gap-5 bg-white/70 backdrop-blur-xl rounded-[32px] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-white">
            <div className="relative w-full xl:w-[480px]">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400" />
              <input 
                type="text" 
                placeholder="Search saved items..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-white rounded-[24px] pl-14 pr-6 py-4 text-[15px] font-bold text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 transition-all shadow-[0_5px_15px_rgba(0,0,0,0.02)]"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full xl:w-auto bg-white/50 p-2 rounded-[24px] border border-white shadow-inner">
              <button 
                onClick={() => setViewMode('grid')}
                className={`flex-1 xl:flex-none px-6 py-3.5 rounded-[18px] flex items-center justify-center transition-all duration-300 ${viewMode === 'grid' ? 'bg-white shadow-[0_5px_15px_rgba(0,0,0,0.05)] text-indigo-600 border border-white scale-105' : 'text-gray-400 hover:text-gray-900 hover:bg-white/50 border border-transparent'}`}
              >
                <LayoutGrid size={22} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`flex-1 xl:flex-none px-6 py-3.5 rounded-[18px] flex items-center justify-center transition-all duration-300 ${viewMode === 'list' ? 'bg-white shadow-[0_5px_15px_rgba(0,0,0,0.05)] text-indigo-600 border border-white scale-105' : 'text-gray-400 hover:text-gray-900 hover:bg-white/50 border border-transparent'}`}
              >
                <ListIcon size={22} />
              </button>
              <button 
                onClick={() => setViewMode('board')}
                className={`flex-1 xl:flex-none px-6 py-3.5 rounded-[18px] flex items-center justify-center transition-all duration-300 ${viewMode === 'board' ? 'bg-white shadow-[0_5px_15px_rgba(0,0,0,0.05)] text-indigo-600 border border-white scale-105' : 'text-gray-400 hover:text-gray-900 hover:bg-white/50 border border-transparent'}`}
              >
                <Columns size={22} />
              </button>
            </div>
          </div>

          {/* Render Area */}
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div className="w-16 h-16 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : viewMode === 'board' ? (
            // KANBAN BOARD VIEW
            <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-8 min-h-[600px] w-full items-start">
              {folders.filter(f => f !== 'All').map(folderName => (
                <div 
                  key={folderName}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, folderName)}
                  className="flex flex-col min-w-[360px] max-w-[360px] bg-white/40 backdrop-blur-xl rounded-[40px] p-5 border border-white shadow-[0_15px_40px_rgba(0,0,0,0.02)]"
                >
                  <div className="px-5 py-4 bg-white/80 backdrop-blur-md rounded-[24px] mb-6 font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-between shadow-sm border border-white">
                    <span className="flex items-center gap-3 text-gray-800"><Folder size={16} className="text-rose-500"/> {folderName}</span>
                    <span className="bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1.5 rounded-xl text-[11px] shadow-inner">{items.filter(i => (i.folder || 'Saved') === folderName).length}</span>
                  </div>
                  <div className="flex flex-col gap-5 min-h-[150px]">
                    {items.filter(i => (i.folder || 'Saved') === folderName).map(item => (
                      <div 
                        key={item._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item._id)}
                        className="cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform"
                      >
                        <WishlistItemBox item={item} onUpdate={handleUpdateItem} isSelected={false} toggleSelection={() => {}} applications={applications} isBoardView={true}>
                          {item.targetModel === 'Campaign' ? <CampaignCard campaign={item.targetId} /> : <CreatorCard creator={item.targetId} />}
                        </WishlistItemBox>
                      </div>
                    ))}
                    {items.filter(i => (i.folder || 'Saved') === folderName).length === 0 && (
                      <div className="py-12 text-center text-gray-400 font-black text-[12px] uppercase tracking-widest border-2 border-dashed border-gray-300 rounded-[24px] bg-white/50">
                        Drop items here
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            // GRID / LIST VIEW
            <motion.div 
              layout
              className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}
            >
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <motion.div 
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                    className="h-full flex flex-col"
                  >
                    <WishlistItemBox 
                      item={item} 
                      onUpdate={handleUpdateItem}
                      isSelected={selectedItems.includes(item._id)}
                      toggleSelection={toggleSelection}
                      applications={applications}
                      isBoardView={false}
                    >
                      {item.targetModel === 'Campaign' ? (
                        <CampaignCard campaign={item.targetId} />
                      ) : (
                        <CreatorCard creator={item.targetId} />
                      )}
                    </WishlistItemBox>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 text-center bg-white/80 backdrop-blur-xl border border-white rounded-[40px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mb-8 border border-white shadow-[0_10px_20px_rgba(0,0,0,0.05)] group-hover:-translate-y-2 transition-transform duration-500">
                <Compass size={40} className="text-indigo-300 drop-shadow-sm" />
              </div>
              <h3 className="text-3xl font-black font-display tracking-tight text-gray-900 mb-3">No Items Found</h3>
              <p className="text-gray-500 max-w-sm mb-8 font-medium text-[15px] leading-relaxed">
                {search ? "We couldn't find anything matching your search criteria." : `Your ${activeFolder} folder is completely empty. Start exploring!`}
              </p>
              {!search && (
                <Link to={user?.role === 'creator' ? "/dashboard/deals" : "/creators"} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl text-[13px] font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_15px_30px_rgba(99,102,241,0.4)] hover:-translate-y-1 transition-all">
                  Discover {user?.role === 'creator' ? 'Campaigns' : 'Creators'}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedItems.length > 0 && viewMode !== 'board' && (
          <motion.div 
            initial={{ y: 150, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 150, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-2xl rounded-full px-8 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex items-center gap-8 border border-white"
          >
            <div className="flex items-center gap-4 border-r border-gray-200 pr-8">
              <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-[14px] text-white shadow-md shadow-indigo-500/30">{selectedItems.length}</div>
              <div className="flex flex-col">
                <span className="font-black text-[14px] text-gray-900 tracking-tight">Items Selected</span>
                <span className="font-bold text-[10px] text-gray-400 uppercase tracking-widest">Bulk Actions</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {showBulkFolderInput ? (
                <div className="flex items-center gap-3">
                  <input 
                    type="text"
                    autoFocus
                    placeholder="Folder name..."
                    value={bulkFolderInput}
                    onChange={e => setBulkFolderInput(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] font-bold outline-none text-gray-900 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 w-40 transition-all"
                  />
                  <button onClick={handleBulkMove} className="bg-gray-900 text-white hover:bg-black px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-md">Move</button>
                  <button onClick={() => setShowBulkFolderInput(false)} className="text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2.5 rounded-xl transition-all"><X size={16}/></button>
                </div>
              ) : (
                <button onClick={() => setShowBulkFolderInput(true)} className="flex items-center gap-2 text-[13px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-5 py-3 rounded-[16px] transition-all">
                  <Folder size={16} /> Move to Folder
                </button>
              )}
              
              <button onClick={handleBulkDelete} className="flex items-center gap-2 text-[13px] font-black uppercase tracking-widest text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 px-5 py-3 rounded-[16px] transition-all group/del">
                <Trash2 size={16} className="group-hover/del:scale-110 transition-transform" /> Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      {user?.role === 'creator' ? (
        <CreatorBottomNav activeTab="" />
      ) : user?.role === 'brand' ? (
        <BrandBottomNav activeTab="" />
      ) : (
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 flex justify-around px-2 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
          {[
            { id: 'board', label: 'Board', icon: Heart, active: true },
            { id: 'campaigns', label: 'Campaigns', icon: Compass, path: '/campaigns' },
            { id: 'creators', label: 'Creators', icon: Users, path: '/creators' },
            { id: 'alerts', label: 'Alerts', icon: Bell, path: '/notifications' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = tab.active;
            
            return tab.path ? (
              <Link
                key={tab.id}
                to={tab.path}
                className="flex flex-col items-center gap-1 min-w-[65px] relative group active:scale-95 transition-transform"
              >
                <div className={`relative p-2.5 rounded-full transition-all duration-300 text-gray-400 group-hover:text-gray-600`}>
                  <Icon size={20} strokeWidth={2} />
                </div>
                <span className="text-[10px] font-black tracking-wide text-gray-400">
                  {tab.label}
                </span>
              </Link>
            ) : (
              <button
                key={tab.id}
                className="flex flex-col items-center gap-1 min-w-[65px] relative group active:scale-95 transition-transform"
              >
                <div className="relative p-2.5 rounded-full bg-[#ea580c] text-white shadow-[0_8px_20px_rgba(234,88,12,0.3)]">
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black tracking-wide text-[#ea580c]">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default Wishlist;
