import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { Home, LogIn, LogOut, User, Users, Calendar, Settings, MapPin } from 'lucide-react';

import '../css/Nav.css';

const AppNavbar = () => {
  const { isAuthenticated, user, logout, login } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogin = () => {
    login();
  };

  const gradientBackgroundStyle = {
    background: 'linear-gradient(to right, #2e3b55, #4d3b8e)',
  };

  return (
    <Navbar expand="lg" className="shadow-lg rounded-b-xl" style={gradientBackgroundStyle}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="text-white text-3xl font-extrabold flex items-center space-x-2">
          <Calendar size={32} className="text-purple-200" />
          <span>Community Hub</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/events" className="text-white hover-blue-200 d-flex align-items-center px-3 py-2 rounded-lg">
              <Home size={20} className="me-1" />
              <span>Events</span>
            </Nav.Link>

            <Nav.Link as={Link} to="/location-search" className="text-white hover-blue-200 d-flex align-items-center px-3 py-2 rounded-lg">
              <MapPin size={20} className="me-1" />
              <span>Location Search</span>
            </Nav.Link>

            {isAuthenticated ? (
              <>
                {user && user.role === 'admin' && (
                  <Nav.Link as={Link} to="/admin-dashboard" className="text-white hover-blue-200 d-flex align-items-center px-3 py-2 rounded-lg">
                    <Settings size={20} className="me-1" />
                    <span>Admin Panel</span>
                  </Nav.Link>
                )}
                {user && user.role === 'organizer' && (
                  <Nav.Link as={Link} to="/organizer-dashboard" className="text-white hover-blue-200 d-flex align-items-center px-3 py-2 rounded-lg">
                    <Calendar size={20} className="me-1" />
                    <span>My Events</span>
                  </Nav.Link>
                )}
                <Nav.Link as={Link} to="/profile" className="text-white hover-blue-200 d-flex align-items-center px-3 py-2 rounded-lg">
                  <User size={20} className="me-1" />
                  <span>Profile</span>
                </Nav.Link>
                <Button onClick={handleLogout} variant="danger" className="ms-3 d-flex align-items-center">
                  <LogOut size={20} className="me-1" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleLogin} variant="success" className="ms-3 d-flex align-items-center">
                  <LogIn size={20} className="me-1" />
                  <span>Login</span>
                </Button>
                <Nav.Link as={Link} to="/register" className="ms-3 text-white d-flex align-items-center">
                  <Users size={20} className="me-1" />
                  <span>Register</span>
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;