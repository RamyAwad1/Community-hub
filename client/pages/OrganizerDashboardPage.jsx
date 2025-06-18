
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../layout/Layout.jsx'; // Corrected path to Layout
import { useAuth } from '../context/AuthContext.jsx';
import { eventsApi } from '../src/utils/api.js';
import { Form, Button, Alert } from 'react-bootstrap'; // Keep Form, Button, Alert for Bootstrap components
import '../css/OrganizerDashboardPage.css'; // Import the custom CSS file

const OrganizerDashboardPage = () => {
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const [organizerEvents, setOrganizerEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(null); // For success messages
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null); // Null if not editing, event object if editing
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);


  // State for new/edited event form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '', // Will be a string in "YYYY-MM-DDTHH:mm" format for datetime-local
    location: '',
    capacity: '', // Added capacity based on backend schema
    image_url: '' // Changed to image_url to match backend
  });

  const isOrganizer = user && (user.role === 'organizer' || user.role === 'admin'); // Admins can also manage events

  // Fetch events for the logged-in organizer
  const fetchEvents = useCallback(async () => {
    if (!isOrganizer || !token) {
      setLoadingEvents(false);
      setError("Authentication required or not authorized to view this page.");
      return;
    }
    setLoadingEvents(true);
    setError('');
    try {
      // Use the actual API call
      const events = await eventsApi.getOrganizerEvents(token);
      setOrganizerEvents(events);
    } catch (err) {
      console.error("Error fetching organizer events:", err);
      setError(err.message || 'Failed to load events.');
      if (err.message.includes('401') || err.message.includes('403')) {
        logout(); // Logout on auth errors
      }
    } finally {
      setLoadingEvents(false);
    }
  }, [user, isOrganizer, token, logout]); // Added user and logout to dependencies

  useEffect(() => {
    if (!authLoading && user) { // Only fetch if auth is not loading and user data is available
      fetchEvents();
    }
  }, [user, authLoading, fetchEvents]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOrUpdateEvent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage(null);
    setLoadingEvents(true);

    // Split date and time for backend if date is datetime-local format
    let eventDate = formData.date;
    let eventTime = '';
    if (formData.date) {
        const dateTimeParts = formData.date.split('T');
        eventDate = dateTimeParts[0]; //YYYY-MM-DD
        eventTime = dateTimeParts[1]; // HH:mm
    }
    
    // Construct payload for backend
    const payload = {
        title: formData.title,
        description: formData.description,
        date: eventDate,
        time: eventTime,
        location: formData.location,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
        image_url: formData.image_url, // Matches backend field
    };

    try {
      if (editingEvent) {
        // Use real API for update
        await eventsApi.updateEvent(editingEvent.event_id, payload, token);
        setSuccessMessage('Event updated successfully!');
      } else {
        // Use real API for creation
        await eventsApi.createEvent(payload, token);
        setSuccessMessage('Event created successfully! It is now pending approval.');
      }
      setFormData({ title: '', description: '', date: '', location: '', capacity: '', image_url: '' });
      setShowCreateForm(false);
      setEditingEvent(null);
      await fetchEvents(); // Re-fetch events to update list
    } catch (err) {
      console.error(`Failed to ${editingEvent ? 'update' : 'create'} event:`, err);
      setError(err.message || `Failed to ${editingEvent ? 'update' : 'create'} event. Please try again.`);
      if (err.message.includes('401') || err.message.includes('403')) {
        logout();
      }
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleEditClick = (event) => {
    setEditingEvent(event);
    // Combine date and time for datetime-local input format (YYYY-MM-DDTHH:mm)
    const combinedDateTime = `${event.date.split('T')[0]}T${event.time}`;
    setFormData({
      title: event.title,
      description: event.description,
      date: combinedDateTime,
      location: event.location,
      capacity: event.capacity || '',
      image_url: event.image_url || '' // Changed to image_url
    });
    setShowCreateForm(true);
  };

  const confirmDelete = (event) => {
    setEventToDelete(event);
    setShowConfirmDelete(true);
  };

  const executeDelete = async () => {
    if (!eventToDelete) return;
    setError('');
    setSuccessMessage(null);
    setLoadingEvents(true);
    setShowConfirmDelete(false); // Hide confirmation modal

    try {
      // Use real API for deletion
      await eventsApi.deleteEvent(eventToDelete.event_id, token);
      setSuccessMessage(`Event "${eventToDelete.title}" deleted successfully!`);
      await fetchEvents(); // Re-fetch events
      setEventToDelete(null);
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(err.message || `Failed to delete event.`);
      if (err.message.includes('401') || err.message.includes('403')) {
        logout();
      }
    } finally {
      setLoadingEvents(false);
    }
  };

  // Conditional rendering for loading, error, and unauthorized states
  if (authLoading || loadingEvents) { // Using loadingEvents for overall component loading
    return <Layout><div className="organizer-loading-message">Loading organizer dashboard...</div></Layout>;
  }

  if (!user || !isOrganizer) {
    return (
      <Layout>
        <div className="organizer-access-denied-message">
          Access Denied. You must be logged in as an organizer to view this page.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="organizer-dashboard-container">
        <h1>Organizer Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome, {user?.name || 'Organizer'}! Manage your events here.</p>

        {/* Messages */}
        {error && <Alert variant="danger" className="organizer-error-message">{error}</Alert>}
        {successMessage && <Alert variant="success" className="organizer-success-message">{successMessage}</Alert>}

        {/* Toggle Button for Create Event Form */}
        <button
          className="create-event-toggle-btn"
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingEvent(null); // Clear editing state when toggling form
            setFormData({ title: '', description: '', date: '', location: '', capacity: '', image_url: '' }); // Reset form
            setError(null); // Clear messages
            setSuccessMessage(null);
          }}
        >
          {showCreateForm ? 'Cancel Creation/Editing' : 'Create New Event'}
        </button>

        {/* Event Creation/Edit Form (Conditionally Rendered) */}
        {showCreateForm && (
          <section className="mb-10 event-creation-section">
            <h3>{editingEvent ? 'Edit Event' : 'Submit New Event'}</h3>
            <Form onSubmit={handleCreateOrUpdateEvent} className="event-form">
              <Form.Group className="mb-3 form-group" controlId="eventTitle">
                <Form.Label>Event Title</Form.Label>
                <Form.Control type="text" name="title" value={formData.title} onChange={handleFormChange} placeholder="Enter event title" required />
              </Form.Group>

              <Form.Group className="mb-3 form-group" controlId="eventDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleFormChange} placeholder="Brief description of the event" />
              </Form.Group>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Group className="mb-3 form-group" controlId="eventDate">
                  <Form.Label>Date & Time</Form.Label>
                  <Form.Control type="datetime-local" name="date" value={formData.date} onChange={handleFormChange} required />
                </Form.Group>
                {/* Removed separate time input as datetime-local handles both */}
              </div>

              <Form.Group className="mb-3 form-group" controlId="eventLocation">
                <Form.Label>Location</Form.Label>
                <Form.Control type="text" name="location" value={formData.location} onChange={handleFormChange} placeholder="e.g., Community Hall, Online" required />
              </Form.Group>

              <Form.Group className="mb-3 form-group" controlId="eventCapacity">
                <Form.Label>Capacity (Optional)</Form.Label>
                <Form.Control type="number" name="capacity" value={formData.capacity} onChange={handleFormChange} placeholder="Max attendees" />
              </Form.Group>

              <Form.Group className="mb-4 form-group" controlId="eventImageUrl">
                <Form.Label>Image URL (Optional)</Form.Label>
                <Form.Control type="text" name="image_url" value={formData.image_url} onChange={handleFormChange} placeholder="URL for event banner image" />
              </Form.Group>

              <Button type="submit" disabled={loadingEvents} className="btn primary-btn">
                {loadingEvents ? 'Saving...' : (editingEvent ? 'Save Changes' : 'Create Event')}
              </Button>
            </Form>
          </section>
        )}

        {/* My Events Section */}
        <section>
          <h2>My Created Events</h2>
          {organizerEvents.length === 0 ? (
            <p className="no-events-message">You haven't created any events yet.</p>
          ) : (
            <div className="event-cards-grid">
              {organizerEvents.map(event => (
                <div key={event.event_id} className="event-card">
                  {/* Fallback for image_url if not provided */}
                  <img src={event.image_url || `https://placehold.co/300x180/ADD8E6/000000?text=${encodeURIComponent(event.title || 'Event')}`}
                       alt={event.title}
                       className="event-card-image"
                       onError={(e) => e.target.src = `https://placehold.co/300x180/ADD8E6/000000?text=No+Image`}
                  />
                  <div className="event-card-content">
                    <h4>{event.title}</h4>
                    <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {event.time}</p> {/* Time is now separate from date */}
                    <p><strong>Location:</strong> {event.location}</p>
                    {event.capacity && <p><strong>Capacity:</strong> {event.capacity}</p>}
                    <p>
                      <strong>Status:</strong>
                      <span className={`status-${event.status ? event.status.toLowerCase() : ''}`}>
                         {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'N/A'}
                      </span>
                    </p>
                  </div>
                  <div className="event-actions">
                    {/* View Details button (placeholder for now) */}
                    <button className="btn secondary-btn" onClick={() => console.log('View details for', event.event_id)}>View Details</button>
                    <button className="btn secondary-btn" onClick={() => handleEditClick(event)}>Edit</button>
                    {/* Replaced window.confirm with internal confirmation */}
                    <button className="btn danger-btn" onClick={() => confirmDelete(event)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Custom Confirmation Modal for Deletion */}
        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center">
              <h4 className="text-xl font-bold mb-4">Confirm Deletion</h4>
              <p className="mb-6">Are you sure you want to delete the event "{eventToDelete?.title}"?</p>
              <div className="flex justify-center gap-4">
                <Button variant="danger" onClick={executeDelete}>Yes, Delete</Button>
                <Button variant="secondary" onClick={() => setShowConfirmDelete(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrganizerDashboardPage;
