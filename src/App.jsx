// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../context/AuthContext.jsx'; // Import useAuth hook

// Page Components 
import LandingPage from '../pages/LandingPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import UserDashboardPage from '../pages/UserDashboard.jsx'; 
import EventDetailsPage from '../pages/EventDetailsPage.jsx';
import EventsPage from '../pages/EventsPage.jsx';
import UserProfilePage from '../pages/UserProfilePage.jsx';
import OrganizerDashboardPage from '../pages/OrganizerDashboardPage.jsx';
import AdminDashboardPage from '../pages/AdminDashboardPage.jsx';
import ApprovedEventsPage from '../pages/ApprovedEventsPage.jsx';
import AdminUsersPage from '../pages/AdminUsersPage.jsx';

// Components
import ProtectedRoute from '../components/ProtectedRoute.jsx'; 

function App() {
  const { isAuthenticated, user, isLoading } = useAuth(); 
  const navigate = useNavigate(); 

  // Effect to handle redirection after authentication
  useEffect(() => {
  
    // Only proceed with redirection logic if Auth is not loading, user is authenticated, and user data is available
    if (!isLoading && isAuthenticated && user) {
      let redirectPath = '/'; // Default redirect path

      // Determine the default landing path based on the user's role
      if (user.role === 'admin') {
        redirectPath = '/admin-dashboard';
      } else if (user.role === 'organizer') {
        redirectPath = '/organizer-dashboard';
      } else if (user.role === 'user') {
        redirectPath = '/dashboard'; // Regular user lands on their dashboard
      } else {
        // Fallback for an authenticated user with an unrecognized or null role
        console.warn("App.jsx useEffect: Authenticated user has an unrecognized or null role, defaulting to /dashboard.");
        redirectPath = '/dashboard';
      }

     

      // Crucial Fix: Only redirect if the user is on a specific pre-authentication page
      // (like the root, login, or Auth0 callback) and not already on their target dashboard.
      const isInitialAuthPage = window.location.pathname === '/' ||
                               window.location.pathname === '/login' ||
                               window.location.pathname.startsWith('/callback'); // Auth0 often uses /callback for silent redirects
      
      if (isInitialAuthPage && window.location.pathname !== redirectPath) {
        // Console log before actual navigation
        console.log(`App.jsx useEffect: Condition met! Navigating from ${window.location.pathname} to ${redirectPath}`);
        navigate(redirectPath, { replace: true }); // Perform the redirect
      } else {
        // Console log if no redirect is needed (already on target path or on another valid page)
        console.log("App.jsx useEffect: Already on target path, or on a different valid page, or no initial redirect needed.");
      }
    } else {
      // Console log if redirect condition is NOT met (e.g., still loading, not authenticated, or user object missing)
      console.log("App.jsx useEffect: Redirect condition NOT met (still loading, not authenticated, or user object missing).");
    }
  }, [isAuthenticated, user, isLoading, navigate]); // Dependencies for useEffect

  return (
    <Routes>
      {/* Public Routes - Accessible to all */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/events" element={<EventsPage />} /> {/* Public events list */}

      {/* Protected Routes - Require Authentication and potentially specific roles */}

      {/* User Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['user', 'organizer', 'admin']}>
            <UserDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Event Details Page */}
      <Route
        path="/events/:eventId" // Dynamic route for event details
        element={
          <ProtectedRoute allowedRoles={['user', 'organizer', 'admin']}>
            <EventDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* User Profile Page */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['user', 'organizer', 'admin']}>
            <UserProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Organizer Dashboard */}
      <Route
        path="/organizer-dashboard"
        element={
          <ProtectedRoute allowedRoles={['organizer', 'admin']}>
            <OrganizerDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Approved Events Page */}
      <Route
        path="/admin/approved-events"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ApprovedEventsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Users Management Page */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;