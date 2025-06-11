import React from 'react';
import Layout from '../layout/Layout.jsx';
import EventCard from '../components/EventCard.jsx';
import { useAuth } from '../context/AuthContext.jsx'; // To show login message
import { mockEventsData } from '../data/mockEventsData.js'; // Centralized data
import '../css/EventsPage.css';

const EventsPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <div className="events-page-container">
        <h2>Upcoming Events</h2>
        {!isAuthenticated && ( // Message for non-logged-in users
          <p className="events-page-message">
            Log in to view event details, RSVP, or volunteer! (<a href="/login">Login here</a>)
          </p>
        )}
        <div className="events-grid">
          {mockEventsData.map(event => (
            <EventCard key={event.id} event={event} /> /* EventCard handles its own clickability */
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default EventsPage;