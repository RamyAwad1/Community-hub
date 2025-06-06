import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Layout from '../layout/Layout.jsx'; // For displaying loading state within layout

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    // Show a full-page loading indicator while Auth0 determines auth status
    return <Layout><div className="loading-container">Authenticating...</div></Layout>;
  }

  if (!isAuthenticated) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // Optional: Check user roles if `allowedRoles` array is provided
  // This assumes your user object from Auth0 includes a 'role' property (e.g., in custom claims)
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role; // Access user.role safely
    if (!userRole || !allowedRoles.includes(userRole)) {
      // User is authenticated but does not have an allowed role, redirect to home 
      return <Navigate to="/" replace />; 
    }
  }

  // User is authenticated and has the correct role (if specified)
  // Render the child components (the actual page content)
  return children ? children : <Outlet />;
};

export default ProtectedRoute;