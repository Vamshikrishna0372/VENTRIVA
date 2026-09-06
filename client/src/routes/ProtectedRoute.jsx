import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Authenticating Ventriva Session...</p>
      </div>
    );
  }

  console.log('[GSI-ROUTE-GUARD] ProtectedRoute evaluating:', {
    isAuthenticated,
    hasUser: Boolean(user),
    role: user?.role,
    path: location.pathname,
  });

  if (!isAuthenticated || !user) {
    console.warn('[GSI-ROUTE-GUARD] Unauthenticated access blocked at', location.pathname, 'redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

