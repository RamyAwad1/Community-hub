import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../layout/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { eventsApi } from '../src/utils/api.js';
import { Link } from 'react-router-dom';
import { Button, Alert } from 'react-bootstrap';
import '../css/EventsPage.css';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { isAuthenticated, isLoading: authLoading, token, user } = useAuth();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedEvents = await eventsApi.getAllApprovedEvents();
      setEvents(fetchedEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message || "Failed to fetch events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRegisterClick = async (eventId, eventTitle) => {
    if (!isAuthenticated) {
      setError("Please log in to register for an event.");
      return;
    }
    setSuccessMessage(null);
    setError(null);

    try {
      await eventsApi.registerForEvent(eventId, token);
      setSuccessMessage(`Successfully registered for "${eventTitle}"!`);
    } catch (err) {
      console.error("Error registering for event:", err);
      setError(err.message || `Failed to register for "${eventTitle}". Please try again.`);
    }
  };

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="text-center py-10">
          <p className="text-lg text-gray-600">Loading events...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert variant="danger" className="m-4">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">Please try again later.</p>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container my-5">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Upcoming Events</h1>

        {successMessage && <Alert variant="success" className="mb-4">{successMessage}</Alert>}
        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        {events.length === 0 ? (
          <p className="text-center text-xl text-gray-600">No approved events available at the moment. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.event_id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">
                <img
                  src={event.image_url || `https://placehold.co/400x250/ADD8E6/000000?text=${encodeURIComponent(event.title || 'Event')}`}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => e.target.src = `https://placehold.co/400x250/ADD8E6/000000?text=No+Image`}
                />
                <div className="p-4 flex-grow">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h2>
                  <p className="text-gray-600 text-sm mb-1">
                    <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600 text-sm mb-1">
                    <span className="font-medium">Time:</span> {event.time}
                  </p>
                  <p className="text-gray-600 text-sm mb-3">
                    <span className="font-medium">Location:</span> {event.location}
                  </p>
                  <p className="text-gray-700 text-base mb-4 line-clamp-3">{event.description}</p>
                </div>
                <div className="p-4 border-t border-gray-200 flex justify-between items-center mt-auto">
                  {isAuthenticated ? (
                    <Button
                      variant="primary"
                      onClick={() => handleRegisterClick(event.event_id, event.title)}
                      className="w-full"
                    >
                      Register
                    </Button>
                  ) : (
                    <Link to="/login" className="btn btn-secondary w-full text-center">
                      Log in to Register
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EventsPage;
