import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const WishlistButton = ({ targetId, targetModel }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user || !targetId) {
        setInitialLoading(false);
        return;
      }
      try {
        const res = await axios.get(`/wishlists/check/${targetId}`);
        setIsWishlisted(res.data.isWishlisted);
      } catch (err) {
        console.error('Failed to check wishlist status', err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    checkWishlistStatus();
  }, [targetId, user]);

  const handleToggle = async (e) => {
    e.preventDefault(); // Prevent navigating if this button is inside a Link
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Optimistic update
      setIsWishlisted(!isWishlisted);
      
      const res = await axios.post('/wishlists/toggle', {
        targetId,
        targetModel
      });
      
      // Update with server source of truth
      setIsWishlisted(res.data.isWishlisted);
      
      // Dispatch custom event to notify Navbar and other components to update their counts/lists
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (err) {
      // Revert on failure
      setIsWishlisted(!isWishlisted);
      console.error('Failed to toggle wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-surface-container/50 animate-pulse border border-outline-variant/10"></div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`w-10 h-10 flex items-center justify-center rounded-2xl border transition-all duration-300 shadow-sm ${
        isWishlisted 
          ? 'bg-[#eb4898]/10 border-[#eb4898]/30 text-[#eb4898]' 
          : 'bg-surface-container-highest border-outline-variant/10 text-on-surface-variant hover:text-[#eb4898] hover:border-[#eb4898]/30'
      }`}
    >
      <Heart 
        size={18} 
        fill={isWishlisted ? 'currentColor' : 'none'} 
        className={`${isWishlisted ? 'scale-110' : 'scale-100'} transition-transform duration-300 active:scale-75`}
      />
    </button>
  );
};

export default WishlistButton;
