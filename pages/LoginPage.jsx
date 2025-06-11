
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Layout from '../layout/Layout.jsx';
import { Form, Button, Alert } from 'react-bootstrap';

const LoginPage = () => {
    // user is not needed as App.jsx will handle redirection based on it.
    const { login, isAuthenticated, isLoading } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    
    // If isAuthenticated is true, the App.jsx useEffect will handle the redirect.

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // If already authenticated, do not initiate login again.
            if (isAuthenticated && !isLoading) {
                console.log("Already authenticated, preventing re-initiation of Auth0 login.");
                return; // Prevent calling loginWithRedirect if already logged in.
            }
            // This initiates the Auth0 Universal Login redirect.
            // Auth0 handles the full page redirect. No further client-side navigation needed here.
            await login();
        } catch (err) {
            console.error("Auth0 login initiation failed:", err);
            setError("Failed to initiate login. Please try again.");
        }
    };

    // Show a loading message if Auth0 is in the process of authenticating or redirecting
    if (isLoading) {
        return <Layout><div className="text-center my-5">Loading authentication state...</div></Layout>;
    }

   
    // This message is a fallback in case of very unusual timing, but shouldn't be seen typically.
    if (isAuthenticated) {
        return <Layout><div className="text-center my-5">You are already logged in. Redirecting...</div></Layout>;
    }

    return (
        <Layout>
            <div className="login-container">
                <h2>Login</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    {/* These fields are visually present but not directly used by Auth0's Universal Login */}
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100">
                        Login with Auth0
                    </Button>
                </Form>
                <div className="mt-3 text-center">
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </div>
            </div>
        </Layout>
    );
};

export default LoginPage;