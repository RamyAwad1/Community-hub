// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react'; // Make sure this is installed and correct

import App from './App.jsx';
import './index.css';

const auth0Domain = "dev-wqyb0g18v4u840mz.us.auth0.com"; // Your Auth0 domain
const auth0ClientId = "XplGoBRxIHQKbFpIL0XBc3a2F5cTpkhM"; // Your Auth0 client ID

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Auth0Provider must wrap your entire app so useAuth0() works */}
      <Auth0Provider
        domain={auth0Domain}
        clientId={auth0ClientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
        }}
      >
        <App /> {/* Your main App component, which contains AuthProvider */}
      </Auth0Provider>
    </BrowserRouter>
  </React.StrictMode>
);