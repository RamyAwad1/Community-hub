

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react'; 

import App from './App.jsx';
import './index.css';

const auth0Domain = "dev-wqyb0g18v4u840mz.us.auth0.com"; 
const auth0ClientId = "XplGoBRxIHQKbFpIL0XBc3a2F5cTpkhM"; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
     
      <Auth0Provider
        domain={auth0Domain}
        clientId={auth0ClientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
        }}
      >
        <App /> 
      </Auth0Provider>
    </BrowserRouter>
  </React.StrictMode>
);