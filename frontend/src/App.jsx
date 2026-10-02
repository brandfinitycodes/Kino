import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import KinoWelcome from './components/KinoWelcome';
import { AnimatePresence } from 'framer-motion';

// Lazy load page components
const Home = lazy(() => import('./pages/Home'));
const OldHome = lazy(() => import('./pages/OldHome'));
const NewHomeStatic = lazy(() => import('./pages/NewHomeStatic'));
const NewHome = lazy(() => import('./pages/NewHome'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CreatorDashboard = lazy(() => import('./pages/CreatorDashboard'));
const BrandDashboard = lazy(() => import('./pages/BrandDashboard'));
const CampaignListing = lazy(() => import('./pages/CampaignListing'));
const CampaignDetail = lazy(() => import('./pages/CampaignDetail'));
const CreatorListing = lazy(() => import('./pages/CreatorListing'));
const CreatorProfile = lazy(() => import('./pages/CreatorProfile'));
const BrandListing = lazy(() => import('./pages/BrandListing'));
const BrandProfile = lazy(() => import('./pages/BrandProfile'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const InstagramOauth = lazy(() => import('./pages/InstagramOauth'));
const AadhaarVerification = lazy(() => import('./pages/AadhaarVerification'));
const Terms = lazy(() => import('./pages/Terms'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const CreatorGuidelines = lazy(() => import('./pages/CreatorGuidelines'));
const BrandHandbook = lazy(() => import('./pages/BrandHandbook'));


const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-12 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (role) {
    if (role === 'admin') {
      const adminRoles = ['superadmin', 'admin', 'moderator', 'support'];
      if (!adminRoles.includes(user.role)) return <Navigate to="/" />;
    } else if (user.role !== role) {
      return <Navigate to="/" />;
    }
  }

  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-12 text-center">Loading...</div>;
  if (user) {
    const adminRoles = ['superadmin', 'admin', 'moderator', 'support'];
    if (adminRoles.includes(user.role)) return <Navigate to="/admin-dashboard" />;
    const justRegistered = sessionStorage.getItem('justRegistered');
    if (justRegistered === 'true') {
      sessionStorage.removeItem('justRegistered');
      return <Navigate to="/aadhaar-verification" />;
    }
    return <Navigate to={user.role === 'creator' ? '/creator-dashboard' : '/brand-dashboard'} />;
  }

  return children;
};


const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-4">
    <div className="relative w-16 h-16">
      {/* Outer spinning ring */}
      <div className="absolute inset-0 border-4 border-solid border-primary border-t-transparent rounded-full animate-spin"></div>
      {/* Inner pulsing blur circle */}
      <div className="absolute inset-2 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-full animate-pulse blur-sm"></div>
      {/* Center pinging core */}
      <div className="absolute inset-4 bg-surface rounded-full flex items-center justify-center shadow-inner">
        <div className="w-2.5 h-2.5 bg-primary rounded-full animate-ping"></div>
      </div>
    </div>
    <span className="mt-6 font-display text-xs font-bold tracking-[0.25em] uppercase text-on-surface-variant animate-pulse text-center">
      Loading Elevate Pulse...
    </span>
  </div>
);

const App = () => {
  // Wake up Render free tier backend on initial load
  React.useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/health`)
      .catch(() => {}); // Fire and forget
  }, []);

  const [showSplash, setShowSplash] = React.useState(() => {
    return !sessionStorage.getItem('kino_splash_shown');
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('kino_splash_shown', 'true');
    setShowSplash(false);
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <SocketProvider>
          <Router>
            <AnimatePresence>
              {showSplash && <KinoWelcome onComplete={handleSplashComplete} />}
            </AnimatePresence>
            {!showSplash && (
              <>
                <ScrollToTop />
                <div className="min-h-screen flex flex-col">
                  <Navbar />
              <main className="grow relative">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/oldhome" element={<OldHome />} />
                    <Route path="/newhome" element={<NewHome />} />
                    <Route path="/newhomestatic" element={<NewHomeStatic />} />
                    <Route
                      path="/login"
                      element={
                        <GuestRoute>
                          <Login />
                        </GuestRoute>
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <GuestRoute>
                          <Register />
                        </GuestRoute>
                      }
                    />

                    <Route path="/campaigns" element={<CampaignListing />} />
                    <Route path="/campaigns/:id" element={<CampaignDetail />} />
                    <Route path="/creators" element={<CreatorListing />} />
                    <Route path="/creators/:id" element={<CreatorProfile />} />
                    <Route path="/brands" element={<BrandListing />} />
                    <Route path="/brands/:id" element={<BrandProfile />} />

                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute>
                          <Notifications />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/wishlist"
                      element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/creator-dashboard"
                      element={
                        <ProtectedRoute role="creator">
                          <CreatorDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/brand-dashboard"
                      element={
                        <ProtectedRoute role="brand">
                          <BrandDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin-dashboard"
                      element={
                        <ProtectedRoute role="admin">
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/aadhaar-verification"
                      element={
                        <ProtectedRoute>
                          <AadhaarVerification />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/kyc-onboarding"
                      element={
                        <ProtectedRoute>
                          <AadhaarVerification />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/kyc-verification"
                      element={
                        <ProtectedRoute>
                          <AadhaarVerification />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/kyc"
                      element={
                        <ProtectedRoute>
                          <AadhaarVerification />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/instagram-oauth" element={<InstagramOauth />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/refund-policy" element={<RefundPolicy />} />
                    <Route path="/creator-guidelines" element={<CreatorGuidelines />} />
                    <Route path="/brand-handbook" element={<BrandHandbook />} />

                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
            </>
            )}
          </Router>
        </SocketProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
