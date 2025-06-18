const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const makeAuthenticatedRequest = async (method, path, body = null, tokenProvider) => {
  try {
    let token;
    if (typeof tokenProvider === 'function') {
      token = await tokenProvider({
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: 'read:events manage:events',
      });
    } else if (typeof tokenProvider === 'string') {
      token = tokenProvider;
    } else {
      throw new Error('Invalid tokenProvider provided to makeAuthenticatedRequest.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const config = {
      method: method,
      headers: headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, config);

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await response.json();
    } else {
      return response;
    }

  } catch (error) {
    console.error(`API Error (${method} ${path}):`, error.message);
    throw error;
  }
};

const makePublicRequest = async (method, path) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const config = { method, headers };

    const response = await fetch(`${API_BASE_URL}${path}`, config);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await response.json();
    } else {
      return response;
    }
  } catch (error) {
    console.error(`Public API Error (${method} ${path}):`, error.message);
    throw error;
  }
};


export const usersApi = {
  upsertUser: async (userData, getAccessTokenSilently) => makeAuthenticatedRequest('POST', '/users', userData, getAccessTokenSilently),
  getUserProfile: async (getAccessTokenSilently) => makeAuthenticatedRequest('GET', '/users/profile', null, getAccessTokenSilently),
  updateUserProfile: async (userData, getAccessTokenSilently) => makeAuthenticatedRequest('PUT', '/users/profile', userData, getAccessTokenSilently),
  getAllUsers: async (getAccessTokenSilently) => makeAuthenticatedRequest('GET', '/admin/users', null, getAccessTokenSilently),
};

export const eventsApi = {
    getAllApprovedEvents: async () => makePublicRequest('GET', '/events'),
    getEventDetails: async (eventId) => makePublicRequest('GET', `/events/${eventId}`),

    createEvent: async (eventData, getAccessTokenSilently) => makeAuthenticatedRequest('POST', '/events', eventData, getAccessTokenSilAccessTokenSilently),
    approveEvent: async (eventId, getAccessTokenSilently) => makeAuthenticatedRequest('PUT', `/events/${eventId}/approve`, null, getAccessTokenSilently),
    rejectEvent: async (eventId, getAccessTokenSilently) => makeAuthenticatedRequest('PUT', `/events/${eventId}/reject`, null, getAccessTokenSilently),
    getAllEventsAdmin: async (getAccessTokenSilently) => makeAuthenticatedRequest('GET', '/admin/events', null, getAccessTokenSilently),
    getOrganizerEvents: async (getAccessTokenSilently) => makeAuthenticatedRequest('GET', '/events/my-events', null, getAccessTokenSilently),
    updateEvent: async (eventId, eventData, getAccessTokenSilently) => makeAuthenticatedRequest('PUT', `/events/${eventId}`, eventData, getAccessTokenSilently),
    deleteEvent: async (eventId, getAccessTokenSilently) => makeAuthenticatedRequest('DELETE', `/events/${eventId}`, null, getAccessTokenSilently),
    registerForEvent: async (eventId, getAccessTokenSilently) => makeAuthenticatedRequest('POST', `/events/${eventId}/register`, null, getAccessTokenSilently),
};
