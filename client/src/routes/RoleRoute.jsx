import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLoader from '../components/common/PageLoader';
import UnauthorizedPage from '../pages/shared/UnauthorizedPage';

export const RoleRoute = ({ allowedRoles = [] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader message="Verifying role permissions..." />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    console.warn('[GSI-ROUTE-GUARD] Role clearance denied for user role:', user?.role, 'required:', allowedRoles);
    return <UnauthorizedPage />;
  }

  console.log('[GSI-ROUTE-GUARD] Role clearance verified for:', user.role);
  return <Outlet />;
};

export default RoleRoute;

