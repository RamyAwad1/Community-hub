
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../layout/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';

import { Table, Button, Modal, Form } from 'react-bootstrap';
import '../css/AdminUsersPage.css'; 

const AdminUsersPage = () => {
    const { user, isLoading: authLoading } = useAuth();
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [error, setError] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // User being edited
    const [editFormData, setEditFormData] = useState({ name: '', email: '', role: '' });

    const isAdmin = user && user.role === 'admin';

    const fetchAllUsers = useCallback(async () => {
        if (!isAdmin) return;
        setLoadingUsers(true);
        setError('');
        try {
            const allUsers = await mockApi.fetchUsers();
            setUsers(allUsers);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoadingUsers(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        if (!authLoading) {
            fetchAllUsers();
        }
    }, [authLoading, fetchAllUsers]);

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"? This cannot be undone.`)) {
            return;
        }
        setError('');
        try {
            await mockApi.deleteUser(userId);
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userId)); // Update UI
            alert(`User "${userName}" deleted successfully.`);
        } catch (err) {
            console.error('Error deleting user:', err);
            setError(`Failed to delete user: ${err.message}`);
        }
    };

    const handleEditClick = (userToEdit) => {
        setCurrentUser(userToEdit);
        setEditFormData({
            name: userToEdit.name || '',
            email: userToEdit.email || '',
            role: userToEdit.role || '',
        });
        setShowEditModal(true);
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        setError('');
        setLoadingUsers(true); // Indicate saving
        try {
            await mockApi.updateUser(currentUser.id, editFormData);
            setShowEditModal(false);
            setCurrentUser(null);
            await fetchAllUsers(); // Re-fetch all users to update the table
            alert('User updated successfully!');
        } catch (err) {
            console.error('Error updating user:', err);
            setError(`Failed to update user: ${err.message}`);
        } finally {
            setLoadingUsers(false);
        }
    };

    if (authLoading || loadingUsers) {
        return <Layout><div className="admin-users-loading">Loading users...</div></Layout>;
    }

    if (!isAdmin) {
        return (
            <Layout>
                <div className="admin-users-unauthorized">
                    Access Denied. You must be an administrator to view this page.
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="admin-users-container">
                <h2>Admin - User Management</h2>
                {error && <p className="error-message">{error}</p>}

                {users.length === 0 ? (
                    <p className="no-users-message">No users found.</p>
                ) : (
                    <div className="table-responsive">
                        <Table striped bordered hover className="admin-users-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>{u.role}</td>
                                        <td>
                                            <Button
                                                variant="info" // Bootstrap info color
                                                size="sm"
                                                onClick={() => handleEditClick(u)}
                                                className="me-2"
                                            >
                                                Edit
                                            </Button>
                                            {/* Prevent admin from deleting themselves, or potentially the last admin */}
                                            {u.id !== user.id && (
                                                <Button
                                                    variant="danger" // Bootstrap danger color
                                                    size="sm"
                                                    onClick={() => handleDeleteUser(u.id, u.name)}
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}

                {/* Edit User Modal */}
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {currentUser && (
                            <Form onSubmit={handleSaveUser}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={editFormData.name}
                                        onChange={handleEditFormChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={editFormData.email}
                                        onChange={handleEditFormChange}
                                        required
                                        readOnly // Email often not editable
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Role</Form.Label>
                                    <Form.Select
                                        name="role"
                                        value={editFormData.role}
                                        onChange={handleEditFormChange}
                                        required
                                    >
                                        <option value="user">User</option>
                                        <option value="organizer">Organizer</option>
                                        <option value="admin">Admin</option>
                                    </Form.Select>
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    {loadingUsers ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Form>
                        )}
                    </Modal.Body>
                </Modal>
            </div>
        </Layout>
    );
};

export default AdminUsersPage;