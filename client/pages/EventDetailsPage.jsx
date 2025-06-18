import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../layout/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { mockEventsData } from '../data/mockEventsData.js'; // Centralized data
import '../css/EventDetailsPage.css';

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [isUserRegistered, setIsUserRegistered] = useState(false);

  useEffect(() => {
    setLoadingEvent(true);
    const foundEvent = mockEventsData.find(e => e.id === eventId); // Use centralized data
    if (foundEvent) {
      setEvent(foundEvent);
      setIsUserRegistered(foundEvent.isRegistered);
    } else {
      setEvent(null);
    }
    setLoadingEvent(false);
  }, [eventId]);

  if (isLoading || loadingEvent) {
    return <Layout><div className="event-details-loading">Loading event details...</div></Layout>;
  }

  if (!event) {
    return <Layout><div className="event-details-not-found">Event not found.</div></Layout>;
  }

  const handleRsvp = () => {
    if (!isAuthenticated) { alert('Please log in to RSVP!'); return; }
    alert(`You RSVP'd for "${event.title}"!`);
    setIsUserRegistered(true);
  };

  const handleVolunteer = () => {
    if (!isAuthenticated) { alert('Please log in to volunteer!'); return; }
    alert(`You volunteered for "${event.title}"!`);
    setIsUserRegistered(true);
  };

  return (
    <Layout>
      <div className="event-details-container">
        <div className="event-header">
          <img src={event.picture} alt={event.title} className="event-picture" />
          <h1>{event.title}</h1>
        </div>

        <div className="event-info-section">
          <p className="event-description">{event.description}</p>
          <div className="event-meta">
            <p><strong>Date:</strong> {event.date}</p>
            <p><strong>Time:</strong> {event.time}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Organizer:</strong> {event.organizer.name}</p>
          </div>
        </div>

        <div className="event-map-placeholder">
          <h3>Event Location</h3>
          <div className="map-embed-area">
            Map of {event.location} will be embedded here soon!
            <br />
            (Latitude: {event.latitude}, Longitude: {event.longitude})
          </div>
        </div>

        {isAuthenticated && (
          <div className="event-actions">
            {isUserRegistered ? (
              <button className="btn registered-btn" disabled>
                Registered for this Event!
              </button>
            ) : (
              <>
                <button className="btn rsvp-btn" onClick={handleRsvp}>
                  RSVP
                </button>
                <button className="btn volunteer-btn" onClick={handleVolunteer}>
                  Volunteer
                </button>
              </>
            )}
          </div>
        )}
        {!isAuthenticated && (
            <p className="login-prompt">Please <a href="/login">log in</a> to RSVP or Volunteer.</p>
        )}
      </div>
    </Layout>
  );
};

export default EventDetailsPage;