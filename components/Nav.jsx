

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; 
import '../css/Nav.css';

const Nav = () => {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth(); 

  // Define links based on authentication status and user role
  const getNavLinks = () => {
    let links = [
      { label: 'Home', href: '/' },
      { label: 'Events', href: '/events' },
    ];

    if (isAuthenticated && user) {
      switch (user.role) { // This 'user.role' would only exist if you configure Auth0 to pass custom claims
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
      <div className="logo"><Link to="/">CommunityHub</Link></div>
      <div className="nav-links">
        {navLinks.map(link => (
          <Link key={link.href} to={link.href}>{link.label}</Link>
        ))}

        {isLoading ? (
          <span className="loading-status">Loading...</span>
        ) : isAuthenticated ? (
          <>
            {user && user.picture && (
              <img src={user.picture} alt={user.name || "User"} className="user-avatar" />
            )}
            {user && user.name && (
              <span className="user-name">{user.name}</span>
            )}
            <button
              className="btn logout-btn"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              Log Out
            </button>
          </>
        ) : (
          <button className="btn login-btn" onClick={() => loginWithRedirect()}>
            Log In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Nav;