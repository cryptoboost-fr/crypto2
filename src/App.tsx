import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import { Toaster } from './components/ui/toaster';
import { ErrorBoundary } from './components/ErrorBoundary';

// Layout components (pas de lazy loading pour les layouts critiques)
import { PublicLayout } from './components/layout/PublicLayout';
import { ClientLayout } from './components/layout/ClientLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { AuthLayout } from './components/layout/AuthLayout';

// Lazy loading des pages pour optimiser le bundle
// Public pages
const Home = lazy(() => import('./pages/public/Home').then(m => ({ default: m.Home })));
const About = lazy(() => import('./pages/public/About').then(m => ({ default: m.About })));
const PublicPlans = lazy(() => import('./pages/public/Plans').then(m => ({ default: m.Plans })));
const Contact = lazy(() => import('./pages/public/Contact').then(m => ({ default: m.Contact })));

// Auth pages
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/auth/Register').then(m => ({ default: m.Register })));

// Client pages - lazy loading
const Dashboard = lazy(() => import('./pages/client/Dashboard').then(m => ({ default: m.Dashboard })));
const Wallet = lazy(() => import('./pages/client/Wallet').then(m => ({ default: m.Wallet })));
const ClientPlans = lazy(() => import('./pages/client/Plans').then(m => ({ default: m.Plans })));
const Exchange = lazy(() => import('./pages/client/Exchange').then(m => ({ default: m.Exchange })));
const History = lazy(() => import('./pages/client/History').then(m => ({ default: m.History })));
const Profile = lazy(() => import('./pages/client/Profile').then(m => ({ default: m.Profile })));
const Notifications = lazy(() => import('./pages/client/Notifications').then(m => ({ default: m.Notifications })));

// Admin pages - lazy loading
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })));
const Users = lazy(() => import('./pages/admin/Users').then(m => ({ default: m.Users })));
const Transactions = lazy(() => import('./pages/admin/Transactions').then(m => ({ default: m.Transactions })));
const InvestmentPlans = lazy(() => import('./pages/admin/InvestmentPlans').then(m => ({ default: m.InvestmentPlans })));
const CryptoWallets = lazy(() => import('./pages/admin/CryptoWallets').then(m => ({ default: m.CryptoWallets })));
const SystemLogs = lazy(() => import('./pages/admin/SystemLogs').then(m => ({ default: m.SystemLogs })));
const Settings = lazy(() => import('./pages/admin/Settings').then(m => ({ default: m.Settings })));

// Enhanced Loading component with skeleton
const LoadingSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-muted-foreground font-medium">Chargement...</p>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  </div>
);

// Skeleton Loader pour Suspense
const PageSkeleton = () => (
  <div className="min-h-screen bg-background p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="h-8 bg-muted rounded animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
        ))}
      </div>
      <div className="h-64 bg-muted rounded animate-pulse"></div>
    </div>
  </div>
);

// Protected route component
const ProtectedRoute = ({ 
  children, 
  requiredRole = 'client' 
}: { 
  children: React.ReactNode; 
  requiredRole?: 'client' | 'admin' 
}) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <Navigate to="/client/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { loading } = useAuthStore();

  // Enhanced initialization
  useEffect(() => {
    // Add dark mode class
    document.documentElement.classList.add('dark');
    
    // Set viewport meta for better mobile experience
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    }
    
    // Prevent zoom on iOS
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    
    // Add accessibility enhancements
    document.body.setAttribute('role', 'application');
    document.body.setAttribute('aria-label', 'CryptoBoost Application');
    
    return () => {
      document.removeEventListener('gesturestart', (e) => e.preventDefault());
    };
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={
            <Suspense fallback={<PageSkeleton />}>
              <Home />
            </Suspense>
          } />
          <Route path="about" element={
            <Suspense fallback={<PageSkeleton />}>
              <About />
            </Suspense>
          } />
          <Route path="plans" element={
            <Suspense fallback={<PageSkeleton />}>
              <PublicPlans />
            </Suspense>
          } />
          <Route path="contact" element={
            <Suspense fallback={<PageSkeleton />}>
              <Contact />
            </Suspense>
          } />
        </Route>

        {/* Auth routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={
            <Suspense fallback={<PageSkeleton />}>
              <Login />
            </Suspense>
          } />
          <Route path="register" element={
            <Suspense fallback={<PageSkeleton />}>
              <Register />
            </Suspense>
          } />
        </Route>

        {/* Client routes */}
        <Route
          path="/client"
          element={
            <ProtectedRoute requiredRole="client">
              <ClientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/client/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route path="wallet" element={
            <Suspense fallback={<PageSkeleton />}>
              <Wallet />
            </Suspense>
          } />
          <Route path="plans" element={
            <Suspense fallback={<PageSkeleton />}>
              <ClientPlans />
            </Suspense>
          } />
          <Route path="exchange" element={
            <Suspense fallback={<PageSkeleton />}>
              <Exchange />
            </Suspense>
          } />
          <Route path="history" element={
            <Suspense fallback={<PageSkeleton />}>
              <History />
            </Suspense>
          } />
          <Route path="profile" element={
            <Suspense fallback={<PageSkeleton />}>
              <Profile />
            </Suspense>
          } />
          <Route path="notifications" element={
            <Suspense fallback={<PageSkeleton />}>
              <Notifications />
            </Suspense>
          } />
        </Route>

        {/* Legacy client route for backward compatibility */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="client">
              <ClientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/client/dashboard" replace />} />
          <Route path="wallet" element={
            <Suspense fallback={<PageSkeleton />}>
              <Wallet />
            </Suspense>
          } />
          <Route path="plans" element={
            <Suspense fallback={<PageSkeleton />}>
              <ClientPlans />
            </Suspense>
          } />
          <Route path="exchange" element={
            <Suspense fallback={<PageSkeleton />}>
              <Exchange />
            </Suspense>
          } />
          <Route path="history" element={
            <Suspense fallback={<PageSkeleton />}>
              <History />
            </Suspense>
          } />
          <Route path="profile" element={
            <Suspense fallback={<PageSkeleton />}>
              <Profile />
            </Suspense>
          } />
          <Route path="notifications" element={
            <Suspense fallback={<PageSkeleton />}>
              <Notifications />
            </Suspense>
          } />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={
            <Suspense fallback={<PageSkeleton />}>
              <AdminDashboard />
            </Suspense>
          } />
          <Route path="users" element={
            <Suspense fallback={<PageSkeleton />}>
              <Users />
            </Suspense>
          } />
          <Route path="transactions" element={
            <Suspense fallback={<PageSkeleton />}>
              <Transactions />
            </Suspense>
          } />
          <Route path="plans" element={
            <Suspense fallback={<PageSkeleton />}>
              <InvestmentPlans />
            </Suspense>
          } />
          <Route path="wallets" element={
            <Suspense fallback={<PageSkeleton />}>
              <CryptoWallets />
            </Suspense>
          } />
          <Route path="logs" element={
            <Suspense fallback={<PageSkeleton />}>
              <SystemLogs />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<PageSkeleton />}>
              <Settings />
            </Suspense>
          } />
        </Route>

        {/* Redirects */}
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/register" element={<Navigate to="/auth/register" replace />} />
        
        {/* 404 route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster />
    </div>
    </ErrorBoundary>
  );
}

export default App; 