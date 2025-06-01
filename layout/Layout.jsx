

import Navbar from '../components/Nav.jsx'; 
import Footer from '../components/Footer.jsx'; 
// IMPORTANT: Do NOT import or use 'useAuth' here.

const Layout = ({ children }) => {

  // Ensure no 'useAuth()' or any related destructuring is here.
  return (
    <>
      <Navbar /> {/* Navbar will get its own auth state using useAuth internally */}
      <main>{children}</main> 
      <Footer />
    </>
  );
};

export default Layout;