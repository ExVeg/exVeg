import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { auth } from '../firebase';
import { useAuthState } from '../hooks/useAuthState';

/**
 * ProtectedRoute — guards routes by role.
 * roles: array of allowed roles e.g. ['Admin'] or ['Seller', 'Admin']
 * If not logged in → redirect to /login
 * If logged in but wrong role → redirect to /
 */
const ProtectedRoute = ({ children, roles }) => {
  const { user, role, loading } = useAuthState();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant font-label-md">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
