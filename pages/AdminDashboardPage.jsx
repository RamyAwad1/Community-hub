
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../layout/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import * as mockApi from '../api/mockApi.js';
import { Table, Button } from 'react-bootstrap'; // Import Bootstrap components
import '../css/AdminDashboardPage.css';

const AdminDashboardPage = () => {
    const { user, isLoading: authLoading } = useAuth();
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]); // To map organizer IDs to names
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isAdmin = user && user.role === 'admin';

    // Fetch all events and users (for organizer names)
    const fetchData = useCallback(async () => {
        if (!isAdmin) return;
        setLoading(true);
        setError('');
        try {
            const [allEvents, allUsers] = await Promise.all([
                mockApi.fetchAllEventsAdmin(), // Fetches all events regardless of approval status
                mockApi.fetchUsers() // Gets all users to map organizer IDs to names
            ]);
            setEvents(allEvents);
            setUsers(allUsers);
        } catch (err) {
            setError('Failed to load data. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        if (!authLoading) {
            fetchData();
        }
    }, [authLoading, fetchData]);

    // Helper to get organizer's name from their ID
    const getOrganizerName = (organizerId) => {
        const organizer = users.find(u => u.id === organizerId);
        return organizer ? organizer.name : 'Unknown Organizer';
    };

    // Handler for approving or rejecting an event
    const handleApproveReject = async (eventId, status) => {
        setError('');
        setLoading(true); // Show loading feedback
        try {
            await mockApi.updateEventApprovalStatus(eventId, status);
            // Update the local state with the new status
            setEvents(prevEvents =>
                prevEvents.map(event =>
                    event.id === eventId ? { ...event, approvalStatus: status } : event
                )
            );
        } catch (err) {
            setError(`Failed to update event status: ${err.message}`);
            console.error(err);
        } finally {
            setLoading(false); // Hide loading feedback
        }
    };

    if (authLoading || loading) {
        return <Layout><div className="admin-loading-message">Loading admin dashboard...</div></Layout>;
    }

    if (!isAdmin) {
        return <Layout><div className="admin-unauthorized-message">Access Denied. You must be an admin to view this page.</div></Layout>;
    }

    return (
        <Layout>
            <div className="admin-dashboard-container">
                <h2>Admin Event Approval Dashboard</h2>
                {error && <p className="error-message">{error}</p>}

                {events.length === 0 ? (
                    <p>No events to display.</p>
                ) : (
                    <div className="table-responsive"> {/* Bootstrap for responsiveness */}
                        <Table striped bordered hover className="admin-events-table"> {/* Bootstrap table classes */}
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Organizer</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(event => (
                                    <tr key={event.id}>
                                        <td>{event.title}</td>
                                        <td>{getOrganizerName(event.organizerId)}</td>
                                        <td>{new Date(event.date).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-${event.approvalStatus.toLowerCase()}`}>
                                                {event.approvalStatus}
                                            </span>
                                        </td>
                                        <td className="admin-actions">
                                            <Button
                                                variant="success" // Bootstrap success color
                                                size="sm"
                                                onClick={() => handleApproveReject(event.id, 'Approved')}
                                                disabled={event.approvalStatus === 'Approved'} // Disable if already approved
                                                className="me-2" // Margin-end for spacing
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="danger" // Bootstrap danger color
                                                size="sm"
                                                onClick={() => handleApproveReject(event.id, 'Rejected')}
                                                disabled={event.approvalStatus === 'Rejected'} // Disable if already rejected
                                            >
                                                Reject
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminDashboardPage;