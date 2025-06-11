
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; 
import '../css/Nav.css';

const Navbar = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };

  const getNavLinks = () => {
    let links = [];

    // Links for all users
    links.push({ label: 'Home', href: '/' });
    links.push({ label: 'Events', href: '/events' }); // Public events page

    // Links for authenticated users
    if (isAuthenticated && user) {
      links.push({ label: 'Dashboard', href: '/dashboard' });
      links.push({ label: 'Profile', href: '/profile' });

      // Role-specific links (from your original code)
      switch (user.role) {
        case 'organizer':
          links.push(
            { label: 'My Events', href: '/organizer' },
            { label: 'Create Event', href: '/organizer/create' }
          );
          break;
        case 'admin':
          links.push(
            { label: 'Admin Dashboard', href: '/admin' },
            { label: 'Manage Events', href: '/admin/events' }
          );
          break;
        default:
          break;
      }
    }
    return links;
  };

  const navLinks = getNavLinks();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">EventHub</Link>
      </div>
      <div className="nav-links">
        {navLinks.map(link => (
          <Link key={link.href} to={link.href}>{link.label}</Link>
        ))}

        {isLoading ? (
          <span className="loading-status">Loading...</span>
        ) : isAuthenticated ? (
          <>
            {user && user.name && (
              <span className="user-name">Hello, {user.name}!</span>
            )}
            {user && !user.name && user.email && (
              <span className="user-name">Hello, {user.email}!</span>
            )}
            
            <button
              className="btn logout-btn"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </>
        ) : (
          <Link to="/login" className="btn login-btn">
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;