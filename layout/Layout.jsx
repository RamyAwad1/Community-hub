// src/layout/Layout.jsx

import Navbar from '../components/Nav.jsx'; // Your Navbar component
import Footer from '../components/Footer.jsx'; // Your Footer component
// IMPORTANT: Do NOT import or use 'useAuth' here.

const Layout = ({ children }) => {
  // Line 23 in your error is likely here if you uncommented / added useAuth()
  // Ensure no 'useAuth()' or any related destructuring is here.
  return (
    <>
      <Navbar /> {/* Navbar will get its own auth state using useAuth internally */}
      <main>{children}</main> {/* This is where your page content goes */}
      <Footer />
    </>
  );
};

export default Layout;