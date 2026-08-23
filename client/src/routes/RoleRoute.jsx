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
    return <UnauthorizedPage />;
  }

  return <Outlet />;
};

export default RoleRoute;

