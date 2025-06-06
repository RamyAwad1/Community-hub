import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';

// Page Components
import LandingPage from '../pages/LandingPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import UserDashboardPage from '../pages/UserDashboard.jsx';
import EventDetailsPage from '../pages/EventDetailsPage.jsx';
import EventsPage from '../pages/EventsPage.jsx'; 
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import UserProfilePage from '../pages/UserProfilePage.jsx';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/events" element={<EventsPage />} />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['user', 'organizer', 'admin']}>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Route for specific Event Details */}
        <Route
          path="/events/:eventId"
          element={
            <ProtectedRoute allowedRoles={['user', 'organizer', 'admin']}>
              <EventDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Protected User Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['user', 'organizer', 'admin']}>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </AuthProvider>
  );
}

export default App;