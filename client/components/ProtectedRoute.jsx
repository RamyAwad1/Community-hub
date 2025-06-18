
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  console.log("ProtectedRoute: Checking access for roles:", allowedRoles);
  console.log("ProtectedRoute: isAuthenticated:", isAuthenticated, "isLoading:", isLoading, "user:", user);


  // If still loading Auth state, show nothing or a loading spinner
  if (isLoading) {
    console.log("ProtectedRoute: Still loading authentication state...");
    return <div>Loading authentication...</div>; // Or a proper loading spinner/component
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated. Redirecting to /login.");
    return <Navigate to="/login" replace />;
  }

  // If authenticated but user object is null (shouldn't happen with AuthContext), redirect
  if (!user) {
      console.warn("ProtectedRoute: Authenticated but user object is null. Redirecting to /login.");
      return <Navigate to="/login" replace />;
  }

  // Check if user's role is allowed
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user.role) {
      console.warn(`ProtectedRoute: User has no role defined. Redirecting to home.`);
      return <Navigate to="/" replace />;
    }
    if (!allowedRoles.includes(user.role)) {
      console.warn(`ProtectedRoute: User role '${user.role}' not allowed for this route. Required roles: ${allowedRoles.join(', ')}. Redirecting to home.`);
      // Redirect to a specific "unauthorized" page or home
      return <Navigate to="/" replace />; // Or '/unauthorized'
    }
  }

  console.log("ProtectedRoute: Access granted for role:", user.role);
  // If all checks pass, render the children (the protected content)
  return children;
};

export default ProtectedRoute;