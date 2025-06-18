
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../layout/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Table, Button } from 'react-bootstrap';
import '../css/AdminDashboardPage.css'; // Reusing admin dashboard CSS

const ApprovedEventsPage = () => {
    const { user, isLoading: authLoading } = useAuth();
    const [approvedEvents, setApprovedEvents] = useState([]);
    const [users, setUsers] = useState([]); // To map organizer IDs to names
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isAdmin = user && user.role === 'admin';

    const fetchApprovedEvents = useCallback(async () => {
        if (!isAdmin) return;
        setLoading(true);
        setError('');
        try {
            const [allEvents, allUsers] = await Promise.all([
                mockApi.fetchAllEventsAdmin(), // Admin sees all events
                mockApi.fetchUsers() // Get all users to map organizer IDs
            ]);
            const filteredApproved = allEvents.filter(event => event.approvalStatus === 'Approved');
            setApprovedEvents(filteredApproved);
            setUsers(allUsers);
        } catch (err) {
            console.error('Error fetching approved events:', err);
            setError('Failed to load approved events. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        if (!authLoading) {
            fetchApprovedEvents();
        }
    }, [authLoading, fetchApprovedEvents]);

    const getOrganizerName = (organizerId) => {
        const organizer = users.find(u => u.id === organizerId);
        return organizer ? organizer.name : 'Unknown Organizer';
    };

    const handleCancelApproval = async (eventId, eventTitle) => {
        if (!window.confirm(`Are you sure you want to cancel the approval for "${eventTitle}"? This will set its status to Pending.`)) {
            return;
        }
        setError('');
        try {
            await mockApi.updateEventApprovalStatus(eventId, 'Pending'); // Change status to Pending
            // Update the local state by removing the event from the approved list
            setApprovedEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
            alert(`Approval for "${eventTitle}" cancelled. Status set to Pending.`);
        } catch (err) {
            console.error(`Error cancelling approval for event:`, err);
            setError(`Failed to cancel approval. Please try again.`);
        }
    };

    if (authLoading || loading) {
        return <Layout><div className="admin-loading-message">Loading approved events...</div></Layout>;
    }

    if (!isAdmin) {
        return (
            <Layout>
                <div className="admin-unauthorized-message">
                    Access Denied. You must be an administrator to view this page.
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="admin-dashboard-container"> {/* Reusing container from admin dashboard */}
                <h2>Approved Events</h2>
                {error && <p className="error-message">{error}</p>}

                {approvedEvents.length === 0 ? (
                    <p className="no-events-message">No approved events to display.</p>
                ) : (
                    <div className="table-responsive">
                        <Table striped bordered hover className="admin-events-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Organizer</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {approvedEvents.map(event => (
                                    <tr key={event.id}>
                                        <td>{event.title}</td>
                                        <td>{getOrganizerName(event.organizerId)}</td>
                                        <td>{new Date(event.date).toLocaleDateString()}</td>
                                        <td>
                                            <Button
                                                variant="warning" // Yellow for 'Cancel'
                                                size="sm"
                                                onClick={() => handleCancelApproval(event.id, event.title)}
                                            >
                                                Cancel Approval
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

export default ApprovedEventsPage;