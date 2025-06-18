
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../layout/Layout.jsx'; // Corrected path to Layout
import { useAuth } from '../context/AuthContext.jsx';
import { eventsApi, usersApi } from '../src/utils/api.js'; // Use eventsApi and usersApi
import { Link } from 'react-router-dom';
import '../css/AdminDashboardPage.css'; // Corrected path to AdminDashboard.css

const AdminDashboardPage = () => {
  const { user, token, isLoading: authLoading, logout } = useAuth(); // Get token and logout
  const [events, setEvents] = useState([]);
  // const [users, setUsers] = useState([]); // Removed: organizer_name is joined in backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user && user.role === 'admin';

  // Fetch all events for admin dashboard
  const fetchData = useCallback(async () => {
    if (!isAdmin || !token) { // Ensure admin role and token are present
      setLoading(false);
      if (!token) setError("Authentication token missing. Please re-login.");
      else setError("You must be an admin to view this page."); // Fallback if isAdmin check fails early
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Use the correct API call with the token
      const allEvents = await eventsApi.getAllEventsAdmin(token);
      setEvents(allEvents);
      // No need to fetch users separately as organizer_name is joined in events query
    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
      const errMessage = err.message || 'Failed to load data. Please try again.';
      setError(errMessage);
      // If unauthorized, log out
      if (err.message.includes('401') || err.message.includes('403')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [isAdmin, token, logout]);

  useEffect(() => {
    if (!authLoading) { // Wait for auth to finish loading
      fetchData();
    }
  }, [authLoading, fetchData]);

  // Handler for approving or rejecting an event
  const handleApproveReject = async (eventId, status) => {
    setError('');
    setLoading(true); // Show loading feedback
    try {
      if (status === 'approved') {
        await eventsApi.approveEvent(eventId, token);
      } else if (status === 'rejected') {
        await eventsApi.rejectEvent(eventId, token); // Call new reject API
      }
      
      // After successful update, refetch data to reflect changes
      await fetchData(); 
      
    } catch (err) {
      console.error(`Failed to update event status to ${status}:`, err);
      setError(`Failed to update event status: ${err.message}`);
      if (err.message.includes('401') || err.message.includes('403')) {
        logout();
      }
    } finally {
      setLoading(false); // Hide loading feedback
    }
  };

  if (authLoading || loading) {
    // Apply custom loading message class
    return <Layout><div className="admin-loading-message">Loading admin dashboard...</div></Layout>;
  }

  if (!isAdmin) {
    // Apply custom unauthorized message class
    return <Layout><div className="admin-unauthorized-message">Access Denied. You must be an admin to view this page.</div></Layout>;
  }

  return (
    <Layout>
      {/* Apply custom container class */}
      <div className="admin-dashboard-container">
        {/* Custom h2 rule from CSS */}
        <h2>Admin Event Approval Dashboard</h2>
        {error && <p className="error-message">{error}</p>} {/* Apply custom error class */}

        {/* Quick Stats/Summary (Using Tailwind grid and custom bg/shadow) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold text-gray-700">Total Events</h3>
            <p className="text-3xl font-bold text-blue-600">{events.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold text-gray-700">Pending Events</h3>
            <p className="text-3xl font-bold text-yellow-600">{events.filter(e => e.status === 'pending').length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold text-gray-700">Approved Events</h3>
            <p className="text-3xl font-bold text-green-600">{events.filter(e => e.status === 'approved').length}</p>
          </div>
        </div>

        {events.length === 0 ? (
          <p className="no-events-message">No events to display.</p> // Apply custom no-events class
        ) : (
          <div className="table-responsive"> {/* Apply custom responsiveness class */}
            {/* Standard HTML table with custom and Tailwind classes */}
            <table className="min-w-full divide-y divide-gray-200 admin-events-table">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map(event => (
                  <tr key={event.event_id}> {/* Use event.event_id as key */}
                    <td>{event.title}</td>
                    <td>{event.organizer_name}</td> {/* Now directly from backend join */}
                    <td>{new Date(event.date).toLocaleDateString()}</td>
                    <td>
                      {/* Apply custom status classes dynamically based on event.status */}
                      <span className={`status-${event.status.toLowerCase()}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </td>
                    <td className="admin-actions"> {/* Apply custom actions class */}
                      <Link to={`/admin/events/${event.event_id}/details`} className="text-indigo-600 hover:text-indigo-900 mr-4">View</Link>
                      <button
                        onClick={() => handleApproveReject(event.event_id, 'approved')} // Use event.event_id
                        disabled={event.status === 'approved' || event.status === 'rejected'} // Disable if already handled
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-2 rounded-lg text-xs mr-2" // Tailwind for button
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproveReject(event.event_id, 'rejected')} // Use event.event_id
                        disabled={event.status === 'approved' || event.status === 'rejected'} // Disable if already handled
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded-lg text-xs" // Tailwind for button
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;