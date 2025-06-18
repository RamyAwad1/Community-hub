

import Navbar from '../components/Nav.jsx'; 
import Footer from '../components/Footer.jsx'; 



const Layout = ({ children }) => {
  return (

    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <Navbar /> 
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {children} 
      </main>
      <Footer /> 
    </div>
  );
};

export default Layout;
