
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { AuthProvider } from '../context/AuthContext.jsx'; // Import your custom AuthProvider

import App from './App.jsx';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        
      }}
    >
      <BrowserRouter>
        {/*custom AuthProvider must wrap App so App can use useAuth() */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>,
);