import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    try {
      const cached = localStorage.getItem('user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Wrapper to keep localStorage and state in sync
  const setUser = (newUser) => {
    if (typeof newUser === 'function') {
      setUserState(prev => {
        const updated = newUser(prev);
        if (updated) {
          try { localStorage.setItem('user', JSON.stringify(updated)); } catch {}
        } else {
          localStorage.removeItem('user');
        }
        return updated;
      });
    } else {
      if (newUser) {
        try { localStorage.setItem('user', JSON.stringify(newUser)); } catch {}
      } else {
        localStorage.removeItem('user');
      }
      setUserState(newUser);
    }
  };

  // If token exists AND cached user already exists, don't block the screen with full-page loader!
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hasToken = Boolean(localStorage.getItem('token'));
    const hasUser = Boolean(localStorage.getItem('user'));
    return hasToken && !hasUser;
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error('Failed to fetch user', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUserState(null);
        }
      } else {
        localStorage.removeItem('user');
        setUserState(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (email, password, role, name, businessName) => {
    const res = await axios.post('/auth/register', { email, password, role, name, businessName });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const googleLogin = async (idToken) => {
    const res = await axios.post('/auth/google-login', { idToken });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const googleRegister = async (idToken, role) => {
    const res = await axios.post('/auth/google-register', { idToken, role });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const sendOtp = async (email) => {
    const res = await axios.post('/auth/send-otp', { email });
    return res.data;
  };

  const verifyOtp = async (email, otp) => {
    const res = await axios.post('/auth/verify-otp', { email, otp });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, googleLogin, googleRegister, sendOtp, verifyOtp, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
