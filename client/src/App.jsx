import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Page Components
import LandingPage from '../pages/LandingPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import UserDashboardPage from '../pages/UserDashboard.jsx';
import EventDetailsPage from '../pages/EventDetailsPage.jsx';
import EventsPage from '../pages/EventsPage.jsx';
import UserProfilePage from '../pages/UserProfilePage.jsx';
import OrganizerDashboardPage from '../pages/OrganizerDashboardPage.jsx';
import AdminDashboardPage from '../pages/AdminDashboardPage.jsx';
import ApprovedEventsPage from '../pages/ApprovedEventsPage.jsx';
import AdminUsersPage from '../pages/AdminUsersPage.jsx';
// NEW: Import the NominatimSearchPage
import NominatimSearchPage from '../pages/NominatimSearchPage.jsx';

// Components
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import Layout from '../layout/Layout.jsx'; // Corrected path to Layout

function App() {
  const { isAuthenticated, user, isLoading } = useAuth(); // Auth is now custom/dummy
  const navigate = useNavigate();

  useEffect(() => {
    
    if (!isLoading && isAuthenticated && user) {
        console.log(`App.jsx: User is authenticated. Role: ${user.role || 'N/A'}`);
    } else {
        console.log("App.jsx: User is not authenticated or still loading custom auth state.");
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  return (
    <Routes>
      
      <Route path="/" element={<LandingPage/>}></Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:eventId" element={<EventDetailsPage />} />
     
      <Route path="/location-search" element={<NominatimSearchPage />} />

      {/* Protected Routes - These will currently rely on the dummy isAuthenticated from AuthContext,
          so they will likely always redirect to login until custom auth is built. */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['user', 'organizer', 'admin']}>
            <UserDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['user', 'organizer', 'admin']}>
            <UserProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizer-dashboard"
        element={
          <ProtectedRoute allowedRoles={['organizer', 'admin']}>
            <OrganizerDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/approved-events"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ApprovedEventsPage />
          </ProtectedRoute>
        }
      />

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
