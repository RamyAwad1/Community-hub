
import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import * as mockApi from '../api/mockApi.js'; // Import mock API functions
import '../css/OrganizerDashboardPage.css';

const OrganizerDashboardPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [organizerEvents, setOrganizerEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null); // Null if not editing, event object if editing

  // State for new/edited event form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    imageUrl: ''
  });

  const isOrganizer = user && user.role === 'organizer';

  // Fetch events for the logged-in organizer
  const fetchEvents = async () => {
    if (!user || !isOrganizer) return;
    setLoadingEvents(true);
    setError('');
    try {
      const events = await mockApi.fetchOrganizerEvents(user.id);
      setOrganizerEvents(events);
    } catch (err) {
      setError('Failed to load events.');
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isOrganizer) {
      fetchEvents();
    }
  }, [user, authLoading, isOrganizer]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOrUpdateEvent = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingEvents(true);

    try {
      if (editingEvent) {
        await mockApi.updateEvent(editingEvent.id, formData);
      } else {
        await mockApi.createEvent({ ...formData, organizerId: user.id });
      }
      setFormData({ title: '', description: '', date: '', location: '', imageUrl: '' });
      setShowCreateForm(false);
      setEditingEvent(null);
      await fetchEvents(); // Re-fetch events to update list
    } catch (err) {
      setError(`Failed to ${editingEvent ? 'update' : 'create'} event: ${err.message}`);
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleEditClick = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date.substring(0, 16), // Format for datetime-local input
      location: event.location,
      imageUrl: event.imageUrl || ''
    });
    setShowCreateForm(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    setError('');
    setLoadingEvents(true);
    try {
      await mockApi.deleteEvent(eventId);
      await fetchEvents(); // Re-fetch events
    } catch (err) {
      setError(`Failed to delete event: ${err.message}`);
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  if (authLoading) {
    return <Layout><div className="organizer-dashboard-loading">Loading user authentication...</div></Layout>;
  }

  if (!user || !isOrganizer) {
    return (
      <Layout>
        <div className="organizer-dashboard-unauthorized">
          You must be logged in as an organizer to view this page.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="organizer-dashboard-container">
        <h2>Organizer Dashboard</h2>
        {error && <p className="error-message">{error}</p>}

        <button 
          className="btn primary-btn create-event-toggle-btn"
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingEvent(null);
            setFormData({ title: '', description: '', date: '', location: '', imageUrl: '' });
          }}
        >
          {showCreateForm ? 'Cancel Creation/Editing' : 'Create New Event'}
        </button>

        {showCreateForm && (
          <div className="event-form-section">
            <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
            <form onSubmit={handleCreateOrUpdateEvent} className="event-form">
              <div className="form-group">
                <label htmlFor="title">Title:</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="date">Date & Time:</label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Location:</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="imageUrl">Image URL (Optional):</label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleFormChange}
                />
              </div>
              <button type="submit" className="btn primary-btn">
                {loadingEvents ? 'Saving...' : (editingEvent ? 'Save Changes' : 'Create Event')}
              </button>
            </form>
          </div>
        )}

        <div className="organizer-event-list">
          <h3>Your Events</h3>
          {loadingEvents ? (
            <p>Loading your events...</p>
          ) : organizerEvents.length === 0 ? (
            <p>You haven't created any events yet.</p>
          ) : (
            <div className="event-cards-grid">
              {organizerEvents.map(event => (
                <div key={event.id} className="event-card">
                  {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="event-card-image" />}
                  <div className="event-card-content">
                    <h4>{event.title}</h4>
                    <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
                    <p><strong>Location:</strong> {event.location}</p>
                    <p><strong>Approval Status:</strong> <span className={`status-${event.approvalStatus.toLowerCase()}`}>{event.approvalStatus}</span></p>
                    <p><strong>RSVPs:</strong> {event.rsvps ? event.rsvps.length : 0}</p>
                    <div className="event-actions">
                      <button className="btn secondary-btn" onClick={() => handleEditClick(event)}>Edit</button>
                      <button className="btn danger-btn" onClick={() => handleDeleteEvent(event.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrganizerDashboardPage;