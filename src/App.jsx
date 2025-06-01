

import { Routes, Route } from 'react-router-dom';

import { AuthProvider } from '../context/AuthContext.jsx'; 

import LandingPage from '../pages/LandingPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';

function App() {
  return (
    // AuthProvider MUST wrap your Routes (and thus all pages)
    // so that components within those pages (like Nav) can use useAuth()
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
