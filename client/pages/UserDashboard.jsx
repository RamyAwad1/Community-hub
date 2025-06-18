import React from 'react';
import Layout from '../layout/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import EventCard from '../components/EventCard.jsx';
import { mockEventsData } from '../data/mockEventsData.js'; // Centralized data
import '../css/UserDashboardPage.css';

// Leaderboard Component (defined here as it's only used on dashboard)
const Leaderboard = () => {
  const mockLeaderboardData = [
    { id: 1, name: 'Alice Smith', points: 1250 },
    { id: 2, name: 'Bob Johnson', points: 1100 },
    { id: 3, name: 'Charlie Brown', points: 980 },
    { id: 4, name: 'Diana Prince', points: 850 },
    { id: 5, name: 'Ethan Hunt', points: 720 },
  ];

  return (
    <div className="leaderboard">
      <h3>Top Participants</h3>
      <ul>
        {mockLeaderboardData.map(entry => (
          <li key={entry.id}>
            {entry.name}: {entry.points} pts
          </li>
        ))}
      </ul>
    </div>
  );
};

const UserDashboardPage = () => {
  const { user, isLoading } = useAuth(); // isAuthenticated not needed here for EventCard

  if (isLoading) {
    return (
      <Layout>
        <div className="dashboard-loading">Loading dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="user-dashboard-container">
        <div className="welcome-section">
          <h2>Welcome, {user ? user.name || user.email || user.nickname : 'Guest'}!</h2>
          <p>Here are some upcoming events for you.</p>
        </div>

        <div className="dashboard-content-wrapper">
          <div className="events-grid">
            {mockEventsData.map(event => ( // Use centralized data
              <EventCard key={event.id} event={event} /> /* EventCard handles its own clickability */
            ))}
          </div>
          <Leaderboard />
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboardPage;